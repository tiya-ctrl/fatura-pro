-- Free plan limits enforced in the database (the app already checks them, but the
-- browser can be bypassed): 20 invoices and 5 clients for accounts that are not on
-- Essential ("pro") or Advanced ("business") and not inside their 7-day trial.
-- Credit notes do not count. Only requests from signed-in users (JWT role
-- "authenticated") are checked; server jobs (recurring cron, API, webhooks) use the
-- service role and are not affected. Existing rows are never touched.
-- Also: a user can never create their own plan row as a paid plan.

create or replace function public.free_plan_active(owner uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.user_plans p
    where p.user_id = owner
      and (p.plan in ('pro', 'business') or (p.trial_end is not null and p.trial_end > now()))
  );
$$;

create or replace function public.enforce_free_invoice_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'authenticated' then return new; end if;
  if coalesce(new.doc_type, '') = 'credit_note' then return new; end if;
  if not public.free_plan_active(new.user_id) then return new; end if;
  if (select count(*) from public.invoices i
      where i.user_id = new.user_id and coalesce(i.doc_type, '') <> 'credit_note') >= 20 then
    raise exception 'FREE_LIMIT_INVOICES' using errcode = 'P0001',
      hint = 'The Free plan includes 20 invoices. Upgrade to Essential for unlimited invoices.';
  end if;
  return new;
end;
$$;

drop trigger if exists free_invoice_limit on public.invoices;
create trigger free_invoice_limit
  before insert on public.invoices
  for each row execute function public.enforce_free_invoice_limit();

create or replace function public.enforce_free_client_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'authenticated' then return new; end if;
  if not public.free_plan_active(new.user_id) then return new; end if;
  if (select count(*) from public.clients c where c.user_id = new.user_id) >= 5 then
    raise exception 'FREE_LIMIT_CLIENTS' using errcode = 'P0001',
      hint = 'The Free plan includes 5 clients. Upgrade to Essential for unlimited clients.';
  end if;
  return new;
end;
$$;

drop trigger if exists free_client_limit on public.clients;
create trigger free_client_limit
  before insert on public.clients
  for each row execute function public.enforce_free_client_limit();

-- The app creates a missing plan row from the browser (always "free", trial counted
-- from sign-up). Make sure such a row can never start on a paid plan or a longer trial.
create or replace function public.guard_user_plan_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  signed_up timestamptz;
begin
  if coalesce(auth.role(), '') <> 'authenticated' then return new; end if;
  select u.created_at into signed_up from auth.users u where u.id = new.user_id;
  new.plan := 'free';
  new.trial_end := least(coalesce(new.trial_end, now()), coalesce(signed_up, now()) + interval '7 days');
  return new;
end;
$$;

drop trigger if exists guard_user_plan_insert on public.user_plans;
create trigger guard_user_plan_insert
  before insert on public.user_plans
  for each row execute function public.guard_user_plan_insert();
