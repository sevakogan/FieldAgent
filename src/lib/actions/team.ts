'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId } from '@/lib/actions/bootstrap'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type TeamMemberRow = {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: string
  pay_type: string | null
  pay_rate: number | null
  status: string
  created_at: string
}

export type TeamMemberDetail = {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: string
  pay_type: string | null
  pay_rate: number | null
  stripe_payout_account_id: string | null
  availability: Record<string, unknown> | null
  status: string
  created_at: string
  updated_at: string
  recent_jobs_count: number
}

export type PayoutRow = {
  id: string
  worker_name: string
  job_id: string | null
  amount: number
  pay_type: string
  status: string
  paid_at: string | null
  created_at: string
}

export type PayoutSummary = {
  total_paid: number
  total_pending: number
  workers_count: number
}

export async function getTeamMembers(): Promise<ActionResult<TeamMemberRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: members, error: membersError } = await supabase
      .from('company_members')
      .select('id, user_id, role, pay_type, pay_rate, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (membersError) {
      return { success: false, error: membersError.message }
    }

    if (!members || members.length === 0) {
      return { success: true, data: [] }
    }

    const userIds = members.map(m => m.user_id)

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, avatar_url')
      .in('id', userIds)

    if (usersError) {
      return { success: false, error: usersError.message }
    }

    const userMap = new Map((users ?? []).map(u => [u.id, u]))

    const rows: TeamMemberRow[] = members.map(member => {
      const user = userMap.get(member.user_id)
      return {
        id: member.id,
        user_id: member.user_id,
        full_name: user?.full_name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? null,
        avatar_url: user?.avatar_url ?? null,
        role: member.role,
        pay_type: member.pay_type,
        pay_rate: member.pay_rate,
        status: member.status,
        created_at: member.created_at,
      }
    })

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch team members' }
  }
}

export async function getTeamMember(id: string): Promise<ActionResult<TeamMemberDetail>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: member, error: memberError } = await supabase
      .from('company_members')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (memberError || !member) {
      return { success: false, error: memberError?.message ?? 'Team member not found' }
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('full_name, email, phone, avatar_url')
      .eq('id', member.user_id)
      .single()

    if (userError || !user) {
      return { success: false, error: userError?.message ?? 'User not found' }
    }

    // Count recent jobs assigned to this worker
    const { count, error: jobsError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('assigned_worker_id', member.user_id)

    if (jobsError) {
      console.error('Error counting jobs:', jobsError.message)
    }

    const detail: TeamMemberDetail = {
      id: member.id,
      user_id: member.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: member.role,
      pay_type: member.pay_type,
      pay_rate: member.pay_rate,
      stripe_payout_account_id: member.stripe_payout_account_id,
      availability: member.availability,
      status: member.status,
      created_at: member.created_at,
      updated_at: member.updated_at,
      recent_jobs_count: count ?? 0,
    }

    return { success: true, data: detail }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch team member' }
  }
}

export type ServicePayConfig = {
  service_id: string
  enabled: boolean
  pay_type: string
  pay_rate: number | null
}

export async function inviteTeamMember(data: {
  full_name: string
  email: string
  phone?: string
  role: 'lead' | 'worker'
  pay_type?: string
  pay_rate?: number
  service_pay?: ServicePayConfig[]
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
      if (authError.message.includes('already been registered') || authError.message.includes('duplicate')) {
        return { success: false, error: 'A user with this email already exists' }
      }
      return { success: false, error: `Failed to create user account: ${authError.message}` }
    }

    const userId = authUser.user.id

    // 2. Create public user record
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      email: data.email.trim(),
      full_name: data.full_name.trim(),
      phone: data.phone?.trim() || null,
      role: 'worker',
    })

    if (userError) {
      return { success: false, error: `Failed to create user record: ${userError.message}` }
    }

    // 3. Create company_members record
    const { data: member, error: memberError } = await supabase
      .from('company_members')
      .insert({
        company_id: companyId,
        user_id: userId,
        role: data.role,
        pay_type: data.pay_type ?? null,
        pay_rate: data.pay_rate ?? null,
        status: 'invited',
        availability: data.service_pay ? { services: Object.fromEntries(
          data.service_pay.filter(s => s.enabled).map(s => [s.service_id, {
            pay_type: s.pay_type,
            pay_rate: s.pay_rate,
          }])
        ) } : null,
      })
      .select('id')
      .single()

    if (memberError || !member) {
      return { success: false, error: `Failed to create team member: ${memberError?.message}` }
    }

    return { success: true, data: { id: member.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to invite team member' }
  }
}

export async function updateTeamMember(
  id: string,
  data: {
    role?: string
    pay_type?: string
    pay_rate?: number
    status?: string
  }
): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const update: Record<string, unknown> = {}
    if (data.role !== undefined) update.role = data.role
    if (data.pay_type !== undefined) update.pay_type = data.pay_type
    if (data.pay_rate !== undefined) update.pay_rate = data.pay_rate
    if (data.status !== undefined) update.status = data.status

    if (Object.keys(update).length === 0) {
      return { success: true }
    }

    const { error } = await supabase
      .from('company_members')
      .update(update)
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to update team member: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update team member' }
  }
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    // Get member for user_id before deleting
    const { data: member, error: fetchError } = await supabase
      .from('company_members')
      .select('user_id')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (fetchError || !member) {
      return { success: false, error: 'Team member not found' }
    }

    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)

    if (error) {
      return { success: false, error: `Failed to remove team member: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete team member' }
  }
}

export async function getTeamPayouts(): Promise<ActionResult<{ payouts: PayoutRow[]; summary: PayoutSummary }>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: payouts, error: payoutsError } = await supabase
      .from('worker_payouts')
      .select('id, worker_id, job_id, amount, pay_type, status, paid_at, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (payoutsError) {
      return { success: false, error: payoutsError.message }
    }

    if (!payouts || payouts.length === 0) {
      return {
        success: true,
        data: {
          payouts: [],
          summary: { total_paid: 0, total_pending: 0, workers_count: 0 },
        },
      }
    }

    // Get worker user info
    const workerIds = [...new Set(payouts.map(p => p.worker_id))]

    // worker_id references company_members.id — get user_ids first
    const { data: members, error: membersError } = await supabase
      .from('company_members')
      .select('id, user_id')
      .in('id', workerIds)

    if (membersError) {
      return { success: false, error: membersError.message }
    }

    const memberUserMap = new Map((members ?? []).map(m => [m.id, m.user_id]))
    const userIds = [...new Set([...(members ?? []).map(m => m.user_id)])]

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', userIds)

    if (usersError) {
      return { success: false, error: usersError.message }
    }

    const userNameMap = new Map((users ?? []).map(u => [u.id, u.full_name]))

    const rows: PayoutRow[] = payouts.map(p => {
      const userId = memberUserMap.get(p.worker_id)
      return {
        id: p.id,
        worker_name: userId ? (userNameMap.get(userId) ?? 'Unknown') : 'Unknown',
        job_id: p.job_id,
        amount: p.amount,
        pay_type: p.pay_type,
        status: p.status,
        paid_at: p.paid_at,
        created_at: p.created_at,
      }
    })

    const summary: PayoutSummary = {
      total_paid: payouts
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0),
      total_pending: payouts
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      workers_count: workerIds.length,
    }

    return { success: true, data: { payouts: rows, summary } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch payouts' }
  }
}

export async function createPayout(data: {
  worker_id: string
  amount: number
  pay_type: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: payout, error } = await supabase
      .from('worker_payouts')
      .insert({
        company_id: companyId,
        worker_id: data.worker_id,
        amount: data.amount,
        pay_type: data.pay_type,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: payout.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create payout' }
  }
}
