import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth callback — handles email confirmation and magic link redirects.
 * After Supabase confirms the user, checks their profile role
 * and redirects to the appropriate portal.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] Code exchange failed:', error.message)
    return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
  }

  // If an explicit next URL was provided, honor it
  if (next) {
    return NextResponse.redirect(new URL(next, origin))
  }

  // Otherwise, route by role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', origin))
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) {
    return NextResponse.redirect(new URL('/signup/company', origin))
  }

  const role = profile.role ?? 'owner'
  if (role === 'client') {
    return NextResponse.redirect(new URL('/portal', origin))
  }

  return NextResponse.redirect(new URL('/dashboard', origin))
}
