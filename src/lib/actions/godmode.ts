'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

const VIEW_AS_COOKIE = 'kleanhq_view_as'

export interface CompanyOption {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly business_type: string
  readonly status: string
  readonly owner_name: string
  readonly owner_email: string
}

export async function getAllCompanies(): Promise<{ success: boolean; data?: readonly CompanyOption[]; error?: string }> {
  try {
    const supabase = createAdminClient()
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, slug, business_type, status, owner_id')
      .order('name')

    if (error) throw error
    if (!companies?.length) return { success: true, data: [] }

    const ownerIds = [...new Set(companies.map(c => c.owner_id))]
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', ownerIds)

    const userMap = new Map((users ?? []).map(u => [u.id, u]))

    const options: readonly CompanyOption[] = companies.map(c => {
      const owner = userMap.get(c.owner_id)
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        business_type: c.business_type,
        status: c.status,
        owner_name: owner?.full_name ?? 'Unknown',
        owner_email: owner?.email ?? '',
      }
    })

    return { success: true, data: options }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load companies' }
  }
}

export async function setViewAsCompany(companyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('companies').select('id').eq('id', companyId).single()
    if (!data) return { success: false, error: 'Company not found' }

    const cookieStore = await cookies()
    cookieStore.set(VIEW_AS_COOKIE, companyId, {
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to set view' }
  }
}

export async function clearViewAsCompany(): Promise<{ success: boolean }> {
  const cookieStore = await cookies()
  cookieStore.delete(VIEW_AS_COOKIE)
  return { success: true }
}

export async function getViewAsCompanyId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(VIEW_AS_COOKIE)?.value ?? null
}

export async function getViewAsCompany(): Promise<CompanyOption | null> {
  const companyId = await getViewAsCompanyId()
  if (!companyId) return null

  const supabase = createAdminClient()
  const { data: company } = await supabase
    .from('companies')
    .select('id, name, slug, business_type, status, owner_id')
    .eq('id', companyId)
    .single()

  if (!company) return null

  const { data: owner } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', company.owner_id)
    .single()

  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    business_type: company.business_type,
    status: company.status,
    owner_name: owner?.full_name ?? 'Unknown',
    owner_email: owner?.email ?? '',
  }
}

/** Returns true if viewing another company (read-only mode). False if viewing own or no override. */
export async function isReadOnlyMode(): Promise<boolean> {
  const viewAsId = await getViewAsCompanyId()
  if (!viewAsId) return false

  const supabase = createAdminClient()
  // Get the default/own company
  const { data: ownCompany } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
    .single()

  if (!ownCompany) return false
  return viewAsId !== ownCompany.id
}
