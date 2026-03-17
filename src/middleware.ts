import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/auth", "/invite", "/pricing", "/privacy", "/terms"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow public paths (exact match for "/" to avoid matching everything)
  const isPublic = pathname === "/" || PUBLIC_PATHS.slice(1).some((p) => pathname.startsWith(p));
  if (isPublic) {
    if (user && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Unauthenticated → login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow onboarding and API routes
  if (pathname.startsWith("/onboard") || pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  // Fetch profile for role-based routing
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // No profile → onboarding
  if (!profile) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboard";
    return NextResponse.redirect(url);
  }

  const role = profile.role;

  // Role-based route protection
  if (role === "crew") {
    if (!pathname.startsWith("/crew") && !pathname.startsWith("/settings")) {
      const url = request.nextUrl.clone();
      url.pathname = "/crew";
      return NextResponse.redirect(url);
    }
  } else if (role === "client") {
    if (!pathname.startsWith("/client") && !pathname.startsWith("/settings")) {
      const url = request.nextUrl.clone();
      url.pathname = "/client";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
