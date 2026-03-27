'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'seva@thelevelteam.com'
const VIEW_AS_COOKIE = 'kleanhq_view_as'
const ACT_AS_COOKIE = 'kleanhq_act_as'

export interface AuthSession {
  readonly userId: string
  readonly email: string
  readonly companyId: string | null
  readonly role: string
  readonly isPlatformOwner: boolean
  readonly isViewingAs: boolean
  readonly isActingAs: boolean
  readonly viewAsCompanyId: string | null
  readonly fullName: string | null
  readonly phone: string | null
}

/**
 * Get the authenticated user's session with company context.
 * Returns null if not authenticated.
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const email = user.email ?? ''
  const isPlatformOwner = email.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  // Look up profile for company_id and role
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('company_id, role, full_name, phone')
    .eq('id', user.id)
    .single()

  // Check God Mode cookies (only for platform owner)
  const cookieStore = await cookies()
  const viewAsId = cookieStore.get(VIEW_AS_COOKIE)?.value ?? null
  const actAsId = cookieStore.get(ACT_AS_COOKIE)?.value ?? null
  const isViewingAs = isPlatformOwner && !!viewAsId
  const isActingAs = isPlatformOwner && !!actAsId && actAsId === viewAsId

  // Determine effective company ID
  let companyId = profile?.company_id ?? null
  if (isPlatformOwner && viewAsId) {
    companyId = viewAsId
  }

  return {
    userId: user.id,
    email,
    companyId,
    role: profile?.role ?? 'owner',
    isPlatformOwner,
    isViewingAs,
    isActingAs,
    viewAsCompanyId: viewAsId,
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
  }
}

/**
 * Get auth session or throw — use in server actions that require auth.
 * Returns the session, never null.
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

/**
 * Get the effective company ID for the current user.
 * This replaces getCompanyId() from bootstrap.ts.
 * Falls back to bootstrap pattern if no auth session (backward compat during migration).
 */
export async function getEffectiveCompanyId(): Promise<string> {
  const session = await getAuthSession()
  if (session?.companyId) return session.companyId

  // Fallback to bootstrap for backward compatibility
  const { getCompanyId } = await import('@/lib/actions/bootstrap')
  return getCompanyId()
}

/**
 * Check if current user is in read-only mode (viewing another company without act-as).
 */
export async function isReadOnly(): Promise<boolean> {
  const session = await getAuthSession()
  if (!session) return true
  return session.isViewingAs && !session.isActingAs
}

/**
 * Sign out the current user and clear all session cookies.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  cookieStore.delete(VIEW_AS_COOKIE)
  cookieStore.delete(ACT_AS_COOKIE)
}
