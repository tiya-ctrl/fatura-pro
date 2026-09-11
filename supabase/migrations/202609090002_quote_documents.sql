-- Add only document fields that the existing quotes table did not persist.
-- Existing quotes remain valid and receive English as their document label.
alter table public.quotes
  add column if not exists seller_vat text,
  add column if not exists seller_country text,
  add column if not exists buyer_country text,
  add column if not exists document_language text not null default 'en';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'quotes_document_language_check'
      and conrelid = 'public.quotes'::regclass
  ) then
    alter table public.quotes
      add constraint quotes_document_language_check
      check (document_language in ('en', 'fr', 'es', 'nl', 'ar')) not valid;
  end if;
end;
$$;

alter table public.quotes validate constraint quotes_document_language_check;
