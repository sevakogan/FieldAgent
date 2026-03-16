# FieldPay CRM — Design Document

**Date**: 2026-03-06
**Status**: Approved
**Location**: `/Users/seva/Documents/Claude - Code/FieldPay`

## Overview

FieldPay is a field service CRM for lawn care and home service businesses. It manages leads, clients, jobs, revenue, reviews, and includes a built-in Twilio-powered business phone (calls, SMS, WhatsApp).

## Stack

- Next.js 16 + App Router + TypeScript
- Tailwind CSS v4
- Supabase (Auth + Postgres + RLS)
- Twilio (Voice, SMS, WhatsApp)
- Supabase URL: `https://pkvxoidnkwxqqvutpsmg.supabase.co`

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Stats, today's jobs, recent leads, quick actions |
| Dialer | `/dialer` | Business line dialpad, call log |
| Leads | `/leads` | Kanban board + list view, search, add/convert |
| Clients | `/clients` | Client list with search |
| Client Profile | `/clients/[id]` | Detail view, lifetime value, jobs, actions |
| Jobs | `/jobs` | Job list with status filters |
| Revenue | `/revenue` | MRR, one-time, collected, outstanding, top clients |
| Reviews | `/reviews` | Ratings, platform connections, Smart Gate config |
| Settings | `/settings` | Business branding, payment methods, notifications |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Topbar + MobileNav
│   │   ├── page.tsx                # Dashboard
│   │   ├── dialer/page.tsx
│   │   ├── leads/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx            # Client list
│   │   │   └── [id]/page.tsx       # Client profile
│   │   ├── jobs/page.tsx
│   │   ├── revenue/page.tsx
│   │   ├── reviews/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── twilio/
│       │   ├── call/route.ts       # Initiate outbound call
│       │   ├── sms/route.ts        # Send SMS
│       │   └── webhook/route.ts    # Inbound call/SMS handler
│       └── reviews/
│           └── gate/route.ts       # Smart Gate routing
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── mobile-nav.tsx
│   ├── ui/
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── stat-card.tsx
│   │   ├── toggle.tsx
│   │   └── button.tsx
│   ├── dialer/
│   │   ├── dialer-modal.tsx
│   │   ├── dialpad.tsx
│   │   └── call-log.tsx
│   ├── leads/
│   │   ├── kanban-board.tsx
│   │   ├── kanban-card.tsx
│   │   └── lead-table.tsx
│   ├── clients/
│   │   ├── client-card.tsx
│   │   └── client-profile.tsx
│   └── jobs/
│       ├── job-card.tsx
│       └── job-list.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── middleware.ts            # Auth middleware
│   ├── twilio/
│   │   └── client.ts               # Twilio REST client
│   └── utils.ts                    # Currency formatter, constants
├── hooks/
│   ├── use-leads.ts
│   ├── use-clients.ts
│   ├── use-jobs.ts
│   └── use-calls.ts
└── types/
    └── index.ts                    # All type definitions
```

## Database Schema

### profiles
- `id` UUID PK (references auth.users)
- `business_name` TEXT
- `tagline` TEXT
- `brand_color` TEXT default '#16a34a'
- `phone` TEXT
- `owner_name` TEXT
- `created_at` TIMESTAMPTZ

### leads
- `id` UUID PK
- `user_id` UUID FK -> profiles
- `name` TEXT NOT NULL
- `phone` TEXT
- `service` TEXT
- `value` INTEGER (monthly value in cents)
- `status` TEXT CHECK (new, contacted, quoted, won, lost)
- `language` TEXT default 'en'
- `created_at` TIMESTAMPTZ

### clients
- `id` UUID PK
- `user_id` UUID FK -> profiles
- `name` TEXT NOT NULL
- `phone` TEXT
- `initials` TEXT (2 chars)
- `properties_count` INTEGER default 1
- `mrr` INTEGER (cents)
- `balance` INTEGER (cents, outstanding)
- `tag` TEXT (VIP, Monthly, or null)
- `created_at` TIMESTAMPTZ

### jobs
- `id` UUID PK
- `user_id` UUID FK -> profiles
- `client_id` UUID FK -> clients
- `address` TEXT
- `service` TEXT
- `worker` TEXT
- `scheduled_at` TIMESTAMPTZ
- `status` TEXT CHECK (upcoming, active, done)
- `total` INTEGER (cents)
- `photos_count` INTEGER default 0
- `completed_at` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ

### calls
- `id` UUID PK
- `user_id` UUID FK -> profiles
- `contact_name` TEXT
- `phone_number` TEXT
- `duration_seconds` INTEGER
- `direction` TEXT CHECK (inbound, outbound)
- `twilio_sid` TEXT
- `created_at` TIMESTAMPTZ

### reviews
- `id` UUID PK
- `user_id` UUID FK -> profiles
- `client_id` UUID FK -> clients
- `platform` TEXT CHECK (google, yelp, facebook, nextdoor)
- `rating` INTEGER CHECK (1-5)
- `text` TEXT
- `gate_passed` BOOLEAN default false
- `created_at` TIMESTAMPTZ

### settings
- `id` UUID PK
- `user_id` UUID FK -> profiles UNIQUE
- `payment_methods` JSONB
- `notification_prefs` JSONB
- `review_platforms` JSONB
- `smart_gate_config` JSONB
- `updated_at` TIMESTAMPTZ

## Auth

- Supabase Auth with email/password
- Single-tenant: one business owner per account
- RLS on all tables: `user_id = auth.uid()`
- Middleware redirects unauthenticated users to `/login`

## Key Features

### Smart Gate (Reviews)
- After job marked done, auto-sends review request (SMS/email)
- Rating < 4: stays private (owner gets notified)
- Rating >= 4: redirects to Google/Yelp review page
- Configurable per notification channel

### Twilio Integration
- Business line number displayed in dialer
- Click-to-call from any client/lead card
- SMS sending from client profile
- Call logging with duration tracking
- WhatsApp channel for Spanish-speaking clients

### Kanban Leads
- Board view: drag between columns (new -> contacted -> quoted -> won/lost)
- List view: table with sort/filter
- Quick actions: call, SMS, convert to client
- View mode persisted in URL search params

## Phases

### Phase 1: Core UI + Data
- Scaffold Next.js project
- All 8 pages with proper components + Tailwind
- Supabase schema, auth, RLS
- CRUD operations for leads, clients, jobs
- Dashboard with real aggregated data

### Phase 2: Telephony
- Twilio account setup
- Outbound calls via API route
- SMS sending
- Call/SMS webhook handlers
- Call log persistence

### Phase 3: Smart Features
- Review gate system
- Platform connections (Google, Yelp)
- WhatsApp integration
- Push notification setup
- Route optimizer placeholder
