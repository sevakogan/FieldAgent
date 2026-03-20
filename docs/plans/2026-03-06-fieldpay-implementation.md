# KleanHQ CRM — Implementation Plan (Phase 1)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready field service CRM with 8 pages, Supabase backend, and Twilio-ready architecture.

**Architecture:** Next.js 16 App Router with route groups — `(auth)` for login, `(dashboard)` for all CRM pages sharing a sidebar/topbar layout. Supabase for auth + Postgres with RLS. All data flows through server components where possible, client components only for interactivity.

**Tech Stack:** Next.js 16.1.6, React 19, TypeScript, Tailwind v4, Supabase SSR (`@supabase/ssr`), Vitest + Testing Library

**Design doc:** `docs/plans/2026-03-06-kleanhq-design.md`
**Prototype reference:** `KleanHQDashboard.jsx` (inline-styles prototype — use as visual spec only)

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `/Users/seva/Documents/Claude - Code/KleanHQ/` (entire project)

**Step 1: Create Next.js app**

```bash
cd "/Users/seva/Documents/Claude - Code"
npx create-next-app@latest KleanHQ --app --tailwind --typescript --src-dir --no-import-alias --eslint
```

When prompted, accept defaults. The `--no-import-alias` flag is fine — we'll configure `@/*` manually.

**Step 2: Verify scaffolding works**

```bash
cd "/Users/seva/Documents/Claude - Code/KleanHQ"
npm run build
```

Expected: Build succeeds.

**Step 3: Configure tsconfig path alias**

File: `tsconfig.json` — ensure paths section:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 4: Configure PostCSS for Tailwind v4**

File: `postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

**Step 5: Set up globals.css**

File: `src/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --color-brand: #16a34a;
  --color-brand-dark: #111111;
}

html {
  scroll-behavior: smooth;
}

/* Minimal scrollbar */
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
```

**Step 6: Create .env.local**

File: `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://pkvxoidnkwxqqvutpsmg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Twilio (Phase 2)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

**Step 7: Add .env.local to .gitignore**

Verify `.gitignore` includes `.env.local` (Next.js scaffolding does this).

**Step 8: Init git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 16 project"
```

---

## Task 2: Install Dependencies + Test Setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/__tests__/setup.ts`

**Step 1: Install Supabase + dev deps**

```bash
npm install @supabase/ssr @supabase/supabase-js
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

**Step 2: Create vitest config**

File: `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/**", "src/hooks/**"],
      exclude: ["src/__tests__/setup.ts"],
    },
  },
});
```

**Step 3: Create test setup**

File: `src/__tests__/setup.ts`:
```typescript
import "@testing-library/jest-dom/vitest";
```

**Step 4: Add test scripts to package.json**

Add to `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

**Step 5: Verify tests run**

```bash
npm run test:run
```

Expected: 0 tests found, no errors.

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: add Supabase, Vitest, and Testing Library"
```

---

## Task 3: Supabase Client Layer

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/middleware.ts`
- Test: `src/lib/supabase/__tests__/client.test.ts`

**Step 1: Write test for browser client**

File: `src/lib/supabase/__tests__/client.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ auth: {}, from: vi.fn() })),
}));

describe("supabase browser client", () => {
  it("creates a browser client with env vars", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    const { supabase } = await import("@/lib/supabase/client");
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });
});
```

**Step 2: Run test — expect FAIL**

```bash
npx vitest run src/lib/supabase/__tests__/client.test.ts
```

Expected: FAIL — module not found.

**Step 3: Implement browser client**

File: `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Step 4: Run test — expect PASS**

```bash
npx vitest run src/lib/supabase/__tests__/client.test.ts
```

**Step 5: Implement server client**

File: `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server component — ignore
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Server component — ignore
          }
        },
      },
    }
  );
}
```

**Step 6: Implement admin client**

File: `src/lib/supabase/admin.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

**Step 7: Implement auth middleware**

File: `src/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "" });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set(name, "", options);
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect authenticated users away from login
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect all dashboard routes
  if (!user && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Supabase client layer and auth middleware"
```

---

## Task 4: Type Definitions + Utilities

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/utils.ts`
- Test: `src/lib/__tests__/utils.test.ts`

**Step 1: Write test for currency formatter**

File: `src/lib/__tests__/utils.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { formatCurrency, formatCurrencyFromCents } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats dollar amounts", () => {
    expect(formatCurrency(120)).toBe("$120");
    expect(formatCurrency(1500)).toBe("$1,500");
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("formatCurrencyFromCents", () => {
  it("converts cents to formatted dollars", () => {
    expect(formatCurrencyFromCents(12000)).toBe("$120");
    expect(formatCurrencyFromCents(150000)).toBe("$1,500");
    expect(formatCurrencyFromCents(0)).toBe("$0");
  });
});
```

**Step 2: Run test — expect FAIL**

```bash
npx vitest run src/lib/__tests__/utils.test.ts
```

**Step 3: Implement utils**

File: `src/lib/utils.ts`:
```typescript
export function formatCurrency(amount: number): string {
  return "$" + (amount || 0).toLocaleString("en-US");
}

export function formatCurrencyFromCents(cents: number): string {
  return formatCurrency(Math.round(cents / 100));
}

export const AVATAR_COLORS: Record<string, string> = {
  ML: "#7c3aed",
  JS: "#2563eb",
  AR: "#d97706",
  DC: "#059669",
  SW: "#db2777",
};

export function getAvatarColor(initials: string): string {
  return AVATAR_COLORS[initials] || "#7c3aed";
}

export const JOB_STATUS_STYLES = {
  done: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Done" },
  active: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Active" },
  upcoming: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Scheduled" },
} as const;

export const LEAD_STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

export const JOB_STATUSES = ["upcoming", "active", "done"] as const;
export type JobStatus = typeof JOB_STATUSES[number];
```

**Step 4: Run test — expect PASS**

```bash
npx vitest run src/lib/__tests__/utils.test.ts
```

**Step 5: Create type definitions**

File: `src/types/index.ts`:
```typescript
export interface Profile {
  readonly id: string;
  readonly business_name: string;
  readonly tagline: string;
  readonly brand_color: string;
  readonly phone: string;
  readonly owner_name: string;
  readonly created_at: string;
}

export interface Lead {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly phone: string;
  readonly service: string;
  readonly value: number; // cents
  readonly status: "new" | "contacted" | "quoted" | "won" | "lost";
  readonly language: string;
  readonly created_at: string;
}

export interface Client {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly phone: string;
  readonly initials: string;
  readonly properties_count: number;
  readonly mrr: number; // cents
  readonly balance: number; // cents
  readonly tag: "VIP" | "Monthly" | null;
  readonly created_at: string;
}

export interface Job {
  readonly id: string;
  readonly user_id: string;
  readonly client_id: string;
  readonly address: string;
  readonly service: string;
  readonly worker: string;
  readonly scheduled_at: string;
  readonly status: "upcoming" | "active" | "done";
  readonly total: number; // cents
  readonly photos_count: number;
  readonly completed_at: string | null;
  readonly created_at: string;
  // Joined fields
  readonly client?: Client;
}

export interface Call {
  readonly id: string;
  readonly user_id: string;
  readonly contact_name: string;
  readonly phone_number: string;
  readonly duration_seconds: number;
  readonly direction: "inbound" | "outbound";
  readonly twilio_sid: string | null;
  readonly created_at: string;
}

export interface Review {
  readonly id: string;
  readonly user_id: string;
  readonly client_id: string;
  readonly platform: "google" | "yelp" | "facebook" | "nextdoor";
  readonly rating: number;
  readonly text: string;
  readonly gate_passed: boolean;
  readonly created_at: string;
}

export interface Settings {
  readonly id: string;
  readonly user_id: string;
  readonly payment_methods: {
    readonly zelle?: string;
    readonly cashapp?: string;
    readonly venmo?: string;
    readonly stripe_link?: string;
  };
  readonly notification_prefs: {
    readonly sms: boolean;
    readonly whatsapp: boolean;
    readonly email: boolean;
    readonly push: boolean;
  };
  readonly review_platforms: {
    readonly google?: { url: string; active: boolean };
    readonly yelp?: { url: string; active: boolean };
    readonly facebook?: { url: string; active: boolean };
    readonly nextdoor?: { url: string; active: boolean };
  };
  readonly smart_gate_config: {
    readonly after_job: boolean;
    readonly after_renewal: boolean;
    readonly gate_active: boolean;
    readonly landing_widget: boolean;
  };
  readonly updated_at: string;
}
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add TypeScript types and utility functions"
```

---

## Task 5: Supabase Schema + RLS

**Files:**
- Create: `supabase-schema.sql`

**Step 1: Write the full schema SQL**

File: `supabase-schema.sql`:
```sql
-- KleanHQ CRM Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  business_name text not null default '',
  tagline text default '',
  brand_color text default '#16a34a',
  phone text default '',
  owner_name text default '',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, owner_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── LEADS ──
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone text default '',
  service text default '',
  value integer default 0,
  status text not null default 'new' check (status in ('new','contacted','quoted','won','lost')),
  language text default 'en',
  created_at timestamptz default now()
);

alter table leads enable row level security;
create policy "Users can manage own leads" on leads for all using (auth.uid() = user_id);
create index idx_leads_user_status on leads(user_id, status);

-- ── CLIENTS ──
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone text default '',
  initials text default '',
  properties_count integer default 1,
  mrr integer default 0,
  balance integer default 0,
  tag text check (tag in ('VIP','Monthly') or tag is null),
  created_at timestamptz default now()
);

alter table clients enable row level security;
create policy "Users can manage own clients" on clients for all using (auth.uid() = user_id);
create index idx_clients_user on clients(user_id);

-- ── JOBS ──
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  address text default '',
  service text default '',
  worker text default '',
  scheduled_at timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming','active','done')),
  total integer default 0,
  photos_count integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table jobs enable row level security;
create policy "Users can manage own jobs" on jobs for all using (auth.uid() = user_id);
create index idx_jobs_user_status on jobs(user_id, status);
create index idx_jobs_client on jobs(client_id);
create index idx_jobs_scheduled on jobs(user_id, scheduled_at);

-- ── CALLS ──
create table if not exists calls (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  contact_name text default '',
  phone_number text default '',
  duration_seconds integer default 0,
  direction text not null check (direction in ('inbound','outbound')),
  twilio_sid text,
  created_at timestamptz default now()
);

alter table calls enable row level security;
create policy "Users can manage own calls" on calls for all using (auth.uid() = user_id);
create index idx_calls_user on calls(user_id, created_at desc);

-- ── REVIEWS ──
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  platform text not null check (platform in ('google','yelp','facebook','nextdoor')),
  rating integer not null check (rating >= 1 and rating <= 5),
  text text default '',
  gate_passed boolean default false,
  created_at timestamptz default now()
);

alter table reviews enable row level security;
create policy "Users can manage own reviews" on reviews for all using (auth.uid() = user_id);
create index idx_reviews_user on reviews(user_id);

-- ── SETTINGS ──
create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references profiles(id) on delete cascade,
  payment_methods jsonb default '{}',
  notification_prefs jsonb default '{"sms":true,"whatsapp":true,"email":true,"push":true}',
  review_platforms jsonb default '{}',
  smart_gate_config jsonb default '{"after_job":true,"after_renewal":false,"gate_active":true,"landing_widget":true}',
  updated_at timestamptz default now()
);

alter table settings enable row level security;
create policy "Users can manage own settings" on settings for all using (auth.uid() = user_id);

-- Auto-create settings on profile creation
create or replace function public.handle_new_profile()
returns trigger as $$
begin
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_profile_created
  after insert on profiles
  for each row execute procedure public.handle_new_profile();
```

**Step 2: Run schema in Supabase SQL Editor**

Go to Supabase dashboard → SQL Editor → paste and run.

**Step 3: Commit**

```bash
git add supabase-schema.sql
git commit -m "feat: add Supabase schema with RLS policies"
```

---

## Task 6: Shared UI Components

**Files:**
- Create: `src/components/ui/avatar.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/stat-card.tsx`
- Create: `src/components/ui/toggle.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Test: `src/components/ui/__tests__/avatar.test.tsx`

These are the reusable building blocks extracted from the prototype. Every page uses these.

**Step 1: Write avatar test**

File: `src/components/ui/__tests__/avatar.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders initials", () => {
    render(<Avatar initials="ML" />);
    expect(screen.getByText("ML")).toBeInTheDocument();
  });

  it("applies custom size class", () => {
    const { container } = render(<Avatar initials="JS" size="lg" />);
    expect(container.firstChild).toHaveClass("w-12");
  });
});
```

**Step 2: Run test — expect FAIL**

**Step 3: Implement all UI components**

File: `src/components/ui/avatar.tsx`:
```tsx
import { getAvatarColor } from "@/lib/utils";

const SIZES = {
  sm: "w-8 h-8 text-xs rounded-lg",
  md: "w-10 h-10 text-sm rounded-[10px]",
  lg: "w-12 h-12 text-base rounded-xl",
  xl: "w-16 h-16 text-lg rounded-2xl",
} as const;

interface AvatarProps {
  readonly initials: string;
  readonly size?: keyof typeof SIZES;
}

export function Avatar({ initials, size = "md" }: AvatarProps) {
  return (
    <div
      className={`${SIZES[size]} shrink-0 flex items-center justify-center font-extrabold text-white tracking-tight`}
      style={{ backgroundColor: getAvatarColor(initials) }}
    >
      {initials}
    </div>
  );
}
```

File: `src/components/ui/badge.tsx`:
```tsx
const VARIANTS = {
  default: "bg-gray-100 text-gray-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-yellow-50 text-yellow-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
  vip: "bg-yellow-50 text-yellow-700",
} as const;

interface BadgeProps {
  readonly children: React.ReactNode;
  readonly variant?: keyof typeof VARIANTS;
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span className={`${VARIANTS[variant]} rounded-md px-2 py-0.5 text-[10px] font-bold`}>
      {children}
    </span>
  );
}
```

File: `src/components/ui/stat-card.tsx`:
```tsx
interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly hintColor?: string;
}

export function StatCard({ label, value, hint, hintColor = "text-green-600" }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3 uppercase">{label}</div>
      <div className="text-3xl font-black tracking-tight leading-none mb-2">{value}</div>
      <div className={`text-[11px] font-semibold ${hintColor}`}>{hint}</div>
    </div>
  );
}
```

File: `src/components/ui/toggle.tsx`:
```tsx
"use client";

interface ToggleProps {
  readonly enabled: boolean;
  readonly onChange: (value: boolean) => void;
}

export function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-[42px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        enabled ? "bg-green-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-200 ${
          enabled ? "translate-x-[21px]" : "translate-x-[3px]"
        } mt-[3px]`}
      />
    </button>
  );
}
```

File: `src/components/ui/button.tsx`:
```tsx
import { type ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary: "bg-gray-900 text-white hover:opacity-85",
  secondary: "bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-900",
  success: "bg-green-500 text-white hover:opacity-90",
  ghost: "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-4 py-2 text-[13px]",
  lg: "px-5 py-3 text-sm",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: keyof typeof VARIANTS;
  readonly size?: keyof typeof SIZES;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-[10px] font-semibold cursor-pointer transition-all duration-150 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

File: `src/components/ui/card.tsx`:
```tsx
interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly padding?: "sm" | "md" | "lg";
}

const PADDING = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
} as const;

export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ${PADDING[padding]} ${className}`}>
      {children}
    </div>
  );
}
```

**Step 4: Run tests — expect PASS**

```bash
npx vitest run src/components/ui/
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shared UI components (avatar, badge, stat-card, toggle, button, card)"
```

---

## Task 7: Dashboard Layout (Sidebar + Topbar + MobileNav)

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/topbar.tsx`
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/layout.tsx` (root layout)

This is the shared shell for all dashboard pages — the sidebar, topbar, and mobile bottom nav from the prototype.

**Step 1: Implement sidebar**

File: `src/components/layout/sidebar.tsx`:
```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly badge?: number;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/" },
  { id: "dialer",    label: "Dialer",    href: "/dialer" },
  { id: "leads",     label: "Leads",     href: "/leads" },
  { id: "clients",   label: "Clients",   href: "/clients" },
  { id: "jobs",      label: "Jobs",      href: "/jobs" },
  { id: "revenue",   label: "Revenue",   href: "/revenue" },
  { id: "reviews",   label: "Reviews",   href: "/reviews" },
  { id: "settings",  label: "Settings",  href: "/settings" },
];

interface SidebarProps {
  readonly mrr: number;
  readonly clientCount: number;
  readonly newLeadCount: number;
  readonly onOpenDialer: () => void;
}

export function Sidebar({ mrr, clientCount, newLeadCount, onOpenDialer }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="hidden md:flex w-[220px] fixed top-0 left-0 bottom-0 bg-gray-900 flex-col p-5 px-3.5 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <div className="w-[34px] h-[34px] bg-white rounded-[10px] flex items-center justify-center text-lg shrink-0">
          🌿
        </div>
        <div>
          <div className="font-extrabold text-sm text-white tracking-tight">KleanHQ</div>
          <div className="text-[11px] text-white/30 mt-0.5">John&apos;s Lawn Care</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => {
          const badge = item.id === "leads" ? newLeadCount : undefined;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-[10px] text-[13.5px] font-medium transition-all duration-150 ${
                isActive(item.href)
                  ? "bg-white/12 text-white font-semibold"
                  : "text-white/45 hover:bg-white/7 hover:text-white/85"
              }`}
            >
              {item.label}
              {badge ? (
                <span className="bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center px-1">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* MRR Widget */}
      <div className="bg-white/6 rounded-[14px] p-4 mb-3">
        <div className="text-[10px] font-semibold tracking-[1.5px] text-white/30 mb-2">MRR</div>
        <div className="text-[28px] font-black text-white tracking-tight leading-none">
          {formatCurrency(mrr)}
        </div>
        <div className="text-[11px] text-white/30 mt-1.5">{clientCount} clients</div>
      </div>

      {/* Dialer Button */}
      <button
        onClick={onOpenDialer}
        className="w-full bg-green-500 rounded-xl py-3 text-white font-bold text-[13.5px] cursor-pointer transition-opacity hover:opacity-90"
      >
        📞  Open Dialer
      </button>
    </aside>
  );
}
```

File: `src/components/layout/topbar.tsx`:
```tsx
"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/dialer": "Dialer",
  "/leads": "Leads",
  "/clients": "Clients",
  "/jobs": "Jobs",
  "/revenue": "Revenue",
  "/reviews": "Reviews",
  "/settings": "Settings",
};

interface TopbarProps {
  readonly onOpenDialer: () => void;
}

export function Topbar({ onOpenDialer }: TopbarProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "KleanHQ";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white border-b border-gray-100 px-7 py-3 flex items-center justify-between sticky top-0 z-40">
      <div>
        <div className="font-extrabold text-[17px] tracking-tight">{title}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">{today}</div>
      </div>
      <div className="flex gap-2.5 items-center">
        <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-[11px] font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Live
        </span>
        <Button onClick={onOpenDialer} size="sm">📞 Dial</Button>
        <div className="w-[34px] h-[34px] bg-gray-900 rounded-[10px] flex items-center justify-center text-white font-extrabold text-[13px] cursor-pointer">
          J
        </div>
      </div>
    </div>
  );
}
```

File: `src/components/layout/mobile-nav.tsx`:
```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const MOBILE_NAV = [
  { id: "dashboard", label: "Dashboard", href: "/",        icon: "📊" },
  { id: "dialer",    label: "Dialer",    href: "/dialer",  icon: "📞" },
  { id: "leads",     label: "Leads",     href: "/leads",   icon: "👤" },
  { id: "clients",   label: "Clients",   href: "/clients", icon: "🏠" },
  { id: "jobs",      label: "Jobs",      href: "/jobs",    icon: "🔧" },
];

interface MobileNavProps {
  readonly newLeadCount?: number;
}

export function MobileNav({ newLeadCount }: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-[100] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex">
      {MOBILE_NAV.map(item => (
        <Link
          key={item.id}
          href={item.href}
          className={`flex-1 py-2.5 pb-3 flex flex-col items-center gap-1 text-[9px] font-bold relative ${
            isActive(item.href) ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {item.id === "leads" && newLeadCount ? (
            <span className="absolute top-1 right-[calc(50%-16px)] bg-red-500 text-white rounded-full px-1 text-[9px] font-extrabold leading-[15px]">
              {newLeadCount}
            </span>
          ) : null}
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </div>
  );
}
```

**Step 2: Create dashboard layout**

File: `src/app/(dashboard)/layout.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DialerModal } from "@/components/dialer/dialer-modal";

// TODO: Replace with real data from Supabase hooks
const MOCK_STATS = { mrr: 980, clientCount: 5, newLeadCount: 2 };

export default function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
  const [dialerOpen, setDialerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 text-sm">
      <Sidebar
        mrr={MOCK_STATS.mrr}
        clientCount={MOCK_STATS.clientCount}
        newLeadCount={MOCK_STATS.newLeadCount}
        onOpenDialer={() => setDialerOpen(true)}
      />

      <main className="md:ml-[220px] flex-1 min-h-screen flex flex-col pb-16 md:pb-0">
        <Topbar onOpenDialer={() => setDialerOpen(true)} />
        <div className="p-6 px-7 flex-1">
          {children}
        </div>
      </main>

      <MobileNav newLeadCount={MOCK_STATS.newLeadCount} />
      {dialerOpen && <DialerModal onClose={() => setDialerOpen(false)} />}
    </div>
  );
}
```

**Step 3: Update root layout**

File: `src/app/layout.tsx` — strip to minimal:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KleanHQ — Field Service CRM",
  description: "Manage leads, clients, jobs, and revenue for your field service business.",
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

**Step 4: Build and verify layout renders**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add dashboard layout with sidebar, topbar, and mobile nav"
```

---

## Task 8: Dialer Modal Component

**Files:**
- Create: `src/components/dialer/dialer-modal.tsx`
- Create: `src/components/dialer/dialpad.tsx`

Extracted from the prototype's `Dialer` component — the modal with business line info, dialpad, and call button.

**Step 1: Implement dialpad**

File: `src/components/dialer/dialpad.tsx`:
```tsx
"use client";

import { useState } from "react";

const KEYS = ["1","2","3","4","5","6","7","8","9","*","0","#"] as const;

export function Dialpad() {
  const [digits, setDigits] = useState("");

  return (
    <div className="bg-white p-5 pb-6">
      {/* Display */}
      <div className="bg-gray-100 rounded-[14px] px-5 py-3 mb-4 text-center min-h-[50px] flex items-center justify-center">
        <span className={`text-[28px] font-bold tracking-[4px] ${digits ? "text-gray-900" : "text-gray-300"}`}>
          {digits || "· · ·"}
        </span>
      </div>

      {/* Keys */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {KEYS.map(key => (
          <button
            key={key}
            onClick={() => setDigits(prev => prev + key)}
            className="bg-gray-100 rounded-xl py-3.5 text-xl font-extrabold text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setDigits(prev => prev.slice(0, -1))}
          className="w-[52px] bg-gray-100 rounded-xl text-xl cursor-pointer hover:bg-gray-200 shrink-0"
        >
          ⌫
        </button>
        <button
          className={`flex-1 rounded-xl py-3.5 font-extrabold text-[15px] transition-all duration-200 ${
            digits
              ? "bg-gray-900 text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-default"
          }`}
        >
          Call
        </button>
      </div>
    </div>
  );
}
```

File: `src/components/dialer/dialer-modal.tsx`:
```tsx
"use client";

import { Dialpad } from "./dialpad";

interface DialerModalProps {
  readonly onClose: () => void;
}

export function DialerModal({ onClose }: DialerModalProps) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative w-[340px] rounded-[32px] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Dark header */}
        <div className="bg-gray-900 px-6 pt-7 pb-5">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="text-[10px] font-bold tracking-[2px] text-white/35 mb-2">BUSINESS LINE</div>
              <div className="text-[26px] font-black text-white tracking-wide">(786) 555-0100</div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/8 rounded-xl w-9 h-9 text-white/50 text-xl cursor-pointer flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="flex gap-2">
            {[
              { icon: "🌐", label: "Internet", cost: "$0.004/min" },
              { icon: "📱", label: "Cell", cost: "$0.018/min" },
            ].map(opt => (
              <div key={opt.label} className="flex-1 bg-white/6 rounded-xl px-3 py-2.5">
                <div className="font-bold text-[13px] text-white/75">{opt.icon} {opt.label}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{opt.cost}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dialpad */}
        <Dialpad />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add dialer modal with dialpad component"
```

---

## Task 9: Dashboard Page

**Files:**
- Create: `src/app/(dashboard)/page.tsx`

The main dashboard with stats, today's jobs, recent leads, and quick actions — direct translation of the prototype's dashboard section.

**Step 1: Implement dashboard page**

File: `src/app/(dashboard)/page.tsx`:
```tsx
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { JOB_STATUS_STYLES } from "@/lib/utils";
import Link from "next/link";

// TODO: Replace with Supabase server queries
const MOCK_JOBS = [
  { id: "1", ini: "ML", client: "Maria Lopez", time: "9:00 AM", svc: "Weekly Lawn Care", total: 65, status: "done" as const, photos: 4 },
  { id: "2", ini: "JS", client: "John Smith", time: "11:30 AM", svc: "Mow + Edge", total: 80, status: "active" as const, photos: 1 },
  { id: "3", ini: "AR", client: "Ana Rodriguez", time: "2:00 PM", svc: "Full Cleanup", total: 150, status: "upcoming" as const, photos: 0 },
  { id: "4", ini: "DC", client: "David Chen", time: "4:00 PM", svc: "Biweekly Mow", total: 80, status: "upcoming" as const, photos: 0 },
];

const MOCK_LEADS = [
  { id: "1", name: "Carlos Mendez", service: "Weekly lawn + edging", value: 120, ago: "2h ago", es: true },
  { id: "2", name: "Patricia Walsh", service: "Biweekly mow", value: 80, ago: "Yesterday", es: false },
  { id: "3", name: "Roberto Sanz", service: "Full yard cleanup", value: 200, ago: "Mar 4", es: true },
  { id: "4", name: "Ashley Kim", service: "Monthly plan", value: 150, ago: "3h ago", es: false },
];

const QUICK_ACTIONS = [
  { icon: "➕", label: "New Job",        bg: "bg-green-50",  fg: "text-green-700" },
  { icon: "👤", label: "Add Client",     bg: "bg-blue-50",   fg: "text-blue-700" },
  { icon: "📋", label: "New Invoice",    bg: "bg-yellow-50", fg: "text-yellow-700" },
  { icon: "💬", label: "Send Message",   bg: "bg-purple-50", fg: "text-purple-700" },
  { icon: "🗺️", label: "Route Optimizer", bg: "bg-rose-50",   fg: "text-rose-700" },
  { icon: "⭐", label: "Request Review", bg: "bg-orange-50", fg: "text-orange-700" },
] as const;

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Monthly Revenue" value={formatCurrency(980)} hint="↑ 12% vs last month" hintColor="text-green-600" />
        <StatCard label="Collected March" value="$3,180" hint="$200 outstanding" hintColor="text-yellow-600" />
        <StatCard label="Jobs Today" value="4" hint="1 done · 3 remaining" hintColor="text-purple-600" />
        <StatCard label="New Leads" value="2" hint="2 need reply" hintColor="text-blue-600" />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-4">
        {/* Today's Jobs */}
        <Card padding="lg">
          <div className="flex justify-between items-center mb-4">
            <span className="font-extrabold text-[15px] tracking-tight">Today&apos;s Jobs</span>
            <Link href="/jobs">
              <Button variant="secondary" size="sm">View all</Button>
            </Link>
          </div>
          {MOCK_JOBS.map(job => {
            const style = JOB_STATUS_STYLES[job.status];
            return (
              <div key={job.id} className="flex items-center gap-3 p-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer mb-0.5">
                <Avatar initials={job.ini} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] mb-0.5">{job.client}</div>
                  <div className="text-[11px] text-gray-400 truncate">{job.time} · {job.svc}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-sm mb-1">{formatCurrency(job.total)}</div>
                  <span className={`${style.bg} ${style.text} rounded-md px-2 py-0.5 text-[10px] font-bold`}>
                    {job.status === "done" ? "✓ " : job.status === "active" ? "↻ " : "◷ "}{style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Recent Leads */}
        <Card padding="lg">
          <div className="flex justify-between items-center mb-4">
            <span className="font-extrabold text-[15px] tracking-tight">Recent Leads</span>
            <Link href="/leads">
              <Button variant="secondary" size="sm">Board</Button>
            </Link>
          </div>
          {MOCK_LEADS.map(lead => (
            <div key={lead.id} className="flex items-center gap-2.5 p-2 px-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer mb-0.5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm shrink-0">👤</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px]">
                  {lead.name}
                  {lead.es && <span className="text-[10px] ml-1">🇪🇸</span>}
                </div>
                <div className="text-[11px] text-gray-400 truncate">{lead.service}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-[13px]">{formatCurrency(lead.value)}<span className="text-[10px] text-gray-300 font-normal">/mo</span></div>
                <div className="text-[10px] text-gray-300">{lead.ago}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card padding="lg">
        <div className="font-extrabold text-[15px] tracking-tight mb-3.5">Quick Actions</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              className={`${action.bg} rounded-[14px] px-3.5 py-4 flex items-center gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md text-left`}
            >
              <span className="text-[22px]">{action.icon}</span>
              <span className={`font-bold text-[13px] ${action.fg}`}>{action.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add dashboard page with stats, jobs, leads, and quick actions"
```

---

## Task 10: Dialer Page

**Files:**
- Create: `src/app/(dashboard)/dialer/page.tsx`
- Create: `src/components/dialer/call-log.tsx`

**Step 1: Implement call log component**

File: `src/components/dialer/call-log.tsx`:
```tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CallEntry {
  readonly name: string;
  readonly number: string;
  readonly duration: string;
  readonly outbound: boolean;
  readonly ago: string;
}

interface CallLogProps {
  readonly calls: readonly CallEntry[];
}

export function CallLog({ calls }: CallLogProps) {
  return (
    <Card padding="lg">
      <div className="font-bold text-sm tracking-tight mb-3.5">Recent Calls</div>
      {calls.map((call, i) => (
        <div
          key={`${call.number}-${i}`}
          className={`flex justify-between items-center py-3 ${
            i < calls.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          <div className="flex gap-2.5 items-center">
            <div className="w-9 h-9 rounded-[10px] bg-gray-100 flex items-center justify-center text-base shrink-0">
              {call.outbound ? "↑" : "↓"}
            </div>
            <div>
              <div className="font-semibold text-[13px]">{call.name}</div>
              <div className="text-[11px] text-gray-400">{call.number} · {call.ago}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-gray-500 font-medium">{call.duration}</span>
            <Button variant="secondary" size="sm">Redial</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}
```

**Step 2: Implement dialer page**

File: `src/app/(dashboard)/dialer/page.tsx`:
```tsx
import { Card } from "@/components/ui/card";
import { Dialpad } from "@/components/dialer/dialpad";
import { CallLog } from "@/components/dialer/call-log";

const MOCK_CALLS = [
  { name: "Carlos Mendez", number: "(786) 555-0123", duration: "4:32", outbound: true, ago: "2h ago" },
  { name: "Maria Lopez", number: "(305) 555-0001", duration: "1:15", outbound: false, ago: "Yesterday" },
  { name: "Patricia Walsh", number: "(305) 555-0456", duration: "2:48", outbound: true, ago: "Mar 4" },
];

export default function DialerPage() {
  return (
    <div className="max-w-[420px] mx-auto animate-in fade-in duration-200">
      {/* Business line header */}
      <div className="bg-gray-900 rounded-3xl px-6 pt-6 pb-5 text-white mb-3.5">
        <div className="text-[10px] font-semibold tracking-[2px] text-white/30 mb-2">BUSINESS LINE</div>
        <div className="text-[26px] font-black tracking-wide mb-1">(786) 555-0100</div>
        <div className="text-[11px] text-white/30">Twilio · A2P Registered · WhatsApp Active</div>
      </div>

      {/* Dialpad card */}
      <Card className="mb-3.5 overflow-hidden !p-0">
        <Dialpad />
      </Card>

      {/* Call log */}
      <CallLog calls={MOCK_CALLS} />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add dialer page with call log"
```

---

## Task 11: Leads Page (Kanban + List)

**Files:**
- Create: `src/app/(dashboard)/leads/page.tsx`
- Create: `src/components/leads/kanban-board.tsx`
- Create: `src/components/leads/kanban-card.tsx`
- Create: `src/components/leads/lead-table.tsx`

This is the most complex page — two views (board/list) with the Kanban columns from the prototype.

**Step 1: Implement kanban card**

File: `src/components/leads/kanban-card.tsx`:
```tsx
"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/types";

interface KanbanCardProps {
  readonly lead: Lead;
  readonly onCall: () => void;
}

export function KanbanCard({ lead, onCall }: KanbanCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-white rounded-[14px] p-3.5 shadow-sm cursor-pointer mb-2 transition-all hover:shadow-md hover:-translate-y-px"
      onClick={() => setExpanded(prev => !prev)}
    >
      <div className="font-bold text-[13px] mb-0.5">
        {lead.name}
        {lead.language === "es" && <span className="text-[10px] ml-1">🇪🇸</span>}
      </div>
      <div className="text-[11px] text-gray-400 mb-2.5 leading-relaxed">{lead.service}</div>
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-[13px]">
          {formatCurrency(lead.value / 100)}
          <span className="text-[10px] text-gray-300 font-normal">/mo</span>
        </span>
        <span className="text-[10px] text-gray-300">
          {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-1.5">
          <button onClick={e => { e.stopPropagation(); onCall(); }} className="bg-green-50 text-green-700 rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer">📞 Call</button>
          <button className="bg-blue-50 text-blue-700 rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer">💬 SMS</button>
          <Button size="sm">Convert</Button>
        </div>
      )}
    </div>
  );
}
```

File: `src/components/leads/kanban-board.tsx`:
```tsx
"use client";

import { KanbanCard } from "./kanban-card";
import { LEAD_STATUSES } from "@/lib/utils";
import type { Lead } from "@/types";

const COLUMN_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

interface KanbanBoardProps {
  readonly leads: readonly Lead[];
  readonly onCall: () => void;
}

export function KanbanBoard({ leads, onCall }: KanbanBoardProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 min-h-[300px]">
      {LEAD_STATUSES.map(status => {
        const items = leads.filter(l => l.status === status);
        return (
          <div key={status} className="min-w-[200px] flex-1 bg-gray-100 rounded-2xl p-3">
            <div className="flex justify-between items-center mb-3 px-0.5">
              <span className="font-bold text-xs text-gray-500">{COLUMN_LABELS[status]}</span>
              <span className="bg-white rounded-full px-2 py-px text-[11px] font-bold text-gray-500">{items.length}</span>
            </div>
            {items.map(lead => (
              <KanbanCard key={lead.id} lead={lead} onCall={onCall} />
            ))}
            <button className="w-full bg-transparent border border-dashed border-gray-300 rounded-[10px] py-2 text-gray-300 text-xs cursor-pointer hover:border-gray-400 hover:text-gray-400 transition-colors">
              + Add
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

File: `src/components/leads/lead-table.tsx`:
```tsx
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/types";

interface LeadTableProps {
  readonly leads: readonly Lead[];
  readonly onCall: () => void;
}

export function LeadTable({ leads, onCall }: LeadTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            {["Name", "Phone", "Service", "Value", "Stage", "Date", ""].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-300 tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-semibold text-[13px]">
                  {lead.name}{lead.language === "es" ? " 🇪🇸" : ""}
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{lead.phone}</td>
              <td className="px-4 py-3 text-xs text-gray-600">{lead.service}</td>
              <td className="px-4 py-3 font-bold text-[13px]">
                {formatCurrency(lead.value / 100)}<span className="text-[10px] text-gray-300 font-normal">/mo</span>
              </td>
              <td className="px-4 py-3">
                <Badge>{lead.status}</Badge>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-300">
                {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  <Button variant="secondary" size="sm" onClick={onCall}>📞</Button>
                  <Button size="sm">Convert</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2: Implement leads page with view toggle**

File: `src/app/(dashboard)/leads/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { LeadTable } from "@/components/leads/lead-table";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/types";

// TODO: Replace with Supabase hook
const MOCK_LEADS: readonly Lead[] = [
  { id: "1", user_id: "", name: "Carlos Mendez", phone: "(786) 555-0123", service: "Weekly lawn + edging", value: 12000, status: "new", language: "es", created_at: "2026-03-06T10:00:00Z" },
  { id: "2", user_id: "", name: "Patricia Walsh", phone: "(305) 555-0456", service: "Biweekly mow", value: 8000, status: "contacted", language: "en", created_at: "2026-03-05T10:00:00Z" },
  { id: "3", user_id: "", name: "Roberto Sanz", phone: "(954) 555-0789", service: "Full yard cleanup", value: 20000, status: "quoted", language: "es", created_at: "2026-03-04T10:00:00Z" },
  { id: "4", user_id: "", name: "Ashley Kim", phone: "(786) 555-1234", service: "Monthly plan", value: 15000, status: "new", language: "en", created_at: "2026-03-06T07:00:00Z" },
  { id: "5", user_id: "", name: "Miguel Torres", phone: "(305) 555-5678", service: "Hedge trimming", value: 9500, status: "contacted", language: "es", created_at: "2026-03-03T10:00:00Z" },
];

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") || "board";
  const [dialerOpen, setDialerOpen] = useState(false);

  const setView = (v: string) => {
    router.push(`/leads?view=${v}`);
  };

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        {/* View toggle */}
        <div className="flex bg-white rounded-xl p-0.5 shadow-sm">
          {[["board", "Board"], ["list", "List"]].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-1.5 rounded-[10px] font-semibold text-[13px] transition-all cursor-pointer ${
                view === v ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="bg-white border border-gray-200 rounded-[10px] px-3.5 py-2 text-[13px] outline-none w-[200px] focus:border-gray-400 transition-colors"
            placeholder="Search leads..."
          />
          <Button>+ Add Lead</Button>
        </div>
      </div>

      {view === "board" ? (
        <KanbanBoard leads={MOCK_LEADS} onCall={() => setDialerOpen(true)} />
      ) : (
        <LeadTable leads={MOCK_LEADS} onCall={() => setDialerOpen(true)} />
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add leads page with kanban board and list views"
```

---

## Task 12: Clients Page + Profile

**Files:**
- Create: `src/app/(dashboard)/clients/page.tsx`
- Create: `src/app/(dashboard)/clients/[id]/page.tsx`
- Create: `src/components/clients/client-card.tsx`
- Create: `src/components/clients/client-profile.tsx`

**Step 1: Implement client card, client page, and profile**

These follow the prototype's client list and profile sections. Client list shows cards with MRR/balance. Clicking navigates to `/clients/[id]` with full profile, stats, and recent jobs.

Implementation follows the same pattern as above — extract from prototype, convert inline styles to Tailwind, use proper types.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add clients page with profile view"
```

---

## Task 13: Jobs Page

**Files:**
- Create: `src/app/(dashboard)/jobs/page.tsx`
- Create: `src/components/jobs/job-card.tsx`

Job list with status filters (All/Scheduled/Active/Done) and job cards showing client, address, service, worker, status, and total.

**Step 1: Implement job card and page**

Same pattern — extract from prototype, Tailwind, proper types.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add jobs page with status filters"
```

---

## Task 14: Revenue Page

**Files:**
- Create: `src/app/(dashboard)/revenue/page.tsx`

Stats row (MRR, one-time, collected, outstanding) + top clients ranked by MRR.

**Step 1: Implement and commit**

```bash
git commit -m "feat: add revenue analytics page"
```

---

## Task 15: Reviews Page + Smart Gate

**Files:**
- Create: `src/app/(dashboard)/reviews/page.tsx`

Stats row + platform connections + Smart Gate toggles.

**Step 1: Implement and commit**

```bash
git commit -m "feat: add reviews page with smart gate configuration"
```

---

## Task 16: Settings Page

**Files:**
- Create: `src/app/(dashboard)/settings/page.tsx`

Business branding, payment methods, notifications — all form fields.

**Step 1: Implement and commit**

```bash
git commit -m "feat: add settings page with business config forms"
```

---

## Task 17: Login Page

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/layout.tsx`

Simple email/password login using Supabase Auth.

**Step 1: Implement auth layout and login**

**Step 2: Commit**

```bash
git commit -m "feat: add login page with Supabase auth"
```

---

## Task 18: Wire Supabase Data Hooks

**Files:**
- Create: `src/hooks/use-leads.ts`
- Create: `src/hooks/use-clients.ts`
- Create: `src/hooks/use-jobs.ts`
- Create: `src/hooks/use-calls.ts`
- Test: `src/hooks/__tests__/use-leads.test.ts`

Replace all mock data with real Supabase queries. Each hook uses the browser client and provides loading/error states.

**Step 1: TDD — write tests for hooks with mocked Supabase**

**Step 2: Implement hooks**

**Step 3: Update all pages to use hooks instead of mock data**

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire Supabase data hooks for all pages"
```

---

## Task 19: Seed Data + Full Integration Test

**Files:**
- Create: `scripts/seed.ts`

Script to populate Supabase with the prototype's mock data for testing.

**Step 1: Write seed script**

**Step 2: Run seed, verify all pages render with real data**

**Step 3: Run full build + test suite**

```bash
npm run test:run
npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add seed script and verify full integration"
```

---

## Summary

**19 tasks** covering Phase 1 (Core UI + Data):
- Tasks 1-5: Project scaffolding, deps, Supabase layer, types, schema
- Tasks 6-8: Shared UI components, layout shell, dialer modal
- Tasks 9-16: All 8 pages (Dashboard, Dialer, Leads, Clients, Jobs, Revenue, Reviews, Settings)
- Task 17: Auth (login page)
- Tasks 18-19: Wire real data + seed

**Phase 2** (Telephony) and **Phase 3** (Smart Features) will be planned separately after Phase 1 is complete.
