create extension if not exists pgcrypto;

create table if not exists public.referral_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  constraint referral_codes_format check (code ~ '^FP[A-Z0-9]{8}$')
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null references public.referral_codes(code) on delete restrict,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  constraint referrals_status check (status in ('pending', 'activated')),
  constraint referrals_not_self check (referrer_id <> referred_user_id)
);

create index if not exists referrals_referrer_status_idx
  on public.referrals(referrer_id, status);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone integer not null,
  reward_days integer not null default 30,
  status text not null default 'banked',
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  constraint referral_rewards_status check (status in ('banked', 'applying', 'applied')),
  constraint referral_rewards_days check (reward_days > 0),
  constraint referral_rewards_milestone check (milestone > 0),
  unique(user_id, milestone)
);

create index if not exists referral_rewards_user_status_idx
  on public.referral_rewards(user_id, status);

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

-- Referral state is exposed only through the authenticated server endpoint.
-- The service role bypasses RLS; browser clients receive no direct table access.
revoke all on public.referral_codes from anon, authenticated;
revoke all on public.referrals from anon, authenticated;
revoke all on public.referral_rewards from anon, authenticated;
grant all on public.referral_codes to service_role;
grant all on public.referrals to service_role;
grant all on public.referral_rewards to service_role;
