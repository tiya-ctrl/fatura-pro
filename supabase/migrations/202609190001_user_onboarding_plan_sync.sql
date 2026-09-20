-- Keep signup-derived records in sync for future users only. This migration
-- intentionally does not update, delete or reclassify any existing customer.
create or replace function public.record_new_user_activation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.activation_events (
    user_id, event_name, occurred_at, metadata, dedupe_key
  ) values (
    new.id,
    'user_signed_up',
    new.created_at,
    jsonb_build_object('provider', coalesce(new.raw_app_meta_data ->> 'provider', 'email')),
    'signup'
  )
  on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;

  insert into public.user_onboarding (user_id, automation_eligible)
  values (new.id, true)
  on conflict (user_id) do nothing;

  insert into public.user_plans (user_id, plan, trial_end, email, country)
  values (
    new.id,
    'free',
    new.created_at + interval '7 days',
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'country'), '')
  )
  on conflict (user_id) do update
  set email = coalesce(excluded.email, public.user_plans.email),
      country = coalesce(public.user_plans.country, excluded.country),
      updated_at = now();

  return new;
end;
$$;
