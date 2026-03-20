# KleanHQ — Complete Site Redesign Brief

## What is KleanHQ?

KleanHQ (kleanhq.com) is a field service CRM for small business owners who run lawn care, pool service, property cleaning, pressure washing, pest control, HVAC, window cleaning, and handyman businesses.

**One-liner:** Schedule jobs, send invoices, and manage your crew — all from one app.

**Parent company:** TheLevelTeam LLC

## Target Audience

Solo operators and small crews (1-10 people) running field service businesses. They're often working from their truck, managing everything on their phone. Many are Spanish-speaking. They're not tech-savvy — the app needs to be dead simple.

## Pricing Tiers

| Tier | Properties | Price |
|------|-----------|-------|
| Starter | 1-10 | $20/mo |
| Growth | 11-30 | $40/mo (most popular) |
| Pro | 31-75 | $79/mo |
| Enterprise | 75+ | Custom |

Pricing is based on unique property addresses managed. Free trial offered on all tiers.

## Referral Program

- Owner invites another Owner: New owner gets 45 days free, inviter gets 30 days free when they pay
- Owner invites a Client: No reward (it's a business feature)
- Referral link format: `kleanhq.com/join?ref=CODE`

## User Roles

- **Owner** — Business owner who manages everything (primary user)
- **Crew** — Workers assigned to jobs (limited mobile view)
- **Client** — Customers who can view their jobs, request services, and see invoices

## Current Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (Postgres + Auth)
- **Email:** Resend
- **SMS:** Twilio (10DLC registered under TheLevelTeam LLC)
- **Deployment:** Vercel
- **Domain:** kleanhq.com

## Current App Pages

### Public Pages
- `/` — Landing page (marketing homepage)
- `/privacy` — Privacy policy (required for Twilio)
- `/terms` — Terms and conditions (required for Twilio)
- `/pricing` — Pricing page

### Auth Pages
- `/login` — Email/password login
- `/onboard` — Post-signup onboarding (business name, type, phone)
- `/auth/reset-password` — Password reset
- `/invite/[token]` — Accept crew/client invite

### Dashboard (Owner) — Behind auth
- `/dashboard` — Overview with stats, today's jobs, revenue
- `/contacts` — Contact list (leads + clients)
- `/clients/[id]` — Individual client detail page
- `/jobs` — Job list with calendar view
- `/business` — Business profile and settings
- `/settings` — Account settings, invite management
- `/referrals` — Referral program dashboard

### Client Portal — Behind auth
- `/client` — Client's view of their jobs and invoices
- `/client/request` — Client submits a service request

### Crew Portal — Behind auth
- `/crew` — Crew member's assigned jobs view

## Current Features

1. **Job Scheduling** — Create, assign, and track jobs with calendar view
2. **Client Management** — Contacts, properties, tags (VIP, Monthly)
3. **Invoicing** — Generate invoices tied to jobs/properties
4. **Crew Management** — Invite workers, assign jobs
5. **Client Portal** — Clients see their jobs, request new services
6. **Built-in Dialer** — Click-to-call with call logging
7. **SMS Notifications** — Task assignments, schedule updates, referral invites
8. **Referral System** — Owner-to-owner referral with free trial incentives
9. **Service Catalog** — Configurable services per business type
10. **Revenue Analytics** — Basic reporting on dashboard

## Business Types Supported

- Lawn care
- Pool service
- Property cleaning
- Pressure washing
- Pest control
- HVAC
- Window cleaning
- Handyman
- Multi-service

## Current Component Library

### Layout Components
- `Sidebar` — Desktop left nav (220px)
- `Topbar` — Page title bar
- `MobileNav` — Bottom tab bar for mobile
- `DialerFAB` — Floating action button for dialer
- `DialerSheet` — Bottom sheet with dialpad

### UI Primitives
- `Avatar`, `Badge`, `Card`, `Skeleton`, `StatCard`, `Toggle`, `BottomSheet`

### Feature Components
- `AddContactSheet` — Slide-up form for new contacts
- `ClientProfileSheet` — Client detail slide-up
- `CalendarView` — Job calendar
- `InviteSheet` — Crew/client invite form
- `BusinessTypeSelector` — Onboarding business type picker
- `PendingRequests` — Dashboard widget for client service requests

## Current Design Language

- Light theme (white/gray-50 background)
- Apple-inspired aesthetic (SF-style rounded corners, clean typography)
- Animated gradient hero on landing page (canvas-based orbs)
- Device mockups (phone + laptop) on landing page showing fake app screens
- Color palette: Blue (#0071e3) primary, Green (#34c759) success, Purple accents
- Font: System sans-serif stack
- Mobile-first responsive design

## Data Model (Key Entities)

- **Company** — Business entity (one per owner)
- **Profile** — User profile linked to company (owner/crew/client)
- **Lead** — Potential client (new → contacted → quoted → won/lost)
- **Client** — Active customer with properties
- **Property** — Physical address tied to client
- **Job** — Scheduled work at a property (upcoming → active → done)
- **Invoice** — Bill tied to job/property (unpaid → paid/overdue/partial)
- **Call** — Phone call log entry
- **Invite** — Pending crew/client invitation

## Design Direction for Redesign

I want a complete visual redesign of the site. Here's what I'm looking for:

### Landing Page
- Modern, bold, conversion-focused
- Should feel premium but approachable — these are blue collar business owners, not enterprise buyers
- Clear value prop above the fold
- Social proof / testimonials
- Feature highlights with visuals
- Pricing section
- Strong CTA throughout

### Dashboard & App
- Clean, data-dense but not overwhelming
- Mobile-first — most users are on their phone in the field
- Quick actions should be 1-2 taps away
- Dark sidebar with light content area (current pattern)

### General Design Goals
- Make it look like a $50M startup, not a side project
- Professional but warm — not cold/corporate
- Fast, lightweight animations (no heavy libraries)
- Accessible — proper contrast, touch targets

## What I Need From You

1. **Design system** — Colors, typography, spacing, component patterns
2. **Landing page redesign** — Full homepage layout and copy
3. **Dashboard redesign** — Main app interface improvements
4. **Mobile experience** — Optimized for field workers on phones
5. **Component code** — React/Next.js + Tailwind CSS implementations

All code should be:
- TypeScript
- Tailwind CSS (v4) — no inline styles
- Next.js App Router compatible
- Mobile-first responsive
- Accessible (WCAG AA)
