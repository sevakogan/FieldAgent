'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Get the company ID for the currently logged-in user.
 *
 * Resolution order:
 * 1. God Mode view-as override (platform owner impersonating a company)
 * 2. Profile lookup — profiles.company_id for the authenticated user
 * 3. Company ownership — companies.owner_id matching the user
 * 4. Company membership — company_members for the user
 */
export async function getCompanyId(): Promise<string> {
  // 1. Check for God Mode view-as override
  const { getViewAsCompanyId } = await import('./godmode')
  const viewAsId = await getViewAsCompanyId()
  if (viewAsId) return viewAsId

  // 2. Get the authenticated user from session
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const admin = createAdminClient()

  // 3. Check profiles table (fastest — set during signup)
  const { data: profile } = await admin
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (profile?.company_id) {
    return profile.company_id
  }

  // 4. Check if user owns a company
  const { data: ownedCompany } = await admin
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (ownedCompany) {
    return ownedCompany.id
  }

  // 5. Check company_members as last resort
  const { data: membership } = await admin
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (membership) {
    return membership.company_id
  }

  throw new Error('No company found for this user')
}

export async function getOwnerId(): Promise<string> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  return user.id
}
