'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type ClientAddress = {
  id: string
  street: string
  unit: string | null
  city: string
  state: string
  zip: string
  is_str: boolean
  status: string
}

export type ClientRow = {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  payment_schedule: string
  address_count: number
  addresses: ClientAddress[]
  created_at: string
}

export type ClientDetail = {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  payment_schedule: string
  auto_pay: boolean
  client_company_id: string
  created_at: string
  addresses: {
    id: string
    street: string
    unit: string | null
    city: string
    state: string
    zip: string
    is_str: boolean
    status: string
  }[]
}

export async function getClients(): Promise<ActionResult<ClientRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Get client_companies for this company
    const { data: clientCompanies, error: ccError } = await supabase
      .from('client_companies')
      .select('client_id, payment_schedule')
      .eq('company_id', companyId)

    if (ccError) {
      return { success: false, error: ccError.message }
    }

    if (!clientCompanies || clientCompanies.length === 0) {
      return { success: true, data: [] }
    }

    const clientIds = clientCompanies.map(cc => cc.client_id)

    // Get clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, user_id, created_at')
      .in('id', clientIds)

    if (clientsError) {
      return { success: false, error: clientsError.message }
    }

    if (!clients || clients.length === 0) {
      return { success: true, data: [] }
    }

    const userIds = clients.map(c => c.user_id)

    // Get users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, phone')
      .in('id', userIds)

    if (usersError) {
      return { success: false, error: usersError.message }
    }

    // Get addresses per client (full details for hover popup)
    const { data: addresses, error: addrError } = await supabase
      .from('addresses')
      .select('id, client_id, street, unit, city, state, zip, is_str, status')
      .eq('company_id', companyId)
      .in('client_id', clientIds)

    if (addrError) {
      return { success: false, error: addrError.message }
    }

    const addressMap = new Map<string, ClientAddress[]>()
    for (const addr of addresses ?? []) {
      const list = addressMap.get(addr.client_id) ?? []
      list.push({
        id: addr.id,
        street: addr.street,
        unit: addr.unit,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        is_str: addr.is_str,
        status: addr.status,
      })
      addressMap.set(addr.client_id, list)
    }

    const userMap = new Map((users ?? []).map(u => [u.id, u]))
    const ccMap = new Map(clientCompanies.map(cc => [cc.client_id, cc]))

    const rows: ClientRow[] = (clients ?? []).map(client => {
      const user = userMap.get(client.user_id)
      const cc = ccMap.get(client.id)
      return {
        id: client.id,
        user_id: client.user_id,
        full_name: user?.full_name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? null,
        payment_schedule: cc?.payment_schedule ?? 'per_job',
        address_count: (addressMap.get(client.id) ?? []).length,
        addresses: addressMap.get(client.id) ?? [],
        created_at: client.created_at,
      }
    })

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch clients' }
  }
}

export async function getClient(id: string): Promise<ActionResult<ClientDetail>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id, created_at')
      .eq('id', id)
      .single()

    if (clientError || !client) {
      return { success: false, error: clientError?.message ?? 'Client not found' }
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('full_name, email, phone')
      .eq('id', client.user_id)
      .single()

    if (userError || !user) {
      return { success: false, error: userError?.message ?? 'User not found' }
    }

    const { data: cc, error: ccError } = await supabase
      .from('client_companies')
      .select('id, payment_schedule, auto_pay')
      .eq('client_id', id)
      .eq('company_id', companyId)
      .single()

    if (ccError || !cc) {
      return { success: false, error: ccError?.message ?? 'Client company record not found' }
    }

    const { data: addresses, error: addrError } = await supabase
      .from('addresses')
      .select('id, street, unit, city, state, zip, is_str, status')
      .eq('client_id', id)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (addrError) {
      return { success: false, error: addrError.message }
    }

    const detail: ClientDetail = {
      id: client.id,
      user_id: client.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      payment_schedule: cc.payment_schedule,
      auto_pay: cc.auto_pay,
      client_company_id: cc.id,
      created_at: client.created_at,
      addresses: addresses ?? [],
    }

    return { success: true, data: detail }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch client' }
  }
}

export async function createClient(data: {
  full_name: string
  email: string
  phone?: string
  payment_schedule?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.full_name.trim()) {
      return { success: false, error: 'Full name is required' }
    }
    if (!data.email.trim()) {
      return { success: false, error: 'Email is required' }
    }

    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email.trim(),
      password: 'TempPass123!',
      email_confirm: true,
    })

    if (authError) {
      return { success: false, error: `Failed to create auth user: ${authError.message}` }
    }

    const userId = authUser.user.id

    // 2. Create public user
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      email: data.email.trim(),
      full_name: data.full_name.trim(),
      phone: data.phone?.trim() || null,
      role: 'client',
    })

    if (userError) {
      return { success: false, error: `Failed to create user record: ${userError.message}` }
    }

    // 3. Create client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({ user_id: userId })
      .select('id')
      .single()

    if (clientError || !client) {
      return { success: false, error: `Failed to create client: ${clientError?.message}` }
    }

    // 4. Create client_companies
    const { error: ccError } = await supabase.from('client_companies').insert({
      client_id: client.id,
      company_id: companyId,
      payment_schedule: data.payment_schedule ?? 'per_job',
      auto_pay: false,
    })

    if (ccError) {
      return { success: false, error: `Failed to link client to company: ${ccError.message}` }
    }

    return { success: true, data: { id: client.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create client' }
  }
}

export async function updateClient(
  id: string,
  data: {
    full_name?: string
    email?: string
    phone?: string
    payment_schedule?: string
    auto_pay?: boolean
  }
): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Get client to find user_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', id)
      .single()

    if (clientError || !client) {
      return { success: false, error: 'Client not found' }
    }

    // Update user fields if provided
    const userUpdate: Record<string, unknown> = {}
    if (data.full_name !== undefined) userUpdate.full_name = data.full_name.trim()
    if (data.email !== undefined) userUpdate.email = data.email.trim()
    if (data.phone !== undefined) userUpdate.phone = data.phone.trim() || null

    if (Object.keys(userUpdate).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdate)
        .eq('id', client.user_id)

      if (userError) {
        return { success: false, error: `Failed to update user: ${userError.message}` }
      }
    }

    // Update client_companies fields if provided
    const ccUpdate: Record<string, unknown> = {}
    if (data.payment_schedule !== undefined) ccUpdate.payment_schedule = data.payment_schedule
    if (data.auto_pay !== undefined) ccUpdate.auto_pay = data.auto_pay

    if (Object.keys(ccUpdate).length > 0) {
      const { error: ccError } = await supabase
        .from('client_companies')
        .update(ccUpdate)
        .eq('client_id', id)
        .eq('company_id', companyId)

      if (ccError) {
        return { success: false, error: `Failed to update client settings: ${ccError.message}` }
      }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update client' }
  }
}

export async function deleteClient(id: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Get client for user_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', id)
      .single()

    if (clientError || !client) {
      return { success: false, error: 'Client not found' }
    }

    // Delete addresses for this client + company
    await supabase
      .from('addresses')
      .delete()
      .eq('client_id', id)
      .eq('company_id', companyId)

    // Delete client_companies
    const { error: ccError } = await supabase
      .from('client_companies')
      .delete()
      .eq('client_id', id)
      .eq('company_id', companyId)

    if (ccError) {
      return { success: false, error: `Failed to delete client company link: ${ccError.message}` }
    }

    // Check if client has other company links
    const { data: otherLinks } = await supabase
      .from('client_companies')
      .select('id')
      .eq('client_id', id)
      .limit(1)

    // Only delete client + user if no other company links
    if (!otherLinks || otherLinks.length === 0) {
      await supabase.from('clients').delete().eq('id', id)
      await supabase.from('users').delete().eq('id', client.user_id)
      await supabase.auth.admin.deleteUser(client.user_id)
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete client' }
  }
}
