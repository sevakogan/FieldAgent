# Lessons Learned

## 2026-03-21 — Pricing Model Rule (CRITICAL BUSINESS LOGIC)
**Rule:** Each address × service type combination has its OWN unique price. The price is NOT global per service type — it's per-property.
- Example: Pool cleaning at 123 Ocean Dr = $120, Pool cleaning at 456 Collins Ave = $180
- Example: STR Turnover at Beach House = $200, STR Turnover at Downtown Condo = $150
- The `address_services` table already supports this: it has `address_id`, `service_type_id`, and `price` columns
- The `service_types.default_price` is just a STARTING template — the actual price lives in `address_services.price`
- When creating a job, the price comes from `address_services.price` for that specific address+service combo
- NEVER assume flat pricing across all properties — every house is different

## Rules
- Each address has its own pricing per service type (stored in address_services table)
- service_types.default_price = template starting point only
- address_services.price = the REAL price for that specific property
- When adding a service to an address, pre-fill from default_price but allow override
- When creating a job, pull price from address_services, NOT from service_types
- Job form should show the address-specific price, not the default
- All times must use Pacific Time (America/Los_Angeles)
- NEVER deploy to production unless user explicitly says "deploy to prod"

## 2026-03-21 — Clients + Addresses Combined (UX RULE)
**Rule:** Clients and Addresses are ONE flow, not separate pages.
- An address CANNOT exist without a client (FK constraint: addresses.client_id)
- When creating a client, offer to add their first address inline (optional, can skip)
- If a client has NO addresses, show a red warning bar on their row in the list
- The client detail page shows their addresses directly — no need for a separate Addresses page
- The sidebar "Addresses" link can go to a filtered view or redirect to clients
- This reduces navigation and makes the workflow: Create Client → Add Address → Add Services → Schedule Job

## Rules (updated)
- NEVER use SSH for Git — ALWAYS use HTTPS (https://github.com/sevakogan/FieldAgent.git)
- Clients and addresses are a combined flow — never require separate navigation
- Client without address = red warning in list view
- Client creation form includes optional address step

## 2026-03-21 — Pay Configuration Lives on Property, NOT Team Member
**Mistake:** Put "Pay by Job Type" section on the team member invite form
**Correct approach:** Pay rates per service type belong on the ADDRESS/PROPERTY level
**Rule:** 
- Team member invite = basic info only (name, email, phone, role)
- Each property (address) has its own services with:
  - Client price (what the client pays)
  - Assigned worker
  - Worker pay rate (what the worker earns for this service at THIS property)
- This is stored in address_services table (which already has assigned_worker_id)
- NEVER put pay configuration on the team member — it's property-specific

## 2026-03-21 — STR Properties Use "Per Turn" Not Recurring Schedule
**Rule:** When a property is marked as STR (Short-Term Rental):
- If NO integration connected: recurrence = "per_turn" (triggered manually per guest checkout)
- If integration IS connected (Airbnb, VRBO, etc.): jobs auto-created from reservation data
- Show a soft notification: "Connect an integration for automatic scheduling"
- Don't make integration required — they can skip and schedule manually per turn
- Regular (non-STR) properties use: one_time, weekly, biweekly, monthly
- STR properties use: per_turn (+ one_time for deep cleans, inspections, etc.)

## 2026-03-21 — Delete = Always Undo (15 seconds)
**Rule:** Every delete action across the entire app must:
1. NOT delete immediately — soft delete or mark as pending
2. Show an "Undo" toast/banner for 15 seconds
3. If user clicks Undo → restore the item
4. If 15 seconds pass → actually delete
5. This applies EVERYWHERE: services, addresses, clients, jobs, team members, invoices, etc.

## 2026-03-21 — Call Button on Jobs + Dialer Fallback
**Rule:** Every job row should have a call button to call the client.
- Click call → option to use dialer (Twilio/VoIP) or regular phone (tel: link)
- Dialer can fall back to regular call if not configured
- This pattern should exist wherever a phone number is shown

## 2026-03-21 — Jobs Page = 7-Day Calendar + Cards
**Rule:** The jobs page should show a 7-day rolling calendar at the top with job cards organized by day/time below it. Not just a flat table.

## 2026-03-22 — Telegram Bot for Business Queries
**Rule:** Build a Telegram bot that can answer questions about:
- Revenue (daily, weekly, monthly, by client, by service)
- Reservations/jobs (upcoming, past, by date, by worker)
- Client names and contact info
- Number of jobs/services/properties
- Worker assignments and schedules
The bot queries Supabase and uses AI to understand natural language questions.

## 2026-03-27 — NEVER Use SSH for Git (CRITICAL)
**Mistake:** Tried to push to GitHub via SSH (`git@github.com:...`), which failed because the SSH key wasn't authorized.
**Correct approach:** ALWAYS use HTTPS for all Git operations. The remote is already set to `https://github.com/sevakogan/FieldAgent.git`.
**Rule:**
- NEVER use SSH keys or SSH URLs for Git — always HTTPS
- Before pushing, verify remote is HTTPS: `git remote -v`
- If remote is SSH, switch it: `git remote set-url origin https://github.com/sevakogan/FieldAgent.git`
- `gh` CLI and HTTPS auth are already configured and working

## 2026-03-22 — Beta V1 vs V2 Feature Split
**V1 Beta (NOW):** Overview, Calendar, Jobs, Clients & Properties, Team, Services, Invoices, Settings
**V2 (LATER):** Quotes, Messages, Revenue, Reports, Reviews, Referrals, Integrations, Automation, Stripe settings, Billing settings, Notifications settings, Resellers, Promo Codes, Webhooks, Analytics, Feedback, Changelog, Help Articles
