// KleanHQ Database Types — matches supabase/migrations/010_full_platform_schema.sql

export type UserRole = 'super_admin' | 'reseller' | 'owner' | 'lead' | 'worker' | 'client' | 'co_client' | 'independent_pro'
export type CompanyMemberRole = 'owner' | 'lead' | 'worker'
export type PayType = 'per_job' | 'hourly' | 'percentage' | 'manual'
export type FeeSetting = 'company_pays' | 'client_pays' | 'split_50_50'
export type JobSource = 'manual_company' | 'client_request' | 'api_integration' | 'quote' | 'booking'
export type JobStatus = 'requested' | 'approved' | 'scheduled' | 'driving' | 'arrived' | 'in_progress' | 'pending_review' | 'revision_needed' | 'completed' | 'charged' | 'cancelled'
export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'overdue'
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired'
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'expired'
export type MessageChannel = 'in_app' | 'email' | 'sms' | 'whatsapp'
export type PaymentMethodType = 'credit_card' | 'ach' | 'e_check'
export type Recurrence = 'one_time' | 'weekly' | 'biweekly' | 'monthly'
export type IntegrationSource = 'airbnb' | 'vrbo' | 'hospitable' | 'hostaway' | 'guesty'
export type WhitelabelBadge = 'powered_by_kleanhq' | 'powered_by_reseller' | 'hidden'
export type AutoAssignRule = 'manual' | 'round_robin' | 'nearest' | 'per_address'
export type FeedbackType = 'bug' | 'feature_request' | 'general'
export type FeedbackStatus = 'new' | 'reviewed' | 'planned' | 'in_progress' | 'resolved'
export type MediaType = 'photo' | 'video'
export type MediaTiming = 'before' | 'after'
export type ReferrerType = 'company' | 'reseller' | 'client' | 'worker'
export type RewardType = 'percentage_recurring' | 'flat_one_time' | 'credit' | 'tier_badge'
export type ReferralStatus = 'pending' | 'signed_up' | 'qualified' | 'rewarded' | 'expired'
export type PromoLevel = 'platform' | 'reseller' | 'company'
export type DiscountType = 'percentage' | 'flat'
export type MemberStatus = 'active' | 'invited' | 'deactivated'
export type AddressStatus = 'active' | 'inactive'
export type ServiceStatus = 'active' | 'archived'
export type AddressServiceStatus = 'active' | 'paused' | 'cancelled'
export type WebhookStatus = 'received' | 'processed' | 'failed' | 'ignored'
export type BillingStatus = 'pending' | 'paid' | 'failed' | 'overdue'
export type WaitlistType = 'company' | 'client' | 'reseller'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  language: string
  created_at: string
  updated_at: string
}

export interface Reseller {
  id: string
  user_id: string
  brand_name: string
  slug: string
  custom_domain: string | null
  logo_url: string | null
  brand_color: string
  margin_percentage: number
  whitelabel_badge: WhitelabelBadge
  whitelabel_fee_active: boolean
  entry_fee_paid: boolean
  status: 'active' | 'suspended'
  properties_count: number
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  business_type: string
  owner_id: string
  reseller_id: string | null
  stripe_account_id: string | null
  stripe_fee_setting: FeeSetting
  logo_url: string | null
  brand_color: string
  phone: string | null
  email: string | null
  review_links: Record<string, string>
  auto_approve_timeout_hours: number
  business_hours: Record<string, unknown> | null
  service_area: Record<string, unknown> | null
  cancellation_policy_hours: number
  late_cancel_fee: number
  job_buffer_minutes: number
  tax_rate: number
  tax_auto_by_zip: boolean
  auto_assign_rule: AutoAssignRule
  review_auto_send_hours: number
  review_smart_gate: boolean
  status: string
  created_at: string
  updated_at: string
}

export interface CompanyMember {
  id: string
  company_id: string
  user_id: string
  role: CompanyMemberRole
  pay_type: PayType | null
  pay_rate: number | null
  stripe_payout_account_id: string | null
  availability: Record<string, unknown> | null
  status: MemberStatus
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ClientCompany {
  id: string
  client_id: string
  company_id: string
  payment_schedule: 'per_job' | 'monthly'
  auto_pay: boolean
  stripe_customer_id: string | null
  stripe_payment_method_id: string | null
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  client_id: string
  company_id: string
  street: string
  unit: string | null
  city: string
  state: string
  zip: string
  lat: number | null
  lng: number | null
  is_str: boolean
  integration_source: IntegrationSource | null
  integration_property_id: string | null
  integration_settings: Record<string, unknown>
  str_auto_approve: boolean
  time_restrictions: Record<string, unknown> | null
  documents: unknown[]
  status: AddressStatus
  created_at: string
  updated_at: string
}

export interface ServiceType {
  id: string
  company_id: string
  name: string
  description: string | null
  default_price: number
  seasonal_pricing: Record<string, unknown> | null
  estimated_duration_minutes: number | null
  photo_required: boolean
  video_allowed: boolean
  checklist_items: unknown[]
  custom_fields: unknown[]
  custom_fields_enabled: boolean
  recurrence_options: string[]
  is_outdoor: boolean
  is_default: boolean
  sort_order: number
  status: ServiceStatus
  created_at: string
  updated_at: string
}

export interface AddressService {
  id: string
  address_id: string
  service_type_id: string
  price: number
  recurrence: Recurrence
  assigned_worker_id: string | null
  status: AddressServiceStatus
  paused_at: string | null
  skip_next: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  company_id: string
  address_id: string
  service_type_id: string
  address_service_id: string | null
  assigned_worker_id: string | null
  source: JobSource
  status: JobStatus
  scheduled_date: string
  scheduled_time: string | null
  drive_started_at: string | null
  drive_lat: number | null
  drive_lng: number | null
  arrived_at: string | null
  arrived_lat: number | null
  arrived_lng: number | null
  started_at: string | null
  ended_at: string | null
  price: number
  expenses_total: number
  tax_amount: number
  tip_amount: number
  total_charged: number | null
  photo_required: boolean
  checklist_results: Record<string, unknown> | null
  custom_field_values: Record<string, unknown> | null
  auto_approve: boolean
  auto_approve_deadline: string | null
  rejection_reason: string | null
  rejection_photos: string[] | null
  cancellation_reason: string | null
  late_cancel_fee: number
  weather_data: Record<string, unknown> | null
  quote_id: string | null
  deposit_amount: number | null
  deposit_paid: boolean
  created_at: string
  updated_at: string
}

export interface JobMedia {
  id: string
  job_id: string
  type: MediaType
  timing: MediaTiming
  url: string
  thumbnail_url: string | null
  captured_at: string | null
  lat: number | null
  lng: number | null
  has_timestamp_overlay: boolean
  uploaded_by: string
  created_at: string
}

export interface JobExpense {
  id: string
  job_id: string
  description: string
  amount: number
  receipt_photo_url: string
  added_by: string
  created_at: string
}

export interface Invoice {
  id: string
  company_id: string
  client_id: string
  job_id: string | null
  invoice_number: string
  subtotal: number
  expenses_total: number
  tax_amount: number
  tip_amount: number
  processing_fee: number
  fee_paid_by: 'company' | 'client' | 'split' | null
  total: number
  payment_method: PaymentMethodType | null
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  status: InvoiceStatus
  due_date: string | null
  paid_at: string | null
  sent_at: string | null
  items: unknown[] | null
  late_fee: number
  retry_count: number
  next_retry_at: string | null
  created_at: string
  updated_at: string
}

export interface WorkerPayout {
  id: string
  company_id: string
  worker_id: string
  job_id: string | null
  amount: number
  pay_type: string
  calculation_detail: Record<string, unknown> | null
  payment_method: string | null
  stripe_transfer_id: string | null
  status: PayoutStatus
  paid_at: string | null
  created_at: string
}

export interface QuoteLineItem {
  description: string
  quantity: number
  unit_price: number
}

export interface Quote {
  id: string
  company_id: string
  client_id: string
  address_id: string | null
  service_type_id: string | null
  title: string | null
  description: string | null
  line_items: QuoteLineItem[] | null
  subtotal: number
  tax_amount: number
  total: number
  valid_until: string | null
  deposit_required: boolean
  deposit_percentage: number | null
  deposit_amount: number | null
  notes: string | null
  photos: string[] | null
  expires_at: string | null
  status: QuoteStatus
  sent_at: string | null
  accepted_at: string | null
  deposit_paid_at: string | null
  services: unknown[]
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  company_id: string
  client_id: string
  address_id: string | null
  content: string
  pdf_url: string | null
  signed_by_client: boolean
  signed_at: string | null
  signature_data: string | null
  status: ContractStatus
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  company_id: string
  client_id: string
  sender_id: string
  sender_role: string
  content: string
  channel: MessageChannel
  read_at: string | null
  created_at: string
}

export interface Referral {
  id: string
  referrer_type: ReferrerType
  referrer_user_id: string
  referrer_entity_id: string | null
  referred_type: ReferrerType
  referred_user_id: string | null
  referral_code: string
  referral_link: string
  reward_type: RewardType | null
  reward_value: number | null
  reward_duration_months: number | null
  total_earned: number
  status: ReferralStatus
  source: string | null
  attributed_at: string | null
  created_at: string
}

export interface PromoCode {
  id: string
  code: string
  level: PromoLevel
  entity_id: string | null
  discount_type: DiscountType
  discount_value: number
  applicable_services: string[] | null
  max_uses: number | null
  current_uses: number
  expires_at: string | null
  status: 'active' | 'expired' | 'disabled'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown> | null
  channels_sent: string[] | null
  read_at: string | null
  created_at: string
}

export interface JobRating {
  id: string
  job_id: string
  client_id: string
  worker_id: string
  rating: number
  created_at: string
}

export interface WebhookLog {
  id: string
  company_id: string | null
  address_id: string | null
  source: string
  payload: Record<string, unknown>
  parsed_data: Record<string, unknown> | null
  job_ids: string[] | null
  status: WebhookStatus
  error_message: string | null
  created_at: string
}

export interface PlatformBilling {
  id: string
  company_id: string
  billing_month: string
  active_addresses: number
  price_per_address: number
  subtotal: number
  discount_percentage: number
  total: number
  is_annual: boolean
  stripe_invoice_id: string | null
  status: BillingStatus
  paid_at: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  company_id: string | null
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface GpsTrack {
  id: string
  job_id: string
  worker_id: string
  lat: number
  lng: number
  status: string
  recorded_at: string
}

export interface PaymentMethod {
  id: string
  client_id: string
  stripe_payment_method_id: string
  type: PaymentMethodType
  last_four: string | null
  brand: string | null
  is_default: boolean
  assigned_address_ids: string[] | null
  created_at: string
}

export interface PlatformSetting {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface HelpArticle {
  id: string
  slug: string
  category: string
  title: string
  content: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  user_id: string
  company_id: string | null
  type: FeedbackType
  description: string
  screenshot_url: string | null
  status: FeedbackStatus
  votes: number
  created_at: string
  updated_at: string
}
