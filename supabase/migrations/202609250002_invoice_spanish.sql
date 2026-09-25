-- Spanish becomes a fifth invoice document language (quotes already allow it).
--
-- Applied on 2026-09-26. The production database never received migration
-- 202609100001, so the language columns are added here first (idempotent);
-- without them every invoice insert failed with PGRST204 since 2026-09-11.
-- Only adds columns and widens the allowed values; existing rows are unchanged.

alter table public.invoices
  add column if not exists document_language text default 'en';
alter table public.business_profile
  add column if not exists default_invoice_language text default 'en';

alter table public.invoices drop constraint if exists invoices_document_language_check;
alter table public.invoices
  add constraint invoices_document_language_check
  check (document_language is null or document_language in ('nl','en','fr','es','ar'));

alter table public.business_profile drop constraint if exists business_profile_default_invoice_language_check;
alter table public.business_profile
  add constraint business_profile_default_invoice_language_check
  check (default_invoice_language is null or default_invoice_language in ('nl','en','fr','es','ar'));

-- Let the API see the new columns immediately.
notify pgrst, 'reload schema';
