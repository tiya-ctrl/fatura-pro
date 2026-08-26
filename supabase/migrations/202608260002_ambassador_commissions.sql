create extension if not exists pgcrypto;

alter table public.referrals
  add column if not exists program text not null default 'member';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'referrals_program_check'
  ) then
    alter table public.referrals
      add constraint referrals_program_check check (program in ('member', 'ambassador'));
  end if;
end $$;

create table if not exists public.ambassador_accounts (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.ambassador_applications(id) on delete set null,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null unique references public.referral_codes(code) on delete restrict,
  status text not null default 'active',
  commission_bps integer not null default 2500,
  commission_months integer not null default 12,
  hold_days integer not null default 30,
  payout_threshold_cents integer not null default 2500,
  recovery_cents integer not null default 0,
  agreement_started_at timestamptz not null default now(),
  agreement_ends_at timestamptz,
  stripe_connected_account_id text unique,
  payouts_enabled boolean not null default false,
  automatic_payouts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ambassador_accounts_status check (status in ('active', 'paused', 'ended')),
  constraint ambassador_accounts_commission check (commission_bps between 500 and 5000),
  constraint ambassador_accounts_months check (commission_months between 1 and 36),
  constraint ambassador_accounts_hold check (hold_days between 0 and 90),
  constraint ambassador_accounts_threshold check (payout_threshold_cents between 1000 and 100000),
  constraint ambassador_accounts_recovery check (recovery_cents >= 0),
  constraint ambassador_accounts_agreement_dates check (agreement_ends_at is null or agreement_ends_at > agreement_started_at)
);

create index if not exists ambassador_accounts_status_idx
  on public.ambassador_accounts(status, agreement_ends_at);

create table if not exists public.ambassador_clicks (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references public.ambassador_accounts(id) on delete cascade,
  code text not null,
  click_token uuid not null,
  created_at timestamptz not null default now(),
  unique(ambassador_id, click_token)
);

create index if not exists ambassador_clicks_ambassador_created_idx
  on public.ambassador_clicks(ambassador_id, created_at desc);

create table if not exists public.ambassador_customers (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references public.ambassador_accounts(id) on delete restrict,
  referral_id uuid not null unique references public.referrals(id) on delete restrict,
  referred_user_id uuid not null unique references auth.users(id) on delete restrict,
  first_paid_at timestamptz not null,
  commission_ends_at timestamptz not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint ambassador_customers_status check (status in ('active', 'ended')),
  constraint ambassador_customers_dates check (commission_ends_at > first_paid_at)
);

create index if not exists ambassador_customers_ambassador_status_idx
  on public.ambassador_customers(ambassador_id, status, commission_ends_at);

create table if not exists public.ambassador_payout_batches (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references public.ambassador_accounts(id) on delete restrict,
  amount_cents integer not null,
  offset_cents integer not null default 0,
  currency text not null default 'eur',
  status text not null default 'processing',
  stripe_transfer_id text unique,
  attempts integer not null default 0,
  last_attempt_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint ambassador_payout_batches_amount check (amount_cents > 0),
  constraint ambassador_payout_batches_offset check (offset_cents >= 0),
  constraint ambassador_payout_batches_currency check (currency ~ '^[a-z]{3}$'),
  constraint ambassador_payout_batches_status check (status in ('processing', 'paid', 'cancelled'))
);

create index if not exists ambassador_payout_batches_account_status_idx
  on public.ambassador_payout_batches(ambassador_id, status, created_at);

create table if not exists public.ambassador_commissions (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references public.ambassador_accounts(id) on delete restrict,
  ambassador_customer_id uuid not null references public.ambassador_customers(id) on delete restrict,
  referred_user_id uuid not null references auth.users(id) on delete restrict,
  stripe_invoice_id text not null unique,
  stripe_subscription_id text,
  stripe_charge_id text,
  currency text not null default 'eur',
  revenue_cents integer not null,
  commission_bps integer not null,
  amount_cents integer not null,
  status text not null default 'pending',
  earned_at timestamptz not null,
  available_at timestamptz not null,
  payout_batch_id uuid references public.ambassador_payout_batches(id) on delete restrict,
  paid_at timestamptz,
  reversed_at timestamptz,
  reversal_reason text,
  created_at timestamptz not null default now(),
  constraint ambassador_commissions_status check (status in ('pending', 'available', 'processing', 'paid', 'reversed')),
  constraint ambassador_commissions_currency check (currency ~ '^[a-z]{3}$'),
  constraint ambassador_commissions_revenue check (revenue_cents >= 0),
  constraint ambassador_commissions_amount check (amount_cents >= 0),
  constraint ambassador_commissions_rate check (commission_bps between 500 and 5000),
  constraint ambassador_commissions_dates check (available_at >= earned_at)
);

create index if not exists ambassador_commissions_account_status_idx
  on public.ambassador_commissions(ambassador_id, status, available_at);

create index if not exists ambassador_commissions_customer_idx
  on public.ambassador_commissions(ambassador_customer_id, earned_at desc);

alter table public.ambassador_accounts enable row level security;
alter table public.ambassador_clicks enable row level security;
alter table public.ambassador_customers enable row level security;
alter table public.ambassador_commissions enable row level security;
alter table public.ambassador_payout_batches enable row level security;

revoke all on public.ambassador_accounts from anon, authenticated;
revoke all on public.ambassador_clicks from anon, authenticated;
revoke all on public.ambassador_customers from anon, authenticated;
revoke all on public.ambassador_commissions from anon, authenticated;
revoke all on public.ambassador_payout_batches from anon, authenticated;
grant all on public.ambassador_accounts to service_role;
grant all on public.ambassador_clicks to service_role;
grant all on public.ambassador_customers to service_role;
grant all on public.ambassador_commissions to service_role;
grant all on public.ambassador_payout_batches to service_role;

create or replace function public.claim_ambassador_payout_batch(
  p_ambassador_id uuid,
  p_currency text
)
returns table(batch_id uuid, batch_amount_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account public.ambassador_accounts%rowtype;
  v_total bigint;
  v_offset bigint;
  v_payout bigint;
  v_batch uuid;
begin
  select * into v_account
  from public.ambassador_accounts
  where id = p_ambassador_id
  for update;

  if not found
     or not v_account.payouts_enabled
     or not v_account.automatic_payouts
     or v_account.stripe_connected_account_id is null then
    return;
  end if;

  if exists (
    select 1 from public.ambassador_payout_batches
    where ambassador_id = p_ambassador_id and status = 'processing'
  ) then
    return;
  end if;

  update public.ambassador_commissions
  set status = 'available'
  where ambassador_id = p_ambassador_id
    and currency = lower(p_currency)
    and status = 'pending'
    and available_at <= now();

  select coalesce(sum(amount_cents), 0) into v_total
  from public.ambassador_commissions
  where ambassador_id = p_ambassador_id
    and currency = lower(p_currency)
    and status = 'available';

  v_offset := least(v_total, v_account.recovery_cents);
  v_payout := v_total - v_offset;

  if v_payout < v_account.payout_threshold_cents or v_payout <= 0 then
    return;
  end if;

  insert into public.ambassador_payout_batches(ambassador_id, amount_cents, offset_cents, currency)
  values (p_ambassador_id, v_payout::integer, v_offset::integer, lower(p_currency))
  returning id into v_batch;

  update public.ambassador_accounts
  set recovery_cents = recovery_cents - v_offset::integer,
      updated_at = now()
  where id = p_ambassador_id;

  update public.ambassador_commissions
  set status = 'processing', payout_batch_id = v_batch
  where ambassador_id = p_ambassador_id
    and currency = lower(p_currency)
    and status = 'available';

  return query select v_batch, v_payout::integer;
end;
$$;

create or replace function public.reverse_ambassador_commission(
  p_stripe_invoice_id text,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_commission public.ambassador_commissions%rowtype;
begin
  select * into v_commission
  from public.ambassador_commissions
  where stripe_invoice_id = p_stripe_invoice_id
  for update;

  if not found or v_commission.status = 'reversed' then
    return false;
  end if;

  if v_commission.status in ('processing', 'paid') then
    update public.ambassador_accounts
    set recovery_cents = recovery_cents + v_commission.amount_cents,
        updated_at = now()
    where id = v_commission.ambassador_id;
  end if;

  update public.ambassador_commissions
  set status = 'reversed', reversed_at = now(), reversal_reason = left(coalesce(p_reason, 'reversed'), 200)
  where id = v_commission.id;
  return true;
end;
$$;

create or replace function public.complete_ambassador_payout_batch(
  p_batch_id uuid,
  p_stripe_transfer_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ambassador_payout_batches
  set status = 'paid',
      stripe_transfer_id = p_stripe_transfer_id,
      paid_at = now(),
      failure_reason = null,
      last_attempt_at = now(),
      attempts = attempts + 1
  where id = p_batch_id and status = 'processing';

  update public.ambassador_commissions
  set status = 'paid', paid_at = now()
  where payout_batch_id = p_batch_id and status = 'processing';
end;
$$;

create or replace function public.ambassador_ledger_totals(
  p_ambassador_id uuid
)
returns table(ledger_status text, total_cents bigint)
language sql
stable
security definer
set search_path = public
as $$
  select status, coalesce(sum(amount_cents), 0)::bigint
  from public.ambassador_commissions
  where ambassador_id = p_ambassador_id
  group by status;
$$;

create or replace function public.ambassador_paid_payout_total(
  p_ambassador_id uuid
)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount_cents), 0)::bigint
  from public.ambassador_payout_batches
  where ambassador_id = p_ambassador_id and status = 'paid';
$$;

revoke all on function public.claim_ambassador_payout_batch(uuid, text) from public, anon, authenticated;
revoke all on function public.complete_ambassador_payout_batch(uuid, text) from public, anon, authenticated;
revoke all on function public.reverse_ambassador_commission(text, text) from public, anon, authenticated;
revoke all on function public.ambassador_ledger_totals(uuid) from public, anon, authenticated;
revoke all on function public.ambassador_paid_payout_total(uuid) from public, anon, authenticated;
grant execute on function public.claim_ambassador_payout_batch(uuid, text) to service_role;
grant execute on function public.complete_ambassador_payout_batch(uuid, text) to service_role;
grant execute on function public.reverse_ambassador_commission(text, text) to service_role;
grant execute on function public.ambassador_ledger_totals(uuid) to service_role;
grant execute on function public.ambassador_paid_payout_total(uuid) to service_role;

-- Extend the existing public-form limiter for anonymous, non-financial click metrics.
create or replace function public.consume_public_form_rate_limit(
  p_form_key text,
  p_actor_hash text,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz := date_trunc('hour', now());
  used_attempts integer;
begin
  if p_form_key not in ('ambassador_ip', 'ambassador_email', 'ambassador_click_ip', 'waitlist_ip', 'waitlist_email')
    or char_length(p_actor_hash) <> 64
    or p_limit < 1
    or p_limit > 20 then
    return false;
  end if;

  insert into public.public_form_rate_limits(form_key, actor_hash, window_start, attempts)
  values (p_form_key, p_actor_hash, current_window, 1)
  on conflict (form_key, actor_hash, window_start)
  do update set attempts = public.public_form_rate_limits.attempts + 1
  returning attempts into used_attempts;

  return used_attempts <= p_limit;
end;
$$;

revoke all on function public.consume_public_form_rate_limit(text, text, integer) from public, anon, authenticated;
grant execute on function public.consume_public_form_rate_limit(text, text, integer) to service_role;

