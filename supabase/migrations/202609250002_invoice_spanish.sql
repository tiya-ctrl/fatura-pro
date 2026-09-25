-- Spanish becomes a fifth invoice document language (quotes already allow it).
-- Only widens the allowed values; existing rows keep their language.

alter table public.invoices drop constraint if exists invoices_document_language_check;
alter table public.invoices
  add constraint invoices_document_language_check
  check (document_language is null or document_language in ('nl','en','fr','es','ar'));

alter table public.business_profile drop constraint if exists business_profile_default_invoice_language_check;
alter table public.business_profile
  add constraint business_profile_default_invoice_language_check
  check (default_invoice_language is null or default_invoice_language in ('nl','en','fr','es','ar'));
