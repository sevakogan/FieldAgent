// KleanHQ Constants

export const JOB_STATUSES = [
  'requested', 'approved', 'scheduled', 'driving', 'arrived',
  'in_progress', 'pending_review', 'revision_needed', 'completed', 'charged', 'cancelled'
] as const

export const JOB_STATUS_COLORS: Record<string, string> = {
  requested: '#FF9F0A',
  approved: '#5AC8FA',
  scheduled: '#007AFF',
  driving: '#5AC8FA',
  arrived: '#FFD60A',
  in_progress: '#007AFF',
  pending_review: '#AF52DE',
  revision_needed: '#FF6B6B',
  completed: '#34C759',
  charged: '#34C759',
  cancelled: '#8E8E93',
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  approved: 'Approved',
  scheduled: 'Scheduled',
  driving: 'Driving',
  arrived: 'Arrived',
  in_progress: 'In Progress',
  pending_review: 'Pending Review',
  revision_needed: 'Revision Needed',
  completed: 'Completed',
  charged: 'Charged',
  cancelled: 'Cancelled',
}

export const USER_ROLES = [
  'super_admin', 'reseller', 'owner', 'lead', 'worker', 'client', 'co_client', 'independent_pro'
] as const

export const COMPANY_MEMBER_ROLES = ['owner', 'lead', 'worker'] as const

export const PAY_TYPES = ['per_job', 'hourly', 'percentage', 'manual'] as const

export const PAY_TYPE_LABELS: Record<string, string> = {
  per_job: 'Per Job',
  hourly: 'Hourly',
  percentage: 'Percentage',
  manual: 'Manual',
}

export const INVOICE_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'overdue'] as const

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  pending: '#FF9F0A',
  paid: '#34C759',
  failed: '#FF6B6B',
  refunded: '#AF52DE',
  overdue: '#FF2D55',
}

export const BUSINESS_TYPES = [
  'Cleaning', 'Lawn Care', 'Pool Service', 'Pressure Washing',
  'HVAC', 'Plumbing', 'Electrical', 'Landscaping',
  'Pest Control', 'Handyman', 'Moving', 'Other'
] as const

export const RECURRENCE_OPTIONS = ['one_time', 'weekly', 'biweekly', 'monthly'] as const

export const RECURRENCE_LABELS: Record<string, string> = {
  one_time: 'One Time',
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
}

export const NOTIFICATION_TYPES = [
  'job_assigned', 'job_started', 'job_completed', 'job_cancelled',
  'payment_received', 'payment_failed', 'invoice_sent', 'invoice_overdue',
  'review_requested', 'review_received', 'worker_invited', 'client_invited',
  'quote_received', 'quote_accepted', 'quote_declined',
  'message_received', 'referral_signed_up', 'referral_rewarded',
] as const

export const FEE_MODES = ['company_pays', 'client_pays', 'split_50_50'] as const

export const FEE_MODE_LABELS: Record<string, string> = {
  company_pays: 'Company Pays',
  client_pays: 'Client Pays',
  split_50_50: 'Split 50/50',
}

export const INTEGRATION_SOURCES = ['airbnb', 'vrbo', 'hospitable', 'hostaway', 'guesty'] as const

export const COLORS = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  border: '#E5E5EA',
  primary: '#007AFF',
  yellow: '#FFD60A',
  lilac: '#AF52DE',
  mint: '#5AC8FA',
  peach: '#FF9F0A',
  coral: '#FF6B6B',
  rose: '#FF2D55',
  slate: '#8E8E93',
  green: '#34C759',
  textPrimary: '#1C1C1E',
  textSecondary: '#3C3C43',
  textTertiary: '#AEAEB2',
} as const
