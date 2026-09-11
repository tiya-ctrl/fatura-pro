-- Interface language and invoice/PDF language are intentionally independent.
-- Existing rows remain unchanged; the application treats a null legacy value as English.
alter table public.invoices
  add column if not exists document_language text default 'en';

alter table public.business_profile
  add column if not exists default_invoice_language text default 'en';

-- Expand the existing quote language constraint for installations that already
-- ran the quote migration before Arabic was introduced.
alter table public.quotes drop constraint if exists quotes_document_language_check;
alter table public.quotes
  add constraint quotes_document_language_check
  check (document_language in ('en','fr','es','nl','ar')) not valid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'invoices_document_language_check'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_document_language_check
      check (document_language is null or document_language in ('nl','en','fr','ar')) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'business_profile_default_invoice_language_check'
      and conrelid = 'public.business_profile'::regclass
  ) then
    alter table public.business_profile
      add constraint business_profile_default_invoice_language_check
      check (default_invoice_language is null or default_invoice_language in ('nl','en','fr','ar')) not valid;
  end if;
end;
$$;

alter table public.invoices validate constraint invoices_document_language_check;
alter table public.business_profile validate constraint business_profile_default_invoice_language_check;
alter table public.quotes validate constraint quotes_document_language_check;
