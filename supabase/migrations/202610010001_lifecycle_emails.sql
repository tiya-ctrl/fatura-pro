-- Lifecycle emails (sent by the daily /api/trial-reminder cron):
--   email_1_sent_at  "your first invoice in 1 minute"  (signed up 2+ days ago, no invoice)
--   email_2_sent_at  "can we help?"                     (5+ days after email 1, still no invoice)
--   winback_sent_at  "what's new"                        (has invoices, not signed in for 30+ days)
-- email_1/2 already exist on user_onboarding (unused so far). Only adds columns.

alter table public.user_onboarding
  add column if not exists winback_sent_at timestamptz,
  add column if not exists emails_unsubscribed_at timestamptz;
