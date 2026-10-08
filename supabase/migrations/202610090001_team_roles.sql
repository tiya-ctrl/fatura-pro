-- Team roles: every team member is "viewer" (read only, e.g. an accountant) unless the
-- owner makes them "editor". Enforced here with RESTRICTIVE policies, so they combine
-- with the existing team policies: a viewer keeps read access, but every insert, update
-- and delete on the owner's data needs owner or editor rights. Server jobs use the
-- service role and are not affected.
-- Also: invoices remember who last changed them (updated_by, updated_at).

alter table public.team_members
  add column if not exists role text not null default 'viewer';
do $$ begin
  alter table public.team_members add constraint team_members_role_check check (role in ('viewer', 'editor'));
exception when duplicate_object then null; end $$;
-- Existing members become read only, as the owner asked; the owner can make anyone an editor.
update public.team_members set role = 'viewer' where role is distinct from 'editor';

-- May the signed-in user change data that belongs to this owner?
create or replace function public.can_write_as(owner uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select owner = auth.uid()
    or exists (
      select 1 from public.team_members m
      where m.owner_id = owner and m.member_user_id = auth.uid()
        and m.status = 'active' and m.role = 'editor'
    );
$$;

do $$
declare
  t text;
begin
  foreach t in array array['invoices', 'clients', 'quotes', 'expenses', 'recurring_invoices', 'business_profile', 'business_profiles'] loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('drop policy if exists team_role_insert on public.%I', t);
    execute format('drop policy if exists team_role_update on public.%I', t);
    execute format('drop policy if exists team_role_delete on public.%I', t);
    execute format('create policy team_role_insert on public.%I as restrictive for insert to authenticated with check (public.can_write_as(user_id))', t);
    execute format('create policy team_role_update on public.%I as restrictive for update to authenticated using (public.can_write_as(user_id)) with check (public.can_write_as(user_id))', t);
    execute format('create policy team_role_delete on public.%I as restrictive for delete to authenticated using (public.can_write_as(user_id))', t);
  end loop;
end $$;

-- Receipt files (receipts/<owner id>/<file>): same rule for uploads, changes and removals.
drop policy if exists receipts_team_role_insert on storage.objects;
drop policy if exists receipts_team_role_update on storage.objects;
drop policy if exists receipts_team_role_delete on storage.objects;
create policy receipts_team_role_insert on storage.objects as restrictive for insert to authenticated
  with check (bucket_id <> 'receipts' or public.can_write_as(nullif((storage.foldername(name))[1], '')::uuid));
create policy receipts_team_role_update on storage.objects as restrictive for update to authenticated
  using (bucket_id <> 'receipts' or public.can_write_as(nullif((storage.foldername(name))[1], '')::uuid));
create policy receipts_team_role_delete on storage.objects as restrictive for delete to authenticated
  using (bucket_id <> 'receipts' or public.can_write_as(nullif((storage.foldername(name))[1], '')::uuid));

-- Only the owner may change a member row (role, status) from the browser.
drop policy if exists team_members_owner_update on public.team_members;
create policy team_members_owner_update on public.team_members as restrictive for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Who changed an invoice last.
alter table public.invoices
  add column if not exists updated_by text,
  add column if not exists updated_at timestamptz;

create or replace function public.stamp_invoice_editor()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'authenticated' then
    new.updated_by := coalesce(auth.jwt() ->> 'email', new.updated_by);
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_invoice_editor on public.invoices;
create trigger stamp_invoice_editor
  before insert or update on public.invoices
  for each row execute function public.stamp_invoice_editor();
