-- ── Clients ──────────────────────────────────────────────────────

create table clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  tag text,                        -- 'VIP', 'Monthly', null
  created_at timestamptz default now()
);

alter table clients enable row level security;

create policy "company members can read clients"
  on clients for select
  using (
    company_id in (
      select company_id from profiles where id = auth.uid()
    )
  );

create policy "owners can manage clients"
  on clients for all
  using (
    company_id in (
      select id from companies where owner_id = auth.uid()
    )
  );

-- ── Properties ───────────────────────────────────────────────────

create table properties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  address text not null,
  nickname text,
  services text[] default '{}',
  monthly_rate integer default 0,  -- stored in cents
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table properties enable row level security;

create policy "company members can read properties"
  on properties for select
  using (
    company_id in (
      select company_id from profiles where id = auth.uid()
    )
  );

create policy "owners can manage properties"
  on properties for all
  using (
    company_id in (
      select id from companies where owner_id = auth.uid()
    )
  );

-- ── Jobs ─────────────────────────────────────────────────────────

create table jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  service text not null,
  worker text,
  date date not null,
  time text,
  status text default 'upcoming',  -- 'upcoming', 'active', 'done'
  total integer default 0,          -- stored in cents
  photos integer default 0,
  notes text,
  created_at timestamptz default now()
);

alter table jobs enable row level security;

create policy "company members can read jobs"
  on jobs for select
  using (
    company_id in (
      select company_id from profiles where id = auth.uid()
    )
  );

create policy "owners can manage jobs"
  on jobs for all
  using (
    company_id in (
      select id from companies where owner_id = auth.uid()
    )
  );

-- ── Invoices ─────────────────────────────────────────────────────

create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  job_id uuid references jobs(id) on delete set null,
  date date not null,
  due_date date not null,
  items jsonb default '[]'::jsonb,  -- [{description, quantity, unit_price, total}]
  subtotal integer default 0,       -- cents
  tax integer default 0,
  total integer default 0,
  status text default 'unpaid',     -- 'unpaid', 'paid', 'overdue', 'partial'
  paid_date date,
  payment_method text,
  created_at timestamptz default now()
);

alter table invoices enable row level security;

create policy "company members can read invoices"
  on invoices for select
  using (
    company_id in (
      select company_id from profiles where id = auth.uid()
    )
  );

create policy "owners can manage invoices"
  on invoices for all
  using (
    company_id in (
      select id from companies where owner_id = auth.uid()
    )
  );

-- ── Leads ────────────────────────────────────────────────────────

create table leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  phone text,
  service text,
  value integer default 0,          -- cents
  status text default 'new',        -- 'new', 'contacted', 'quoted', 'won', 'lost'
  spanish_speaker boolean default false,
  created_at timestamptz default now()
);

alter table leads enable row level security;

create policy "company members can read leads"
  on leads for select
  using (
    company_id in (
      select company_id from profiles where id = auth.uid()
    )
  );

create policy "owners can manage leads"
  on leads for all
  using (
    company_id in (
      select id from companies where owner_id = auth.uid()
    )
  );

-- ── Calls ────────────────────────────────────────────────────────

create table calls (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  name text,
  number text,
  duration text,
  outbound boolean default true,
  created_at timestamptz default now()
);

alter table calls enable row level security;

create policy "company members can read calls"
  on calls for select
  using (
    company_id in (
      select company_id from profiles where id = auth.uid()
    )
  );

create policy "owners can manage calls"
  on calls for all
  using (
    company_id in (
      select id from companies where owner_id = auth.uid()
    )
  );
