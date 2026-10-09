-- Receipt scans per account, so Essential can include 20 scans per calendar month
-- (Advanced stays unlimited). Only the server (service role) reads and writes this
-- table: RLS is on and there are no policies for signed-in users.
-- Additive only: no existing table, row or policy is changed.

create table if not exists public.receipt_scans (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  scanned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists receipt_scans_owner_created_idx
  on public.receipt_scans (owner_id, created_at desc);

alter table public.receipt_scans enable row level security;
