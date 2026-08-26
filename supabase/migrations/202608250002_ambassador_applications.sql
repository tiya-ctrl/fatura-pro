create table if not exists public.ambassador_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  primary_channel text not null,
  profile_url text not null,
  audience_size text not null,
  languages text not null,
  country text not null,
  motivation text not null,
  source text not null default 'website',
  medium text not null default 'organic',
  campaign text not null default 'founding_ambassadors',
  status text not null default 'pending',
  internal_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint ambassador_applications_status check (status in ('pending', 'shortlisted', 'approved', 'declined')),
  constraint ambassador_applications_channel check (primary_channel in ('YouTube', 'TikTok', 'Instagram', 'LinkedIn', 'Newsletter', 'Community', 'Consulting', 'Other')),
  constraint ambassador_applications_audience check (audience_size in ('under_1k', '1k_5k', '5k_25k', '25k_plus')),
  constraint ambassador_applications_name_length check (char_length(name) between 1 and 80),
  constraint ambassador_applications_email_length check (char_length(email) between 3 and 160),
  constraint ambassador_applications_profile_length check (char_length(profile_url) between 8 and 300),
  constraint ambassador_applications_motivation_length check (char_length(motivation) between 40 and 1000)
);

create index if not exists ambassador_applications_status_created_idx
  on public.ambassador_applications(status, created_at desc);

alter table public.ambassador_applications enable row level security;

-- Applications are submitted through the validated server endpoint only.
-- Browser clients cannot read or modify the applicant list.
revoke all on public.ambassador_applications from anon, authenticated;
grant all on public.ambassador_applications to service_role;
