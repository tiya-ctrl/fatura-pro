-- Advanced 7-day trial without a card (temporary, while Stripe payments are paused).
-- Additive only: one new column and two functions; no existing row is changed.
--
--  * user_plans.advanced_trial_end: until when the account has Advanced through the
--    no-card trial. The plan column is not touched (the Stripe webhook owns it).
--  * start_advanced_trial(): called by the signed-in user. One trial per email, using
--    the same trial_claims table as the Stripe trial. Returns the end date, or null
--    when the trial was already used.
--  * A signed-in user can never change plan, trial dates or the Stripe customer on
--    their own row; only the server (service role) and start_advanced_trial() can.
--  * The Free plan limits do not apply during the Advanced trial.

alter table public.user_plans
  add column if not exists advanced_trial_end timestamptz;

create or replace function public.guard_user_plan_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'authenticated' then return new; end if;
  if coalesce(current_setting('app.plan_change', true), '') = '1' then return new; end if;
  new.plan := old.plan;
  new.trial_end := old.trial_end;
  new.advanced_trial_end := old.advanced_trial_end;
  new.stripe_customer := old.stripe_customer;
  return new;
end;
$$;

drop trigger if exists guard_user_plan_update on public.user_plans;
create trigger guard_user_plan_update
  before update on public.user_plans
  for each row execute function public.guard_user_plan_update();

-- Same insert guard as 202610030001, plus: a browser-created row cannot carry an
-- Advanced trial date either.
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
  if coalesce(current_setting('app.plan_change', true), '') <> '1' then
    new.advanced_trial_end := null;
  end if;
  return new;
end;
$$;

create or replace function public.start_advanced_trial()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  user_email text;
  claim_key text;
  claimed integer;
  ends timestamptz := now() + interval '7 days';
begin
  if uid is null then return null; end if;
  select u.email into user_email from auth.users u where u.id = uid;
  claim_key := public.normalize_email_key(user_email);
  if claim_key is null then return null; end if;

  insert into public.trial_claims (email_key, plan) values (claim_key, 'advanced')
  on conflict do nothing;
  get diagnostics claimed = row_count;
  if claimed = 0 then return null; end if;

  perform set_config('app.plan_change', '1', true);
  update public.user_plans set advanced_trial_end = ends, updated_at = now() where user_id = uid;
  if not found then
    insert into public.user_plans (user_id, plan, email, advanced_trial_end)
    values (uid, 'free', user_email, ends);
  end if;
  return ends;
end;
$$;

revoke all on function public.start_advanced_trial() from public, anon;
grant execute on function public.start_advanced_trial() to authenticated;

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
      and (p.plan in ('pro', 'business')
        or (p.trial_end is not null and p.trial_end > now())
        or (p.advanced_trial_end is not null and p.advanced_trial_end > now()))
  );
$$;
