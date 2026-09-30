-- One free trial per email address, per plan (Essential and Advanced), even
-- after an account is deleted and signed up again.
--
-- trial_claims keeps a normalised email key for every trial handed out. It is
-- only readable through the service role (RLS on, no policies). The signup
-- trigger gives the automatic Essential trial only when the key is new; the
-- Stripe webhook ends an Advanced trial straight away when the key already
-- claimed one. Existing accounts are backfilled as having used their trials.

create table if not exists public.trial_claims (
  email_key text not null,
  plan text not null check (plan in ('essential', 'advanced')),
  claimed_at timestamptz not null default now(),
  primary key (email_key, plan)
);
alter table public.trial_claims enable row level security;

-- Lower-case, drop "+tag", and for Gmail also drop dots, so a.b+x@gmail.com and
-- ab@gmail.com count as the same address. Mirrored in server/trial-claims.js.
create or replace function public.normalize_email_key(email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when email is null or position('@' in email) = 0 then null
    when split_part(lower(trim(email)), '@', 2) in ('gmail.com', 'googlemail.com')
      then replace(split_part(split_part(lower(trim(email)), '@', 1), '+', 1), '.', '') || '@gmail.com'
    else split_part(split_part(lower(trim(email)), '@', 1), '+', 1) || '@' || split_part(lower(trim(email)), '@', 2)
  end;
$$;

-- Every existing account has already had its Essential trial.
insert into public.trial_claims (email_key, plan, claimed_at)
select public.normalize_email_key(u.email), 'essential', u.created_at
from auth.users u
where public.normalize_email_key(u.email) is not null
on conflict do nothing;

-- Accounts that went through Stripe checkout have had their Advanced trial.
insert into public.trial_claims (email_key, plan, claimed_at)
select public.normalize_email_key(coalesce(up.email, u.email)), 'advanced', coalesce(up.updated_at, now())
from public.user_plans up
join auth.users u on u.id = up.user_id
where up.stripe_customer is not null
  and public.normalize_email_key(coalesce(up.email, u.email)) is not null
on conflict do nothing;

-- Same signup trigger as 202609190001, except the Essential trial is only
-- given to an email that has not had one. A claim error never blocks signup.
create or replace function public.record_new_user_activation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fresh_trial boolean := true;
  claim_key text := public.normalize_email_key(new.email);
begin
  insert into public.activation_events (
    user_id, event_name, occurred_at, metadata, dedupe_key
  ) values (
    new.id,
    'user_signed_up',
    new.created_at,
    jsonb_build_object('provider', coalesce(new.raw_app_meta_data ->> 'provider', 'email')),
    'signup'
  )
  on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;

  insert into public.user_onboarding (user_id, automation_eligible)
  values (new.id, true)
  on conflict (user_id) do nothing;

  if claim_key is not null then
    begin
      fresh_trial := false;
      insert into public.trial_claims (email_key, plan, claimed_at)
      values (claim_key, 'essential', new.created_at)
      on conflict do nothing
      returning true into fresh_trial;
      fresh_trial := coalesce(fresh_trial, false);
    exception when others then
      fresh_trial := true;
    end;
  end if;

  insert into public.user_plans (user_id, plan, trial_end, email, country)
  values (
    new.id,
    'free',
    case when fresh_trial then new.created_at + interval '7 days' else new.created_at end,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'country'), '')
  )
  on conflict (user_id) do update
  set email = coalesce(excluded.email, public.user_plans.email),
      country = coalesce(public.user_plans.country, excluded.country),
      updated_at = now();

  return new;
end;
$$;

-- Lets the signed-in user's browser ask whether their Advanced trial is still
-- available, without exposing the claims table.
create or replace function public.advanced_trial_available()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.trial_claims c
    where c.plan = 'advanced'
      and c.email_key = public.normalize_email_key((select email from auth.users where id = auth.uid()))
  );
$$;
revoke all on function public.advanced_trial_available() from public, anon;
grant execute on function public.advanced_trial_available() to authenticated;
