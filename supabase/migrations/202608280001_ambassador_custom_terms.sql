alter table public.ambassador_accounts
  add column if not exists business_commission_bps integer;

update public.ambassador_accounts
set business_commission_bps = 3500
where business_commission_bps is null;

alter table public.ambassador_accounts
  alter column business_commission_bps set default 3500,
  alter column business_commission_bps set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ambassador_accounts_business_commission'
  ) then
    alter table public.ambassador_accounts
      add constraint ambassador_accounts_business_commission
      check (business_commission_bps between 500 and 5000);
  end if;
end $$;

comment on column public.ambassador_accounts.commission_bps is
  'Pro subscription commission in basis points for this ambassador.';

comment on column public.ambassador_accounts.business_commission_bps is
  'Business subscription commission in basis points for this ambassador.';
