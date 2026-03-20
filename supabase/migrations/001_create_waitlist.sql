create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  type text not null check (type in ('company','client','reseller','independent_pro')),
  referral_code text unique not null,
  referred_by uuid references waitlist(id),
  referral_count integer default 0,
  position integer,
  source text,
  ip_address text,
  status text default 'waiting' check (status in ('waiting','invited','converted')),
  created_at timestamptz default now()
);

create index if not exists idx_waitlist_email on waitlist(email);
create index if not exists idx_waitlist_referral_code on waitlist(referral_code);
create index if not exists idx_waitlist_position on waitlist(position);
