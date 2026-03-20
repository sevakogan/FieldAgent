import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkGate } from "@/lib/gate";

// ── Rate Limiting ────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

interface RateLimitEntry {
  readonly count: number;
  readonly resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = rateLimitMap.get(ip);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (existing.count >= RATE_LIMIT_MAX) return true;

  rateLimitMap.set(ip, { ...existing, count: existing.count + 1 });
  return false;
}

// ── Supabase Client Factory ──────────────────────────────────────
function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );
}

// ── Middleware ────────────────────────────────────────────────────
const ADMIN_EMAIL = "seva@thelevelteam.com";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limit signup API
  if (pathname === "/api/waitlist/signup") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    return NextResponse.next();
  }

  // Waitlist admin route protection (except login page)
  if (pathname.startsWith("/waitlist-admin") && pathname !== "/waitlist-admin/login") {
    const supabaseResponse = NextResponse.next({ request });
    const supabase = createMiddlewareClient(request, supabaseResponse);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone();
      url.pathname = "/waitlist-admin/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // Platform gate — require password cookie for all platform routes
  const platformPrefixes = ["/dashboard", "/worker", "/portal", "/reseller"]
  if (platformPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!checkGate(request)) {
      const url = request.nextUrl.clone()
      url.pathname = "/gate"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Everything else passes through (waitlist is public)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/waitlist/signup",
    "/waitlist-admin/:path*",
    "/dashboard/:path*",
    "/worker/:path*",
    "/portal/:path*",
    "/reseller/:path*",
  ],
};
