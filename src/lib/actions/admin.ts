'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/lib/actions/jobs'

// ─── Overview ────────────────────────────────────────────────────────
export async function getAdminOverview(): Promise<ActionResult<{
  totalCompanies: number
  mrr: number
  totalRevenue: number
  recentSignups: Array<{ id: string; name: string; status: string; created_at: string }>
  recentActivity: Array<{ id: string; action: string; entity_type: string; entity_id: string; created_at: string }>
}>> {
  try {
    const supabase = createAdminClient()

    const [companiesRes, invoicesPaidRes, recentRes] = await Promise.all([
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('invoices').select('total').eq('status', 'paid'),
      supabase.from('companies').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(5),
    ])

    // activity_log may not exist yet
    const activityRes = await supabase.from('activity_log').select('id, action, entity_type, entity_id, created_at').order('created_at', { ascending: false }).limit(5)

    const totalCompanies = companiesRes.count ?? 0
    const totalRevenue = (invoicesPaidRes.data ?? []).reduce((sum, inv) => sum + (inv.total ?? 0), 0)

    // MRR: sum of most recent month's paid invoices
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const mrrRes = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid')
      .gte('created_at', startOfMonth)

    const mrr = (mrrRes.data ?? []).reduce((sum, inv) => sum + (inv.total ?? 0), 0)

    return {
      success: true,
      data: {
        totalCompanies,
        mrr,
        totalRevenue,
        recentSignups: recentRes.data ?? [],
        recentActivity: activityRes.data ?? [],
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load overview' }
  }
}

// ─── Companies ───────────────────────────────────────────────────────
export async function getAdminCompanies(): Promise<ActionResult<Array<{
  id: string
  name: string
  business_type: string | null
  status: string
  created_at: string
  owner_id: string | null
  owner_name: string | null
  owner_email: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, business_type, status, created_at, owner_id, users!companies_owner_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (data ?? []).map((c: Record<string, unknown>) => {
      const user = c.users as { full_name: string | null; email: string | null } | null
      return {
        id: c.id as string,
        name: c.name as string,
        business_type: c.business_type as string | null,
        status: c.status as string,
        created_at: c.created_at as string,
        owner_id: c.owner_id as string | null,
        owner_name: user?.full_name ?? null,
        owner_email: user?.email ?? null,
      }
    })

    return { success: true, data: mapped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load companies' }
  }
}

// ─── Resellers ───────────────────────────────────────────────────────
export async function getAdminResellers(): Promise<ActionResult<Array<{
  id: string
  brand_name: string | null
  slug: string | null
  margin_percentage: number | null
  status: string
  properties_count: number | null
  created_at: string
  user_name: string | null
  user_email: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('resellers')
      .select('id, brand_name, slug, margin_percentage, status, properties_count, created_at, users!resellers_user_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (data ?? []).map((r: Record<string, unknown>) => {
      const user = r.users as { full_name: string | null; email: string | null } | null
      return {
        id: r.id as string,
        brand_name: r.brand_name as string | null,
        slug: r.slug as string | null,
        margin_percentage: r.margin_percentage as number | null,
        status: r.status as string,
        properties_count: r.properties_count as number | null,
        created_at: r.created_at as string,
        user_name: user?.full_name ?? null,
        user_email: user?.email ?? null,
      }
    })

    return { success: true, data: mapped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load resellers' }
  }
}

// ─── Billing / Invoices ──────────────────────────────────────────────
export async function getAdminBilling(): Promise<ActionResult<{
  mrr: number
  totalCollected: number
  outstanding: number
  overdueCount: number
  invoices: Array<{
    id: string
    total: number
    status: string
    created_at: string
    company_name: string | null
  }>
}>> {
  try {
    const supabase = createAdminClient()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [mrrRes, allPaidRes, outstandingRes, invoicesRes] = await Promise.all([
      supabase.from('invoices').select('total').eq('status', 'paid').gte('created_at', startOfMonth),
      supabase.from('invoices').select('total').eq('status', 'paid'),
      supabase.from('invoices').select('total, status').in('status', ['pending', 'overdue']),
      supabase
        .from('invoices')
        .select('id, total, status, created_at, companies!invoices_company_id_fkey(name)')
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    const mrr = (mrrRes.data ?? []).reduce((sum, i) => sum + (i.total ?? 0), 0)
    const totalCollected = (allPaidRes.data ?? []).reduce((sum, i) => sum + (i.total ?? 0), 0)
    const outstanding = (outstandingRes.data ?? []).reduce((sum, i) => sum + (i.total ?? 0), 0)
    const overdueCount = (outstandingRes.data ?? []).filter(i => i.status === 'overdue').length

    const invoices = (invoicesRes.data ?? []).map((inv: Record<string, unknown>) => {
      const company = inv.companies as { name: string } | null
      return {
        id: inv.id as string,
        total: inv.total as number,
        status: inv.status as string,
        created_at: inv.created_at as string,
        company_name: company?.name ?? null,
      }
    })

    return { success: true, data: { mrr, totalCollected, outstanding, overdueCount, invoices } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load billing' }
  }
}

// ─── Revenue ─────────────────────────────────────────────────────────
export async function getAdminRevenue(): Promise<ActionResult<{
  invoices: Array<{ total: number; status: string; created_at: string }>
}>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('total, status, created_at')
      .order('created_at', { ascending: true })

    if (error) throw error
    return { success: true, data: { invoices: data ?? [] } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load revenue' }
  }
}

// ─── Referrals ───────────────────────────────────────────────────────
export async function getAdminReferrals(): Promise<ActionResult<Array<{
  id: string
  referrer_type: string | null
  referred_email: string | null
  referral_code: string | null
  status: string
  reward_type: string | null
  reward_value: number | null
  created_at: string
  company_name: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('referrals')
      .select('id, referrer_type, referred_email, referral_code, status, reward_type, reward_value, created_at, companies!referrals_company_id_fkey(name)')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: true, data: [] }
    }

    const mapped = (data ?? []).map((r: Record<string, unknown>) => {
      const company = r.companies as { name: string } | null
      return {
        id: r.id as string,
        referrer_type: r.referrer_type as string | null,
        referred_email: r.referred_email as string | null,
        referral_code: r.referral_code as string | null,
        status: r.status as string,
        reward_type: r.reward_type as string | null,
        reward_value: r.reward_value as number | null,
        created_at: r.created_at as string,
        company_name: company?.name ?? null,
      }
    })

    return { success: true, data: mapped }
  } catch {
    return { success: true, data: [] }
  }
}

// ─── Waitlist ────────────────────────────────────────────────────────
export async function getAdminWaitlist(): Promise<ActionResult<Array<Record<string, unknown>>>> {
  try {
    const supabase = createAdminClient()
    // Try both possible table names
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist — try alternate name
      const { data: data2, error: error2 } = await supabase
        .from('waitlist_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error2) {
        // Neither table exists — return empty
        return { success: true, data: [] }
      }
      return { success: true, data: data2 ?? [] }
    }

    return { success: true, data: data ?? [] }
  } catch {
    return { success: true, data: [] }
  }
}

// ─── Promo Codes ─────────────────────────────────────────────────────
export async function getAdminPromoCodes(): Promise<ActionResult<Array<{
  id: string
  code: string
  level: string | null
  discount_type: string | null
  discount_value: number | null
  max_uses: number | null
  current_uses: number | null
  expires_at: string | null
  status: string
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('promo_codes')
      .select('id, code, level, discount_type, discount_value, max_uses, current_uses, expires_at, status, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data ?? [] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load promo codes' }
  }
}

export async function createPromoCode(fields: {
  code: string
  discount_type: string
  discount_value: number
  max_uses: number
  expires_at: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: fields.code.toUpperCase(),
        level: 'platform',
        discount_type: fields.discount_type,
        discount_value: fields.discount_value,
        max_uses: fields.max_uses,
        expires_at: fields.expires_at,
        status: 'active',
        current_uses: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create promo code' }
  }
}

export async function updatePromoCodeStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('promo_codes')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update promo code' }
  }
}

// ─── Webhooks ────────────────────────────────────────────────────────
export async function getAdminWebhooks(): Promise<ActionResult<Array<{
  id: string
  source: string | null
  event_type: string | null
  status: string
  processed_at: string | null
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('id, source, event_type, status, processed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      // Table might not exist yet
      return { success: true, data: [] }
    }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: true, data: [] }
  }
}

// ─── Analytics ───────────────────────────────────────────────────────
export async function getAdminAnalytics(): Promise<ActionResult<{
  totalUsers: number
  totalCompanies: number
  companies: Array<{ id: string; name: string; created_at: string }>
}>> {
  try {
    const supabase = createAdminClient()

    const [usersRes, companiesCountRes, companiesRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id, name, created_at').order('created_at', { ascending: true }),
    ])

    return {
      success: true,
      data: {
        totalUsers: usersRes.count ?? 0,
        totalCompanies: companiesCountRes.count ?? 0,
        companies: companiesRes.data ?? [],
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load analytics' }
  }
}

// ─── Feedback ────────────────────────────────────────────────────────
export async function getAdminFeedback(): Promise<ActionResult<Array<{
  id: string
  type: string | null
  title: string | null
  description: string | null
  status: string
  votes: number | null
  created_at: string
  user_name: string | null
  user_email: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('feedback')
      .select('id, type, title, description, status, votes, created_at, users!feedback_user_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist yet
      return { success: true, data: [] }
    }

    const mapped = (data ?? []).map((f: Record<string, unknown>) => {
      const user = f.users as { full_name: string | null; email: string | null } | null
      return {
        id: f.id as string,
        type: f.type as string | null,
        title: f.title as string | null,
        description: f.description as string | null,
        status: f.status as string,
        votes: f.votes as number | null,
        created_at: f.created_at as string,
        user_name: user?.full_name ?? null,
        user_email: user?.email ?? null,
      }
    })

    return { success: true, data: mapped }
  } catch {
    return { success: true, data: [] }
  }
}

// ─── Help Articles ───────────────────────────────────────────────────
export async function getAdminHelpArticles(): Promise<ActionResult<Array<{
  id: string
  title: string
  category: string | null
  content: string | null
  views: number | null
  helpful_count: number | null
  status: string
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('help_articles')
      .select('id, title, category, content, views, helpful_count, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: true, data: [] }
    }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: true, data: [] }
  }
}

// ─── Platform Settings ───────────────────────────────────────────────
export async function getAdminSettings(): Promise<ActionResult<Array<{
  key: string
  value: string | null
  description: string | null
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value, description')
      .order('key', { ascending: true })

    if (error) {
      return { success: true, data: [] }
    }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: true, data: [] }
  }
}

export async function updateAdminSetting(key: string, value: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value }, { onConflict: 'key' })

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update setting' }
  }
}

// ─── Reseller Mutations ─────────────────────────────────────────────
export async function createAdminReseller(fields: {
  brand_name: string
  user_email: string
  margin_percentage: number
  slug: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()

    // Check if user already exists by email
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', fields.user_email)
      .limit(1)

    let userId: string

    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: fields.user_email,
        email_confirm: true,
      })
      if (authError) throw authError

      userId = authData.user.id

      // Create users record
      const { error: userError } = await supabase
        .from('users')
        .insert({ id: userId, email: fields.user_email, role: 'reseller' })
      if (userError) throw userError
    }

    // Create resellers record
    const { data, error } = await supabase
      .from('resellers')
      .insert({
        user_id: userId,
        brand_name: fields.brand_name,
        slug: fields.slug,
        margin_percentage: fields.margin_percentage,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create reseller' }
  }
}

export async function updateResellerStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('resellers')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update reseller status' }
  }
}

// ─── Company Mutations ──────────────────────────────────────────────
export async function updateCompanyStatus(companyId: string, status: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('companies')
      .update({ status })
      .eq('id', companyId)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update company status' }
  }
}

export async function updateCompany(companyId: string, fields: {
  name?: string
  business_type?: string
  phone?: string
  email?: string
  ownerName?: string
}): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    // Update company fields
    const companyUpdate: Record<string, string> = {}
    if (fields.name !== undefined) companyUpdate.name = fields.name
    if (fields.business_type !== undefined) companyUpdate.business_type = fields.business_type
    if (fields.phone !== undefined) companyUpdate.phone = fields.phone
    if (fields.email !== undefined) companyUpdate.email = fields.email

    if (Object.keys(companyUpdate).length > 0) {
      const { error } = await supabase.from('companies').update(companyUpdate).eq('id', companyId)
      if (error) throw error
    }

    // Update owner name if provided
    if (fields.ownerName !== undefined) {
      const { data: company } = await supabase.from('companies').select('owner_id').eq('id', companyId).single()
      if (company?.owner_id) {
        await supabase.from('users').update({ full_name: fields.ownerName }).eq('id', company.owner_id)
      }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update company' }
  }
}

export async function canDeleteCompany(companyId: string): Promise<ActionResult<{ canDelete: boolean; reason?: string }>> {
  try {
    const supabase = createAdminClient()

    // Check for unpaid invoices
    const { data: unpaidInvoices, error: invErr } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['pending', 'overdue'])

    if (invErr) throw invErr
    if ((unpaidInvoices as unknown as number) > 0 || (invErr === null && unpaidInvoices !== null)) {
      // Use count from header
    }

    // Re-query with count
    const { count: unpaidCount } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['pending', 'overdue'])

    if (unpaidCount && unpaidCount > 0) {
      return { success: true, data: { canDelete: false, reason: `Company has ${unpaidCount} unpaid invoice(s). Resolve payments before deleting.` } }
    }

    // Check for active Stripe subscriptions (stripe_account_id present = might have active billing)
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_account_id')
      .eq('id', companyId)
      .single()

    if (company?.stripe_account_id) {
      // Has Stripe connected — check for recent paid invoices in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count: recentPaid } = await supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'paid')
        .gte('paid_at', thirtyDaysAgo)

      if (recentPaid && recentPaid > 0) {
        return { success: true, data: { canDelete: false, reason: `Company has ${recentPaid} paid invoice(s) in the last 30 days. Wait until billing cycle completes.` } }
      }
    }

    return { success: true, data: { canDelete: true } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to check delete eligibility' }
  }
}

export async function deleteCompany(companyId: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    // Final safety check
    const check = await canDeleteCompany(companyId)
    if (!check.success || !check.data?.canDelete) {
      return { success: false, error: check.data?.reason ?? 'Cannot delete this company' }
    }

    // Delete in dependency order
    // 1. Job-related
    await supabase.from('job_media').delete().in('job_id',
      (await supabase.from('jobs').select('id').eq('company_id', companyId)).data?.map(j => j.id) ?? []
    )
    await supabase.from('job_expenses').delete().in('job_id',
      (await supabase.from('jobs').select('id').eq('company_id', companyId)).data?.map(j => j.id) ?? []
    )
    await supabase.from('worker_payouts').delete().eq('company_id', companyId)
    await supabase.from('jobs').delete().eq('company_id', companyId)

    // 2. Address-related
    await supabase.from('address_services').delete().in('address_id',
      (await supabase.from('addresses').select('id').eq('company_id', companyId)).data?.map(a => a.id) ?? []
    )
    await supabase.from('addresses').delete().eq('company_id', companyId)

    // 3. Client links
    await supabase.from('client_companies').delete().eq('company_id', companyId)

    // 4. Services, invoices, quotes, messages, etc.
    await supabase.from('invoices').delete().eq('company_id', companyId)
    await supabase.from('quotes').delete().eq('company_id', companyId)
    await supabase.from('contracts').delete().eq('company_id', companyId)
    await supabase.from('messages').delete().eq('company_id', companyId)
    await supabase.from('notifications').delete().eq('company_id', companyId)
    await supabase.from('service_types').delete().eq('company_id', companyId)
    await supabase.from('referrals').delete().eq('company_id', companyId)
    await supabase.from('activity_log').delete().eq('company_id', companyId)

    // 5. Company members
    await supabase.from('company_members').delete().eq('company_id', companyId)

    // 6. Company itself
    const { error } = await supabase.from('companies').delete().eq('id', companyId)
    if (error) throw error

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete company' }
  }
}

// ─── Waitlist Mutations ─────────────────────────────────────────────
export async function approveWaitlistEntry(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('waitlist_entries')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to approve waitlist entry' }
  }
}

export async function rejectWaitlistEntry(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('waitlist_entries')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to reject waitlist entry' }
  }
}

// ─── Feedback Mutations ─────────────────────────────────────────────
export async function updateFeedbackStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update feedback status' }
  }
}

// ─── Help Article Mutations ─────────────────────────────────────────
export async function createHelpArticle(fields: {
  title: string
  category: string
  content: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('help_articles')
      .insert({
        title: fields.title,
        category: fields.category,
        content: fields.content,
        status: 'published',
        views: 0,
        helpful_count: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create help article' }
  }
}

export async function deleteHelpArticle(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('help_articles')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete help article' }
  }
}

// ─── Webhook Mutations ──────────────────────────────────────────────
export async function retryWebhook(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('webhook_logs')
      .update({ status: 'received', processed_at: null })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to retry webhook' }
  }
}

// ─── Referral Status Update ────────────────────────────────────────
export async function updateReferralStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('referrals')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update referral status' }
  }
}

// ─── Changelog (stored as help_articles with category='changelog') ─
export async function getChangelogEntries(): Promise<ActionResult<Array<{
  id: string
  title: string
  content: string | null
  version: string | null
  entry_type: string | null
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('help_articles')
      .select('id, title, content, category, status, created_at')
      .eq('category', 'changelog')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not support this query — return empty
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { success: true, data: [] }
      }
      throw error
    }

    const mapped = (data ?? []).map((a: Record<string, unknown>) => {
      // Parse version and type from title format: "[version] title" and status as type
      const titleStr = a.title as string
      const versionMatch = titleStr.match(/^\[([^\]]+)\]\s*/)
      return {
        id: a.id as string,
        title: versionMatch ? titleStr.replace(versionMatch[0], '') : titleStr,
        content: a.content as string | null,
        version: versionMatch ? versionMatch[1] : null,
        entry_type: a.status as string | null,
        created_at: a.created_at as string,
      }
    })

    return { success: true, data: mapped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load changelog' }
  }
}

export async function createChangelogEntry(fields: {
  version: string
  title: string
  description: string
  type: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('help_articles')
      .insert({
        title: `[${fields.version}] ${fields.title}`,
        content: fields.description,
        category: 'changelog',
        status: fields.type,
        views: 0,
        helpful_count: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create changelog entry' }
  }
}

export async function deleteChangelogEntry(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('help_articles')
      .delete()
      .eq('id', id)
      .eq('category', 'changelog')

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete changelog entry' }
  }
}

// ─── Create Company ────────────────────────────────────────────────
export async function createAdminCompany(fields: {
  name: string
  ownerEmail: string
  ownerName: string
  businessType: string
}): Promise<ActionResult<{ companyId: string }>> {
  try {
    const supabase = createAdminClient()

    // Create or find auth user
    let userId: string
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: fields.ownerEmail,
      password: 'TempPass123!',
      email_confirm: true,
    })

    if (authError) {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const found = existingUsers?.users?.find(u => u.email === fields.ownerEmail)
      if (!found) throw new Error(`Failed to create user: ${authError.message}`)
      userId = found.id
    } else {
      userId = authUser.user.id
    }

    // Upsert public user
    await supabase.from('users').upsert({
      id: userId,
      email: fields.ownerEmail,
      full_name: fields.ownerName,
      role: 'owner',
    })

    // Create company
    const slug = fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: fields.name,
        slug: slug + '-' + Date.now().toString(36),
        business_type: fields.businessType,
        owner_id: userId,
        status: 'active',
      })
      .select('id')
      .single()

    if (companyError) throw companyError

    // Add owner as company member
    await supabase.from('company_members').insert({
      company_id: company.id,
      user_id: userId,
      role: 'owner',
      status: 'active',
    })

    return { success: true, data: { companyId: company.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create company' }
  }
}

// ─── Create Client (platform-level) ──────────────────────────────
export async function createAdminClient_record(fields: {
  fullName: string
  email: string
  phone?: string
  companyId: string
}): Promise<ActionResult<{ clientId: string }>> {
  try {
    const supabase = createAdminClient()

    // Create or find auth user
    let userId: string
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: fields.email,
      password: 'TempPass123!',
      email_confirm: true,
    })

    if (authError) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const found = existingUsers?.users?.find(u => u.email === fields.email)
      if (!found) throw new Error(`Failed to create user: ${authError.message}`)
      userId = found.id
    } else {
      userId = authUser.user.id
    }

    // Upsert public user
    await supabase.from('users').upsert({
      id: userId,
      email: fields.email,
      full_name: fields.fullName,
      phone: fields.phone ?? null,
      role: 'client',
    })

    // Create client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({ user_id: userId })
      .select('id')
      .single()

    if (clientError) throw clientError

    // Link to company
    await supabase.from('client_companies').insert({
      client_id: client.id,
      company_id: fields.companyId,
    })

    return { success: true, data: { clientId: client.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create client' }
  }
}

// ─── Get All Clients (platform-level) ────────────────────────────
export async function getAdminClients(): Promise<ActionResult<Array<{
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string
  company_id: string
  created_at: string
}>>> {
  try {
    const supabase = createAdminClient()

    const { data: clientCompanies, error } = await supabase
      .from('client_companies')
      .select('client_id, company_id')

    if (error) throw error
    if (!clientCompanies?.length) return { success: true, data: [] }

    const clientIds = [...new Set(clientCompanies.map(cc => cc.client_id))]
    const companyIds = [...new Set(clientCompanies.map(cc => cc.company_id))]

    const { data: clients } = await supabase.from('clients').select('id, user_id, created_at').in('id', clientIds)
    const userIds = (clients ?? []).map(c => c.user_id)
    const { data: users } = await supabase.from('users').select('id, full_name, email, phone').in('id', userIds)
    const { data: companies } = await supabase.from('companies').select('id, name').in('id', companyIds)

    const userMap = new Map((users ?? []).map(u => [u.id, u]))
    const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]))
    const ccMap = new Map(clientCompanies.map(cc => [cc.client_id, cc.company_id]))

    const rows = (clients ?? []).map(c => {
      const user = userMap.get(c.user_id)
      const companyId = ccMap.get(c.id) ?? ''
      return {
        id: c.id,
        full_name: user?.full_name ?? 'Unknown',
        email: user?.email ?? '',
        phone: user?.phone ?? null,
        company_name: companyMap.get(companyId) ?? 'Unknown',
        company_id: companyId,
        created_at: c.created_at,
      }
    })

    return { success: true, data: rows }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load clients' }
  }
}
