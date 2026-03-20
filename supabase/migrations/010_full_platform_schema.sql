-- KleanHQ Full Platform Schema
-- Multi-tenant field service CRM
-- Run after existing waitlist migrations

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (extends Supabase Auth)
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  role text not null check (role in ('super_admin','reseller','owner','lead','worker','client','co_client','independent_pro')),
  avatar_url text,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resellers
create table if not exists public.resellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  brand_name text not null,
  slug text unique not null,
  custom_domain text,
  logo_url text,
  brand_color text default '#007AFF',
  margin_percentage numeric default 0,
  whitelabel_badge text default 'powered_by_kleanhq' check (whitelabel_badge in ('powered_by_kleanhq','powered_by_reseller','hidden')),
  whitelabel_fee_active boolean default false,
  entry_fee_paid boolean default false,
  status text default 'active' check (status in ('active','suspended')),
  properties_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  business_type text not null,
  owner_id uuid references public.users not null,
  reseller_id uuid references public.resellers,
  stripe_account_id text,
  stripe_fee_setting text default 'company_pays' check (stripe_fee_setting in ('company_pays','client_pays','split_50_50')),
  logo_url text,
  brand_color text default '#007AFF',
  phone text,
  email text,
  review_links jsonb default '{}',
  auto_approve_timeout_hours integer default 48,
  business_hours jsonb,
  service_area jsonb,
  cancellation_policy_hours integer default 24,
  late_cancel_fee numeric default 0,
  job_buffer_minutes integer default 30,
  tax_rate numeric default 0,
  tax_auto_by_zip boolean default false,
  auto_assign_rule text default 'manual' check (auto_assign_rule in ('manual','round_robin','nearest','per_address')),
  review_auto_send_hours integer default 24,
  review_smart_gate boolean default true,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Company Members
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  user_id uuid references public.users not null,
  role text not null check (role in ('owner','lead','worker')),
  pay_type text check (pay_type in ('per_job','hourly','percentage','manual')),
  pay_rate numeric,
  stripe_payout_account_id text,
  availability jsonb,
  status text default 'active' check (status in ('active','invited','deactivated')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Client-Company Link
create table if not exists public.client_companies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients not null,
  company_id uuid references public.companies not null,
  payment_schedule text default 'per_job' check (payment_schedule in ('per_job','monthly')),
  auto_pay boolean default false,
  stripe_customer_id text,
  stripe_payment_method_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id, company_id)
);

-- Co-Clients
create table if not exists public.co_clients (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients not null,
  user_id uuid references public.users not null,
  created_at timestamptz default now()
);

-- Addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients not null,
  company_id uuid references public.companies not null,
  street text not null,
  unit text,
  city text not null,
  state text not null,
  zip text not null,
  lat numeric,
  lng numeric,
  is_str boolean default false,
  integration_source text check (integration_source in ('airbnb','vrbo','hospitable','hostaway','guesty')),
  integration_property_id text,
  integration_settings jsonb default '{}',
  str_auto_approve boolean default true,
  time_restrictions jsonb,
  documents jsonb default '[]',
  status text default 'active' check (status in ('active','inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Service Types
create table if not exists public.service_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  name text not null,
  description text,
  default_price numeric not null,
  seasonal_pricing jsonb,
  estimated_duration_minutes integer,
  photo_required boolean default true,
  video_allowed boolean default true,
  checklist_items jsonb default '[]',
  custom_fields jsonb default '[]',
  custom_fields_enabled boolean default false,
  recurrence_options jsonb default '["one_time","weekly","biweekly","monthly"]',
  is_outdoor boolean default false,
  is_default boolean default false,
  sort_order integer default 0,
  status text default 'active' check (status in ('active','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Address Services
create table if not exists public.address_services (
  id uuid primary key default gen_random_uuid(),
  address_id uuid references public.addresses not null,
  service_type_id uuid references public.service_types not null,
  price numeric not null,
  recurrence text default 'one_time' check (recurrence in ('one_time','weekly','biweekly','monthly')),
  assigned_worker_id uuid references public.company_members,
  status text default 'active' check (status in ('active','paused','cancelled')),
  paused_at timestamptz,
  skip_next boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  address_id uuid references public.addresses not null,
  service_type_id uuid references public.service_types not null,
  address_service_id uuid references public.address_services,
  assigned_worker_id uuid references public.company_members,
  source text not null check (source in ('manual_company','client_request','api_integration','quote','booking')),
  status text not null default 'scheduled' check (status in ('requested','approved','scheduled','driving','arrived','in_progress','pending_review','revision_needed','completed','charged','cancelled')),
  scheduled_date date not null,
  scheduled_time time,
  drive_started_at timestamptz,
  drive_lat numeric,
  drive_lng numeric,
  arrived_at timestamptz,
  arrived_lat numeric,
  arrived_lng numeric,
  started_at timestamptz,
  ended_at timestamptz,
  price numeric not null,
  expenses_total numeric default 0,
  tax_amount numeric default 0,
  tip_amount numeric default 0,
  total_charged numeric,
  photo_required boolean default true,
  checklist_results jsonb,
  custom_field_values jsonb,
  auto_approve boolean default false,
  auto_approve_deadline timestamptz,
  rejection_reason text,
  rejection_photos text[],
  company_rejection_reason text,
  company_counter_price numeric,
  company_counter_date date,
  company_counter_note text,
  cancellation_reason text,
  late_cancel_fee numeric default 0,
  recurring_parent_id uuid references public.address_services,
  reservation_first_name text,
  reservation_last_name text,
  reservation_number text,
  reservation_checkin_date date,
  reservation_checkin_time time,
  reservation_checkout_date date,
  reservation_checkout_time time,
  download_link_client text,
  download_link_owner text,
  weather_data jsonb,
  quote_id uuid,
  deposit_amount numeric,
  deposit_paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Job Photos/Videos
create table if not exists public.job_media (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs not null,
  type text not null check (type in ('photo','video')),
  timing text not null check (timing in ('before','after')),
  url text not null,
  thumbnail_url text,
  captured_at timestamptz,
  lat numeric,
  lng numeric,
  has_timestamp_overlay boolean default false,
  uploaded_by uuid references public.users not null,
  created_at timestamptz default now()
);

-- Job Expenses
create table if not exists public.job_expenses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs not null,
  description text not null,
  amount numeric not null,
  receipt_photo_url text not null,
  added_by uuid references public.users not null,
  created_at timestamptz default now()
);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  client_id uuid references public.clients not null,
  job_id uuid references public.jobs,
  invoice_number text not null,
  subtotal numeric not null,
  expenses_total numeric default 0,
  tax_amount numeric default 0,
  tip_amount numeric default 0,
  processing_fee numeric default 0,
  fee_paid_by text check (fee_paid_by in ('company','client','split')),
  total numeric not null,
  payment_method text check (payment_method in ('credit_card','ach','e_check')),
  stripe_payment_intent_id text,
  stripe_charge_id text,
  status text default 'pending' check (status in ('pending','paid','failed','refunded','overdue')),
  due_date date,
  paid_at timestamptz,
  sent_at timestamptz,
  items jsonb,
  late_fee numeric default 0,
  retry_count integer default 0,
  next_retry_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Worker Payouts
create table if not exists public.worker_payouts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  worker_id uuid references public.company_members not null,
  job_id uuid references public.jobs,
  amount numeric not null,
  pay_type text not null,
  calculation_detail jsonb,
  payment_method text,
  stripe_transfer_id text,
  status text default 'pending' check (status in ('pending','processing','paid','failed')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Quotes
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  client_id uuid references public.clients not null,
  address_id uuid references public.addresses not null,
  services jsonb not null,
  total numeric not null,
  deposit_required boolean default false,
  deposit_percentage numeric,
  deposit_amount numeric,
  notes text,
  photos text[],
  expires_at timestamptz,
  status text default 'sent' check (status in ('draft','sent','accepted','declined','expired')),
  accepted_at timestamptz,
  deposit_paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contracts
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  client_id uuid references public.clients not null,
  address_id uuid references public.addresses,
  content text not null,
  pdf_url text,
  signed_by_client boolean default false,
  signed_at timestamptz,
  signature_data text,
  status text default 'draft' check (status in ('draft','sent','signed','expired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  client_id uuid references public.clients not null,
  sender_id uuid references public.users not null,
  sender_role text not null,
  content text not null,
  channel text default 'in_app' check (channel in ('in_app','email','sms','whatsapp')),
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Referrals
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_type text not null check (referrer_type in ('company','reseller','client','worker')),
  referrer_user_id uuid references public.users not null,
  referrer_entity_id uuid,
  referred_type text not null check (referred_type in ('company','reseller','client','worker')),
  referred_user_id uuid references public.users,
  referral_code text unique not null,
  referral_link text not null,
  reward_type text check (reward_type in ('percentage_recurring','flat_one_time','credit','tier_badge')),
  reward_value numeric,
  reward_duration_months integer,
  total_earned numeric default 0,
  status text default 'pending' check (status in ('pending','signed_up','qualified','rewarded','expired')),
  source text,
  attributed_at timestamptz,
  created_at timestamptz default now()
);

-- Promo Codes
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  level text not null check (level in ('platform','reseller','company')),
  entity_id uuid,
  discount_type text not null check (discount_type in ('percentage','flat')),
  discount_value numeric not null,
  applicable_services uuid[],
  max_uses integer,
  current_uses integer default 0,
  expires_at timestamptz,
  status text default 'active' check (status in ('active','expired','disabled')),
  created_at timestamptz default now()
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  type text not null,
  title text not null,
  body text not null,
  data jsonb,
  channels_sent text[],
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Notification Preferences
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  event_type text not null,
  web boolean default true,
  mobile_push boolean default true,
  sms boolean default false,
  email boolean default true,
  whatsapp boolean default false,
  unique(user_id, event_type)
);

-- Internal Ratings
create table if not exists public.job_ratings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs not null,
  client_id uuid references public.clients not null,
  worker_id uuid references public.company_members not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  created_at timestamptz default now()
);

-- Webhook Logs
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies,
  address_id uuid references public.addresses,
  source text not null,
  payload jsonb not null,
  parsed_data jsonb,
  job_ids uuid[],
  status text default 'received' check (status in ('received','processed','failed','ignored')),
  error_message text,
  created_at timestamptz default now()
);

-- Platform Billing
create table if not exists public.platform_billing (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  billing_month date not null,
  active_addresses integer not null,
  price_per_address numeric not null,
  subtotal numeric not null,
  discount_percentage numeric default 0,
  total numeric not null,
  is_annual boolean default false,
  stripe_invoice_id text,
  status text default 'pending' check (status in ('pending','paid','failed','overdue')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Activity Log
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies,
  user_id uuid references public.users not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- GPS Tracking Points
create table if not exists public.gps_tracks (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs not null,
  worker_id uuid references public.company_members not null,
  lat numeric not null,
  lng numeric not null,
  status text not null,
  recorded_at timestamptz default now()
);

-- Client Payment Methods
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients not null,
  stripe_payment_method_id text not null,
  type text not null check (type in ('credit_card','ach','e_check')),
  last_four text,
  brand text,
  is_default boolean default false,
  assigned_address_ids uuid[],
  created_at timestamptz default now()
);

-- Platform Settings
create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Help Articles
create table if not exists public.help_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  title text not null,
  content text not null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Feedback
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  company_id uuid references public.companies,
  type text not null check (type in ('bug','feature_request','general')),
  description text not null,
  screenshot_url text,
  status text default 'new' check (status in ('new','reviewed','planned','in_progress','resolved')),
  votes integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Drip Emails
create table if not exists public.drip_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  template_key text not null,
  sent_at timestamptz default now(),
  unique(user_id, template_key)
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_jobs_company_status on public.jobs(company_id, status);
create index if not exists idx_jobs_scheduled on public.jobs(scheduled_date);
create index if not exists idx_jobs_worker on public.jobs(assigned_worker_id);
create index if not exists idx_addresses_company on public.addresses(company_id);
create index if not exists idx_addresses_client on public.addresses(client_id);
create index if not exists idx_invoices_company_status on public.invoices(company_id, status);
create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_messages_company_client on public.messages(company_id, client_id);
create index if not exists idx_gps_tracks_job on public.gps_tracks(job_id);
create index if not exists idx_activity_log_company on public.activity_log(company_id, created_at);
create index if not exists idx_notifications_user on public.notifications(user_id, read_at);
create index if not exists idx_company_members_company on public.company_members(company_id);
create index if not exists idx_company_members_user on public.company_members(user_id);
create index if not exists idx_client_companies_client on public.client_companies(client_id);
create index if not exists idx_client_companies_company on public.client_companies(company_id);
create index if not exists idx_job_media_job on public.job_media(job_id);
create index if not exists idx_worker_payouts_worker on public.worker_payouts(worker_id);
create index if not exists idx_referrals_code on public.referrals(referral_code);

-- ============================================
-- RLS POLICIES
-- ============================================

alter table public.users enable row level security;
alter table public.resellers enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_companies enable row level security;
alter table public.co_clients enable row level security;
alter table public.addresses enable row level security;
alter table public.service_types enable row level security;
alter table public.address_services enable row level security;
alter table public.jobs enable row level security;
alter table public.job_media enable row level security;
alter table public.job_expenses enable row level security;
alter table public.invoices enable row level security;
alter table public.worker_payouts enable row level security;
alter table public.quotes enable row level security;
alter table public.contracts enable row level security;
alter table public.messages enable row level security;
alter table public.referrals enable row level security;
alter table public.promo_codes enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.job_ratings enable row level security;
alter table public.webhook_logs enable row level security;
alter table public.platform_billing enable row level security;
alter table public.activity_log enable row level security;
alter table public.gps_tracks enable row level security;
alter table public.payment_methods enable row level security;
alter table public.platform_settings enable row level security;
alter table public.help_articles enable row level security;
alter table public.feedback enable row level security;
alter table public.drip_emails enable row level security;

-- Users: can read own row
create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Super admin can read all
create policy "Super admin reads all users" on public.users for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'super_admin')
);

-- Company members can read their company
create policy "Members read own company" on public.companies for select using (
  id in (select company_id from public.company_members where user_id = auth.uid())
  or owner_id = auth.uid()
);

-- Company members access
create policy "Members read company members" on public.company_members for select using (
  company_id in (select company_id from public.company_members where user_id = auth.uid())
);

-- Jobs: company members can read
create policy "Company members read jobs" on public.jobs for select using (
  company_id in (select company_id from public.company_members where user_id = auth.uid())
);

-- Clients: can read own
create policy "Clients read own" on public.clients for select using (user_id = auth.uid());

-- Addresses: company members + client
create policy "Company members read addresses" on public.addresses for select using (
  company_id in (select company_id from public.company_members where user_id = auth.uid())
);

-- Invoices: company + client
create policy "Company members read invoices" on public.invoices for select using (
  company_id in (select company_id from public.company_members where user_id = auth.uid())
);

-- Messages: company + client
create policy "Company members read messages" on public.messages for select using (
  company_id in (select company_id from public.company_members where user_id = auth.uid())
);

-- Notifications: own only
create policy "Users read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update using (user_id = auth.uid());

-- Help articles: public read
create policy "Anyone can read help articles" on public.help_articles for select using (true);

-- Platform settings: super admin only
create policy "Super admin reads settings" on public.platform_settings for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'super_admin')
);

-- Service types: company members
create policy "Company members read services" on public.service_types for select using (
  company_id in (select company_id from public.company_members where user_id = auth.uid())
);

-- ============================================
-- SEED PLATFORM SETTINGS
-- ============================================

insert into public.platform_settings (key, value) values
  ('pricing_tiers', '{"base_price_per_address": 7, "volume_discounts": [{"min_addresses": 50, "discount_percent": 10}, {"min_addresses": 100, "discount_percent": 15}, {"min_addresses": 250, "discount_percent": 20}]}'),
  ('stripe_margin', '{"percentage": 2.9, "fixed_cents": 30, "platform_markup_percent": 0.5}'),
  ('reseller_entry_fee', '{"amount": 0, "min_properties_for_margin": 5}'),
  ('annual_discount', '{"percentage": 10}'),
  ('whitelabel_monthly_fee', '{"amount": 100}'),
  ('trial_config', '{"duration_days": 15, "max_addresses": 5}'),
  ('referral_config', '{"company_reward": "percentage_recurring", "company_reward_value": 10, "company_reward_duration_months": 12, "client_reward": "credit", "client_reward_value": 25, "worker_reward": "flat_one_time", "worker_reward_value": 50}')
on conflict (key) do nothing;
