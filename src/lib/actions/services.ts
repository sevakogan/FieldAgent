'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'
import type { ServiceType, ServiceStatus } from '@/types/database'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type ServiceRow = {
  id: string
  name: string
  description: string | null
  default_price: number
  estimated_duration_minutes: number | null
  photo_required: boolean
  is_outdoor: boolean
  checklist_items: unknown[]
  status: ServiceStatus
  sort_order: number
  created_at: string
}

export async function getServices(): Promise<ActionResult<ServiceRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('service_types')
      .select('id, name, description, default_price, estimated_duration_minutes, photo_required, is_outdoor, checklist_items, status, sort_order, created_at')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: (data ?? []) as ServiceRow[] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch services' }
  }
}

export async function getAllServices(): Promise<ActionResult<ServiceRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('service_types')
      .select('id, name, description, default_price, estimated_duration_minutes, photo_required, is_outdoor, checklist_items, status, sort_order, created_at')
      .eq('company_id', companyId)
      .order('sort_order', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: (data ?? []) as ServiceRow[] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch services' }
  }
}

export async function getService(id: string): Promise<ActionResult<ServiceType>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (error || !data) {
      return { success: false, error: error?.message ?? 'Service not found' }
    }

    return { success: true, data: data as ServiceType }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch service' }
  }
}

export async function createService(data: {
  name: string
  description?: string
  default_price: number
  estimated_duration_minutes?: number
  photo_required?: boolean
  checklist_items?: string[]
  is_outdoor?: boolean
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.name.trim()) {
      return { success: false, error: 'Service name is required' }
    }
    if (data.default_price < 0) {
      return { success: false, error: 'Price must be a positive number' }
    }

    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Get next sort_order
    const { data: lastService } = await supabase
      .from('service_types')
      .select('sort_order')
      .eq('company_id', companyId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const nextSortOrder = (lastService?.sort_order ?? 0) + 1

    const { data: service, error } = await supabase
      .from('service_types')
      .insert({
        company_id: companyId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        default_price: data.default_price,
        estimated_duration_minutes: data.estimated_duration_minutes ?? null,
        photo_required: data.photo_required ?? false,
        checklist_items: data.checklist_items ?? [],
        is_outdoor: data.is_outdoor ?? false,
        sort_order: nextSortOrder,
        status: 'active',
      })
      .select('id')
      .single()

    if (error || !service) {
      return { success: false, error: `Failed to create service: ${error?.message}` }
    }

    return { success: true, data: { id: service.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create service' }
  }
}

export async function updateService(
  id: string,
  data: {
    name?: string
    description?: string
    default_price?: number
    estimated_duration_minutes?: number | null
    photo_required?: boolean
    checklist_items?: string[]
    is_outdoor?: boolean
  }
): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const update: Record<string, unknown> = {}
    if (data.name !== undefined) update.name = data.name.trim()
    if (data.description !== undefined) update.description = data.description.trim() || null
    if (data.default_price !== undefined) update.default_price = data.default_price
    if (data.estimated_duration_minutes !== undefined) update.estimated_duration_minutes = data.estimated_duration_minutes
    if (data.photo_required !== undefined) update.photo_required = data.photo_required
    if (data.checklist_items !== undefined) update.checklist_items = data.checklist_items
    if (data.is_outdoor !== undefined) update.is_outdoor = data.is_outdoor

    if (Object.keys(update).length === 0) {
      return { success: true }
    }

    const { error } = await supabase
      .from('service_types')
      .update(update)
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update service: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update service' }
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('service_types')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to archive service: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to archive service' }
  }
}
