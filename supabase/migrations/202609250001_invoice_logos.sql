-- Keep the logos a user uploads on an invoice, and remember their own logo on
-- the business profile so the next invoice starts with it.
-- Only adds optional columns; existing rows and policies are unchanged.

alter table public.invoices
  add column if not exists seller_logo text,
  add column if not exists seller_logo_size integer,
  add column if not exists buyer_logo text,
  add column if not exists buyer_logo_size integer;

alter table public.business_profile
  add column if not exists logo text;
