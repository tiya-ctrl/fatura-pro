-- Run in the Supabase SQL editor. It returns counts only and does not expose
-- customer email addresses, invoice contents, client details or event metadata.
with per_user as (
  select
    users.id,
    exists (
      select 1 from public.business_profile profile
      where profile.user_id = users.id and nullif(trim(profile.name), '') is not null
    ) as business_profile_completed,
    exists (
      select 1 from public.clients client where client.user_id = users.id
    ) as client_created,
    (
      select count(*) from public.invoices invoice
      where invoice.user_id = users.id and coalesce(invoice.doc_type, 'invoice') <> 'credit_note'
    ) as invoice_count,
    exists (
      select 1 from public.quotes quote where quote.user_id = users.id
    ) as quote_created,
    exists (
      select 1 from public.expenses expense where expense.user_id = users.id
    ) as expense_created,
    exists (
      select 1 from public.activation_events event
      where event.user_id = users.id and event.event_name = 'invoice_started'
    ) as invoice_started,
    exists (
      select 1 from public.activation_events event
      where event.user_id = users.id and event.event_name = 'user_returned'
    ) as returned_after_signup
  from auth.users as users
)
select
  count(*) as signed_up,
  count(*) filter (where business_profile_completed) as business_profile_completed,
  count(*) filter (where client_created) as client_created,
  count(*) filter (where invoice_started) as invoice_started,
  count(*) filter (where invoice_count >= 1) as first_invoice_created,
  count(*) filter (where invoice_count >= 2) as created_another_invoice,
  count(*) filter (where quote_created) as quote_created,
  count(*) filter (where expense_created) as expense_created,
  count(*) filter (where returned_after_signup) as returned_after_signup,
  count(*) filter (where returned_after_signup and invoice_count >= 2) as returned_and_created_another_invoice
from per_user;
