# FieldPay User Management & Roles Design

**Date:** 2026-03-16
**Status:** Approved

## Roles

| Role | Description |
|------|-------------|
| **Owner** | Business owner. Full access to everything. Creates account, manages crew + clients. |
| **Crew** | Field worker. Sees only their assigned jobs (past + future). Gets notifications. |
| **Client** | Customer. Views jobs, invoices, receipts. Can request off-cycle jobs. |

## Database Schema

### `companies`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| name | text | |
| owner_id | uuid, FK → auth.users | |
| phone | text | |
| created_at | timestamptz | |

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK, FK → auth.users | |
| company_id | uuid, FK → companies | |
| role | text ('owner', 'crew', 'client') | |
| full_name | text | |
| phone | text | |
| avatar_url | text, nullable | |
| created_at | timestamptz | |

### `invites`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| company_id | uuid, FK → companies | |
| email | text, nullable | |
| phone | text, nullable | |
| role | text ('crew', 'client') | |
| token | text, unique | For link-based invites |
| status | text ('pending', 'accepted', 'expired') | |
| invited_by | uuid, FK → auth.users | |
| created_at | timestamptz | |
| expires_at | timestamptz | |

### `job_requests` (off-cycle client requests)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| company_id | uuid, FK → companies | |
| client_id | uuid, FK → profiles | |
| service_description | text | |
| estimated_amount | integer | Cents |
| owner_amount | integer, nullable | Owner's adjusted price |
| status | text | 'pending', 'approved', 'confirmed', 'declined', 'cancelled' |
| created_at | timestamptz | |

### RLS Rules
- Owner: full read/write on all company data
- Crew: read-only on their assigned jobs within company
- Client: read-only on their own jobs/invoices, write on job_requests

## Invite Flow

### Owner Actions (Settings → Team & Clients)
1. "Invite Crew" or "Invite Client" button → bottom sheet
2. Fill in: name, email, phone
3. Three delivery options:
   - **Send Email** — Supabase invite email with magic link
   - **Send SMS** — API route sends SMS with invite link (stub initially)
   - **Copy Link** — generates `/invite/{token}`, copies to clipboard

### Invite Accept Flow
1. Recipient clicks link → `/invite/[token]` page
2. New user: "Set your password" form → account created → auto-joins company
3. Existing user: auto-joins company with assigned role

## Role-Based Routing

| Role | Visible Pages | Hidden Pages |
|------|---------------|--------------|
| Owner | Dashboard, Contacts, Jobs, Business, Settings | — |
| Crew | Jobs (theirs only), Settings | Dashboard, Contacts, Business |
| Client | My Jobs, My Invoices, Request Job, Settings | Dashboard, Contacts, Business |

### Crew Dashboard
- Today's assigned jobs + past jobs list
- Mark job as done, upload photos
- Notifications for new assignments

### Client Dashboard
- Upcoming scheduled jobs
- Past jobs + invoices + receipts
- "Request a Job" button

## Off-Cycle Job Request Flow

### Client Side
1. Tap "Request a Job" → bottom sheet
2. Pick service type + date preference
3. System shows estimated amount (based on historical pricing)
4. Submit → `job_requests` row with status `pending`

### Owner Side
1. Notification via: in-app badge, push/SMS, email with "Approve" link
2. Open request → see details → approve (with optional price adjustment) or decline
3. If approved → client notified with final price

### Resolution
- **Client confirms** → charge processes instantly → job created as `upcoming`
- **Client declines** → status = `declined` → job sits in pending, owner can follow up

## Password Reset
1. "Forgot password?" link on login page
2. Calls `supabase.auth.resetPasswordForEmail(email)`
3. User receives email → clicks link → `/auth/callback` handles token
4. Redirects to `/auth/reset-password` → "Set new password" form

## New Routes

| Route | Purpose |
|-------|---------|
| `/invite/[token]` | Accept invite + set password |
| `/auth/reset-password` | Set new password after reset link |
| `/crew` | Crew dashboard (their jobs only) |
| `/client` | Client dashboard (jobs, invoices, request) |
| `/client/request` | Off-cycle job request flow |
