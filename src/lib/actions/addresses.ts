'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type AddressRow = {
  id: string
  street: string
  unit: string | null
  city: string
  state: string
  zip: string
  is_str: boolean
  status: string
  client_id: string
  client_name: string
  created_at: string
}

export type AddressDetail = {
  id: string
  client_id: string
  client_name: string
  client_email: string
  street: string
  unit: string | null
  city: string
  state: string
  zip: string
  lat: number | null
  lng: number | null
  is_str: boolean
  status: string
  integration_source: string | null
  created_at: string
  updated_at: string
  services: {
    id: string
    service_name: string
    price: number
    recurrence: string
    status: string
  }[]
}

export async function getAddresses(): Promise<ActionResult<AddressRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: addresses, error: addrError } = await supabase
      .from('addresses')
      .select('id, street, unit, city, state, zip, is_str, status, client_id, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (addrError) {
      return { success: false, error: addrError.message }
    }

    if (!addresses || addresses.length === 0) {
      return { success: true, data: [] }
    }

    // Get unique client ids
    const clientIds = [...new Set(addresses.map(a => a.client_id))]

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, user_id')
      .in('id', clientIds)

    if (clientsError) {
      return { success: false, error: clientsError.message }
    }

    const userIds = (clients ?? []).map(c => c.user_id)

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', userIds)

    if (usersError) {
      return { success: false, error: usersError.message }
    }

    const clientUserMap = new Map(
      (clients ?? []).map(c => {
        const user = (users ?? []).find(u => u.id === c.user_id)
        return [c.id, user?.full_name ?? 'Unknown']
      })
    )

    const rows: AddressRow[] = addresses.map(addr => ({
      id: addr.id,
      street: addr.street,
      unit: addr.unit,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      is_str: addr.is_str,
      status: addr.status,
      client_id: addr.client_id,
      client_name: clientUserMap.get(addr.client_id) ?? 'Unknown',
      created_at: addr.created_at,
    }))

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch addresses' }
  }
}

export async function getAddress(id: string): Promise<ActionResult<AddressDetail>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: address, error: addrError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (addrError || !address) {
      return { success: false, error: addrError?.message ?? 'Address not found' }
    }

    // Get client + user info
    const { data: client } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', address.client_id)
      .single()

    let clientName = 'Unknown'
    let clientEmail = ''

    if (client) {
      const { data: user } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', client.user_id)
        .single()

      if (user) {
        clientName = user.full_name
        clientEmail = user.email
      }
    }

    // Get address services
    const { data: addressServices } = await supabase
      .from('address_services')
      .select('id, service_type_id, price, recurrence, status')
      .eq('address_id', id)

    let services: AddressDetail['services'] = []

    if (addressServices && addressServices.length > 0) {
      const serviceTypeIds = addressServices.map(as => as.service_type_id)
      const { data: serviceTypes } = await supabase
        .from('service_types')
        .select('id, name')
        .in('id', serviceTypeIds)

      const serviceNameMap = new Map((serviceTypes ?? []).map(st => [st.id, st.name]))

      services = addressServices.map(as => ({
        id: as.id,
        service_name: serviceNameMap.get(as.service_type_id) ?? 'Unknown Service',
        price: as.price,
        recurrence: as.recurrence,
        status: as.status,
      }))
    }

    const detail: AddressDetail = {
      id: address.id,
      client_id: address.client_id,
      client_name: clientName,
      client_email: clientEmail,
      street: address.street,
      unit: address.unit,
      city: address.city,
      state: address.state,
      zip: address.zip,
      lat: address.lat,
      lng: address.lng,
      is_str: address.is_str,
      status: address.status,
      integration_source: address.integration_source,
      created_at: address.created_at,
      updated_at: address.updated_at,
      services,
    }

    return { success: true, data: detail }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch address' }
  }
}

export async function createAddress(data: {
  client_id: string
  street: string
  unit?: string
  city: string
  state: string
  zip: string
  is_str?: boolean
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.client_id) {
      return { success: false, error: 'Client is required' }
    }
    if (!data.street.trim()) {
      return { success: false, error: 'Street address is required' }
    }
    if (!data.city.trim()) {
      return { success: false, error: 'City is required' }
    }
    if (!data.state.trim()) {
      return { success: false, error: 'State is required' }
    }
    if (!data.zip.trim()) {
      return { success: false, error: 'ZIP code is required' }
    }

    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        client_id: data.client_id,
        company_id: companyId,
        street: data.street.trim(),
        unit: data.unit?.trim() || null,
        city: data.city.trim(),
        state: data.state.trim(),
        zip: data.zip.trim(),
        is_str: data.is_str ?? false,
        status: 'active',
      })
      .select('id')
      .single()

    if (error || !address) {
      return { success: false, error: `Failed to create address: ${error?.message}` }
    }

    return { success: true, data: { id: address.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create address' }
  }
}

export async function updateAddress(
  id: string,
  data: {
    street?: string
    unit?: string
    city?: string
    state?: string
    zip?: string
    is_str?: boolean
    status?: string
  }
): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const update: Record<string, unknown> = {}
    if (data.street !== undefined) update.street = data.street.trim()
    if (data.unit !== undefined) update.unit = data.unit.trim() || null
    if (data.city !== undefined) update.city = data.city.trim()
    if (data.state !== undefined) update.state = data.state.trim()
    if (data.zip !== undefined) update.zip = data.zip.trim()
    if (data.is_str !== undefined) update.is_str = data.is_str
    if (data.status !== undefined) update.status = data.status

    if (Object.keys(update).length === 0) {
      return { success: true }
    }

    const { error } = await supabase
      .from('addresses')
      .update(update)
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update address: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update address' }
  }
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to delete address: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete address' }
  }
}

export async function addServiceToAddress(data: {
  address_id: string
  service_type_id: string
  price: number
  recurrence?: string
  assigned_worker_id?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.address_id) {
      return { success: false, error: 'Address is required' }
    }
    if (!data.service_type_id) {
      return { success: false, error: 'Service type is required' }
    }
    if (data.price < 0) {
      return { success: false, error: 'Price must be a positive number' }
    }

    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Verify the address belongs to this company
    const { data: address, error: addrError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', data.address_id)
      .eq('company_id', companyId)
      .single()

    if (addrError || !address) {
      return { success: false, error: 'Address not found' }
    }

    const { data: record, error } = await supabase
      .from('address_services')
      .insert({
        address_id: data.address_id,
        service_type_id: data.service_type_id,
        price: data.price,
        recurrence: data.recurrence ?? 'one_time',
        assigned_worker_id: data.assigned_worker_id || null,
        status: 'active',
      })
      .select('id')
      .single()

    if (error || !record) {
      return { success: false, error: `Failed to add service: ${error?.message}` }
    }

    return { success: true, data: { id: record.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add service to address' }
  }
}

export async function removeServiceFromAddress(addressServiceId: string): Promise<ActionResult> {
  try {
    if (!addressServiceId) {
      return { success: false, error: 'Address service ID is required' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('address_services')
      .delete()
      .eq('id', addressServiceId)

    if (error) {
      return { success: false, error: `Failed to remove service: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove service' }
  }
}
