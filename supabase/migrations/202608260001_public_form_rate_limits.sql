create table if not exists public.public_form_rate_limits (
  form_key text not null,
  actor_hash text not null,
  window_start timestamptz not null,
  attempts integer not null default 1,
  primary key (form_key, actor_hash, window_start),
  constraint public_form_rate_limits_key_length check (char_length(form_key) between 1 and 40),
  constraint public_form_rate_limits_hash_length check (char_length(actor_hash) = 64),
  constraint public_form_rate_limits_attempts_positive check (attempts > 0)
);

alter table public.public_form_rate_limits enable row level security;
revoke all on public.public_form_rate_limits from anon, authenticated;
grant select, insert, update, delete on public.public_form_rate_limits to service_role;

create or replace function public.consume_public_form_rate_limit(
  p_form_key text,
  p_actor_hash text,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz := date_trunc('hour', now());
  used_attempts integer;
begin
  if p_form_key not in ('ambassador_ip', 'ambassador_email', 'waitlist_ip', 'waitlist_email')
    or char_length(p_actor_hash) <> 64
    or p_limit < 1
    or p_limit > 20 then
    return false;
  end if;

  insert into public.public_form_rate_limits(form_key, actor_hash, window_start, attempts)
  values (p_form_key, p_actor_hash, current_window, 1)
  on conflict (form_key, actor_hash, window_start)
  do update set attempts = public.public_form_rate_limits.attempts + 1
  returning attempts into used_attempts;

  return used_attempts <= p_limit;
end;
$$;

revoke all on function public.consume_public_form_rate_limit(text, text, integer) from public, anon, authenticated;
grant execute on function public.consume_public_form_rate_limit(text, text, integer) to service_role;
