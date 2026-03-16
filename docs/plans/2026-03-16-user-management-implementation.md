# User Management & Roles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add multi-role authentication (Owner, Crew, Client) with invite system, password reset, role-based routing, and off-cycle job request flow.

**Architecture:** Supabase Auth + RLS on 4 new tables (`companies`, `profiles`, `invites`, `job_requests`). Proxy (middleware) checks `profiles.role` to route users to role-specific dashboards. Invites delivered via email (Supabase), SMS (stub), or copy-link.

**Tech Stack:** Next.js 16 App Router, Supabase Auth + PostgreSQL + RLS, @supabase/ssr, Tailwind CSS v4

---

## Phase 1: Database Foundation

### Task 1: Create Supabase migration SQL

**Files:**
- Create: `supabase/migrations/001_user_management.sql`

**Step 1: Write the migration SQL**

```sql
-- Companies table
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  phone text not null default '',
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;

create policy "owners can manage their company"
  on public.companies for all
  using (owner_id = auth.uid());

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  role text not null check (role in ('owner', 'crew', 'client')),
  full_name text not null,
  phone text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "owners can read company profiles"
  on public.profiles for select
  using (
    company_id in (
      select id from public.companies where owner_id = auth.uid()
    )
  );

create policy "owners can insert company profiles"
  on public.profiles for insert
  with check (
    company_id in (
      select id from public.companies where owner_id = auth.uid()
    )
  );

-- Invites table
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  email text,
  phone text,
  role text not null check (role in ('crew', 'client')),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  invited_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

alter table public.invites enable row level security;

create policy "owners can manage invites"
  on public.invites for all
  using (
    company_id in (
      select id from public.companies where owner_id = auth.uid()
    )
  );

create policy "anyone can read invite by token"
  on public.invites for select
  using (true);

-- Job Requests table (off-cycle)
create table public.job_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  client_id uuid not null references public.profiles(id),
  service_description text not null,
  estimated_amount integer not null default 0,
  owner_amount integer,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'confirmed', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.job_requests enable row level security;

create policy "clients can create own requests"
  on public.job_requests for insert
  with check (client_id = auth.uid());

create policy "clients can read own requests"
  on public.job_requests for select
  using (client_id = auth.uid());

create policy "owners can manage company requests"
  on public.job_requests for all
  using (
    company_id in (
      select id from public.companies where owner_id = auth.uid()
    )
  );
```

**Step 2: Run migration against Supabase**

Run the SQL in the Supabase Dashboard SQL editor at:
`https://supabase.com/dashboard/project/pkvxoidnkwxqqvutpsmg/sql/new`

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add user management schema (companies, profiles, invites, job_requests)"
```

---

### Task 2: Add TypeScript types for new tables

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add the new types**

Add these types after the existing `Call` interface:

```typescript
export type UserRole = "owner" | "crew" | "client";

export interface Company {
  readonly id: string;
  readonly name: string;
  readonly owner_id: string;
  readonly phone: string;
  readonly created_at: string;
}

export interface Profile {
  readonly id: string;
  readonly company_id: string;
  readonly role: UserRole;
  readonly full_name: string;
  readonly phone: string;
  readonly avatar_url: string | null;
  readonly created_at: string;
}

export type InviteStatus = "pending" | "accepted" | "expired";

export interface Invite {
  readonly id: string;
  readonly company_id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly role: "crew" | "client";
  readonly token: string;
  readonly status: InviteStatus;
  readonly invited_by: string;
  readonly created_at: string;
  readonly expires_at: string;
}

export type JobRequestStatus = "pending" | "approved" | "confirmed" | "declined" | "cancelled";

export interface JobRequest {
  readonly id: string;
  readonly company_id: string;
  readonly client_id: string;
  readonly service_description: string;
  readonly estimated_amount: number;
  readonly owner_amount: number | null;
  readonly status: JobRequestStatus;
  readonly created_at: string;
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types for companies, profiles, invites, job_requests"
```

---

## Phase 2: Auth Enhancements

### Task 3: Add password reset to login page

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

**Step 1: Add "forgot" mode and reset handler**

Update the `Mode` type to include `"forgot"`:

```typescript
type Mode = "login" | "signup" | "forgot";
```

Add a handler branch inside `handleSubmit` for `mode === "forgot"`:

```typescript
if (mode === "forgot") {
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  setLoading(false);
  if (resetError) {
    setError(resetError.message);
    return;
  }
  setSuccess("Check your email for a password reset link.");
  return;
}
```

Update the submit button text:

```typescript
{loading ? "..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
```

Add heading text for forgot mode:

```typescript
{mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
```

Hide password field when `mode === "forgot"` by wrapping the password div:

```typescript
{mode !== "forgot" && (
  <div className="mb-6">...</div>
)}
```

Add "Forgot password?" link below the password field (visible only in login mode):

```typescript
{mode === "login" && (
  <button
    type="button"
    onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
    className="text-[12px] text-gray-400 bg-transparent border-none cursor-pointer hover:text-gray-600 mb-4 block"
  >
    Forgot password?
  </button>
)}
```

Update the toggle text at the bottom to handle the forgot mode:

```typescript
{mode === "forgot" ? (
  <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
    className="text-brand font-semibold bg-transparent border-none cursor-pointer">
    Back to sign in
  </button>
) : (
  // existing toggle
)}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add src/app/(auth)/login/page.tsx
git commit -m "feat: add password reset flow to login page"
```

---

### Task 4: Create reset password page

**Files:**
- Create: `src/app/auth/reset-password/page.tsx`

**Step 1: Create the page**

```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">
            🌿
          </div>
          <h1 className="font-black text-2xl tracking-tight">FieldPay</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-7">
          <h2 className="font-extrabold text-lg mb-5">Set new password</h2>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">NEW PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <div className="mb-6">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {loading ? "..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. New route `/auth/reset-password` appears as `○ Static`.

**Step 3: Commit**

```bash
git add src/app/auth/reset-password/page.tsx
git commit -m "feat: add reset password page"
```

---

### Task 5: Create owner onboarding (company + profile on first sign-up)

**Files:**
- Create: `src/app/api/onboard/route.ts`
- Create: `src/lib/supabase/admin.ts`

**Step 1: Create admin client (uses service role key)**

```typescript
// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

**Step 2: Create onboarding API route**

```typescript
// src/app/api/onboard/route.ts
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { companyName, fullName, phone } = body;

  if (!companyName || !fullName) {
    return NextResponse.json({ error: "Company name and full name are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if user already has a profile
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
  }

  // Create company
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: companyName, owner_id: user.id, phone: phone || "" })
    .select()
    .single();

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  }

  // Create profile
  const { error: profileError } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      company_id: company.id,
      role: "owner",
      full_name: fullName,
      phone: phone || "",
    });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, companyId: company.id });
}
```

**Step 3: Commit**

```bash
git add src/lib/supabase/admin.ts src/app/api/onboard/route.ts
git commit -m "feat: add owner onboarding API (company + profile creation)"
```

---

### Task 6: Create onboarding page

**Files:**
- Create: `src/app/(auth)/onboard/page.tsx`

**Step 1: Create the onboarding page**

This page shows after first sign-up when the user has no profile. They enter company name, their name, and phone.

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardPage() {
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, fullName, phone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">
            🌿
          </div>
          <h1 className="font-black text-2xl tracking-tight">Welcome to FieldPay</h1>
          <p className="text-sm text-gray-400 mt-1">Set up your business</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-7">
          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: "COMPANY NAME", value: companyName, set: setCompanyName, placeholder: "John's Lawn Care" },
              { label: "YOUR NAME", value: fullName, set: setFullName, placeholder: "John Doe" },
              { label: "PHONE", value: phone, set: setPhone, placeholder: "(786) 555-0100", required: false },
            ].map((field) => (
              <div key={field.label} className="mb-4">
                <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.label === "PHONE" ? "tel" : "text"}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                  placeholder={field.placeholder}
                  required={field.required !== false}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? "..." : "Get Started"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(auth)/onboard/page.tsx
git commit -m "feat: add owner onboarding page"
```

---

### Task 7: Update proxy to handle role-based routing

**Files:**
- Modify: `src/proxy.ts`

**Step 1: Update proxy logic**

The proxy needs to:
1. Allow `/login`, `/auth/*`, `/invite/*`, `/onboard` without auth
2. After auth check, fetch user profile to determine role
3. Redirect users without profiles to `/onboard`
4. Redirect crew to `/crew`, clients to `/client` if they hit owner routes
5. Prevent cross-role access

Replace the entire `proxy.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth", "/invite"];

export async function proxy(request: NextRequest) {
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

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // Redirect authenticated users away from /login
    if (user && pathname.startsWith("/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
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
    // Crew can only access /crew/* and /settings
    if (!pathname.startsWith("/crew") && !pathname.startsWith("/settings")) {
      const url = request.nextUrl.clone();
      url.pathname = "/crew";
      return NextResponse.redirect(url);
    }
  } else if (role === "client") {
    // Client can only access /client/* and /settings
    if (!pathname.startsWith("/client") && !pathname.startsWith("/settings")) {
      const url = request.nextUrl.clone();
      url.pathname = "/client";
      return NextResponse.redirect(url);
    }
  }
  // Owner can access everything (default dashboard routes)

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: add role-based routing to proxy (owner/crew/client)"
```

---

## Phase 3: Invite System

### Task 8: Create invite API routes

**Files:**
- Create: `src/app/api/invites/route.ts` (create invite)
- Create: `src/app/api/invites/[token]/route.ts` (accept invite)

**Step 1: Create invite creation endpoint**

```typescript
// src/app/api/invites/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is an owner
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    return NextResponse.json({ error: "Only owners can send invites" }, { status: 403 });
  }

  const body = await request.json();
  const { email, phone, role, name } = body;

  if (!role || !["crew", "client"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!email && !phone) {
    return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
  }

  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .insert({
      company_id: profile.company_id,
      email: email || null,
      phone: phone || null,
      role,
      invited_by: user.id,
    })
    .select()
    .single();

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // If email provided, send Supabase invite email
  if (email) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { invite_token: invite.token, full_name: name || "" },
      redirectTo: `${request.headers.get("origin") || ""}/invite/${invite.token}`,
    });
  }

  return NextResponse.json({
    success: true,
    invite: {
      id: invite.id,
      token: invite.token,
      role: invite.role,
    },
  });
}
```

**Step 2: Create invite acceptance endpoint**

```typescript
// src/app/api/invites/[token]/route.ts
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: invite, error } = await admin
    .from("invites")
    .select("*, companies(name)")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  }

  // Check expiration
  if (new Date(invite.expires_at) < new Date()) {
    await admin.from("invites").update({ status: "expired" }).eq("id", invite.id);
    return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
  }

  return NextResponse.json({
    role: invite.role,
    companyName: invite.companies?.name || "Unknown",
    email: invite.email,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Must be signed in to accept invite" }, { status: 401 });
  }

  const { data: invite } = await admin
    .from("invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  }

  const body = await request.json();
  const { fullName, phone } = body;

  // Create profile for invited user
  const { error: profileError } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      company_id: invite.company_id,
      role: invite.role,
      full_name: fullName || user.email || "",
      phone: phone || "",
    });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Mark invite as accepted
  await admin.from("invites").update({ status: "accepted" }).eq("id", invite.id);

  return NextResponse.json({ success: true, role: invite.role });
}
```

**Step 3: Commit**

```bash
git add src/app/api/invites/
git commit -m "feat: add invite creation and acceptance API routes"
```

---

### Task 9: Create invite acceptance page

**Files:**
- Create: `src/app/invite/[token]/page.tsx`

**Step 1: Create the invite page**

This page loads invite details, lets the user sign up or sign in, then accepts the invite.

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "loading" | "preview" | "auth" | "profile" | "done" | "error";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [invite, setInvite] = useState<{ role: string; companyName: string; email: string | null } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        setInvite(data);
        if (data.email) setEmail(data.email);
        setStep("preview");
      })
      .catch(() => {
        setError("This invite link is invalid or has expired.");
        setStep("error");
      });
  }, [token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    if (authMode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
    }

    setLoading(false);
    setStep("profile");
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/invites/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error); return; }

    setStep("done");
    const redirect = data.role === "crew" ? "/crew" : "/client";
    setTimeout(() => { router.push(redirect); router.refresh(); }, 1500);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">
            🌿
          </div>
          <h1 className="font-black text-2xl tracking-tight">FieldPay</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-7">
          {step === "loading" && <p className="text-center text-gray-400">Loading invite...</p>}

          {step === "error" && (
            <div className="text-center">
              <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>
              <button onClick={() => router.push("/login")} className="text-brand font-semibold bg-transparent border-none cursor-pointer text-sm">
                Go to login
              </button>
            </div>
          )}

          {step === "preview" && invite && (
            <div className="text-center">
              <h2 className="font-extrabold text-lg mb-2">You're invited!</h2>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-bold text-gray-900">{invite.companyName}</span> has invited you as a
              </p>
              <span className="inline-block bg-brand/10 text-brand font-bold rounded-lg px-3 py-1 text-sm capitalize mb-5">
                {invite.role}
              </span>
              <button
                onClick={() => setStep("auth")}
                className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity"
              >
                Accept Invite
              </button>
            </div>
          )}

          {step === "auth" && (
            <>
              <h2 className="font-extrabold text-lg mb-5">
                {authMode === "signup" ? "Create your account" : "Sign in"}
              </h2>
              {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>}
              <form onSubmit={handleAuth}>
                <div className="mb-4">
                  <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">EMAIL</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                    placeholder="you@email.com" required />
                </div>
                <div className="mb-6">
                  <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PASSWORD</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                    placeholder="••••••••" minLength={6} required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
                  {loading ? "..." : authMode === "signup" ? "Create Account" : "Sign In"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-400 mt-4">
                {authMode === "signup" ? "Already have an account? " : "Need an account? "}
                <button onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setError(""); }}
                  className="text-brand font-semibold bg-transparent border-none cursor-pointer">
                  {authMode === "signup" ? "Sign in" : "Sign up"}
                </button>
              </p>
            </>
          )}

          {step === "profile" && (
            <>
              <h2 className="font-extrabold text-lg mb-5">Your details</h2>
              {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>}
              <form onSubmit={handleAccept}>
                <div className="mb-4">
                  <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">FULL NAME</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                    placeholder="Your name" required />
                </div>
                <div className="mb-6">
                  <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PHONE</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                    placeholder="(786) 555-0100" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
                  {loading ? "..." : "Complete Setup"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="font-extrabold text-lg mb-1">You're in!</h2>
              <p className="text-sm text-gray-400">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/invite/
git commit -m "feat: add invite acceptance page with multi-step flow"
```

---

### Task 10: Add invite UI to settings page

**Files:**
- Create: `src/components/settings/invite-sheet.tsx`
- Modify: `src/app/(dashboard)/settings/page.tsx`

**Step 1: Create the invite bottom sheet**

```typescript
// src/components/settings/invite-sheet.tsx
"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface InviteSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly defaultRole: "crew" | "client";
}

export function InviteSheet({ open, onClose, defaultRole }: InviteSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setName(""); setEmail(""); setPhone("");
    setResult(null); setError(""); setCopied(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSend = async (method: "email" | "sms" | "link") => {
    setError("");

    if (method === "email" && !email) { setError("Email is required"); return; }
    if (method === "sms" && !phone) { setError("Phone is required"); return; }

    setLoading(true);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || undefined, phone: phone || undefined, role: defaultRole, name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error); return; }

    if (method === "link") {
      setResult({ token: data.invite.token });
    } else if (method === "email") {
      handleClose();
    } else {
      // SMS stub — show link for now
      setResult({ token: data.invite.token });
    }
  };

  const copyLink = async () => {
    if (!result) return;
    const link = `${window.location.origin}/invite/${result.token}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title={`Invite ${defaultRole === "crew" ? "Crew Member" : "Client"}`}>
      <div className="p-5 pt-0">
        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>
        )}

        {result ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 mb-3">Share this invite link:</p>
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-[13px] font-mono break-all mb-4">
              {`${window.location.origin}/invite/${result.token}`}
            </div>
            <button onClick={copyLink}
              className="w-full bg-brand-dark text-white border-none rounded-xl py-3 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity">
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">NAME</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="Their name" />
            </div>
            <div className="mb-3">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="them@email.com" />
            </div>
            <div className="mb-5">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PHONE</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="(786) 555-0100" />
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleSend("email")} disabled={loading}
                className="w-full bg-brand-dark text-white border-none rounded-xl py-3 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
                {loading ? "..." : "📧 Send Email Invite"}
              </button>
              <button onClick={() => handleSend("sms")} disabled={loading}
                className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50">
                {loading ? "..." : "📱 Send SMS Invite"}
              </button>
              <button onClick={() => handleSend("link")} disabled={loading}
                className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50">
                {loading ? "..." : "🔗 Get Invite Link"}
              </button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
```

**Step 2: Add Team & Clients section to settings page**

In `settings/page.tsx`, add state for invite sheet and a new Card section between Notifications and Payment Methods:

Add imports:
```typescript
import { InviteSheet } from "@/components/settings/invite-sheet";
```

Add state:
```typescript
const [inviteRole, setInviteRole] = useState<"crew" | "client" | null>(null);
```

Add Card section after Notifications:
```tsx
{/* Team & Clients */}
<Card className="mb-4" padding="lg">
  <h2 className="font-extrabold text-[15px] mb-4">Team & Clients</h2>
  <div className="flex flex-col gap-2">
    <button
      onClick={() => setInviteRole("crew")}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-gray-100 transition-colors text-left px-4"
    >
      👷 Invite Crew Member
    </button>
    <button
      onClick={() => setInviteRole("client")}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-gray-100 transition-colors text-left px-4"
    >
      👤 Invite Client
    </button>
  </div>
</Card>

<InviteSheet
  open={inviteRole !== null}
  onClose={() => setInviteRole(null)}
  defaultRole={inviteRole ?? "crew"}
/>
```

**Step 3: Commit**

```bash
git add src/components/settings/invite-sheet.tsx src/app/(dashboard)/settings/page.tsx
git commit -m "feat: add invite UI (bottom sheet + settings section)"
```

---

## Phase 4: Role-Specific Dashboards

### Task 11: Create crew dashboard layout and page

**Files:**
- Create: `src/app/(crew)/layout.tsx`
- Create: `src/app/(crew)/crew/page.tsx`
- Create: `src/components/layout/crew-nav.tsx`

**Step 1: Create crew mobile nav**

```typescript
// src/components/layout/crew-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/crew", icon: "🔧", label: "Jobs" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
] as const;

export function CrewNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2.5 px-4 md:hidden z-50">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold no-underline transition-colors ${active ? "text-brand" : "text-gray-400"}`}>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

**Step 2: Create crew layout**

```typescript
// src/app/(crew)/layout.tsx
import { CrewNav } from "@/components/layout/crew-nav";

export default function CrewLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-3.5">
        <h1 className="font-black text-lg tracking-tight">🌿 FieldPay</h1>
      </header>
      <main className="p-5 pb-20 md:pb-5 animate-fade-in">
        {children}
      </main>
      <CrewNav />
    </div>
  );
}
```

**Step 3: Create crew jobs page**

```typescript
// src/app/(crew)/crew/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function CrewDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  // TODO: Fetch real jobs assigned to this crew member
  // For now, show placeholder
  return (
    <div className="max-w-lg">
      <h2 className="font-extrabold text-xl mb-1">
        Hey, {profile?.full_name || "there"} 👋
      </h2>
      <p className="text-sm text-gray-400 mb-5">Here are your assigned jobs</p>

      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">TODAY</h3>

      <div className="text-center py-12 text-gray-400 text-sm">
        No jobs assigned yet. Your owner will add them soon.
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/\(crew\)/ src/components/layout/crew-nav.tsx
git commit -m "feat: add crew dashboard layout and jobs page"
```

---

### Task 12: Create client dashboard layout and pages

**Files:**
- Create: `src/app/(client)/layout.tsx`
- Create: `src/app/(client)/client/page.tsx`
- Create: `src/app/(client)/client/request/page.tsx`
- Create: `src/components/layout/client-nav.tsx`

**Step 1: Create client mobile nav**

```typescript
// src/components/layout/client-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/client", icon: "🏠", label: "Home" },
  { href: "/client/request", icon: "➕", label: "Request" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
] as const;

export function ClientNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2.5 px-4 md:hidden z-50">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold no-underline transition-colors ${active ? "text-brand" : "text-gray-400"}`}>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

**Step 2: Create client layout**

```typescript
// src/app/(client)/layout.tsx
import { ClientNav } from "@/components/layout/client-nav";

export default function ClientLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-3.5">
        <h1 className="font-black text-lg tracking-tight">🌿 FieldPay</h1>
      </header>
      <main className="p-5 pb-20 md:pb-5 animate-fade-in">
        {children}
      </main>
      <ClientNav />
    </div>
  );
}
```

**Step 3: Create client home page**

```typescript
// src/app/(client)/client/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function ClientDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, companies(name)")
    .eq("id", user!.id)
    .single();

  // TODO: Fetch real client jobs and invoices
  return (
    <div className="max-w-lg">
      <h2 className="font-extrabold text-xl mb-1">
        Welcome, {profile?.full_name || "there"} 👋
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        {(profile as any)?.companies?.name || "Your service provider"}
      </p>

      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">UPCOMING JOBS</h3>
      <Card className="mb-5" padding="lg">
        <p className="text-sm text-gray-400 text-center py-4">No upcoming jobs scheduled</p>
      </Card>

      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">RECENT INVOICES</h3>
      <Card className="mb-5" padding="lg">
        <p className="text-sm text-gray-400 text-center py-4">No invoices yet</p>
      </Card>
    </div>
  );
}
```

**Step 4: Create job request page**

```typescript
// src/app/(client)/client/request/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const SERVICES = [
  { label: "Weekly Lawn Care", estimate: 6500 },
  { label: "Mow + Edge", estimate: 8000 },
  { label: "Full Yard Cleanup", estimate: 15000 },
  { label: "Hedge Trimming", estimate: 9500 },
  { label: "Other", estimate: 0 },
] as const;

export default function RequestJobPage() {
  const router = useRouter();
  const [service, setService] = useState("");
  const [customService, setCustomService] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedService = SERVICES.find((s) => s.label === service);
  const estimate = selectedService?.estimate || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, company_id")
      .eq("id", user!.id)
      .single();

    if (!profile) { setError("Profile not found"); setLoading(false); return; }

    const description = service === "Other" ? customService : service;
    const { error: insertError } = await supabase
      .from("job_requests")
      .insert({
        company_id: profile.company_id,
        client_id: profile.id,
        service_description: description,
        estimated_amount: estimate,
      });

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    setSuccess(true);
    setTimeout(() => { router.push("/client"); router.refresh(); }, 2000);
  };

  if (success) {
    return (
      <div className="max-w-lg text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-extrabold text-xl mb-2">Request Sent!</h2>
        <p className="text-sm text-gray-400">Your service provider will review and respond soon.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-extrabold text-xl mb-1">Request a Job</h2>
      <p className="text-sm text-gray-400 mb-5">Pick a service and we'll send it to your provider</p>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-4" padding="lg">
          <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">SERVICE TYPE</h3>
          <div className="flex flex-col gap-2">
            {SERVICES.map((s) => (
              <button key={s.label} type="button" onClick={() => setService(s.label)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                  service === s.label
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}>
                {s.label}
                {s.estimate > 0 && (
                  <span className="float-right text-gray-400 font-normal">
                    ~${(s.estimate / 100).toFixed(0)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {service === "Other" && (
          <Card className="mb-4" padding="lg">
            <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">
              DESCRIBE THE SERVICE
            </label>
            <textarea value={customService} onChange={(e) => setCustomService(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors resize-none h-24"
              placeholder="What do you need done?" required />
          </Card>
        )}

        {estimate > 0 && (
          <Card className="mb-4 text-center" padding="lg">
            <p className="text-xs text-gray-400 mb-1">Estimated cost</p>
            <p className="font-black text-3xl tracking-tight">${(estimate / 100).toFixed(0)}</p>
            <p className="text-[11px] text-gray-400 mt-1">Final price confirmed by provider</p>
          </Card>
        )}

        <button type="submit" disabled={loading || !service || (service === "Other" && !customService)}
          className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
          {loading ? "..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/app/\(client\)/ src/components/layout/client-nav.tsx
git commit -m "feat: add client dashboard with job request flow"
```

---

## Phase 5: Owner-Side Request Management

### Task 13: Add job request notifications to owner dashboard

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`
- Create: `src/components/dashboard/request-card.tsx`

**Step 1: Create request approval card**

```typescript
// src/components/dashboard/request-card.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { JobRequest } from "@/types";

interface RequestCardProps {
  readonly request: JobRequest & { readonly profiles: { readonly full_name: string } };
  readonly onUpdate: () => void;
}

export function RequestCard({ request, onUpdate }: RequestCardProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(request.estimated_amount / 100));
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("job_requests")
      .update({
        status: "approved",
        owner_amount: Math.round(parseFloat(amount) * 100),
      })
      .eq("id", request.id);
    setLoading(false);
    setOpen(false);
    onUpdate();
  };

  const handleDecline = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("job_requests")
      .update({ status: "declined" })
      .eq("id", request.id);
    setLoading(false);
    setOpen(false);
    onUpdate();
  };

  return (
    <>
      <Card
        className="flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
        padding="sm"
        onClick={() => setOpen(true)}
      >
        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-base shrink-0">📋</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13px]">{request.profiles.full_name}</div>
          <div className="text-[11px] text-gray-400 truncate">{request.service_description}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-[13px]">{formatCurrency(request.estimated_amount)}</div>
          <div className="text-[10px] text-yellow-600 font-semibold">Pending</div>
        </div>
      </Card>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Job Request">
        <div className="p-5 pt-0">
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Client</p>
            <p className="font-bold text-sm">{request.profiles.full_name}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Service</p>
            <p className="font-bold text-sm">{request.service_description}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Client estimate</p>
            <p className="font-bold text-sm">{formatCurrency(request.estimated_amount)}</p>
          </div>
          <div className="mb-5">
            <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">
              YOUR PRICE
            </label>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                min="0" step="1" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDecline} disabled={loading}
              className="flex-1 bg-white text-red-600 border border-red-200 rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-50">
              Decline
            </button>
            <button onClick={handleApprove} disabled={loading}
              className="flex-1 bg-brand-dark text-white border-none rounded-xl py-3 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
              {loading ? "..." : "Approve"}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
```

**Step 2: Add pending requests section to owner dashboard**

In `src/app/(dashboard)/page.tsx`, add a section above "Today's Jobs" that shows pending job requests. This will be a client component wrapper that fetches requests and renders `RequestCard` components.

Create a wrapper component:

```typescript
// src/components/dashboard/pending-requests.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RequestCard } from "./request-card";
import type { JobRequest } from "@/types";

type RequestWithProfile = JobRequest & { readonly profiles: { readonly full_name: string } };

export function PendingRequests() {
  const [requests, setRequests] = useState<readonly RequestWithProfile[]>([]);

  const fetchRequests = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("job_requests")
      .select("*, profiles(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (data) setRequests(data as unknown as RequestWithProfile[]);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  if (requests.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">
        JOB REQUESTS ({requests.length})
      </h3>
      <div className="flex flex-col gap-2">
        {requests.map((req) => (
          <RequestCard key={req.id} request={req} onUpdate={fetchRequests} />
        ))}
      </div>
    </div>
  );
}
```

Add `<PendingRequests />` to the dashboard page above the jobs list.

**Step 3: Commit**

```bash
git add src/components/dashboard/ src/app/(dashboard)/page.tsx
git commit -m "feat: add pending job requests to owner dashboard with approve/decline"
```

---

### Task 14: Verify full build and test flows

**Step 1: Run build**

Run: `npm run build`
Expected: All routes compile successfully.

**Step 2: Manual test checklist**

1. Owner sign-up → onboard → dashboard
2. Forgot password → email sent → reset password page
3. Settings → Invite Crew → copy link
4. Open invite link → sign up as crew → crew dashboard
5. Settings → Invite Client → send email
6. Client accepts → client dashboard → request job
7. Owner sees pending request → approves with adjusted price
8. Sign out → redirect to login

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete user management system (roles, invites, job requests)"
```

---

## Summary

| Phase | Tasks | What It Builds |
|-------|-------|----------------|
| 1 | Tasks 1-2 | Database schema + TypeScript types |
| 2 | Tasks 3-7 | Password reset, onboarding, role-based proxy |
| 3 | Tasks 8-10 | Invite API, accept page, invite UI in settings |
| 4 | Tasks 11-12 | Crew dashboard, client dashboard + job request |
| 5 | Tasks 13-14 | Owner request management, build verification |
