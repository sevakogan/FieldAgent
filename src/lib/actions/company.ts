'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId, getOwnerId } from '@/lib/actions/bootstrap'
import type { ActionResult } from '@/lib/actions/jobs'
import type { Company, AutoAssignRule, FeeSetting } from '@/types/database'

export async function getCompany(): Promise<ActionResult<Company>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (error) throw error
    return { success: true, data: data as Company }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load company' }
  }
}

export async function updateCompany(fields: {
  name?: string
  phone?: string | null
  email?: string | null
  business_type?: string
  tax_rate?: number
  auto_approve_timeout_hours?: number
  cancellation_policy_hours?: number
  job_buffer_minutes?: number
  auto_assign_rule?: AutoAssignRule
  review_auto_send_hours?: number
  review_smart_gate?: boolean
  stripe_fee_setting?: FeeSetting
}): Promise<ActionResult<Company>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('companies')
      .update(fields)
      .eq('id', companyId)
      .select('*')
      .single()

    if (error) throw error
    return { success: true, data: data as Company }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update company' }
  }
}

export type NotificationPref = {
  id: string
  type: string
  email: boolean
  sms: boolean
  push: boolean
  in_app: boolean
}

const DEFAULT_NOTIFICATION_TYPES = [
  'new_job',
  'job_completed',
  'job_cancelled',
  'new_message',
  'new_review',
  'payment_received',
  'invoice_overdue',
  'worker_arrived',
]

export async function getNotificationPreferences(): Promise<ActionResult<NotificationPref[]>> {
  try {
    const ownerId = await getOwnerId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('id, type, email, sms, push, in_app')
      .eq('user_id', ownerId)
      .order('type')

    if (error) throw error

    if (!data || data.length === 0) {
      // Return defaults
      return {
        success: true,
        data: DEFAULT_NOTIFICATION_TYPES.map(type => ({
          id: '',
          type,
          email: true,
          sms: true,
          push: true,
          in_app: true,
        })),
      }
    }

    return { success: true, data: data as NotificationPref[] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load notification preferences' }
  }
}

export async function updateNotificationPreferences(
  prefs: { type: string; email: boolean; sms: boolean; push: boolean; in_app: boolean }[]
): Promise<ActionResult> {
  try {
    const ownerId = await getOwnerId()
    const supabase = createAdminClient()

    // Upsert all preferences
    const rows = prefs.map(p => ({
      user_id: ownerId,
      type: p.type,
      email: p.email,
      sms: p.sms,
      push: p.push,
      in_app: p.in_app,
    }))

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(rows, { onConflict: 'user_id,type' })

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update notification preferences' }
  }
}

export async function getCalendarJobs(year: number, month: number): Promise<ActionResult<{
  id: string
  service_name: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
  address_street: string
  worker_name: string | null
}[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, service_type_id, status, scheduled_date, scheduled_time, assigned_worker_id, address_id')
      .eq('company_id', companyId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date')
      .order('scheduled_time')

    if (error) throw error
    if (!jobs || jobs.length === 0) return { success: true, data: [] }

    // Get service names
    const serviceIds = [...new Set(jobs.map(j => j.service_type_id))]
    const { data: services } = await supabase
      .from('service_types')
      .select('id, name')
      .in('id', serviceIds)
    const serviceMap = new Map(services?.map(s => [s.id, s.name]) ?? [])

    // Get worker names
    const workerIds = [...new Set(jobs.map(j => j.assigned_worker_id).filter(Boolean))] as string[]
    const { data: workers } = workerIds.length > 0
      ? await supabase.from('users').select('id, full_name').in('id', workerIds)
      : { data: [] }
    const workerMap = new Map(workers?.map(w => [w.id, w.full_name]) ?? [])

    // Get addresses
    const addressIds = [...new Set(jobs.map(j => j.address_id))]
    const { data: addresses } = await supabase
      .from('addresses')
      .select('id, street')
      .in('id', addressIds)
    const addressMap = new Map(addresses?.map(a => [a.id, a.street]) ?? [])

    const rows = jobs.map(j => ({
      id: j.id,
      service_name: serviceMap.get(j.service_type_id) ?? 'Unknown Service',
      status: j.status,
      scheduled_date: j.scheduled_date,
      scheduled_time: j.scheduled_time,
      address_street: addressMap.get(j.address_id) ?? '',
      worker_name: j.assigned_worker_id ? (workerMap.get(j.assigned_worker_id) ?? null) : null,
    }))

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load calendar jobs' }
  }
}
