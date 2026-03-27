import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// ── Rate Limiting ────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5

interface RateLimitEntry {
  readonly count: number
  readonly resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const existing = rateLimitMap.get(ip)

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (existing.count >= RATE_LIMIT_MAX) return true

  rateLimitMap.set(ip, { ...existing, count: existing.count + 1 })
  return false
}

// ── Route Definitions ────────────────────────────────────────────
const PUBLIC_ROUTES = new Set([
  '/',
  '/beta',
  '/login',
  '/signup',
  '/signup/company',
  '/signup/client',
  '/signup/worker',
  '/forgot-password',
  '/reset-password',
  '/gate',
  '/privacy',
  '/terms',
])

const PUBLIC_PREFIXES = [
  '/auth/',
  '/api/waitlist/',
  '/api/onboard',
  '/invite/',
  '/r/',
  '/portal/signup/',
  '/waitlist-admin/',
] as const

const ADMIN_EMAIL = 'seva@thelevelteam.com'

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

// ── Middleware ────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rate limit signup API
  if (pathname === '/api/waitlist/signup') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }
    return NextResponse.next()
  }

  // Refresh Supabase session for all non-static requests
  const { supabaseResponse, user } = await updateSession(request)

  // Public routes — no auth required
  if (isPublicRoute(pathname)) {
    // If logged in and hitting /login or /signup, redirect to dashboard
    if (user && (pathname === '/login' || pathname.startsWith('/signup'))) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Waitlist admin — require specific email
  if (pathname.startsWith('/waitlist-admin')) {
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone()
      url.pathname = '/waitlist-admin/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Admin routes — require platform owner
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Protected routes — require auth
  const protectedPrefixes = ['/dashboard', '/worker', '/portal', '/reseller']
  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // All other routes pass through
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
