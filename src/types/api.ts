import type { JobStatus, InvoiceStatus, PayType, Recurrence, FeedbackType, JobSource } from './database'

// Generic API response envelope
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

// Job
export interface CreateJobInput {
  company_id: string
  address_id: string
  service_type_id: string
  assigned_worker_id?: string
  source: JobSource
  scheduled_date: string
  scheduled_time?: string
  price: number
  auto_approve?: boolean
  checklist_items?: string[]
  custom_fields?: Record<string, unknown>
}

export interface UpdateJobInput {
  status?: JobStatus
  assigned_worker_id?: string
  scheduled_date?: string
  scheduled_time?: string
  price?: number
  rejection_reason?: string
  cancellation_reason?: string
  tip_amount?: number
}

// Client
export interface CreateClientInput {
  full_name: string
  email: string
  phone?: string
  company_id: string
  send_invite?: boolean
}

export interface UpdateClientInput {
  full_name?: string
  email?: string
  phone?: string
}

// Address
export interface CreateAddressInput {
  client_id: string
  company_id: string
  street: string
  unit?: string
  city: string
  state: string
  zip: string
  is_str?: boolean
  integration_source?: string
}

// Service Type
export interface CreateServiceTypeInput {
  company_id: string
  name: string
  description?: string
  default_price: number
  estimated_duration_minutes?: number
  photo_required?: boolean
  checklist_items?: string[]
  custom_fields?: unknown[]
  is_outdoor?: boolean
}

// Team Member
export interface CreateMemberInput {
  company_id: string
  full_name: string
  email: string
  phone?: string
  role: 'lead' | 'worker'
  pay_type: PayType
  pay_rate: number
}

// Invoice
export interface CreateInvoiceInput {
  company_id: string
  client_id: string
  job_id?: string
  items: InvoiceLineItem[]
  tax_amount?: number
  due_date?: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

// Quote
export interface CreateQuoteInput {
  company_id: string
  client_id: string
  address_id: string
  services: QuoteServiceItem[]
  notes?: string
  deposit_required?: boolean
  deposit_percentage?: number
  expires_at?: string
}

export interface QuoteServiceItem {
  service_type_id: string
  name: string
  price: number
  recurrence: Recurrence
}

// Payment
export interface CreatePaymentInput {
  invoice_id: string
  payment_method_id: string
  amount: number
  tip_amount?: number
}

// Message
export interface SendMessageInput {
  company_id: string
  client_id: string
  content: string
  channel?: 'in_app' | 'email' | 'sms' | 'whatsapp'
}

// Feedback
export interface SubmitFeedbackInput {
  type: FeedbackType
  description: string
  screenshot_url?: string
}

// Referral
export interface CreateReferralInput {
  referrer_type: 'company' | 'reseller' | 'client' | 'worker'
  referred_type: 'company' | 'reseller' | 'client' | 'worker'
}

// Filters
export interface JobFilters {
  status?: JobStatus
  worker_id?: string
  address_id?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface InvoiceFilters {
  status?: InvoiceStatus
  client_id?: string
  date_from?: string
  date_to?: string
}
