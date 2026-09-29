-- Receipt photos on expenses (Business plan).
-- Adds one optional column and a private storage bucket. Existing expenses and
-- policies are unchanged.
--
-- Files live at receipts/<owner user id>/<file>. The owner and their active team
-- members can read and write that folder; nobody else can.

alter table public.expenses
  add column if not exists receipt_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create or replace function public.can_access_receipt_folder(folder text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    folder = auth.uid()::text
    or exists (
      select 1 from public.team_members tm
      where tm.owner_id::text = folder
        and tm.member_user_id = auth.uid()
        and tm.status = 'active'
    )
  );
$$;

drop policy if exists "receipts_select" on storage.objects;
create policy "receipts_select" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and public.can_access_receipt_folder((storage.foldername(name))[1]));

drop policy if exists "receipts_insert" on storage.objects;
create policy "receipts_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and public.can_access_receipt_folder((storage.foldername(name))[1]));

drop policy if exists "receipts_update" on storage.objects;
create policy "receipts_update" on storage.objects for update to authenticated
  using (bucket_id = 'receipts' and public.can_access_receipt_folder((storage.foldername(name))[1]));

drop policy if exists "receipts_delete" on storage.objects;
create policy "receipts_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and public.can_access_receipt_folder((storage.foldername(name))[1]));
