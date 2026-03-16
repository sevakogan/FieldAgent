-- Companies table
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  phone text not null default '',
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;

create policy "owners can manage their company"
  on public.companies for all
  using (owner_id = auth.uid());

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  role text not null check (role in ('owner', 'crew', 'client')),
  full_name text not null,
  phone text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "owners can read company profiles"
  on public.profiles for select
  using (
    company_id in (
      select id from public.companies where owner_id = auth.uid()
    )
  );

create policy "owners can insert company profiles"
  on public.profiles for insert
  with check (
    company_id in (
      select id from public.companies where owner_id = auth.uid()
    )
  );

-- Invites table
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  email text,
  phone text,
  role text not null check (role in ('crew', 'client')),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  invited_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

alter table public.invites enable row level security;

create policy "owners can manage invites"
  on public.invites for all
  using (
    company_id in (
      select id from public.companies where owner_id = auth.uid()
    )
  );

create policy "anyone can read invite by token"
  on public.invites for select
  using (true);

-- Job Requests table (off-cycle)
create table public.job_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  client_id uuid not null references public.profiles(id),
  service_description text not null,
  estimated_amount integer not null default 0,
  owner_amount integer,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'confirmed', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.job_requests enable row level security;

create policy "clients can create own requests"
  on public.job_requests for insert
  with check (client_id = auth.uid());

create policy "clients can read own requests"
  on public.job_requests for select
  using (client_id = auth.uid());

create policy "owners can manage company requests"
  on public.job_requests for all
  using (
    company_id in (
      select id from public.companies where owner_id = auth.uid()
    )
  );
