create table if not exists public.activation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  dedupe_key text null,
  constraint activation_events_name_length check (char_length(event_name) between 1 and 80),
  constraint activation_events_name_check check (event_name in (
    'user_signed_up',
    'business_profile_created',
    'client_created',
    'invoice_started',
    'invoice_created',
    'quote_created',
    'expense_created',
    'user_returned'
  )),
  constraint activation_events_metadata_size check (octet_length(metadata::text) <= 2048)
);

create index if not exists activation_events_name_time_idx
  on public.activation_events (event_name, occurred_at desc);

create index if not exists activation_events_user_time_idx
  on public.activation_events (user_id, occurred_at desc);

create unique index if not exists activation_events_user_dedupe_idx
  on public.activation_events (user_id, dedupe_key)
  where dedupe_key is not null;

alter table public.activation_events enable row level security;

drop policy if exists "Users can insert their own activation events" on public.activation_events;
create policy "Users can insert their own activation events"
  on public.activation_events for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own activation events" on public.activation_events;
create policy "Users can read their own activation events"
  on public.activation_events for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on table public.activation_events from anon;
grant select, insert on table public.activation_events to authenticated;

create or replace function public.record_new_user_activation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.activation_events (user_id, event_name, occurred_at, metadata, dedupe_key)
  values (
    new.id,
    'user_signed_up',
    new.created_at,
    jsonb_build_object('provider', coalesce(new.raw_app_meta_data ->> 'provider', 'email')),
    'signup'
  )
  on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_activation on auth.users;
create trigger on_auth_user_created_activation
  after insert on auth.users
  for each row execute function public.record_new_user_activation();

-- Preserve a complete signup baseline without copying names or email addresses.
insert into public.activation_events (user_id, event_name, occurred_at, metadata, dedupe_key)
select
  users.id,
  'user_signed_up',
  users.created_at,
  jsonb_build_object('provider', coalesce(users.raw_app_meta_data ->> 'provider', 'email')),
  'signup'
from auth.users as users
on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;
