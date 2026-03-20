# KleanHQ — Complete System Specification v3 (FINAL)
## Field Service CRM Platform for Small Business Owners
### Master Build Document for Claude Code

---

## ⚠️ AUTONOMOUS BUILD MODE — READ THIS FIRST

**DO NOT ask the user any questions until the ENTIRE build is complete.**

Read this entire document first. Then build everything phase by phase (Phase 1 through Phase 9) without stopping, without asking for clarification, without requesting API keys or credentials.

### Rules:
1. **Never stop to ask a question.** If something is ambiguous, make the best decision yourself and log it in `DECISIONS.md`.
2. **Use placeholder environment variables everywhere.** Example: `NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here`. The user will fill these in after the build.
3. **Build mock/placeholder integrations.** For Stripe, Supabase, Resend, Twilio, QuickBooks, Xero, Airbnb, etc. — build the full integration code with proper function signatures, error handling, and types, but use placeholder API keys. Everything should compile and run with mock data.
4. **Create seed data.** Build a seed script (`scripts/seed.ts`) that populates the database with realistic demo data: 2 companies, 5 clients, 10 addresses, 20 jobs across various statuses, 3 workers, sample invoices, sample messages. This lets the user see the app working immediately after connecting Supabase.
5. **Build all UI pages.** Every single route listed in the Page Structure section should have a real, functional page — not a placeholder "coming soon" stub. Use mock data if the backend isn't connected yet.
6. **When the ENTIRE application is built**, present the user with ONE final message containing:
   - A summary of what was built (page count, feature count)
   - A `DECISIONS.md` file listing every decision you made autonomously
   - A `SETUP.md` file with step-by-step instructions to connect everything:
     - Supabase project setup (create project, run migrations, set env vars)
     - Stripe Connect setup (create platform account, set webhook URL)
     - Resend setup (verify domain, set API key)
     - Twilio setup (get number, set webhook for incoming SMS)
     - Vercel deployment (connect repo, set env vars, deploy)
     - DNS configuration for kleanhq.com
   - A list of ALL environment variables needed with descriptions
   - The command to run the seed script
7. **Do not ask for anything else.** The user should be able to take your output, plug in credentials, and have a working application.

### Build Order:
Follow the phases exactly as listed in this document (Phase 1 → Phase 9). Each phase builds on the previous one. Do not skip phases.

### Quality Standards:
- All TypeScript — no `any` types, proper interfaces for everything
- All components are responsive (mobile-first, iOS design patterns)
- Framer Motion animations on page transitions, modals, status changes
- Proper error handling and loading states on every page
- Proper form validation on every form
- Accessible (ARIA labels, keyboard navigation, screen reader friendly)

---

## OVERVIEW

KleanHQ is a multi-tenant field service management platform for small businesses (lawn care, pool service, cleaning, pressure washing, HVAC, etc.). It handles job scheduling, crew dispatch, GPS tracking, photo/video verification, automated payments, STR integrations, client portals, referral programs, and reseller white-labeling.

**The core promise:** Company schedules → Worker executes → Client approves → Payment flows. Super simple.

**Domain:** kleanhq.com
**Repo:** github.com/sevakogan/FieldAgent (being rebuilt as KleanHQ)

---

## TECH STACK

```
Framework:      Next.js 15 (App Router, Turbopack, Server Components)
UI:             React 19 + TypeScript
Styling:        Tailwind CSS v4 (iOS design tokens, 4pt/8pt grid)
Animations:     Framer Motion (iOS spring curves, sheet modals, swipe gestures)
PWA:            next-pwa (installable on phones, full-screen, splash screen)
Native Wrapper: Capacitor (App Store/Play Store when ready — same codebase)
Database:       Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
Payments:       Stripe Connect (embedded, platform model)
Email:          Resend (all transactional emails, branded templates)
SMS:            Twilio (when connected — notification channel)
WhatsApp:       Twilio WhatsApp Business API (wired in)
AI:             Anthropic Claude API (contract generation, smart features)
Deploy:         Vercel (CDN, edge, serverless, wildcard subdomains)
```

---

## BRAND IDENTITY — iOS PASTEL

```
Background:     #F2F2F7 (iOS system grouped background)
Surface/Cards:  #FFFFFF
Border:         #E5E5EA (iOS separator)

Accent Colors (Pastel):
  Sky Blue:     #007AFF (primary actions, links)
  Soft Yellow:  #FFD60A (workers, alerts)
  Lilac:        #AF52DE (clients, portal)
  Mint:         #5AC8FA (dashboard, leads)
  Peach:        #FF9F0A (payments, fees)
  Coral:        #FF6B6B (errors, rejections)
  Rose:         #FF2D55 (growth, invites)
  Slate:        #8E8E93 (admin, neutral)

Text:
  Primary:      #1C1C1E
  Secondary:    #3C3C43
  Tertiary:     #AEAEB2

Typography:
  Display:      SF Pro Display (iOS) → Geist Sans (web fallback)
  Body:         SF Pro Text (iOS) → Geist Sans (web fallback)
  Mono:         SF Mono → Geist Mono (timestamps, code, numbers)

Radius:         16-20px cards, 12px buttons, 8px inputs
Spacing:        iOS 4pt/8pt grid system
Shadows:        Minimal — prefer 1px borders for separation
Blur:           backdrop-blur for nav bars (iOS frosted glass effect)
```

### iOS Design Patterns (USE EVERYWHERE)
- Bottom tab navigation on mobile (worker + client views, 5 tabs max, icon + label)
- NO bottom tabs on desktop — use sidebar navigation instead
- Breakpoint: 768px (below = mobile with bottom tabs, above = desktop with sidebar)
- Grouped lists (Settings-app style rounded sections)
- Sheet modals (slide up from bottom with drag indicator, not centered dialogs)
- Large title headers that collapse on scroll
- Pull to refresh on all list views
- Swipe left on cards for quick actions
- 44pt minimum touch targets on all interactive elements
- Safe area insets (notch, home indicator, status bar)
- Haptic feedback design cues (job started, photo captured, payment confirmed)
- Card-based layouts with generous padding (24px horizontal, 16px vertical minimum)
- Spring animation curves (not linear) for all transitions

---

## CUSTOM AUTH FLOW (Fully Custom — Not Default Supabase UI)

Everything is custom-built, branded KleanHQ pastel iOS design. Supabase Auth is used as the backend engine but ALL screens are custom.

### Signup Flows
- **Company signup:** name, email, phone, password, business type → onboarding wizard (add first service, first client, first worker)
- **Client signup:** name, email, phone, password → OR invited by company (pre-filled email, just set password)
- **Worker signup:** invited by company only → receives email/SMS with signup link → sets password + uploads profile photo
- **Reseller signup:** separate flow from reseller section of landing page → name, email, phone, password, brand name

### Login
- Email + password (primary)
- Magic link option (passwordless — email a login link)
- "Remember me" toggle
- Forgot password → reset email via Resend (branded template)
- Login page is clean, minimal: logo, two fields, two buttons

### Profile Management (Every User Type Has This)
- Profile photo upload (circular crop, iOS style picker)
- Edit: full name, email, phone
- Change password
- Notification preferences (which channels: web, mobile, SMS, email, WhatsApp)
- Language preference (English, Spanish, etc.)
- Delete account (confirmation modal → option to export all data first → soft delete)

### User Management (Owner/Lead in Dashboard → /dashboard/team)
- **Create new worker:** name, email, phone, pay type, pay rate, profile photo → sends invite email/SMS with signup link
- **Create new client:** name, email, phone, profile photo (optional) → sends invite with portal login link
- **Edit any user's info** (name, email, phone, role, pay settings)
- **Deactivate user:** soft delete — user can't log in, data preserved, can reactivate later
- **Reactivate user:** restore access
- **Delete user:** hard delete with confirmation — reassigns their jobs/data to "unassigned"
- **View all users:** filterable by role (owner, lead, worker), searchable by name/email
- **Invite history:** see pending invites, resend, cancel

---

## MEDIA & PHOTOS (Stored in Supabase Storage)

### User Profile Photos
- Every user can upload a profile photo
- Circular crop on upload (iOS-style image picker)
- Shows on: job cards, message threads, team lists, client lists, worker tracking map pins
- Fallback: colored circle with initials (like iOS contacts)
- Stored: `/avatars/{user_id}.webp`

### Property/Address Photos
- **One primary photo per address** (property exterior)
- Uploaded by: client (from portal) OR company (from dashboard)
- Shows on: address cards in lists, job cards, calendar entries, client portal, worker job detail
- Stored: `/properties/{address_id}/primary.webp`

### Service/Job Gallery (Built Over Time)
- Every completed job's before/after photos auto-populate a gallery per address
- Client can browse: "See all past work at this address" (timeline view)
- Owner can browse: "Work history at 123 Main St"
- Filterable by: service type, date range, worker
- Useful for: showing improvement over time, dispute resolution, marketing (with client consent)

### Worker Portfolio
- Worker's completed job after-photos build a portfolio automatically
- Owner sees: "Worker A's work quality across all jobs" → helps with performance reviews
- Optional: client-facing worker profiles on booking page ("Meet your technician" with photo + rating + portfolio)

### Company Media
- **Company logo:** shown in portal header, invoices, emails, booking page, mobile app header
- **Company cover photo:** optional — shown on public booking page as hero image
- **Service type photos:** optional — shown on booking page and portal when browsing services
- Stored: `/companies/{company_id}/logo.webp`, `/companies/{company_id}/cover.webp`, `/services/{service_id}/photo.webp`

### Photo Processing
- All uploads auto-converted to WebP for performance
- Thumbnails auto-generated (200px for lists, 800px for detail views)
- Original preserved for downloads
- Max upload size: 10MB per photo, 50MB per video

---

## PLATFORM HIERARCHY

```
KleanHQ Super Admin (Seva)
├── Direct Companies (owned by Seva — full margin, no reseller)
├── Reseller A (white-label tier)
│     ├── Company 1
│     └── Company 2
├── Reseller B
│     └── Company 3
└── Direct Company N
```

### Super Admin
- **Admin credentials (auto-create in seed script):**
  - Email: `Seva@thelevelteam.com`
  - Password: `Seva@1982`
  - Role: `super_admin`
- Sees ALL companies, resellers, revenue, metrics globally
- Can own and operate companies directly (gets full margin)
- Sets and changes global pricing: $/address/month, volume discount tiers — adjustable from $5 to $50, no code change
- Sets global Stripe fee margin (KleanHQ's hidden cut)
- Manages reseller accounts, their margin caps, their custom pricing
- Platform-wide analytics, referral tracking, webhook logs, waitlist management
- Configures reseller entry fee ($0 default, can change to $250)

### Reseller
- White-labels KleanHQ (own brand name, logo, colors, custom domain)
- Sets their own processing fee margin on top of KleanHQ's margin
- Sees only their companies, their revenue, their margin earnings
- Never sees KleanHQ's underlying margin
- Entry: $0 fee, but margin doesn't kick in until 5 properties under management (super admin can override to $250 one-time fee)
- White-label badge removal: $100/mo add-on ("Powered by KleanHQ" removed or replaced)

### Company
- The core tenant. Has: owner, leads, workers, clients, addresses, services, jobs

---

## USER TYPES

### 1. Owner
- Full admin of the company
- Manages everything: workers, clients, addresses, services, pricing, billing, Stripe, integrations
- Sees all jobs across all workers in real-time with live status + GPS map
- Downloads owner version of job files (includes worker pay amount + receipt)
- Connects company-side integrations: QuickBooks, Xero, Google Calendar
- Pays workers via Stripe Connect
- Can own multiple companies — switch between them like Slack workspaces
- Configures: automation rules, notification preferences, cancellation policy, business hours, service area

### 2. Lead
- Same permissions as Owner (V1 — future: scopeable permissions)
- Multiple leads per company allowed

### 3. Worker
- Mobile-first — THIS IS THE PRIMARY INTERFACE
- Sees only their assigned jobs (today's schedule + upcoming)
- Job execution: DRIVE → ARRIVED → IN PROGRESS → UPLOAD BEFORE PHOTOS → DO WORK → UPLOAD AFTER PHOTOS/VIDEO → ENTER CUSTOM FIELDS → ADD EXPENSES → COMPLETE CHECKLIST → END JOB
- In-app camera: date/time overlay on bottom-right of photo. GPS metadata attached.
- Video capture supported (before and after)
- Can add expenses mid-job (photo of receipt + description + price → added to invoice)
- Offline mode: download today's schedule button, work offline, sync when back
- Cannot see: financials, other workers' jobs, client payment info, company billing

### 4. Client
- Own portal (separate UI/layout from company dashboard)
- Can belong to MULTIPLE companies simultaneously
- Portal shows jobs from ALL connected companies
- Can add a Co-Client who sees the exact same view
- Connects STR integrations from their portal: Airbnb, VRBO, Hospitable, Hostaway, Guesty
- Can INVITE new companies to join KleanHQ (growth engine)
- Portal features:
  - Calendar (all jobs, all addresses, all companies)
  - Request new job (company approves or counter-offers)
  - View/approve/reject completed jobs (see before/after photos, checklist, expenses)
  - View current + past invoices and receipts
  - Pay invoices (credit card, ACH, e-check)
  - Set up auto-pay
  - Manage payment methods (assign per address)
  - Leave reviews (Google/Yelp/etc. — company provides link)
  - Manage STR integrations
  - Invite companies
  - Document storage per address (gate codes, WiFi, instructions)
  - See weather forecast on upcoming outdoor jobs
  - See expected pricing for scheduled jobs
  - Tip worker after approval
  - Pause/skip recurring services
  - See live worker location during active jobs ("10 min away")
  - Settings (profile, co-client management, notification preferences, language)

### 5. Co-Client
- Mirrors client view exactly. Invited by client.
- Can approve jobs, pay invoices, view everything client sees.

### 6. Independent Pro (Marketplace)
- Registers for **FREE** — becomes searchable in the marketplace
- Not employed by any company — freelancer picking up jobs directly from clients
- Has their own dashboard (`/pro`) — similar to worker view but with: profile management, pricing, earnings, reviews
- Sets their own: services, pricing, availability, service area
- Clients find them via "Find a Pro" search → request a job → Pro accepts/declines
- Jobs follow the same lifecycle (photos, approval, payment through Stripe)
- KleanHQ earns processing margin on every transaction — no monthly fee to the Pro
- Can upgrade to a Company account when they grow (one-click, data transfers)

---

## INTEGRATIONS (All under "Integrations" section)

### Client-Side (Connected in Client Portal via OAuth)
| Platform | Type | Trigger |
|----------|------|---------|
| Airbnb | STR | Checkout → auto-create job |
| VRBO | STR | Checkout → auto-create job |
| Hospitable | STR | Checkout → auto-create job |
| Hostaway | STR | Checkout → auto-create job |
| Guesty | STR | Checkout → auto-create job |

**Data per reservation:** first_name, last_name, reservation_number, checkin_date, checkin_time, checkout_date, checkout_time

**STR auto-approve:** ON by default per STR address. Client can disable to manually review.

### Company-Side (Connected in Dashboard by Owner)
| Platform | Type | Sync |
|----------|------|------|
| QuickBooks | Accounting | Invoices, payments, expenses |
| Xero | Accounting | Invoices, payments, expenses |
| Google Calendar | Calendar | Two-way sync (company + client) |

### Communication (System-Level)
| Channel | Provider | Usage |
|---------|----------|-------|
| Email | Resend | All transactional emails, branded pastel templates |
| SMS | Twilio | Notifications when connected |
| WhatsApp | Twilio WhatsApp Business | Wired in for messaging |

### Auto-Job Creation Flow (STR)
1. Client connects STR platform (OAuth) in their portal
2. Client's addresses linked to STR listings
3. Checkout event → webhook hits KleanHQ
4. System creates SEPARATE jobs per service type (cleaning = 1 job, pool = 1 job, lawn = 1 job, etc.)
5. Each job uses the address's default service type + scheduling rules
6. Worker assigned per address/service defaults (or manual)
7. Jobs appear on company calendar
8. Each job follows normal lifecycle independently
9. Reservation data attached to all related jobs for filtering

---

## JOB LIFECYCLE — COMPLETE FLOW

### Status Enum
```
requested → approved → scheduled → driving → arrived → in_progress → pending_review → completed → charged
                                                                   → revision_needed → (back to in_progress)
cancelled (from: requested, approved, scheduled — cancellation policy applies)
```

### Worker Execution Flow (Mobile-First)

1. **SCHEDULED** — Job card on worker's calendar. Shows: client name, address, service type, time, special instructions, weather (outdoor jobs), client documents (gate code, WiFi, notes).

2. **TAP "DRIVE"** → Opens Google Maps or Apple Maps with address. Status → `driving`. `drive_started_at` + GPS recorded. Client sees "Your technician is on the way" with live location.

3. **TAP "ARRIVED"** → Status → `arrived`. `arrived_at` + GPS recorded. Client sees "Technician has arrived."

4. **UPLOAD BEFORE PHOTOS/VIDEO** — Document the state before work begins. Camera (timestamp overlay) or gallery. Video supported.

5. **TAP "START JOB"** → Status → `in_progress`. `started_at` recorded.

6. **DO THE WORK** — During the job, worker can:
   - Check off items on the job checklist (if checklist is set for this service type)
   - Enter custom fields (pool readings, HVAC data — if toggled on for this service type)
   - Add expenses: tap "Add Expense" → photo of receipt (required) + description + price. Multiple allowed. Added to invoice total.

7. **UPLOAD AFTER PHOTOS/VIDEO** — Document completed work. Client will see before/after side by side.

8. **TAP "END JOB"** → Validation checks:
   - If `photo_required = true` → at least 1 after photo required
   - If checklist exists → all required items must be checked
   - If validation passes → `ended_at` recorded. Status → `pending_review`.
   
9. **NOTIFICATIONS FIRE:**
   - Client: "Your [service] at [address] is complete — review photos and approve"
   - Owner: "[Worker] completed [service] at [address] — pending client review"
   - `auto_approve_deadline` set to 48 hours from now

10. **CLIENT REVIEWS (in portal):**
    - Sees: before/after photos/videos side by side, checklist results, custom field data, expenses with receipt photos, total price (base + expenses)
    - **Approves** → status → `completed` → charge fires → `charged`. Invoice auto-generates → auto-emails → saved to portal.
    - **Tip option** appears after approval: "Add a tip for [Worker]?" Optional, goes directly to worker.
    - **Rejects** → must enter specific reason (required text). Can attach photos showing issue. Status → `revision_needed`. Worker + Owner notified with rejection reason.
    - **No response** → auto-approve at `auto_approve_deadline` (48hr) → `completed` → `charged`.

11. **REVISION FLOW:**
    - Worker goes back, redoes work, uploads new after photos/video
    - Taps END JOB again → back to `pending_review`
    - Same 48hr timeout applies

12. **RECURRING:**
    - On `completed`, if linked to active recurring address_service → next job auto-creates
    - Same address, service type, worker, time
    - Date = current job date + recurrence interval
    - New job appears on calendar immediately

### Company Rejects Client Request
- Company enters: rejection reason + revised price (optional) + revised date (optional) + note
- Client notified with counter-offer
- Client accepts (→ becomes scheduled job) or cancels

### Cancellation Flow
- Client or company can cancel jobs in: `requested`, `approved`, `scheduled` status
- Cancellation policy set per company: X hours notice required, late cancel fee amount
- If cancelled within policy window → late cancel fee applies → charged
- If cancelled outside window → no fee
- Cancelled jobs logged in history

### Quotes Flow
- Company creates a quote: services, price, notes, optional photos, expiration date, deposit requirement
- Client receives in portal: views quote → accepts or declines
- If deposit required: deposit charges immediately on acceptance (amount configurable — e.g., 50%)
- On acceptance → quote converts to scheduled job
- Remaining balance charged on job completion

---

## STRIPE ARCHITECTURE

### Platform Model (Stripe Connect)
KleanHQ is the platform. Each company is a connected account.

**Payment flow:**
Client pays → KleanHQ platform account → KleanHQ takes margin → remainder transfers to company connected account

### Fee Markup (Hidden from Company)
```
ACH:
  Stripe real:     0.8%
  KleanHQ shows:   1.5%
  KleanHQ keeps:   0.7%

Credit Card:
  Stripe real:     2.9% + $0.30
  KleanHQ shows:   3.5% + $0.30
  KleanHQ keeps:   0.6%

Reseller adds on top:
  Company sees:    KleanHQ rate + reseller margin
  Example:         3.5% + 0.5% = 4.0% + $0.30
  Three layers of revenue per transaction
```

### Fee Assignment (Company Chooses)
- Company absorbs → deducted from payout
- Client pays → added to charge amount
- Split 50/50

### Payment Schedules
- **Per job:** Charge on client approval OR auto-charge 48hr after photos
- **Monthly:** All completed jobs roll up → charge on 1st of month → itemized invoice
- Auto-pay: if ON, charges automatically. If OFF, invoice sits in portal for manual payment.

### Invoice Flow (Fully Automatic)
Job completed → charge fires → invoice auto-generates (base price + expenses + tax + tip) → auto-emails to client via Resend → saved to portal → receipt generated

### Worker Payouts
Set during worker onboarding (can vary by job type):
- Per job: flat rate per completed job
- Hourly: calculated from START to END timestamps
- Percentage: X% of job price
- Manual: owner sends any amount
- Via: ACH, credit card, Cash App, e-check (whatever Stripe Connect supports)

### Tax
- Company sets tax rate per state/region OR auto-calculate by zip code
- Shows as line item on invoice
- Collected and reported through Stripe

### Late Payment Handling
- Payment fails → auto-retry after 3 days
- Client notified: "Payment failed — update your card"
- Owner notified: "Payment failed for [Client]"
- After X failed attempts → account flagged
- Late fee option: company sets amount + grace period

### Deposits
- For one-time jobs / quotes: company sets deposit percentage
- Deposit charges on quote acceptance
- Remaining balance charges on job completion

### Platform Billing (KleanHQ Revenue)
- **$7/address/month** (base price — super admin can adjust anytime)
- Volume tiers: 1-5 = $7/mo, 6-15 = $6/mo, 16-50 = $5/mo, 50+ = custom
- Annual subscription option: 10% discount
- Super admin can adjust all pricing anytime, no code change
- Billed via Stripe

### Free Trial Structure
- **Standard signup: 15-day free trial** (no credit card required)
- **Referred signup: 30-day free trial** (if they used a referral code/link)
- After trial: must add payment method or account goes read-only
- Trial countdown visible in dashboard
- Reminder emails:
  - 5 days before trial ends
  - 1 day before trial ends
  - Day of expiry: "Your trial has ended — upgrade to keep going"

### AI Assistant Pricing
- **60-day free trial on AI** for all users (starts from first AI message, not signup)
- After 60 days: **AI automatically turns OFF** (not charged by default — must opt-in)
- Reminder emails before AI turns off:
  - 30 days before: "Your AI assistant trial is halfway done — here's what you've used it for"
  - 15 days before: "15 days left of free AI — subscribe to keep it"
  - 5 days before: "Your AI assistant turns off in 5 days — $5/mo to keep it"
- After turn-off: AI chat bubble disappears. One-tap "Reactivate AI — $5/mo" in settings.
- $5/month per user (owner, lead, client, co-client). **Workers always free.**
- Company owner sees: "AI Assistant: 3 users × $5 = $15/mo"
- Client sees: "AI Assistant: $5/mo" in their portal billing

### KleanHQ Revenue Streams (Total — This is Where the Money Comes From)
1. **$7/address/month** — platform billing from company side (volume tiers, annual discount)
2. **Stripe processing margin** — hidden delta on every client payment transaction (both sides pay without knowing)
3. **$100/mo white-label badge removal** — reseller add-on
4. **$5/mo per AI user** — after 60-day free trial, opt-in, auto-off if not subscribed
5. **Referral program** — costs money but drives exponential growth + referred users get longer trial (30 vs 15 days)

**The customer-side revenue engine:**
- Every client who uses AI chat = $5/mo to KleanHQ
- Every transaction the client makes = processing margin to KleanHQ
- The more clients on the platform, the more recurring revenue from BOTH sides (company pays per address, clients pay per AI + processing fees)
- Referral system compounds this: more users → more referrals → more users → more revenue

---

## NOTIFICATIONS SYSTEM

### Channels (User Configurable in Settings)
- Web (in-app notifications)
- Mobile push (via PWA / Capacitor)
- SMS (via Twilio when connected)
- Email (via Resend)
- WhatsApp (via Twilio WhatsApp)

User can check/uncheck any combination per notification type.

### Notification Events
| Event | Recipients |
|-------|-----------|
| Job assigned to worker | Worker |
| Job started (DRIVE) | Owner, Client ("technician on the way") |
| Job arrived | Client ("technician arrived") |
| Job completed → pending review | Client, Owner |
| 24hr warning before auto-approve | Client |
| Auto-approved (48hr) | Client, Owner |
| Client approved | Owner, Worker |
| Client rejected → revision needed | Owner, Worker (with reason) |
| Payment successful | Client (receipt), Owner |
| Payment failed | Client, Owner |
| New service request from client | Owner |
| Service request approved/countered | Client |
| Quote sent | Client |
| Quote accepted | Owner |
| New STR job auto-created | Owner |
| Worker expense added | Owner |
| Referral reward earned | Referrer |
| Recurring job auto-created | Owner |
| Cancellation | Client, Owner, Worker |
| Late payment reminder | Client |
| Review request | Client (X hours after completion) |

### Automation Settings (Company Configures)
All automation rules are togglable in company settings:
- Auto-send review request: X hours after job completion
- Auto-approve timeout: configurable (default 48hr)
- Auto-retry failed payments: after X days
- Auto-send late payment reminders: after X days
- Auto-create recurring jobs: on completion of current
- Auto-assign workers: round-robin / nearest / specific per address
- Smart review gate: 4-5 stars → redirect to Google/Yelp. 1-3 stars → private feedback form.

---

## COMMUNICATION / MESSAGING

### In-App Messaging (Per Client Thread)
- Owner/Lead/Worker can message a client within the app
- One thread per client (not per job)
- Messages sync to client via:
  - Email (Resend) — always
  - SMS (Twilio) — when connected
  - WhatsApp (Twilio WhatsApp) — wired in
- Client can reply via any channel → appears in the app thread
- If client texts the company's Twilio number → notification to owner
- Message history stored, searchable
- Owner sees all threads across all clients
- Worker sees only threads for their assigned clients

---

## SEARCH

### Global Search Bar (Top of Every Page)
- Searches across: clients, addresses, jobs, invoices, workers
- Fields: name, email, phone, address, job ID, checkout date, reservation number, invoice number
- Results grouped by type (Clients, Jobs, Invoices, etc.)
- Keyboard shortcut: Cmd+K / Ctrl+K
- Recent searches remembered
- Available to: Owner, Lead (full), Worker (their jobs/clients only), Client (their data only)

---

## REPORTS & ANALYTICS (Owner/Lead Dashboard)

### Revenue Reports
- Revenue by: client, address, service type, worker, month, quarter, year
- Revenue trends (charts): MRR, growth rate, month-over-month comparison
- Collected vs outstanding breakdown
- Processing fee costs

### Job Reports
- Jobs completed: this week/month/quarter
- Average job time per service type
- Jobs by status breakdown
- Jobs by source (manual, client request, STR integration)

### Worker Reports
- Worker efficiency: jobs/day, average time per job
- Worker utilization rate
- Rejection rate per worker
- Revenue generated per worker
- Payout history per worker

### Client Reports
- Client retention (active vs churned)
- Client lifetime value
- Outstanding balances aging report (30/60/90 days)
- Top clients by revenue

### Expense Reports
- Worker expenses over time
- Expenses by category/service type
- Profit margin per job (charge - worker pay - expenses)

### Data Export
- Export any report as CSV or PDF
- Export clients, jobs, invoices as CSV
- Tax season annual summary export
- QuickBooks/Xero sync handles accounting export

---

## JOB CHECKLISTS

### Setup (Owner Creates Templates per Service Type)
- Each service type can have an optional checklist
- Checklist items: text label + required (yes/no)
- Drag-and-drop reorder
- Must be fluid and easy to create — no complex nesting, just a simple ordered list

### Worker Execution
- Checklist appears during job execution (between START and END)
- Worker taps to check off each item
- If item is marked "required" → job can't be ended until checked
- Clean, simple toggle UI — one tap per item

### Client Review
- Client sees the completed checklist during pending_review
- Shows which items were checked and when

### Examples
**Turnover Clean:** Kitchen ✓, Bathrooms ✓, Bedrooms ✓, Linens ✓, Restock ✓, Trash out ✓
**Pool Service:** Skim ✓, Vacuum ✓, Brush walls ✓, Check filter ✓, Add chemicals ✓, Test water ✓
**HVAC Tune-Up:** Inspect unit ✓, Replace filter ✓, Check refrigerant ✓, Test thermostat ✓, Clean coils ✓

---

## CUSTOM JOB FIELDS

### Setup (Owner Toggles per Service Type)
- Optional — toggled on/off per service type in settings
- When ON, worker sees data entry fields during job execution
- Field types: text, number, dropdown, checkbox

### Pre-Built Templates
**Pool Service:** pH level, Chlorine (free/total), Alkalinity, Calcium hardness, CYA (stabilizer), Water temperature
**HVAC:** Equipment model/serial, Filter size, Refrigerant levels, System age, Error codes
**Lawn Care:** Grass height, Problem areas, Fertilizer used, Weed treatment, Irrigation notes

### Data Saved To
- Job record (viewable in job detail)
- Client portal (client sees in review + history)
- Downloadable job file
- Over time, builds a history chart per address (e.g., pool chemical trends)

---

## WORKER EXPENSE ADD-ONS

### During Job (Between ARRIVED and END)
- Worker taps "Add Expense"
- Required: photo of receipt/item
- Required: description (e.g., "5lb chlorine bucket")
- Required: price (what they paid)
- Multiple expenses per job allowed

### Flow
- Each expense attached to the job record
- Added to the job total automatically
- Client sees expenses itemized during review (with receipt photos)
- Client approves the FULL amount (service + expenses)
- Included in invoice and charge
- Included in downloadable job file

---

## BEFORE & AFTER PHOTOS + VIDEO

### Before (Taken on Arrival)
- Worker documents state before work begins
- Photos AND/OR video supported
- Camera (in-app with timestamp overlay) or gallery upload

### After (Taken Before END JOB)
- Worker documents completed work
- Photos AND/OR video supported
- Same camera/gallery options

### Client Review
- Client sees before/after side by side in pending_review
- Much more powerful for approval — sees the transformation

### Photo Requirements
- In-app camera: date/time overlay bottom-right corner (white monospace text on semi-transparent black bar)
- GPS coordinates attached as metadata
- Multiple photos/videos per job allowed
- If `photo_required = true` on service type → at least 1 after photo required to END JOB

---

## GPS LIVE TRACKING

### Worker Tracking
- During `driving` and `in_progress` status → worker's live GPS location tracked
- Owner dashboard: map view showing all active workers as pins (real-time)
- Color-coded: driving = blue, on-site = yellow, idle = gray
- Tap a pin → see worker name, current job, client, ETA

### Client Tracking
- During `driving` status → client sees "Your technician is X minutes away" with live map
- Similar to Uber/DoorDash tracking experience
- Auto-updates every 10 seconds

### Data Logging
- GPS coordinates logged at: drive_started, arrived, started, ended
- Route recorded during driving (for mileage/travel time analytics)
- All GPS data available in job record and downloadable file

---

## CLIENT DOCUMENT STORAGE

### Per Address
- Client stores documents/notes per address in their portal:
  - Gate codes
  - Alarm codes
  - WiFi password
  - Lockbox location
  - Special instructions ("fragile art on wall," "dog is friendly," "use back entrance")
- Free-form text field + ability to add labeled key-value pairs

### Worker Access
- These documents show to the worker on the job detail screen
- Worker sees them before/during the job
- Worker cannot edit (client manages)

---

## RECURRING JOB MANAGEMENT

### Auto-Create
- When a recurring job is marked `completed` → next job auto-creates on calendar
- Same: address, service type, assigned worker, time
- Date = current date + recurrence interval (weekly=7d, biweekly=14d, monthly=30d)

### Pause / Skip
- Client can SKIP next occurrence (one-time, auto-resumes after)
- Client can PAUSE recurring service indefinitely (until un-paused)
- Neither cancels the subscription
- Owner notified of pauses/skips

### Seasonal Pricing
- Company can set different prices per month for a service type
- Example: lawn mow = $65 in summer (Apr-Oct), $45 in winter (Nov-Mar)
- Prices auto-switch based on the month of the scheduled job
- Configurable in service type settings

---

## QUOTES

### Creation
- Company creates a quote: selected services, price per service, notes, optional photos, expiration date
- Deposit requirement: optional, configurable amount/percentage
- Quote sent to client (email + appears in portal)

### Client Response
- Client views in portal → Accepts or Declines
- If deposit required → deposit charges immediately on acceptance
- On acceptance → quote converts to one or more scheduled jobs
- Remaining balance charged on job completion
- If declined → owner notified

---

## AI CONTRACT GENERATION

### Setup
- Company creates contract template structure per service type
- Templates include: company info, client info, address, services, pricing, frequency, cancellation terms, liability clauses
- Uses Anthropic Claude API (company's API key or KleanHQ platform key)

### Generation
- When a new recurring client is added or a service agreement is needed → AI generates the contract
- Pulls in: company name, client name, address, services, pricing, frequency, terms
- Output: professional service agreement

### Signing
- Client signs digitally in the portal
- Signed contract stored as PDF in Supabase Storage
- Linked to the client/address record
- Accessible by owner and client

---

## AI ASSISTANT (Per User Role — Claude API)

Every user gets an AI chat assistant scoped to their role and data. Powered by Anthropic Claude API via tool use / function calling. The assistant can read the user's data AND take actions (with confirmation).

### Worker AI Assistant
**Can ask:**
- "What's my next job today?"
- "What's the gate code for 123 Main St?"
- "How do I add an expense?"
- "What's the checklist for a turnover clean?"
- "Show me directions to my next job" (triggers Maps)
- "What did the client say about the backyard?" (pulls address documents)

**Scoped to:** their assigned jobs, addresses they visit, their schedule, checklists, help docs
**Cannot access:** financials, other workers' jobs, client payment info, company settings

**Tools available:**
- `getMySchedule(date?)` → returns today's or specified date's jobs
- `getJobDetail(jobId)` → returns full job detail (only if assigned to them)
- `getAddressDocuments(addressId)` → returns gate codes, WiFi, instructions
- `getChecklist(serviceTypeId)` → returns checklist template
- `getHelpArticle(query)` → searches help docs
- `startNavigation(addressId)` → opens Maps with address

### Client AI Assistant
**Can ask:**
- "When is my next service?"
- "How much did I pay last month?"
- "Show me all jobs at my Ocean Drive property"
- "I want to schedule a deep clean for next Friday"
- "What's the status of my pool service today?"
- "Can I pause my lawn service for two weeks?"
- "What's my total outstanding balance?"
- "Show me the before/after photos from last week"

**Scoped to:** their jobs, invoices, addresses, connected companies, payment history, contracts
**Cannot access:** company internals, worker details, other clients, company revenue

**Tools available:**
- `getMyJobs(filters?)` → returns jobs (filterable by address, date, company, status)
- `getJobPhotos(jobId)` → returns before/after media
- `getMyInvoices(filters?)` → returns invoices
- `getMyBalance()` → returns outstanding total
- `requestService(addressId, serviceTypeId, preferredDate)` → creates service request (with confirmation)
- `pauseRecurring(addressServiceId, resumeDate?)` → pauses a recurring service
- `skipNextJob(addressServiceId)` → skips next occurrence
- `getAddressHistory(addressId)` → returns all jobs at this address
- `getHelpArticle(query)` → searches help docs

### Owner / Lead AI Assistant
**Can ask:**
- "How much revenue did we do this week?"
- "Which worker has the most rejections this month?"
- "Show me all overdue invoices"
- "What's our most profitable service type?"
- "Schedule a lawn mow for Maria Lopez at Coral Way next Monday, assign to Jose"
- "Send an invoice to David Chen for $150"
- "Who's available tomorrow afternoon?"
- "What jobs are pending review right now?"
- "Compare March vs February revenue"
- "Message Maria Lopez: we'll be there at 9am tomorrow"

**Scoped to:** EVERYTHING in their company — full data access
**Cannot access:** other companies' data, platform admin data (unless super admin)

**Tools available:**
- `getRevenue(period?, groupBy?)` → revenue data with breakdowns
- `getJobs(filters?)` → all jobs (any status, any worker, any client)
- `getClients(filters?)` → client list with balances
- `getWorkers()` → worker list with stats
- `getWorkerStats(workerId, period?)` → efficiency, rejections, ratings
- `getOverdueInvoices()` → aging report
- `createJob(params)` → creates a job (with confirmation prompt)
- `sendInvoice(clientId, amount, items)` → generates and sends invoice (with confirmation)
- `sendMessage(clientId, content)` → sends in-app message
- `getWorkerAvailability(date)` → who's free when
- `getPendingReviews()` → jobs awaiting client approval
- `getExpenseReport(period?)` → worker expenses breakdown
- `getHelpArticle(query)` → searches help docs

### Technical Implementation
```
UI:
- Floating chat bubble (bottom-right desktop, menu item on mobile)
- Opens slide-over panel (iOS sheet modal on mobile)
- Conversation history saved per user in Supabase
- Quick suggestion pills: "Try: What's my schedule today?"
- Voice input option (speech-to-text via Web Speech API — for workers with dirty hands)
- Typing indicator while AI responds
- Markdown rendering in responses (bold, lists, etc.)

Backend:
- API route: POST /api/ai/chat
- Receives: { message, conversationHistory, userId }
- Builds system prompt based on user role + current context
- Calls Anthropic Claude API with tool definitions scoped to user role
- Executes tool calls against Supabase (with RLS respecting user's access)
- Returns AI response + any action confirmations
- Logs all conversations for analytics

System Prompt Structure:
- Role description ("You are KleanHQ's AI assistant for [role]")
- User context (name, company, current page)
- Available tools (role-scoped)
- Tone: friendly, concise, action-oriented
- Rules: never expose data outside user's scope, always confirm before taking actions
- Help docs injected as context

Database:
```sql
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  messages jsonb not null default '[]',
  context jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Cost Control:
- Use Claude Haiku for simple queries (fast, cheap)
- Escalate to Claude Sonnet for complex multi-tool queries
- Rate limit: 50 messages per user per day (configurable by super admin)
- Cache frequent queries (e.g., "what's my schedule today" — cache for 5 minutes)
- Show "AI Assistant" as a toggleable feature in company settings (owner can disable)

Pricing:
- FIRST 60 DAYS: completely free for all users (company owners, clients, workers)
- AFTER 60 DAYS: $5/month per user who has AI Assistant enabled
  - "User" = any account that uses the AI chat (owner, lead, client, co-client)
  - Workers are NOT charged — AI is free for workers always (they need it most, dirty hands, in the field)
  - Charged to: company owner for their team, client pays their own
  - Company owner can see in billing: "AI Assistant: 3 users × $5 = $15/mo"
  - Client sees in their portal: "AI Assistant: $5/mo" (or they can disable it)
  - Auto-enabled during free period, user must opt-in to paid after 60 days
  - If they don't opt in, AI chat bubble disappears but everything else works
  - Super admin can adjust the price, the free period, and who gets charged
  - This is a SEPARATE line item from platform billing ($X/address) — additional revenue stream

Database addition to users table:
  - ai_enabled boolean default true
  - ai_trial_started_at timestamptz (set on first AI message)
  - ai_trial_ends_at timestamptz (ai_trial_started_at + 60 days)
  - ai_subscribed boolean default false (true after they opt-in to paid)
  - ai_subscription_started_at timestamptz
```

### Action Confirmations
When the AI wants to take an action (create job, send invoice, send message), it ALWAYS shows a confirmation card:
```
┌─────────────────────────────────┐
│ 📋 Create Job                   │
│                                  │
│ Client: Maria Lopez             │
│ Address: 123 Coral Way          │
│ Service: Weekly Lawn Mow        │
│ Date: Monday, April 7           │
│ Worker: Jose M.                 │
│ Price: $65                      │
│                                  │
│  [Cancel]  [✓ Confirm & Create] │
└─────────────────────────────────┘
```
User must tap Confirm before any write operation executes. Read operations (queries) execute immediately.

---

## REFERRAL SYSTEM — VIRAL LOOPS

### 6 Referral Types
1. **Company → Company:** Refer a service business. Reward: recurring credit off platform billing for X months.
2. **Client → Client:** Tell a friend. Reward: credit toward next service (default $25, company sets amount).
3. **Client → Company:** Invite a company not on KleanHQ. Reward: client gets service credit, company gets first month free.
4. **Company → Client:** Onboard customers to portal. Reward: gamified tier badges → unlock lower fees.
5. **Worker → Worker:** Bring a friend. Reward: flat bonus after X completed jobs.
6. **Reseller → Reseller:** Refer a reseller. Reward: recurring % of referred reseller's revenue.

### Mechanics
- Every user gets a unique referral code + shareable link: `kleanhq.com/ref/CODE`
- First-touch attribution — permanent
- QR code generation for in-person referrals
- Share via: Copy Link, SMS, Email, WhatsApp, **Instagram** (auto-generates branded image with referral code + rules, opens IG ready to post)
- Referral status: `invited → signed_up → qualified → rewarded`
- Qualified = real activity (company creates first job, client pays first invoice)
- No reward for signups only — prevents gaming

### Referral Tracking — EVERYWHERE
- **Every single link shared from the app carries referral attribution**
- Job share links, invoice links, review links, portal invites, ANY link
- If anyone clicks and eventually signs up → referral attributed
- Every screen footer: subtle "Know someone who'd love KleanHQ?" + share button

### Referral Landing Page (`kleanhq.com/ref/CODE`)
- Shows: who referred them, what both sides get
- CTA: "Sign up as a Company" or "Sign up as a Client"
- Referral code auto-fills during signup

### Super Admin Controls
- Set reward amounts/types per referral loop
- Set qualification criteria
- Set duration for recurring rewards
- Set caps (max reward per referrer per month)
- Pause/adjust any program instantly
- View all referral activity platform-wide

---

## WAITLIST SYSTEM

### Launch Waitlist (kleanhq.com — live NOW)
- Coming soon landing page with countdown timer
- Waitlist signup: name, email, type (Company / Client / Reseller)
- Unique referral link per signup
- Share to move up: the more people you refer who also sign up, the higher your position
- Social share: Instagram, SMS, Email, WhatsApp, Copy Link
- Leaderboard showing top referrers (optional, anonymous or public)

### Service Waitlist (In-App — for companies at capacity)
- When a company is fully booked → new client requests go to waitlist
- Waitlist has a special share code — if they share and friends sign up, they move up
- Company sees the waitlist and can pull from it when slots open
- Or: auto-suggest next available date

### Admin Backend (Super Admin)
- See all waitlist signups
- Referral count per person
- Position in waitlist
- Source tracking (where they came from)
- Manual position override
- Export as CSV
- Send batch invite emails when ready to launch

---

## MARKETPLACE — "FIND A PRO"

### Overview
KleanHQ is not just a tool — it's a **platform with a marketplace**. Any service provider can register for free and become searchable. Any client can find and hire them. This creates network effects that make the platform harder to leave.

### Three Provider Types on the Platform
1. **Company Worker** — employed by a company, assigned jobs by their owner (existing)
2. **Independent Pro** — freelancer, registered free, searchable, picks up jobs directly from clients (NEW)
3. **Company** — business entity with workers under it (existing)

### Independent Pro Registration (FREE)
- Sign up at `kleanhq.com/join-as-pro` or `/portal/find-pro` (client can also invite)
- Registration form:
  - Name, email, phone, password
  - Profile photo
  - Services offered (pick from master list)
  - Service area (zip codes or radius from location)
  - Pricing (hourly rate and/or per-job prices per service type — they set their own)
  - Bio / about me
  - Portfolio photos (manual upload — auto-populated from completed jobs over time)
  - Certifications / licenses (CPO for pool, pesticide, insured, bonded, etc.)
  - Languages spoken
  - Availability (which days/times they work)
- After signup: profile is live and searchable immediately
- Costs: **$0 to register, $0 to be searchable, $0 monthly fee**

### Independent Pro Profile
```
┌─────────────────────────────────────────┐
│  [Profile Photo]                         │
│  Jose Martinez                           │
│  ⭐ 4.8 (23 reviews) · Miami, FL        │
│  ✓ Verified · ✓ Insured · ✓ CPO Cert   │
│                                          │
│  Services: Pool Service, Pool Repair     │
│  Rate: $75-120/job                       │
│  Available: Mon-Sat, 7am-5pm            │
│  Languages: English, Spanish             │
│  Response time: ~15 min                  │
│                                          │
│  "15 years of pool service experience    │
│   in South Florida..."                   │
│                                          │
│  [Portfolio photos grid]                 │
│                                          │
│  [📩 Request a Job]  [💬 Message]       │
└─────────────────────────────────────────┘
```

### Client Search — "Find a Pro"
**In client portal:** `/portal/find-pro`
**Public page (drives SEO traffic):** `kleanhq.com/find`

- Search by: service type, location (zip/city/radius), rating, price range, availability, language, verified status
- Results: grid of profile cards (photo, name, rating, services, price range, distance)
- Sort by: distance, rating, price low→high, response time
- Tap a card → full profile detail
- "Request a Job" button → select address, service type, preferred date/time, notes
- Job request sent to Pro → Pro gets push notification
- Pro accepts → job created → normal job flow (schedule, photos, approval, payment)
- Pro declines → client notified, can search for someone else

### What Happens When a Pro Gets Their First Job
- Job flows through KleanHQ: scheduling, photos, approval, payment — all standard
- Payment goes through Stripe Connect → KleanHQ earns processing margin
- Pro gets paid after client approves (same flow as company jobs)
- Pro gets rated by client (builds their profile)
- **Pro pays $7/address/month from day one** — same price as companies. Every unique client address the Pro services counts as an address. No free ride.
- **KleanHQ also earns processing margin** on every transaction on top of the platform fee
- Registration and being searchable is free. Revenue starts the moment a job happens.

### Pro → Company Upgrade Path
When an Independent Pro grows (gets enough clients, hires helpers):
- Prompt: "You're growing! Upgrade to a Company account to manage workers, automate billing, and more."
- One-click upgrade: Pro becomes a Company Owner
- Their existing clients, jobs, ratings, and billing transfer seamlessly
- Same $7/address/month — no price change, just more features
- Volume discounts kick in at 6+ addresses (same tier structure as companies)
- This is the natural growth funnel: solo Pro → full Company

### Marketplace Revenue Model
```
Independent Pro registers free → becomes searchable
  → Client finds them (free to search and connect)
  → First job at a client address → Pro starts paying $7/addr/mo for that address
  → Payment through Stripe → KleanHQ earns processing margin
  → Pro services more addresses → more platform billing revenue
  → Pro builds reputation → gets more clients → more addresses → more revenue
  → Pro grows → upgrades to Company → same pricing, more features
  → Pro refers other Pros → more providers → more jobs → more revenue
```

**Free to register, free to be found. $7/address/month the moment work starts. Processing margin on every transaction.**

### Database
```sql
create table independent_pros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  bio text,
  services jsonb not null default '[]',
  service_area_zips text[],
  service_area_radius_miles integer,
  service_area_lat numeric,
  service_area_lng numeric,
  hourly_rate numeric,
  per_job_prices jsonb default '{}',
  certifications jsonb default '[]',
  languages text[] default '{"en"}',
  availability jsonb,
  portfolio_photos text[] default '{}',
  is_verified boolean default false,
  is_insured boolean default false,
  avg_rating numeric default 0,
  total_reviews integer default 0,
  total_jobs integer default 0,
  avg_response_minutes integer,
  stripe_account_id text,
  status text default 'active' check (status in ('active','paused','suspended','upgraded_to_company')),
  upgraded_company_id uuid references companies,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pro reviews (from clients)
create table pro_reviews (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid references independent_pros not null,
  client_id uuid references clients not null,
  job_id uuid references jobs not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);
```

### Pages
```
Public:
  kleanhq.com/find                    → Public search (SEO-driven)
  kleanhq.com/pro/[slug]              → Public pro profile
  kleanhq.com/join-as-pro             → Pro registration

Client Portal:
  /portal/find-pro                    → Search for Independent Pros
  /portal/find-pro/[proId]            → Pro profile detail + request job

Pro Dashboard (/pro):
  /pro                                → Dashboard (incoming requests, active jobs, earnings)
  /pro/jobs                           → Job list
  /pro/jobs/[id]                      → Job execution (same as worker view)
  /pro/profile                        → Edit profile, portfolio, services, pricing
  /pro/reviews                        → View ratings and reviews
  /pro/earnings                       → Payment history
  /pro/settings                       → Notification prefs, availability, Stripe payout setup
  /pro/upgrade                        → Upgrade to Company account
```

### Admin View
- Super admin sees: total Pros registered, active Pros, jobs through marketplace, revenue from marketplace
- Can: verify Pros, suspend Pros, feature Pros (boost in search results)

---

## DOMAIN & SUBDOMAIN STRUCTURE

```
kleanhq.com                              → Landing page + waitlist (now), marketing + signup (launch)
app.kleanhq.com                          → Main app login/router

Direct companies:
  johnslawn.kleanhq.com                  → Client portal (free)

Under reseller:
  johnslawn.proservice.kleanhq.com       → Client portal (free)

White-label:
  johnslawn.proservice.io                → Fully white-labeled ($100/mo)
```

### Technical
- Vercel wildcard subdomains: `*.kleanhq.com`
- Company has `slug` field → maps to subdomain
- Reseller has `slug` + optional `custom_domain`
- Custom domains: CNAME → Vercel + auto SSL
- Middleware reads hostname → resolves company/reseller → loads correct branding

### White-Label Badge
- Free: "Powered by KleanHQ" visible in footer
- $100/mo: remove badge entirely OR replace with "Powered by [Reseller Name]"
- Per reseller (covers all their companies)

---

## COMPANY SETTINGS

### Business Configuration
- Business type (pre-loads service categories)
- Business hours (when jobs can be scheduled)
- Service area (radius from HQ or zip code list)
- Cancellation policy (hours notice required, late cancel fee)
- Auto-approve timeout (default 48hr, configurable)
- Job buffer time (minimum travel time between jobs per worker)
- Tax rate (set per state/region or auto by zip)

### Auto-Assign Rules
- Round-robin (distribute evenly across workers)
- Nearest worker (based on GPS)
- Specific worker per address/service (default assignment)

### Branding (Shown in Client Portal)
- Company logo
- Brand accent color
- Company name
- Contact info (phone, email)

### Review Automation (Smart Gate)
- Auto-send review request X hours after job completion
- If rating 4-5 stars → redirect to Google/Yelp link
- If rating 1-3 stars → redirect to private feedback form
- Review links configurable (Google, Yelp, Facebook, Nextdoor, etc.)

---

## MULTI-COMPANY SWITCHING

### For Owners with Multiple Companies
- One login, one account
- Company switcher in the top navigation (like Slack workspace switcher)
- Tap → dropdown of all companies they own/lead
- Quick switch, no re-login
- Each company is fully isolated (separate clients, workers, billing)
- OR: consolidated view across all companies (filterable)
- Always show which company is currently active (prominent indicator)

---

## TIME-OF-DAY RESTRICTIONS

### Per Address
- Set quiet hours / scheduling restrictions (e.g., "No lawn mowing before 8am or after 6pm")
- System warns if a job is scheduled outside allowed hours
- Doesn't block — just warns. Owner can override.
- Shows to worker in job details

---

## WEATHER AWARENESS

### For Outdoor Service Types
- Pull weather data for the job's address on the scheduled date
- Weather badge on job card: ☀️ 85°F or 🌧️ Rain expected
- Shows to: Worker (in their schedule), Owner (in dashboard calendar), Client (in their portal)
- Alert to owner if rain is forecasted for outdoor jobs
- Does NOT auto-cancel — just alerts. Owner decides.

---

## INTERNAL RATING SYSTEM

### Client Rates Worker (After Each Job)
- 1-5 stars, optional
- Prompted after approval
- Owner sees ratings over time per worker (trends, averages)
- Never shown to the worker directly (management tool only)
- Helps owner identify top performers and issues

---

## DOWNLOADABLE JOB FILES

### Client Version (Client + Co-Client Access)
- All before/after photos and videos (timestamped, GPS)
- Job summary PDF (date, time, address, service, status timeline, checklist results)
- Payment receipt PDF (amount, expenses, tax, tip, date, method)
- Custom field data (pool readings, etc.)
- NO worker information

### Owner Version (Owner + Lead Access)
- Everything in client version PLUS:
- Worker name
- Worker drive time + on-site time
- Worker pay amount for this job
- Worker receipt of payment

### Delivery
- One persistent URL per job → downloads zip of all files
- URL never expires
- Stored in Supabase Storage
- Generated after job marked `completed`

---

## OFFLINE MODE (Workers)

### Implementation
- "Download Today's Schedule" button in worker app
- Uses service worker + IndexedDB (local cache)
- Downloads: today's jobs, job details, address info, checklists, client documents
- Worker can: START, take photos, check off checklist, add expenses, END — all stored locally
- When connection returns → everything syncs automatically
- Photos queue in background upload
- Worker never notices the difference

---

## CLIENT SELF-SERVICE BOOKING

### Public Booking Page
- URL: `[company-slug].kleanhq.com/book`
- Shows: available services + prices
- New visitor can: pick service → enter address → pick date/time → enter info → pay deposit or full amount
- Becomes a new client automatically
- Lead generation built into the platform
- Company can customize: which services are bookable, available times, deposit requirements

---

## DUPLICATE JOB DETECTION

- When creating a job (manual or auto): check for same address + same service type + same date
- If duplicate found → warning: "This looks like a duplicate — merge or keep both?"
- Prevents double-booking from STR auto-creation + manual scheduling overlap

---

## AUDIT TRAIL / ACTIVITY LOG

- Every action logged: who did what, when
- Job status changes with timestamps
- Payment events
- Photo/video uploads
- Setting changes
- User logins
- Visible to: Owner, Lead
- Useful for disputes, accountability, compliance

---

## PROMO CODES / COUPONS

### Company Level
- Company creates promo codes for their clients
- Example: "FIRST50" = 50% off first service
- Configurable: discount amount/percentage, expiration, max uses, applicable services

### Platform Level
- KleanHQ creates promo codes for new signups
- Example: "3MONTHSFREE" = no platform billing for 3 months

### Reseller Level
- Resellers create promo codes for recruiting companies
- Example: "JOINPRO" = first 3 addresses free for 2 months

---

## DOWNGRADE / CHURN PREVENTION

### When Company Tries to Cancel
- Show: "You have X active clients, $Y in monthly revenue flowing through KleanHQ"
- Offer: pause billing for 1 month instead of cancel
- Survey: "Why are you leaving?" (required)
- Data saved for product improvement
- Super admin sees all cancellation attempts + reasons

---

## LEGAL PAGES (AI-Generated Drafts)

- Terms of Service
- Privacy Policy
- Cookie Policy
- Acceptable Use Policy
- Service Level Agreement (for resellers)
- Generated using Claude API, reviewed by Seva
- Accessible from footer of all pages

---

## EMAIL TEMPLATES (Resend — All Branded Pastel)

All emails use KleanHQ's pastel brand colors, iOS-inspired clean layout, mobile-optimized.

1. Invoice sent
2. Payment receipt
3. Job pending review (with before/after photos)
4. Job auto-approved (48hr)
5. Service request received (to company)
6. Service request approved/countered (to client)
7. Quote sent
8. Quote accepted
9. Revision needed (to worker + owner, with rejection reason)
10. Worker payout sent
11. Monthly invoice
12. Referral reward earned
13. STR job auto-created (to owner)
14. Welcome / onboarding
15. Referral invite ("You've been referred by...")
16. Review request (smart gate)
17. Payment failed
18. Late payment reminder
19. Waitlist confirmation
20. Waitlist position update
21. Launch invite (from waitlist)

---

## DATA MODEL — COMPLETE SCHEMA

### Core Tables
```sql
-- Users (extends Supabase Auth)
create table users (
  id uuid primary key references auth.users,
  email text not null,
  full_name text not null,
  phone text,
  role text not null check (role in ('super_admin','reseller','owner','lead','worker','client','co_client','independent_pro')),
  avatar_url text,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resellers
create table resellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  brand_name text not null,
  slug text unique not null,
  custom_domain text,
  logo_url text,
  brand_color text default '#007AFF',
  margin_percentage numeric default 0,
  whitelabel_badge text default 'powered_by_kleanhq' check (whitelabel_badge in ('powered_by_kleanhq','powered_by_reseller','hidden')),
  whitelabel_fee_active boolean default false,
  entry_fee_paid boolean default false,
  status text default 'active' check (status in ('active','suspended')),
  properties_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Companies
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  business_type text not null,
  owner_id uuid references users not null,
  reseller_id uuid references resellers,
  stripe_account_id text,
  stripe_fee_setting text default 'company_pays' check (stripe_fee_setting in ('company_pays','client_pays','split_50_50')),
  logo_url text,
  brand_color text default '#007AFF',
  phone text,
  email text,
  review_links jsonb default '{}',
  auto_approve_timeout_hours integer default 48,
  business_hours jsonb,
  service_area jsonb,
  cancellation_policy_hours integer default 24,
  late_cancel_fee numeric default 0,
  job_buffer_minutes integer default 30,
  tax_rate numeric default 0,
  tax_auto_by_zip boolean default false,
  auto_assign_rule text default 'manual' check (auto_assign_rule in ('manual','round_robin','nearest','per_address')),
  review_auto_send_hours integer default 24,
  review_smart_gate boolean default true,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Company Members (owner, lead, worker)
create table company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  user_id uuid references users not null,
  role text not null check (role in ('owner','lead','worker')),
  pay_type text check (pay_type in ('per_job','hourly','percentage','manual')),
  pay_rate numeric,
  stripe_payout_account_id text,
  availability jsonb,
  status text default 'active' check (status in ('active','invited','deactivated')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Client-Company Link (many-to-many)
create table client_companies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients not null,
  company_id uuid references companies not null,
  payment_schedule text default 'per_job' check (payment_schedule in ('per_job','monthly')),
  auto_pay boolean default false,
  stripe_customer_id text,
  stripe_payment_method_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id, company_id)
);

-- Co-Clients
create table co_clients (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients not null,
  user_id uuid references users not null,
  created_at timestamptz default now()
);

-- Addresses
create table addresses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients not null,
  company_id uuid references companies not null,
  street text not null,
  unit text,
  city text not null,
  state text not null,
  zip text not null,
  lat numeric,
  lng numeric,
  is_str boolean default false,
  integration_source text check (integration_source in ('airbnb','vrbo','hospitable','hostaway','guesty')),
  integration_property_id text,
  integration_settings jsonb default '{}',
  str_auto_approve boolean default true,
  time_restrictions jsonb,
  documents jsonb default '[]',
  status text default 'active' check (status in ('active','inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Service Types
create table service_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  name text not null,
  description text,
  default_price numeric not null,
  seasonal_pricing jsonb,
  estimated_duration_minutes integer,
  photo_required boolean default true,
  video_allowed boolean default true,
  checklist_items jsonb default '[]',
  custom_fields jsonb default '[]',
  custom_fields_enabled boolean default false,
  recurrence_options jsonb default '["one_time","weekly","biweekly","monthly"]',
  is_outdoor boolean default false,
  is_default boolean default false,
  sort_order integer default 0,
  status text default 'active' check (status in ('active','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Address Services (active services per address with pricing)
create table address_services (
  id uuid primary key default gen_random_uuid(),
  address_id uuid references addresses not null,
  service_type_id uuid references service_types not null,
  price numeric not null,
  recurrence text default 'one_time' check (recurrence in ('one_time','weekly','biweekly','monthly')),
  assigned_worker_id uuid references company_members,
  status text default 'active' check (status in ('active','paused','cancelled')),
  paused_at timestamptz,
  skip_next boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs
create table jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  address_id uuid references addresses not null,
  service_type_id uuid references service_types not null,
  address_service_id uuid references address_services,
  assigned_worker_id uuid references company_members,
  source text not null check (source in ('manual_company','client_request','api_integration','quote','booking')),
  status text not null default 'scheduled' check (status in ('requested','approved','scheduled','driving','arrived','in_progress','pending_review','revision_needed','completed','charged','cancelled')),
  scheduled_date date not null,
  scheduled_time time,
  drive_started_at timestamptz,
  drive_lat numeric,
  drive_lng numeric,
  arrived_at timestamptz,
  arrived_lat numeric,
  arrived_lng numeric,
  started_at timestamptz,
  ended_at timestamptz,
  price numeric not null,
  expenses_total numeric default 0,
  tax_amount numeric default 0,
  tip_amount numeric default 0,
  total_charged numeric,
  photo_required boolean default true,
  checklist_results jsonb,
  custom_field_values jsonb,
  auto_approve boolean default false,
  auto_approve_deadline timestamptz,
  rejection_reason text,
  rejection_photos text[],
  company_rejection_reason text,
  company_counter_price numeric,
  company_counter_date date,
  company_counter_note text,
  cancellation_reason text,
  late_cancel_fee numeric default 0,
  recurring_parent_id uuid references address_services,
  reservation_first_name text,
  reservation_last_name text,
  reservation_number text,
  reservation_checkin_date date,
  reservation_checkin_time time,
  reservation_checkout_date date,
  reservation_checkout_time time,
  download_link_client text,
  download_link_owner text,
  weather_data jsonb,
  quote_id uuid,
  deposit_amount numeric,
  deposit_paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Job Photos/Videos
create table job_media (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs not null,
  type text not null check (type in ('photo','video')),
  timing text not null check (timing in ('before','after')),
  url text not null,
  thumbnail_url text,
  captured_at timestamptz,
  lat numeric,
  lng numeric,
  has_timestamp_overlay boolean default false,
  uploaded_by uuid references users not null,
  created_at timestamptz default now()
);

-- Job Expenses
create table job_expenses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs not null,
  description text not null,
  amount numeric not null,
  receipt_photo_url text not null,
  added_by uuid references users not null,
  created_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  client_id uuid references clients not null,
  job_id uuid references jobs,
  invoice_number text not null,
  subtotal numeric not null,
  expenses_total numeric default 0,
  tax_amount numeric default 0,
  tip_amount numeric default 0,
  processing_fee numeric default 0,
  fee_paid_by text check (fee_paid_by in ('company','client','split')),
  total numeric not null,
  payment_method text check (payment_method in ('credit_card','ach','e_check')),
  stripe_payment_intent_id text,
  stripe_charge_id text,
  status text default 'pending' check (status in ('pending','paid','failed','refunded','overdue')),
  due_date date,
  paid_at timestamptz,
  sent_at timestamptz,
  items jsonb,
  late_fee numeric default 0,
  retry_count integer default 0,
  next_retry_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Worker Payouts
create table worker_payouts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  worker_id uuid references company_members not null,
  job_id uuid references jobs,
  amount numeric not null,
  pay_type text not null,
  calculation_detail jsonb,
  payment_method text,
  stripe_transfer_id text,
  status text default 'pending' check (status in ('pending','processing','paid','failed')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Quotes
create table quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  client_id uuid references clients not null,
  address_id uuid references addresses not null,
  services jsonb not null,
  total numeric not null,
  deposit_required boolean default false,
  deposit_percentage numeric,
  deposit_amount numeric,
  notes text,
  photos text[],
  expires_at timestamptz,
  status text default 'sent' check (status in ('draft','sent','accepted','declined','expired')),
  accepted_at timestamptz,
  deposit_paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contracts
create table contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  client_id uuid references clients not null,
  address_id uuid references addresses,
  content text not null,
  pdf_url text,
  signed_by_client boolean default false,
  signed_at timestamptz,
  signature_data text,
  status text default 'draft' check (status in ('draft','sent','signed','expired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  client_id uuid references clients not null,
  sender_id uuid references users not null,
  sender_role text not null,
  content text not null,
  channel text default 'in_app' check (channel in ('in_app','email','sms','whatsapp')),
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Referrals
create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_type text not null check (referrer_type in ('company','reseller','client','worker')),
  referrer_user_id uuid references users not null,
  referrer_entity_id uuid,
  referred_type text not null check (referred_type in ('company','reseller','client','worker')),
  referred_user_id uuid references users,
  referral_code text unique not null,
  referral_link text not null,
  reward_type text check (reward_type in ('percentage_recurring','flat_one_time','credit','tier_badge')),
  reward_value numeric,
  reward_duration_months integer,
  total_earned numeric default 0,
  status text default 'pending' check (status in ('pending','signed_up','qualified','rewarded','expired')),
  source text,
  attributed_at timestamptz,
  created_at timestamptz default now()
);

-- Promo Codes
create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  level text not null check (level in ('platform','reseller','company')),
  entity_id uuid,
  discount_type text not null check (discount_type in ('percentage','flat')),
  discount_value numeric not null,
  applicable_services uuid[],
  max_uses integer,
  current_uses integer default 0,
  expires_at timestamptz,
  status text default 'active' check (status in ('active','expired','disabled')),
  created_at timestamptz default now()
);

-- Waitlist
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  type text not null check (type in ('company','client','reseller')),
  referral_code text unique not null,
  referred_by uuid references waitlist(id),
  referral_count integer default 0,
  position integer,
  source text,
  status text default 'waiting' check (status in ('waiting','invited','converted')),
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  type text not null,
  title text not null,
  body text not null,
  data jsonb,
  channels_sent text[],
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Notification Preferences
create table notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  event_type text not null,
  web boolean default true,
  mobile_push boolean default true,
  sms boolean default false,
  email boolean default true,
  whatsapp boolean default false,
  unique(user_id, event_type)
);

-- Internal Ratings
create table job_ratings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs not null,
  client_id uuid references clients not null,
  worker_id uuid references company_members not null,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz default now()
);

-- Integration Webhook Logs
create table webhook_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies,
  address_id uuid references addresses,
  source text not null,
  payload jsonb not null,
  parsed_data jsonb,
  job_ids uuid[],
  status text default 'received' check (status in ('received','processed','failed','ignored')),
  error_message text,
  created_at timestamptz default now()
);

-- Platform Billing
create table platform_billing (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  billing_month date not null,
  active_addresses integer not null,
  price_per_address numeric not null,
  subtotal numeric not null,
  discount_percentage numeric default 0,
  total numeric not null,
  is_annual boolean default false,
  stripe_invoice_id text,
  status text default 'pending' check (status in ('pending','paid','failed','overdue')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Activity Log (Audit Trail)
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies,
  user_id uuid references users not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- GPS Tracking Points
create table gps_tracks (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs not null,
  worker_id uuid references company_members not null,
  lat numeric not null,
  lng numeric not null,
  status text not null,
  recorded_at timestamptz default now()
);

-- Client Payment Methods (multiple per client, assignable per address)
create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients not null,
  stripe_payment_method_id text not null,
  type text not null check (type in ('credit_card','ach','e_check')),
  last_four text,
  brand text,
  is_default boolean default false,
  assigned_address_ids uuid[],
  created_at timestamptz default now()
);

-- Platform Settings (super admin)
create table platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);
-- Keys: 'pricing_tiers', 'stripe_margin', 'reseller_entry_fee', 'reseller_min_properties',
--        'whitelabel_monthly_fee', 'annual_discount_percentage', 'referral_config'
```

### Supabase Storage Buckets
```
avatars/                    → User profile photos ({user_id}.webp)
properties/                 → Property/address photos ({address_id}/primary.webp)
job-media/                  → Job before/after photos + videos ({job_id}/{filename})
job-expenses/               → Expense receipt photos ({job_id}/{expense_id}.webp)
companies/                  → Company logos, covers, service photos ({company_id}/)
invoices/                   → Generated PDF invoices ({invoice_id}.pdf)
contracts/                  → Signed contract PDFs ({contract_id}.pdf)
downloads/                  → Generated job file zips ({job_id}.zip)
referral-images/            → Auto-generated referral share images ({referral_code}.png)
```

All uploads auto-converted to WebP (photos) for performance. Thumbnails auto-generated (200px for lists, 800px for detail). Originals preserved for downloads. Max: 10MB per photo, 50MB per video.

---

## PAGE STRUCTURE — NEXT.JS APP ROUTER

### Public Pages
```
(marketing)/
  page.tsx                          → Landing page + waitlist (Phase 0) → full marketing (launch)
  pricing/page.tsx                  → Plans and pricing
  referral/[code]/page.tsx          → Referral landing page
  book/[company-slug]/page.tsx      → Client self-service booking
  legal/
    terms/page.tsx
    privacy/page.tsx
    cookies/page.tsx

(auth)/
  login/page.tsx                    → Custom login (email/password + magic link + forgot password)
  signup/page.tsx                   → Role selector → routes to correct signup
  signup/company/page.tsx           → Company signup + onboarding wizard
  signup/client/page.tsx            → Client signup
  signup/worker/[invite-code]/page.tsx → Worker invited signup (pre-filled from invite)
  signup/reseller/page.tsx          → Reseller signup
  forgot-password/page.tsx          → Password reset request
  reset-password/page.tsx           → Set new password (from email link)
```

### Company Dashboard — `/dashboard`
```
dashboard/
  layout.tsx                        → Sidebar (desktop) + responsive
  page.tsx                          → Overview (widgets, today's jobs, revenue, pending reviews, active workers map)
  calendar/page.tsx                 → Full calendar (day/week/month, color-coded, filterable, drag-drop reschedule)
  jobs/
    page.tsx                        → Job list (filterable by status, worker, address, date)
    [id]/page.tsx                   → Job detail (full timeline, photos, expenses, invoice)
    new/page.tsx                    → Create job wizard
  clients/
    page.tsx                        → Client list
    [id]/page.tsx                   → Client profile (addresses, jobs, invoices, payments, messages)
    new/page.tsx                    → Add client
  addresses/
    page.tsx                        → All addresses (with billing count)
    [id]/page.tsx                   → Address detail (services, pricing, jobs, documents, integration)
  team/
    page.tsx                        → Worker + lead list
    [id]/page.tsx                   → Member profile (pay settings, jobs, ratings, payouts)
    new/page.tsx                    → Onboard worker (name, contact, pay type, pay rate)
    payouts/page.tsx                → Payout management
  services/page.tsx                 → Service type CRUD (checklists, custom fields, seasonal pricing)
  quotes/
    page.tsx                        → Quote list
    [id]/page.tsx                   → Quote detail
    new/page.tsx                    → Create quote
  revenue/page.tsx                  → Revenue dashboard (charts, breakdowns)
  reports/page.tsx                  → All reports (revenue, jobs, workers, clients, expenses)
  invoices/
    page.tsx                        → All invoices
    [id]/page.tsx                   → Invoice detail
  messages/
    page.tsx                        → All client message threads
    [clientId]/page.tsx             → Thread with specific client
  reviews/page.tsx                  → Review management (smart gate settings, pending requests)
  integrations/page.tsx             → Company integrations (QuickBooks, Xero, Google Calendar)
  referrals/page.tsx                → Referral dashboard
  settings/
    page.tsx                        → Company settings (all config)
    billing/page.tsx                → KleanHQ platform billing
    stripe/page.tsx                 → Stripe Connect settings
    automation/page.tsx             → All automation rules
    notifications/page.tsx          → Notification preferences
```

### Worker View — `/worker`
```
worker/
  layout.tsx                        → Mobile bottom tabs (no bottom tabs on desktop)
  page.tsx                          → Today's schedule
  calendar/page.tsx                 → Week/month view
  jobs/[id]/page.tsx                → Job execution screen (DRIVE→ARRIVE→PHOTOS→CHECKLIST→EXPENSES→END)
  history/page.tsx                  → Completed jobs
  profile/page.tsx                  → Profile photo, name, email, phone, change password, notification prefs, language, payout info
```

### Client Portal — `/portal`
```
portal/
  layout.tsx                        → Portal layout + bottom tabs mobile
  page.tsx                          → Dashboard (upcoming, recent invoices, quick actions)
  calendar/page.tsx                 → All jobs, all companies
  jobs/[id]/page.tsx                → Review (before/after photos, checklist, expenses, approve/reject, tip)
  request/page.tsx                  → Request new job
  quotes/
    page.tsx                        → Received quotes
    [id]/page.tsx                   → Quote detail (accept/decline)
  invoices/
    page.tsx                        → Current + past
    [id]/page.tsx                   → Invoice detail + pay
  receipts/page.tsx                 → Paid history
  payments/page.tsx                 → Payment methods + auto-pay + assign per address
  reviews/page.tsx                  → Pending review requests
  integrations/page.tsx             → STR platforms (Airbnb, VRBO, Hospitable, Hostaway, Guesty)
  providers/page.tsx                → Manage connected companies + invite new
  messages/
    page.tsx                        → Message threads
    [companyId]/page.tsx            → Thread with specific company
  documents/page.tsx                → Document storage per address
  contracts/page.tsx                → Service agreements
  settings/page.tsx                 → Profile photo, name, email, phone, change password, co-client management, notification prefs, language, delete account
```

### Super Admin — `/admin`
```
admin/
  layout.tsx
  page.tsx                          → Platform overview (total companies, revenue, transactions)
  companies/page.tsx                → All companies
  resellers/page.tsx                → Reseller management
  billing/page.tsx                  → Platform billing overview
  revenue/page.tsx                  → Platform revenue (margin + billing)
  referrals/page.tsx                → All referral activity
  waitlist/page.tsx                 → Waitlist management (signups, positions, referrals, export, invite)
  promo-codes/page.tsx              → Platform promo codes
  webhooks/page.tsx                 → Webhook logs
  analytics/page.tsx                → Product analytics dashboard (PostHog data)
  feedback/page.tsx                 → All user feedback + feature requests
  changelog/page.tsx                → Add/edit changelog entries
  help/page.tsx                     → Manage help articles (CRUD)
  settings/page.tsx                 → Global pricing, margins, reseller fees, trial config, all settings
```

### Public Utility Pages
```
/help                               → Searchable help center / FAQ
/changelog                          → Public changelog (what's new)
/blog                               → SEO blog (V2 — MDX or Supabase)
/blog/[slug]                        → Individual blog post
/status                             → Service status page
/pricing                            → Detailed pricing + reseller info
```

### Reseller — `/reseller`
```
reseller/
  layout.tsx
  page.tsx                          → Overview (companies, revenue, margin)
  companies/page.tsx                → Companies under this reseller
  revenue/page.tsx                  → Margin earnings
  referrals/page.tsx                → Referral tracking
  promo-codes/page.tsx              → Reseller promo codes
  settings/page.tsx                 → Branding, margin, domain, badge
```

### API Routes — `/api`
```
api/
  webhooks/
    hospitable/[companyId]/route.ts
    hostaway/[companyId]/route.ts
    guesty/[companyId]/route.ts
    airbnb/[companyId]/route.ts
    vrbo/[companyId]/route.ts
    stripe/route.ts
    twilio/route.ts                 → Incoming SMS/WhatsApp handler
  cron/
    auto-approve/route.ts           → Check 48hr deadlines hourly
    monthly-invoices/route.ts       → Generate rollups on 1st
    payment-retry/route.ts          → Retry failed payments
    weather-fetch/route.ts          → Fetch weather for tomorrow's outdoor jobs
    review-requests/route.ts        → Send review request emails
  jobs/
    [id]/generate-download/route.ts → Generate zip of job files
    [id]/duplicate-check/route.ts
  contracts/
    generate/route.ts               → AI contract generation (Claude API)
  legal/
    generate/route.ts               → AI legal page generation
  referral/
    track/route.ts                  → Universal referral click tracker
  waitlist/
    signup/route.ts
    share/route.ts
  feedback/
    submit/route.ts                 → Submit feedback/feature request
    vote/route.ts                   → Upvote a feature request
  drip/
    send/route.ts                   → Trigger next drip email for a user
    check/route.ts                  → Cron: check all users for pending drip emails
  cron/
    trial-expiry/route.ts           → Check for expired trials daily
    soft-delete-purge/route.ts      → Hard purge records deleted 90+ days ago
    onboarding-drip/route.ts        → Send onboarding emails based on user age + actions
  ai/
    chat/route.ts                   → AI assistant chat endpoint (role-scoped, tool use)
    conversations/route.ts          → Get/save conversation history
```

---

## BUILD ORDER

### Phase 0 — Waitlist Landing Page (BUILD FIRST — LAUNCH TODAY)
1. kleanhq.com coming soon page
2. Countdown timer to launch date
3. Waitlist signup form (name, email, type)
4. Share-to-move-up referral system
5. Social share buttons (IG, SMS, Email, WhatsApp, Copy)
6. Small admin backend to see signups + referrals
7. Deploy to Vercel

### Phase 1 — Foundation
1. Clean FieldPay code → rebrand to KleanHQ
2. Tailwind v4 config with iOS pastel design tokens
3. Framer Motion setup
4. next-pwa configuration
5. Supabase client utilities (server, client, middleware, admin)
6. Full database schema (all migrations)
7. RLS policies on all tables
8. Supabase Auth (email/password + magic link)
9. Shared UI component library (iOS-style: Button, Input, Card, Badge, Modal, Sheet, Calendar, Table, Sidebar, TopBar, BottomNav, SearchBar, etc.)
10. Middleware for subdomain routing + auth

### Phase 2 — Company Dashboard
1. Layout: sidebar (desktop) + responsive
2. Dashboard overview with widgets
3. Calendar (day/week/month, filterable, color-coded)
4. Job CRUD + detail view + status management
5. Client CRUD + profile + address management
6. Service types (checklists, custom fields, seasonal pricing)
7. Team management + worker onboarding (pay type)
8. Revenue dashboard
9. Reports (all analytics)
10. Settings (all company config, automation, notifications)

### Phase 3 — Worker App
1. Mobile-first layout + iOS bottom tabs (hidden on desktop)
2. Today's schedule + calendar views
3. Job execution: DRIVE → ARRIVE → BEFORE PHOTOS/VIDEO → START → CHECKLIST → CUSTOM FIELDS → EXPENSES → AFTER PHOTOS/VIDEO → END
4. In-app camera with timestamp overlay
5. Video capture
6. Expense add-ons (receipt photo + description + amount)
7. GPS live tracking
8. Offline mode (download today's schedule, sync when back)
9. Job history

### Phase 4 — Client Portal
1. Separate portal layout + bottom tabs mobile
2. Dashboard with upcoming + recent invoices
3. Calendar (all jobs, all companies)
4. Job review (before/after side-by-side, checklist, expenses, approve/reject, tip)
5. Service request flow
6. Company invite flow (search or invite by email)
7. Invoices + payment (credit card, ACH, e-check)
8. Payment method management + assign per address + auto-pay
9. STR integrations page (5 platforms, OAuth connect)
10. Document storage per address
11. Recurring pause/skip
12. Contracts (digital signature)
13. Messages thread
14. Weather on outdoor jobs
15. Live worker tracking during active jobs
16. Co-client management

### Phase 5 — Payments
1. Stripe Connect onboarding for companies
2. Payment processing with hidden markup logic
3. Invoice generation + auto-email via Resend
4. Worker payout system
5. Fee assignment logic (company/client/split)
6. Monthly invoice rollup + auto-charge on 1st
7. Tax calculation
8. Deposit handling for quotes
9. Late payment handling (retry, reminders, fees)
10. Tip processing
11. Platform billing ($X/address/month)
12. Annual subscription option (10% discount)
13. Promo code processing

### Phase 6 — Integrations
1. STR webhooks (Airbnb, VRBO, Hospitable, Hostaway, Guesty)
2. Auto-job creation from checkout events (separate job per service type)
3. QuickBooks OAuth + sync
4. Xero OAuth + sync
5. Google Calendar two-way sync
6. Twilio SMS notifications
7. Twilio WhatsApp messaging
8. Webhook logging

### Phase 7 — Growth & Communication
1. Referral system (all 6 loops)
2. Referral landing pages
3. Instagram share (auto-generate branded image)
4. QR code generation
5. Universal link tracking (every link carries referral)
6. In-app messaging (per client, syncs to email/SMS/WhatsApp)
7. Review automation (smart gate)
8. Client self-service booking page
9. Quotes flow
10. AI contract generation (Claude API)

### Phase 8 — Admin & Reseller
1. Super admin dashboard (full platform metrics)
2. Reseller dashboard (companies, revenue, branding)
3. Waitlist management in admin
4. Subdomain routing + custom domain support
5. White-label badge management ($100/mo)
6. Reseller fee management ($0 default, configurable)
7. Global pricing/margin configuration
8. Promo code management (platform + reseller level)
9. Churn prevention flow
10. Legal pages (AI-generated)

### Phase 9 — Polish & Operations Infrastructure
1. Multi-language support (full app localization — company sets their language, client sets theirs independently)
2. Duplicate job detection
3. Audit trail / activity log
4. Data export (CSV, PDF)
5. Demo mode / sandbox (public demo with dummy data — dummy login visible on landing page)
6. All email templates branded (21+ templates)
7. Downloadable job files (client + owner versions as zip)
8. Worker schedule download button for offline
9. Weather integration for outdoor jobs
10. Internal rating system (client rates worker)
11. Time-of-day restrictions per address
12. Worker availability / conflict detection
13. Capacitor wrapper for App Store / Play Store (when ready)

### Phase 10 — Growth Infrastructure & Platform Health
1. Onboarding email drip sequences
2. In-app help system + FAQ page
3. Feedback system
4. Analytics tracking (PostHog)
5. Error monitoring (Sentry)
6. Uptime monitoring
7. Status page
8. Changelog
9. SEO optimization
10. Cookie consent
11. Rate limiting + CAPTCHA
12. Free trial system
13. Pricing page
14. Blog (SEO content)
15. AI help chatbot
16. Feature request voting
17. App Store listing assets

---

## ONBOARDING EMAIL DRIP SEQUENCES (Resend)

### Company Onboarding (After Signup)
```
Day 0:  "Welcome to KleanHQ! Here's your quick start guide" — link to dashboard, 3-step setup
Day 1:  "Add your first client in 30 seconds" — direct link to /dashboard/clients/new
Day 2:  "Create your first job" — link to /dashboard/jobs/new + short video
Day 3:  "Invite your team" — link to /dashboard/team/new + explain worker app
Day 7:  "Your first week — here's what you might be missing" — features they haven't used yet
Day 14: "Two weeks in — here are your stats" — jobs created, revenue, clients added
Day 30: "One month! Refer a friend, save on your plan" — referral link + incentive
```

### Client Onboarding (After Being Added by Company or Self-Signup)
```
Day 0:  "Welcome! [Company] added you to KleanHQ" — portal link, how it works
Day 1:  "Add a payment method for seamless billing" — link to /portal/payments
Day 3:  "Connect your Airbnb/VRBO for automatic scheduling" — link to /portal/integrations (if STR)
Day 7:  "Did you know you can request services directly?" — link to /portal/request
```

### Worker Onboarding (After Accepting Invite)
```
Day 0:  "You're set up! Here's how your schedule works" — link to /worker
Day 1:  "Quick tip: download today's schedule for offline access" — show the button
Day 3:  "Taking photos in the app? Here's how the timestamp works" — camera guide
```

### Trigger Logic
- Track which emails were sent per user (prevent duplicates)
- Skip emails for actions already completed (e.g., don't send "add first client" if they already have clients)
- All emails are branded pastel KleanHQ design via Resend
- Unsubscribe link on every email

---

## IN-APP HELP SYSTEM

### Help Tooltips (First-Time User Experience)
- On first login, key UI elements show pulsing blue dots
- Tap a dot → tooltip explains the feature
- "Got it" dismisses permanently for that user
- Track which tooltips each user has seen (in user preferences)
- Tooltips on: sidebar nav items, job status badges, calendar filters, payment settings, integration buttons

### Help Page (`/help`)
- Searchable FAQ organized by topic:
  - Getting Started
  - Managing Jobs
  - Client Portal
  - Payments & Invoices
  - Worker App
  - Integrations
  - Billing & Plans
  - Account & Security
- Each article: title + body (markdown rendered)
- Stored in Supabase table `help_articles` (id, slug, category, title, content, sort_order)
- Super admin can add/edit/delete articles from `/admin/help`

### "?" Help Button
- Fixed position button on every screen (bottom-right on desktop, accessible from menu on mobile)
- Opens a slide-over panel with:
  - Search bar
  - Contextual articles (based on current page)
  - "Contact Support" link
  - "Send Feedback" link

### AI Help Chatbot (V2)
- Chat widget in the help panel
- Powered by Claude API
- System prompt includes all help articles + product knowledge
- Can answer: "How do I add a client?", "What happens when a payment fails?", etc.
- Fallback: "I'm not sure — let me connect you with support" → opens feedback form

---

## FEEDBACK & FEATURE REQUEST SYSTEM

### Feedback Button
- Accessible from every screen via the help "?" menu or a dedicated "Feedback" link in settings
- Simple form:
  - Type: Bug Report / Feature Request / General Feedback (segmented control)
  - Description (text area, required)
  - Screenshot (optional — auto-capture current screen or upload)
  - Email (pre-filled from logged in user)
- Saved to Supabase table `feedback`

### Feature Request Voting (V2)
- Public board at `/feedback` or `/roadmap`
- Users can see submitted feature requests
- Upvote requests they want
- Sort by: most votes, newest, trending
- Super admin can: mark as planned, in progress, shipped
- Shows users their voice matters → reduces churn

### Admin View (`/admin/feedback`)
- All feedback entries in a filterable table
- Filter by: type, date, user role, company
- Mark as: new, reviewed, planned, resolved
- Reply to user (sends email via Resend)

### Database
```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  company_id uuid references companies,
  type text not null check (type in ('bug','feature_request','general')),
  description text not null,
  screenshot_url text,
  page_url text,
  status text default 'new' check (status in ('new','reviewed','planned','in_progress','resolved')),
  votes integer default 0,
  admin_reply text,
  created_at timestamptz default now()
);

create table feedback_votes (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid references feedback not null,
  user_id uuid references users not null,
  created_at timestamptz default now(),
  unique(feedback_id, user_id)
);
```

---

## ANALYTICS & MONITORING (Platform-Level — For Seva)

### Product Analytics (PostHog — Open Source)
- Track every significant user action:
  - Signup, login, onboarding step completed
  - Job created, job completed, job approved
  - Payment processed, invoice sent
  - Feature used (which pages visited, which buttons clicked)
  - Integration connected/disconnected
- Funnels: signup → first client → first job → first payment (conversion rates)
- Retention: daily/weekly/monthly active users
- Cohort analysis: users who signed up in March vs April
- Self-hostable (privacy-friendly) or cloud
- Dashboard visible at `/admin/analytics`

### Error Monitoring (Sentry)
- Catches all frontend and backend errors in production
- Stack traces with source maps
- User context (which user, which company, which page)
- Release tracking (know which deploy introduced a bug)
- Alert to Seva via email/Slack when errors spike
- Free tier covers most needs

### Uptime Monitoring
- External service (BetterUptime or UptimeRobot — free tier)
- Pings kleanhq.com, app.kleanhq.com, API endpoints every 60 seconds
- Alerts Seva via SMS/email if downtime detected
- Feeds into status page

### Status Page (`status.kleanhq.com`)
- Shows current status of:
  - Website (kleanhq.com)
  - Application (app.kleanhq.com)
  - API
  - Payment processing (Stripe)
  - Email delivery (Resend)
  - SMS (Twilio)
  - Integrations (STR platforms)
- Auto-updated from uptime monitoring
- Manual incident posting for planned maintenance
- Historical uptime percentage (99.9% etc.)
- Simple, clean page — can be a static Next.js page

---

## CHANGELOG (`/changelog`)

### Purpose
Users see what's new → stay engaged → know the product is improving

### Implementation
- Page at `/changelog` showing all updates
- Each entry: date, title, description, category tag (New Feature / Improvement / Fix)
- Stored in Supabase table `changelog_entries`
- Super admin adds entries from `/admin/changelog`
- In-app notification: "🆕 New features!" badge on help button when there are unseen changelog entries
- Badge clears after user views the changelog

### Database
```sql
create table changelog_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (category in ('feature','improvement','fix')),
  published_at timestamptz default now(),
  created_at timestamptz default now()
);
```

---

## SEO

### Technical SEO (Built into Next.js)
- Dynamic `<title>` and `<meta description>` on every page
- Open Graph tags (og:title, og:description, og:image) on all public pages
- Twitter Card tags
- Structured data (JSON-LD):
  - SoftwareApplication schema on landing page
  - Organization schema
  - FAQ schema on help/pricing pages
- `sitemap.xml` auto-generated (next-sitemap package)
- `robots.txt` — allow all public pages, disallow /dashboard, /worker, /portal, /admin
- Canonical URLs on all pages
- Image alt tags on all images

### Blog (`/blog`) — Full Spec
- Markdown-based blog for SEO content marketing
- Stored in Supabase table `blog_posts`
- Admin creates/edits from `/admin/blog`
- Each post: title, slug, body (markdown), category, tags, featured image, SEO meta, author, published_at
- Public at `/blog` (list) and `/blog/[slug]` (post)
- Categories: Cleaning, Pool Service, Lawn Care, HVAC, Pressure Washing, STR/Airbnb, Business Tips, Product Updates
- Auto-generate OG image per post (title on branded gradient background)
- RSS feed at `/blog/rss.xml`
- Related posts at bottom of each article
- CTA banner in every post: "Ready to simplify your business? Join KleanHQ →"
- AI-assisted writing: admin can click "Draft with AI" → Claude generates a blog post draft from a topic/title → admin edits and publishes

**Seed content (auto-generate these posts at launch):**
1. "The Ultimate Guide to Starting a Cleaning Business in 2026"
2. "How to Manage Airbnb Turnovers Like a Pro"
3. "Pool Service Business: Everything You Need to Know"
4. "Why Before & After Photos Will Save Your Service Business"
5. "5 Ways to Get More Clients for Your Lawn Care Business"
6. "How to Price Your Cleaning Services (And Actually Make Money)"
7. "The Complete Airbnb Host Guide to Hiring Cleaners"
8. "Field Service Software: What to Look For in 2026"
9. "How AI is Changing the Field Service Industry"
10. "Why Every Service Business Needs a Client Portal"

**Database:**
```sql
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  body text not null,
  excerpt text,
  category text not null,
  tags text[] default '{}',
  featured_image_url text,
  og_image_url text,
  seo_title text,
  seo_description text,
  author_name text default 'KleanHQ Team',
  status text default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Blog Publishing Schedule
- **Monday / Wednesday / Friday** — 3 posts per week
- AI-assisted: admin enters a topic → Claude drafts → admin reviews/edits → publishes
- Can queue posts in advance (scheduled publishing via `published_at` timestamp)
- Social auto-share: when a post publishes → auto-generate share images → prompt admin to post on socials
- Newsletter digest: weekly Friday email to waitlist/subscribers with that week's 3 posts

---

## AD TRACKING & ANALYTICS PIXELS

### Google Tag Manager (GTM)
- GTM container installed on all pages (loaded after cookie consent)
- Single container ID manages all tags below
- Fires on: page views, signups, waitlist joins, job created, payment completed

### Google Analytics 4 (GA4)
- Full GA4 property via GTM
- Events tracked:
  - `page_view` (all pages)
  - `sign_up` (type: company/client/reseller/pro)
  - `waitlist_join`
  - `referral_share` (channel: copy/sms/email/whatsapp/instagram)
  - `job_created`
  - `job_completed`
  - `payment_completed` (amount)
  - `trial_started`
  - `trial_converted` (free → paid)
  - `ai_message_sent`
  - `pro_search`
  - `booking_page_visit`
  - `qr_scan`
- Conversions: waitlist signup, account signup, first job, first payment, trial → paid
- Audiences: companies, clients, pros, resellers (for remarketing)

### Google Ads
- Google Ads conversion tracking via GTM
- Conversions: waitlist signup, account creation, first payment
- Enhanced conversions (send hashed email for better attribution)
- Remarketing audiences: visited site but didn't sign up, signed up but didn't create first job, trial expired without converting
- Ready for campaigns: Search, Display, YouTube, Performance Max

### Meta Pixel (Facebook/Instagram Ads)
- Meta Pixel installed via GTM
- Events:
  - `PageView` (all pages)
  - `Lead` (waitlist signup)
  - `CompleteRegistration` (account signup)
  - `Purchase` (first payment, with value)
  - `Subscribe` (trial → paid conversion)
- Custom audiences: website visitors, waitlist signups, registered but not paid
- Lookalike audiences from: paying customers, active companies, active clients
- Ready for campaigns: Facebook feed, Instagram feed, Stories, Reels

### TikTok Pixel
- TikTok Pixel via GTM
- Events: PageView, CompleteRegistration, PlaceOrder
- For running TikTok ads targeting service business owners

### Environment Variables (Ad Tracking)
```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXXX
```

### Implementation
- All pixels load through GTM (single script, easy to manage)
- ALL pixels gated behind cookie consent — only fire after user accepts analytics cookies
- GTM container configured with triggers per event
- Server-side tracking option for Meta Conversions API (more accurate, bypasses ad blockers)
- DataLayer pushes from Next.js on every tracked event:
```typescript
// Example: push to dataLayer on signup
window.dataLayer?.push({
  event: 'sign_up',
  user_type: 'company',
  referral_source: referralCode || 'direct',
});
```

---

## FREE ADVERTISING CHANNELS (Marketing Playbook)

### Launch Day (Coordinate all at once for maximum impact)
1. **Product Hunt** — Launch post. Title: "KleanHQ — The simplest field service platform". Prepare screenshots, GIF demo, maker comment. Schedule for Tuesday (best day). This alone can drive 1000+ signups.
2. **Hacker News** — "Show HN: We built a field service CRM with AI assistant and marketplace"
3. **Indie Hackers** — Post the building journey, revenue model, tech stack
4. **Reddit** — Post in r/SaaS, r/entrepreneur, r/smallbusiness, r/startups (stagger posts, follow each sub's rules)

### Ongoing Free Channels
5. **Facebook Groups** (join and provide value, don't spam):
   - Lawn care business groups (50+ groups with 10K+ members each)
   - Cleaning business groups
   - Airbnb host groups
   - Pool service groups
   - Pressure washing groups
   - Property management groups
   - Small business owner groups
6. **Reddit** — r/lawncare, r/airbnb_hosts, r/sweatystartup, r/pressurewashing, r/EntrepreneurRideAlong. Answer questions. Be helpful. Mention KleanHQ when relevant.
7. **LinkedIn** — Seva posts 3x/week about building KleanHQ. Building in public. Tag #SaaS #startup #fieldservice
8. **Twitter/X** — Building in public thread. Daily updates. Tech + startup audience.
9. **TikTok** — Short videos: "Watch how this app helps cleaners get paid automatically" / "POV: You're a pool guy and your app schedules everything" — huge for service business audience
10. **YouTube** — Tutorial channel: "How to start a cleaning business", "Best apps for lawn care companies", "Airbnb turnover management guide". Each video mentions KleanHQ. Long-tail SEO goldmine.
11. **Quora** — Answer questions about field service software, cleaning business, Airbnb management. Link to relevant blog posts.
12. **Google Business Profile** — Create one for KleanHQ. Shows in local searches for "field service software". Free.
13. **Capterra / G2 / GetApp / Software Advice** — List KleanHQ. Service business owners search these when shopping for software. Free listing, paid for premium placement later.
14. **Nextdoor** — Post about KleanHQ in local Miami community. Expand to other cities.
15. **Alignable** — Small business networking platform. Create company profile.
16. **Podcast appearances** — Pitch to: cleaning business podcasts, SaaS podcasts, Airbnb host podcasts, field service industry podcasts. Free exposure to targeted audience.
17. **WhatsApp / Telegram Groups** — Service provider communities. Miami-based and nationwide.
18. **Craigslist** — Post in services section in top 20 metro areas. Free.
19. **Partnerships** — Cleaning supply companies, pool chemical distributors, lawn equipment dealers. Cross-promote to their customer lists. They benefit because their customers use more supplies when their business grows.
20. **Email signature** — Every email from anyone at KleanHQ includes: "Founder, KleanHQ — the simplest field service platform" with link
21. **Thumbtack / TaskRabbit / Angi** — Where Independent Pros already live. Recruit them to KleanHQ marketplace.
22. **Local chamber of commerce** — Join Miami chamber, attend events, present KleanHQ
23. **SCORE / SBA events** — Small business workshops. Present KleanHQ as a tool for service businesses.

### Content Calendar
```
Monday:    Blog post published + shared on LinkedIn, Twitter, Facebook groups
Tuesday:   TikTok/Reels video + Reddit engagement
Wednesday: Blog post published + YouTube video (tutorial or tip)
Thursday:  LinkedIn post (building in public) + Quora answers
Friday:    Blog post published + weekly newsletter digest + Instagram carousel
Saturday:  Community engagement (FB groups, Reddit, respond to comments)
Sunday:    Plan next week's content
```

### Tracking
- Every channel gets a UTM-tagged link: `kleanhq.com?utm_source=reddit&utm_medium=organic&utm_campaign=launch`
- GA4 tracks which channels drive signups and conversions
- Monthly review: which channels are working → double down on winners, cut losers

---

## QR BRANDING PAGE — "Leave Your Mark"

### Overview
Companies (especially cleaners for Airbnb/STR) need a **branded printable page** they can leave inside properties or send to clients. This page has their logo, a QR code, and a link for clients to book again, leave a review, or view their portal.

### What It Is
A **customizable, printable one-page PDF** that the company generates from their dashboard.

### Templates Available (Company Picks One)

**Template 1: "Thank You" Card (Airbnb/STR)**
```
┌─────────────────────────────────────┐
│                                      │
│  [Company Logo]                      │
│                                      │
│  Thank you for staying!              │
│  Your space was cleaned by           │
│  [Company Name]                      │
│                                      │
│  ┌──────────┐                       │
│  │ QR CODE  │  Scan to:             │
│  │          │  • Book us again      │
│  │          │  • Leave a review     │
│  │          │  • View your portal   │
│  └──────────┘                       │
│                                      │
│  [Company Phone] · [Company Email]   │
│  Powered by KleanHQ                  │
└─────────────────────────────────────┘
```

**Template 2: "Service Complete" Card (General)**
```
┌─────────────────────────────────────┐
│  [Company Logo]                      │
│                                      │
│  Your service is complete! ✓         │
│  [Company Name]                      │
│                                      │
│  Scan to view details:               │
│  ┌──────────┐                       │
│  │ QR CODE  │  • See before/after   │
│  │          │  • Approve & pay      │
│  │          │  • Request next visit  │
│  └──────────┘                       │
│                                      │
│  [Company Contact Info]              │
└─────────────────────────────────────┘
```

**Template 3: "Refer a Friend" Card**
```
┌─────────────────────────────────────┐
│  [Company Logo]                      │
│                                      │
│  Love our service?                   │
│  Refer a friend and get              │
│  $25 off your next visit!            │
│                                      │
│  ┌──────────┐                       │
│  │ QR CODE  │  Scan to share        │
│  └──────────┘                       │
│                                      │
│  [Referral Code: ABC123]            │
│  [Company Name & Contact]            │
└─────────────────────────────────────┘
```

### How It Works
1. Company goes to `/dashboard/marketing/qr-cards`
2. Picks a template
3. Customizes: text, colors (uses company brand color), which QR links to
4. QR code options:
   - Link to client portal
   - Link to public booking page
   - Link to Google review page
   - Link to referral signup
   - Custom URL
5. Preview on screen
6. Download as PDF (print-ready, A5 or letter size)
7. Or share digitally (email to client, WhatsApp)

### QR Code Generation
- Generated server-side using `qrcode` npm package
- Embedded in the PDF
- Company logo can be overlaid in center of QR (with error correction)
- Tracking: every QR scan hits a redirect URL (`kleanhq.com/qr/[code]`) that logs the scan before redirecting to the destination

### Database
```sql
create table qr_cards (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies not null,
  template text not null check (template in ('thank_you','service_complete','refer_friend','custom')),
  title text,
  body_text text,
  qr_destination_url text not null,
  qr_code_url text,
  pdf_url text,
  scan_count integer default 0,
  created_at timestamptz default now()
);

create table qr_scans (
  id uuid primary key default gen_random_uuid(),
  qr_card_id uuid references qr_cards not null,
  ip_address text,
  user_agent text,
  scanned_at timestamptz default now()
);
```

### Pages
```
/dashboard/marketing/              → Marketing hub overview
/dashboard/marketing/qr-cards      → QR card builder (pick template, customize, generate)
/dashboard/marketing/qr-cards/[id] → Edit existing card, view scan stats
/qr/[code]                        → Public redirect URL (logs scan → redirects to destination)
```

---

## IMAGE GENERATION — Google Imagen API

### Overview
For all auto-generated share images (referral cards, Instagram posts, OG images, QR card backgrounds), use **Google's Imagen API** (via Vertex AI) to create high-quality, unique images instead of static templates.

### Use Cases

**1. Referral Share Image (Instagram)**
- When a user taps "Share to Instagram" → system generates a unique branded image:
  - Google Imagen creates a beautiful background (prompt: "clean modern pastel gradient with subtle service icons, professional SaaS aesthetic")
  - KleanHQ logo, referral code, and text overlaid on top
  - Result: every share image looks unique and premium, not cookie-cutter

**2. Blog Post Featured Images**
- When admin creates a blog post → "Auto-generate image" button
- Prompt built from post title + category
- Example: title "How to Manage Airbnb Turnovers" → generates a clean, professional image of a tidy vacation rental

**3. QR Card Backgrounds**
- Instead of plain white backgrounds on QR cards → generate subtle branded backgrounds
- Prompt: "soft pastel [company brand color] background with subtle cleaning/service motifs, professional print-ready"

**4. Company Branding Assets**
- When a company signs up and doesn't have a logo → offer "Generate a logo with AI"
- Simple prompt: "[Company Name] logo for [business type], modern, minimal, pastel"
- Not a replacement for real design, but gets them started

**5. OG Images (Social Sharing)**
- Auto-generate unique OG images for every public page
- Blog posts, Pro profiles, booking pages — each gets a custom image

### Technical Implementation
```
Provider: Google Vertex AI — Imagen 3
API: REST via Vertex AI endpoint
Auth: Google Cloud service account key

Flow:
1. System builds prompt based on context (referral, blog, QR card, etc.)
2. Calls Imagen API → receives generated image
3. Image saved to Supabase Storage
4. URL returned and used wherever needed
5. Cache: generated images are stored permanently, not re-generated

Rate limiting:
- Blog images: on-demand (admin clicks button)
- Referral images: generated once per user, cached
- QR backgrounds: generated once per card, cached
- Max: 100 generations per day (configurable)

Fallback:
- If Imagen API fails or quota exceeded → fall back to static gradient templates
- Static templates are always available as default
```

### Environment Variables
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path-to-service-account-key.json
```

### API Route
```
POST /api/generate-image
  Body: { type: 'referral' | 'blog' | 'qr_card' | 'og', context: { ... } }
  Returns: { url: 'https://...' }
```

---

## MARKETING HUB (Company Dashboard)

### Overview
A dedicated section in the company dashboard for all marketing tools.

### Pages
```
/dashboard/marketing/               → Marketing hub overview
/dashboard/marketing/qr-cards       → QR card builder
/dashboard/marketing/review-links   → Manage review platform links
/dashboard/marketing/referrals      → Company referral program settings
/dashboard/marketing/booking-page   → Customize public booking page
/dashboard/marketing/social         → Generate social media assets (Instagram posts, share images)
/dashboard/marketing/email-campaigns→ Send marketing emails to client list (V2)
```

### Social Media Asset Generator
- Company goes to `/dashboard/marketing/social`
- Picks a template: "New Service Announcement", "Before/After Showcase", "Client Testimonial", "Seasonal Promotion"
- Fills in details
- Google Imagen generates a unique branded image
- Download as image or share directly
- Templates sized for: Instagram Post (1080×1080), Instagram Story (1080×1920), Facebook (1200×630)

---

## COOKIE CONSENT

### Banner
- Appears on first visit (bottom of screen, not blocking content)
- Text: "We use cookies to improve your experience and analyze usage."
- Buttons: [Accept All] [Manage Preferences] [Reject Non-Essential]
- Preferences panel: toggle categories (Essential, Analytics, Marketing)
- Stores preference in localStorage + cookie
- Essential cookies always on (auth, sessions)
- Analytics cookies (PostHog) only load after consent
- Compliant with GDPR/CCPA

### Implementation
- Cookie consent component rendered in root layout
- Check consent before initializing PostHog
- Consent state accessible via React context

---

## RATE LIMITING & ABUSE PREVENTION

### API Rate Limits
- Waitlist signup: 5 per IP per hour
- Login attempts: 5 per email per 15 minutes (then lockout for 30 min)
- API routes: 100 requests per minute per authenticated user
- Webhook endpoints: 1000 per minute per company (STR platforms can be bursty)
- Implement via: Vercel Edge Middleware or Upstash Redis rate limiter

### CAPTCHA
- Use Cloudflare Turnstile (free, privacy-friendly, not ugly like reCAPTCHA)
- Required on: waitlist signup, account signup, login (after 3 failed attempts), contact/feedback forms
- Invisible mode (no user interaction unless suspicious)

### Abuse Detection
- Flag accounts creating abnormal volumes of: signups, referrals, API calls
- Alert super admin
- Auto-suspend flagged accounts pending review

---

## FREE TRIAL

### Structure
- **Standard signup: 15-day free trial** — NO credit card required
- **Referred signup: 30-day free trial** — if they used a referral code/link at signup
- Full access to all features during trial (including AI assistant — separate 60-day AI trial)
- Trial countdown visible in dashboard: "X days left in your trial"
- Reminder emails:
  - 5 days before expiry: "5 days left — add a payment method to keep going"
  - 1 day before: "Your trial ends tomorrow — don't lose your setup"
  - Day of expiry: "Your trial has ended — upgrade now"
- Trial expires → account enters read-only mode
  - Can still view everything (jobs, invoices, clients)
  - Cannot create new jobs, clients, or invoices
  - Prominent banner: "Your trial has ended. Add a payment method to continue."
  - One click to upgrade
- After adding payment method → full access restored, billing starts at $7/address/month

### AI Trial (Separate from Platform Trial)
- 60-day free AI trial — starts from first AI message, NOT from account signup
- After 60 days: **AI automatically turns OFF** (does not charge by default)
- User must explicitly opt-in to $5/mo to keep AI
- Reminder emails:
  - 30 days before AI turns off: "Halfway through your AI trial — here's what you've used it for"
  - 15 days before: "15 days left of free AI — $5/mo to keep it"
  - 5 days before: "AI turns off in 5 days — subscribe now"
- After turn-off: chat bubble gone. "Reactivate AI — $5/mo" button in settings.

### Database
- `companies` table: `trial_started_at`, `trial_ends_at`, `is_trial`, `trial_expired`, `was_referred` (determines 15 vs 30 day trial)
- `users` table: `ai_trial_started_at`, `ai_trial_ends_at`, `ai_enabled`, `ai_subscribed`
- Cron job checks daily: expired platform trials + expiring AI trials → sends appropriate emails

---

## PRICING PAGE

### Location
- Section on the landing page (scroll-to) + dedicated `/pricing` route

### Content
```
┌─────────────────────────────────────────────────┐
│                                                   │
│  Simple, transparent pricing                      │
│  No hidden fees. No contracts. Cancel anytime.    │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  FREE    │  │ STANDARD │  │  ANNUAL  │        │
│  │  TRIAL   │  │          │  │          │        │
│  │          │  │  $7/addr │  │  $6.30   │        │
│  │ 15 days  │  │  /month  │  │  /addr   │        │
│  │ No card  │  │          │  │  /month  │        │
│  │ required │  │ All feat │  │  (10%    │        │
│  │          │  │ ures     │  │   off)   │        │
│  │ 30 days  │  │          │  │          │        │
│  │ if refer │  │ [Start]  │  │ [Start]  │        │
│  │ red!     │  │          │  │          │        │
│  │ [Start]  │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                   │
│  Volume discounts:                                │
│  6-15 addresses: $6/mo                            │
│  16-50: $5/mo                                     │
│  50+: Contact us                                  │
│                                                   │
│  ──── AI Assistant ────                           │
│  60 days free for everyone                        │
│  Then $5/mo per user · Workers always free        │
│                                                   │
│  ──── For Resellers ────                          │
│  White-label KleanHQ as your own platform         │
│  $0 to start · Earn margin after 5 properties     │
│  Custom domain: +$100/mo                          │
│  [Become a Reseller →]                            │
│                                                   │
│  ──── FAQ ────                                    │
│  What counts as an address?                       │
│  Can I cancel anytime?                            │
│  What's the difference between 15 and 30 day trial│
│  What happens when AI trial ends?                 │
│  What payment methods do you accept?              │
│  Is there a setup fee? (No.)                      │
│  ...                                              │
└─────────────────────────────────────────────────┘
```

---

## BACKUP & DATA SAFETY

### Automatic Backups
- Supabase daily automated backups (enabled by default on Pro plan)
- Verify backup retention: minimum 7 days
- Document backup restore procedure in SETUP.md

### Soft Delete Everywhere
- NEVER hard delete records — mark as `deleted_at` timestamp
- Deleted records hidden from all UI queries
- Admin can restore deleted records
- Hard purge only after 90 days (cron job)

### Data Export Before Deletion
- When a user requests account deletion → generate full data export first
- Export includes: profile, jobs, invoices, photos, messages
- Delivered as downloadable zip
- Account soft-deleted after export is ready
- 30-day grace period before permanent deletion

---

## EMAIL DOMAIN AUTHENTICATION

### DNS Records Required (Document in SETUP.md)
```
SPF:   TXT record — v=spf1 include:amazonses.com ~all (Resend uses SES)
DKIM:  CNAME records — provided by Resend dashboard after domain verification
DMARC: TXT record — v=DMARC1; p=quarantine; rua=mailto:dmarc@kleanhq.com
```

### Verification Steps
1. Add domain to Resend dashboard
2. Add DNS records to kleanhq.com
3. Wait for verification (usually 5-15 minutes)
4. Test by sending a test email
5. Check deliverability score

---

## SUMMARY

- **100+ features**
- **6 user types** (owner, lead, worker, client, co-client, independent pro)
- **9+ job statuses**
- **8 integrations** (5 STR + 2 accounting + 1 calendar)
- **3 communication channels** (email, SMS, WhatsApp)
- **6 referral loops**
- **30+ database tables**
- **80+ pages/routes**
- **25+ email templates** (transactional + drip sequences)
- **10 blog posts** (auto-generated seed content for SEO)
- **10 build phases**
- **Mobile-first, iOS design, pastel UI**
- **One codebase → web + PWA + App Store (Capacitor)**
- **Marketplace** — "Find a Pro" (free registration, searchable, $7/addr when working)
- **AI Assistant** per user role (Claude API, tool use, voice input, 60-day free then $5/mo)
- **AI Image Generation** (Google Imagen API — referral cards, blog images, QR backgrounds, social assets)
- **Marketing Hub** (QR branding cards, social asset generator, booking page, review management)
- **Blog** (SEO content, AI-assisted writing, RSS feed, auto-generated OG images)
- **QR Branding Pages** (printable cards for Airbnb properties, clients — 3 templates, scan tracking)
- **Full operations infrastructure** (analytics, monitoring, error tracking, status page, help, feedback, changelog)
- **Growth infrastructure** (referrals, waitlist, onboarding drips, SEO, blog, free trial 15/30 days, migration hook)
- **Security** (rate limiting, CAPTCHA, soft delete, backups, cookie consent, GDPR basics)
- **Custom auth flow** (signup, login, magic link, forgot password, profile management, user CRUD)
- **Complete media system** (avatars, property photos, job galleries, worker portfolios, company branding, AI-generated images)
- **5 revenue streams** ($7/addr/mo, Stripe margin, $100/mo white-label, $5/mo AI, marketplace transactions)
