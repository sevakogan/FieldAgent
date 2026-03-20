# KleanHQ Waitlist Landing Page — FINAL BUILD
## Phase 0: Launch NOW

---

## ⚠️ AUTONOMOUS BUILD MODE — READ THIS FIRST

**DO NOT ask the user any questions until the ENTIRE build is complete.**

Build everything in this document from top to bottom without stopping. Make all decisions yourself. Use placeholder values for any environment variables or API keys. When the entire application is fully built, working, and ready to deploy, THEN — and only then — present the user with a single checklist of what they need to connect:

1. Supabase project URL + anon key + service role key
2. Resend API key
3. Cloudflare Turnstile site key + secret key
4. Domain DNS settings for kleanhq.com

**Do not ask for these during the build. Use placeholder env vars and build everything assuming they will be filled in later.**

**If you encounter a decision point, make the best choice yourself and move on. Document what you chose in a DECISIONS.md file.**

**Goal: User starts this, walks away, comes back to a fully built application that just needs env vars plugged in.**

### Admin User (Auto-Create in Seed Script)
- Email: `Seva@thelevelteam.com`
- Password: `Seva@1982`
- Role: `super_admin`

### Launch Date (Countdown Timer Target)
- **June 1, 2026 at 9:00 AM Eastern**
- ISO: `2026-06-01T09:00:00-04:00`
- Hardcode as `NEXT_PUBLIC_LAUNCH_DATE` env var with this as default

---

## WHAT TO BUILD

A **showstopper** "Coming Soon" landing page for kleanhq.com:
1. Premium animated landing page showing ALL KleanHQ features
2. Countdown timer to June 1, 2026
3. Waitlist signup with role selection (Company / Client / Reseller / Independent Pro)
4. Share-to-move-up referral system (unique link per signup)
5. Social share buttons (Instagram image gen, SMS, Email, WhatsApp, Copy Link)
6. Full admin backend at `/admin/waitlist`
7. Cookie consent, CAPTCHA, rate limiting, SEO

---

## TECH STACK

```
Next.js 15 (App Router, Turbopack)
React 19
TypeScript
Tailwind CSS v4
Framer Motion (heavy animations)
canvas-confetti (signup celebration)
Supabase (waitlist table, auth for admin)
Resend (confirmation + drip emails)
Cloudflare Turnstile (CAPTCHA)
Vercel (deploy)
```

---

## DESIGN — PREMIUM MODERN LANDING PAGE

This is NOT a basic "coming soon" page. This is a **showstopper** — Linear.app launch page meets Apple product reveal meets Stripe homepage. Heavy on animation, parallax, floating elements, and visual storytelling.

### Colors
```
Background:       #F2F2F7 (iOS system grouped background)
Cards:            #FFFFFF with glassmorphism (backdrop-blur + semi-transparent)
Border:           #E5E5EA
Primary:          #007AFF (sky blue)
Secondary:        #AF52DE (lilac)
Accent Yellow:    #FFD60A
Coral:            #FF6B6B
Mint:             #5AC8FA
Peach:            #FF9F0A
Rose:             #FF2D55
Slate:            #8E8E93
Text:             #1C1C1E
Text Secondary:   #3C3C43
Text Muted:       #AEAEB2

Gradient Hero:    linear-gradient(135deg, #007AFF 0%, #AF52DE 50%, #FF6B6B 100%)
Gradient Section: linear-gradient(180deg, #F2F2F7 0%, #E8F0FE 50%, #F5EEFF 100%)
Ambient Glow:     radial-gradient(circle at 30% 20%, rgba(0,122,255,0.08), transparent 50%)
```

### Typography
```
Headings:  Outfit (Google Font) — weight 700-800
Body:      DM Sans (Google Font) — weight 400-500
Mono:      JetBrains Mono (timestamps, code)

Hero title:     64px desktop / 36px mobile, weight 800
Section titles: 40px desktop / 28px mobile, weight 700
Body:           16-18px, line-height 1.6
```

---

## ANIMATION & VISUAL EFFECTS

### Global Effects (Always Active)
1. **Smooth scroll** — Framer Motion `useScroll` + `useTransform` for parallax
2. **Page load sequence** — staggered reveal: logo → title → tagline → CTA (100ms delays)
3. **Cursor glow** — radial gradient follows mouse on desktop. Sky blue, 200px radius, 5% opacity. Disabled on mobile.
4. **Grain overlay** — subtle film grain texture, CSS noise, 2% opacity
5. **Scroll progress bar** — thin blue line at top of viewport
6. **Floating gradient orbs** — 3-4 large blurred circles, parallax movement:
   - Sky blue orb (top-left, 0.3x scroll speed)
   - Lilac orb (top-right, 0.2x)
   - Peach orb (bottom-center, 0.15x)
   - `position: fixed`, `filter: blur(100px)`, opacity 0.15
7. **Dotted grid pattern** — faint background grid, opacity 0.03, 32px spacing
8. **Floating service icons** — scattered background icons slowly rotating:
   - 🏠 🔧 🌊 💧 🌿 ✨ 🧹 📱 📋 💳 📍 ⭐ 🏊 🧽 🔑
   - 20-30px each, opacity 0.06-0.1, rotate 360° over 20-40s, float 10-20px
   - Different parallax speeds (0.1x to 0.4x)
   - Reduced to 4-5 icons on mobile

### Performance Rules
- All animations use `transform` and `opacity` only (GPU accelerated)
- `will-change: transform` on parallax elements
- Lazy load below-fold content
- All parallax disabled on mobile (performance)
- Cursor glow disabled on mobile
- Framer Motion `LazyMotion` with `domAnimation`

---

## PAGE SECTIONS (Top to Bottom)

### SECTION 1: Hero (Full Viewport Height)

**Background:** Animated mesh gradient — 3-4 color stops shifting position over 15s loop

**Content (centered, staggered animation):**
1. KleanHQ logo — blue circle with white "K" (bounces in with spring: stiffness 200, damping 15)
2. "KleanHQ" — 64px bold (fades up from 30px below, 0.2s after logo)
3. "The simplest way to run your field service business" — 20px (fades up, 0.1s after title)
4. "Schedule. Dispatch. Track. Get Paid. All from your phone." — 16px muted (fades up)
5. "COMING SOON" badge — pastel pill (scales in from 0.8 to 1.0 with overshoot)
6. Countdown timer — 4 boxes (Days / Hours / Minutes / Seconds):
   - Each digit flips in (3D Y-axis rotation) one by one, left to right
   - Timer counts down to: **June 1, 2026 9:00 AM ET**
   - Large numbers, small labels below
   - White cards with subtle shadow
7. Scroll indicator — bouncing down arrow at bottom

---

### SECTION 2: Features — "Everything You Need"

**Heading:** "Everything you need. Nothing you don't." (40px, stagger fade)

**6 feature cards** (stagger in from bottom on scroll, 100ms between each):

| Icon | Title | Description |
|------|-------|-------------|
| 📅 | Schedule & Dispatch | Assign jobs to your crew. Drag-and-drop calendar. Auto-assign by distance. |
| 📸 | Photo Verification | Before & after proof. Timestamp + GPS on every photo. Client sees the transformation. |
| 💳 | Automatic Payments | Stripe-powered. Per job or monthly. Client approves → payment fires. Zero chasing. |
| 🔗 | STR Integrations | Airbnb, VRBO, Hospitable, Hostaway, Guesty. Checkout → auto-schedule cleaning. |
| 🤖 | AI Assistant | Ask anything. "What's my schedule today?" Voice input. Role-based. Takes actions for you. |
| 🔍 | Find a Pro | Marketplace. Clients search for service providers. Pros register free. Get found. Get hired. |

**Card design:**
- White glassmorphism card, 20px radius
- Icon with unique micro-animation on hover:
  - Calendar: pages flip
  - Camera: shutter flash
  - Dollar: coin spin
  - Link: chain connects
  - Robot: eyes blink
  - Magnifying glass: zoom pulse
- On hover: lift 8px + shadow deepens + icon scales 1.1

---

### SECTION 3: How It Works (3-Step Flow)

**Heading:** "How it works" (40px)

Three steps connected by animated dotted line:

```
①──────────────②──────────────③
Schedule        Worker does     Client
the job         the work        approves
                                → Payment fires
```

- Each step fades in sequentially on scroll
- Dotted line draws itself (SVG stroke-dashoffset animation)
- Icons bounce on scroll-into-view
- Step 1: Calendar icon + "Assign to your crew with one tap"
- Step 2: Camera icon + "Photos, GPS tracking, checklists — all automatic"
- Step 3: Checkmark icon + "Client sees proof, taps approve, gets charged"

---

### SECTION 4: Full Feature List — "Built for the Field"

**Heading:** "Built for the field" (40px)

**Four columns of features** (fade in staggered, grouped by category):

**For Companies:**
- Job scheduling & calendar
- Worker GPS live tracking
- Before/after photo & video
- Job checklists & templates
- Custom fields (pool readings, HVAC data)
- Worker expense add-ons
- Automated invoicing & payments
- Revenue reports & analytics
- Worker payouts (ACH, card, Cash App)
- Quote / estimate builder
- AI contract generation
- Review automation (smart gate)
- Multi-company switching
- Weather alerts for outdoor jobs
- Seasonal pricing per month
- Promo codes & coupons
- Client messaging (SMS, WhatsApp, in-app)

**For Clients:**
- Client portal (view jobs, approve, pay)
- STR integrations (Airbnb, VRBO, Hospitable, Hostaway, Guesty)
- Auto-pay setup
- Before/after photo review
- Tip your worker
- Pause/skip recurring services
- Live worker tracking ("10 min away")
- Document storage per property (gate codes, WiFi)
- Invite companies to join KleanHQ
- Co-client access (share with partner/manager)
- Price transparency on all jobs
- Service request from portal

**For Workers:**
- Mobile-first app (iOS design)
- One-tap: Drive → Arrive → Upload → End
- In-app camera with timestamp overlay
- Video capture
- Offline mode (download today's schedule)
- Expense tracking with receipt photos
- Job checklists
- Voice-powered AI assistant
- Portfolio auto-built from completed jobs

**Marketplace & Growth:**
- "Find a Pro" — clients search for service providers
- Independent Pro registration (free)
- Referral system (6 viral loops)
- Share to Instagram with auto-generated image
- Waitlist with share-to-move-up
- Client self-service booking page
- Reseller white-label program
- Custom subdomains & domains

**Design:** Each feature is a single line with a small pastel icon dot. Compact, scannable. The whole section shows the depth of the platform.

---

### SECTION 5: AI Assistant Preview

**Heading:** "Your AI-powered co-pilot" (40px)

**Mock chat interface** (animated):
- Fake chat bubble conversation showing the AI in action:
  ```
  You: "What's my schedule today?"
  AI: "You have 4 jobs today:
       9:00 AM — Lawn mow at 123 Main St (Jose)
       11:00 AM — Pool service at 456 Ocean Dr (You)
       2:00 PM — Deep clean at 789 Palm Ave (Maria)
       4:30 PM — Turnover clean at 321 Beach Rd (Jose)"
  
  You: "Schedule a pool service for Mrs. Chen next Tuesday"
  AI: [Confirmation card appears]
       📋 Create Job
       Client: Mrs. Chen
       Service: Pool Chemical Balance
       Date: Tuesday, June 10
       [Cancel] [✓ Confirm]
  ```
- Chat bubbles animate in one by one (typing indicator → reveal)
- Pastel blue bubbles (user) and white bubbles (AI)
- Shows: voice input button, quick suggestions pills

**Below the chat mock:**
- "60 days free. Then $5/mo. Workers always free."
- Three role badges: "Owner AI" "Client AI" "Worker AI" — each with one-line description

---

### SECTION 6: Marketplace Preview — "Find a Pro"

**Heading:** "Need a pro? Find one instantly." (40px)

**Mock search interface:**
- Search bar: "Pool service near Miami, FL"
- Three result cards showing fake Pro profiles:
  - Profile photo (placeholder), name, ⭐ rating, services, "$75-120/job", "2.3 mi away"
  - Cards slide in from right on scroll
- "Free to register. Get found. Get hired."
- CTA: "Join as a Pro" button

---

### SECTION 7: Integrations Marquee

**Heading:** "Works with the tools you already use" (24px centered)

**Infinite horizontal scroll marquee:**
- Logos: Airbnb, VRBO, Hospitable, Hostaway, Guesty, Stripe, QuickBooks, Xero, Google Calendar, Twilio, WhatsApp
- Grayscale by default → color on hover
- Pauses on hover
- Slow, smooth, continuous

---

### SECTION 8: Pricing Preview

**Heading:** "Simple, transparent pricing" (40px)

Three cards side by side:

| FREE TRIAL | STANDARD | ANNUAL |
|------------|----------|--------|
| 15 days | $7/addr/mo | $6.30/addr/mo |
| No card required | All features | 10% savings |
| 30 days if referred! | Volume discounts | Billed yearly |

Below cards:
- "AI Assistant: 60 days free, then $5/mo per user. Workers always free."
- "Resellers: $0 to start. White-label available."
- "Independent Pros: Free to register. $7/addr/mo when you start working."

**Below pricing cards — Migration Hook:**
```
┌─────────────────────────────────────────────────┐
│  Switching from Jobber, Housecall Pro,           │
│  ServiceTitan, or another platform?              │
│                                                   │
│  We'll migrate your data for free.               │
│  Clients, addresses, job history — all of it.    │
│                                                   │
│  [Join the Waitlist →]                           │
└─────────────────────────────────────────────────┘
```
- Subtle card with pastel border
- Competitor logos shown faded (Jobber, Housecall Pro, ServiceTitan, Workiz, Fieldpulse)
- This converts people already paying for a competitor but unhappy

---

### SECTION 9: Stats Counter

**Background:** Subtle gradient section

**5 counters** (animate from 0 to value on scroll-into-view, 200ms stagger):

| 95+ | 6 | 8 | 5 | ∞ |
|-----|---|---|---|---|
| Features | User Types | Integrations | Revenue Streams | Viral Loops |

---

### SECTION 10: Waitlist Signup (THE MAIN CTA)

**Card design:** Animated gradient border (rotating gradient ring around the card). Glassmorphism background.

**Heading:** "Join the Waitlist" (40px bold)
**Subheading:** "Be first in line. Share to move up." (16px muted)

**Form:**
```
┌──────────────────────────┐
│ Full Name                │  ← input, blue border on focus with glow
└──────────────────────────┘
┌──────────────────────────┐
│ Email                    │
└──────────────────────────┘

┌─Company─┬─Client─┬─Reseller─┬─Pro─┐   ← iOS segmented control
└─────────┴────────┴──────────┴─────┘

[Cloudflare Turnstile — invisible CAPTCHA]

┌──────────────────────────────────┐
│     🚀 Join the Waitlist         │  ← gradient button (blue→lilac), pulsing gently
└──────────────────────────────────┘
```

**On Submit:** Confetti burst animation (canvas-confetti)

**After Signup (AnimatePresence morph from form to success):**
```
🎉 You're in!

┌──────────────────────────────────┐
│  Your position: #47              │  ← number rolls in like odometer
│  Referred by: [name] (if applicable)
└──────────────────────────────────┘

Share to move up — every referral bumps you higher:

┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 📋│ │💬 │ │📧 │ │💚 │ │📸 │
│Copy│ │SMS│ │Mail│ │WA │ │IG │   ← bounce in staggered 50ms
└───┘ └───┘ └───┘ └───┘ └───┘

Your referral link: kleanhq.com?ref=ABC123
0 friends referred
```

---

### SECTION 11: Footer

```
KleanHQ
© 2026 · Terms · Privacy
Built in Miami 🌴  ← palm tree sway animation

"Know someone who'd love KleanHQ?"
[Share KleanHQ →]   ← referral link (always tracked)
```

---

## SHARE FUNCTIONALITY

### Copy Link
- One-tap: `kleanhq.com?ref=CODE`
- Toast: "Link copied!"

### SMS
- Opens native SMS: "I just signed up for KleanHQ — the easiest way to run a service business. Join the waitlist and skip the line: kleanhq.com?ref=CODE"

### Email
- Opens mailto:
- Subject: "Check out KleanHQ"
- Body: same as SMS

### WhatsApp
- wa.me link with pre-filled message

### Instagram
- Auto-generates a branded share image (1080×1080):
  - KleanHQ logo + pastel gradient background
  - "Join KleanHQ" headline
  - Referral code displayed prominently
  - "Use my link to skip the line"
  - QR code with referral link embedded
- "Save Image" button → user posts to IG manually
- On mobile: attempt deep link to IG Stories with image

---

## WAITLIST BACKEND

### Database (Supabase)
```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  type text not null check (type in ('company','client','reseller','independent_pro')),
  referral_code text unique not null,
  referred_by uuid references waitlist(id),
  referral_count integer default 0,
  position integer,
  source text,
  ip_address text,
  status text default 'waiting' check (status in ('waiting','invited','converted')),
  created_at timestamptz default now()
);

create index idx_waitlist_email on waitlist(email);
create index idx_waitlist_referral_code on waitlist(referral_code);
create index idx_waitlist_position on waitlist(position);
```

### Referral Code
- 6-character alphanumeric, uppercase, easy to type
- Link: `kleanhq.com?ref=CODE`
- On signup with ref → `referred_by` set, referrer's `referral_count` increments

### Position Calculation
- Base position = signup order (#1 = first)
- Each referral moves you up 3 positions
- Recalculates on every new referral
- Ties broken by signup date

### API Routes
```
POST /api/waitlist/signup     → { name, email, type, referral_code?, turnstile_token }
                              → returns { position, referral_code, referral_link }

GET  /api/waitlist/status     → ?email=x → { position, referral_count, referral_code }

GET  /api/waitlist/count      → { total }

POST /api/waitlist/share-image → generates branded referral image, returns URL
```

### Confirmation Email (Resend — Branded Pastel)
- Subject: "You're on the KleanHQ waitlist! 🎉"
- Body: position, referral link, encourage sharing, feature highlights
- Pastel iOS design matching the landing page

---

## ADMIN BACKEND (`/admin/waitlist`)

### Access
- Login at `/admin/login`
- **Admin user (auto-create in seed script):**
  - Email: `Seva@thelevelteam.com`
  - Password: `Seva@1982`
  - Role: `super_admin`
- Middleware: if email !== admin email → redirect to landing page

### Dashboard
- Total signups (live count, big number)
- Breakdown by type: X companies, Y clients, Z resellers, W pros
- Signups today / this week / this month (simple chart)
- Top referrers leaderboard (name, email, referral count, position)
- Conversion rate (if tracking invited → converted)

### Waitlist Table
- Sortable, filterable, searchable table
- Columns: Position, Name, Email, Type, Referral Count, Referred By, Signup Date, Status
- Search by name or email
- Filter by: type (company/client/reseller/pro), status (waiting/invited/converted)
- Bulk actions: select multiple → "Send Invite" / "Export CSV"

### Actions
- Change position manually (input number)
- Mark as "Invited" (ready to onboard)
- Mark as "Converted" (signed up for real app)
- Export full waitlist as CSV
- Send batch invite email to top X people
- Delete spam entries

---

## SECURITY

- **Rate limiting:** signup API: 5 per IP per hour
- **CAPTCHA:** Cloudflare Turnstile (invisible mode) on signup form
- **Input validation:** server-side email validation, name sanitization, XSS prevention
- **Duplicate prevention:** if email exists → show "You're already on the list!" with position + share link

---

## SEO

- `<title>`: "KleanHQ — The Simplest Field Service Platform | Coming Soon"
- `<meta description>`: "Schedule jobs, dispatch workers, get paid automatically. AI-powered. Marketplace built in. Lawn care, pool, cleaning & more. Join the waitlist."
- Open Graph: title, description, auto-generated OG image (1200×630)
- Twitter Card tags
- `sitemap.xml`
- `robots.txt` — allow /, disallow /admin
- JSON-LD: SoftwareApplication schema
- Favicon: blue circle K + apple-touch-icon + PWA manifest icons

---

## AD TRACKING (Install on Waitlist Page)

All pixels gated behind cookie consent. Load via Google Tag Manager.

- **Google Tag Manager** — container on all pages
- **Google Analytics 4** — track: page_view, waitlist_join, referral_share (with channel)
- **Google Ads pixel** — conversion: waitlist_join (for future ad campaigns)
- **Meta Pixel** — events: PageView, Lead (waitlist signup)
- **TikTok Pixel** — events: PageView, CompleteRegistration

Every waitlist signup pushes to dataLayer:
```typescript
window.dataLayer?.push({
  event: 'waitlist_join',
  user_type: type, // company/client/reseller/pro
  referral_source: referralCode || 'direct',
});
```

### Environment Variables (Ad Tracking)
```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXXX
```

Use placeholder values during build. User fills in real IDs after.

---

## COOKIE CONSENT

- Bottom banner on first visit
- "We use cookies to improve your experience." [Accept] [Decline]
- Essential only if declined
- Stores in localStorage

---

## ASSETS TO GENERATE

1. **Animated KleanHQ logo** — SVG that draws itself (stroke-dashoffset). "K" draws first, circle fills.
2. **OG Image** — 1200×630. Logo, title, tagline, gradient background.
3. **Referral share image** — 1080×1080. Logo, "Join KleanHQ", referral code, QR code, gradient.
4. **Favicon** — blue circle with white K. 16×16, 32×32, 180×180 (apple-touch), 512×512 (PWA).
5. **6 feature card SVG icons** — simple line-art, pastel colored, CSS animated.

---

## FILE STRUCTURE

```
src/
├── app/
│   ├── page.tsx                         → Landing page (all sections)
│   ├── layout.tsx                       → Root layout (fonts, metadata, cookie consent)
│   ├── globals.css                      → Tailwind + custom styles + grain overlay + grid pattern
│   ├── admin/
│   │   ├── login/page.tsx               → Admin login
│   │   └── waitlist/
│   │       ├── page.tsx                 → Waitlist dashboard + table
│   │       └── layout.tsx               → Admin layout (auth check)
│   ├── api/
│   │   └── waitlist/
│   │       ├── signup/route.ts          → POST signup
│   │       ├── status/route.ts          → GET status by email
│   │       ├── count/route.ts           → GET total count
│   │       └── share-image/route.ts     → Generate referral image
│   ├── favicon.ico
│   ├── icon.svg
│   ├── apple-icon.png
│   ├── opengraph-image.png
│   ├── manifest.json
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── landing/
│   │   ├── Hero.tsx                     → Logo, title, countdown, mesh gradient
│   │   ├── Features.tsx                 → 6 feature cards with animations
│   │   ├── HowItWorks.tsx              → 3-step flow with animated line
│   │   ├── FullFeatureList.tsx          → 4-column detailed feature list
│   │   ├── AIPreview.tsx               → Mock chat interface
│   │   ├── MarketplacePreview.tsx      → Mock search + pro cards
│   │   ├── IntegrationsMarquee.tsx     → Infinite logo scroll
│   │   ├── PricingPreview.tsx          → 3 pricing cards
│   │   ├── StatsCounter.tsx            → Animated count-up numbers
│   │   ├── WaitlistForm.tsx            → Signup form + Turnstile
│   │   ├── WaitlistSuccess.tsx         → Post-signup (position, share)
│   │   ├── ShareButtons.tsx            → All share options
│   │   ├── Countdown.tsx               → Timer with flip animation
│   │   ├── LiveCounter.tsx             → "X people on the waitlist"
│   │   ├── Footer.tsx                  → Footer with referral
│   │   └── CookieConsent.tsx           → GDPR banner
│   ├── effects/
│   │   ├── FloatingOrbs.tsx            → Gradient orbs with parallax
│   │   ├── FloatingIcons.tsx           → Service icons rotating
│   │   ├── CursorGlow.tsx             → Mouse-following gradient
│   │   ├── GrainOverlay.tsx           → Film grain texture
│   │   ├── ScrollProgress.tsx          → Top progress bar
│   │   ├── MeshGradient.tsx           → Animated hero background
│   │   └── GridPattern.tsx            → Dotted background grid
│   ├── admin/
│   │   ├── WaitlistTable.tsx
│   │   ├── WaitlistStats.tsx
│   │   ├── TopReferrers.tsx
│   │   └── AdminNav.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── SegmentedControl.tsx
│       ├── Toast.tsx
│       └── GlassCard.tsx              → Glassmorphism card
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── email/
│   │   └── waitlist-confirmation.ts
│   └── utils/
│       ├── referral.ts                 → Code gen, position calc
│       ├── share.ts                    → Share link builders
│       └── turnstile.ts               → CAPTCHA verification
├── hooks/
│   ├── useScrollAnimation.ts           → Framer Motion scroll triggers
│   ├── useCountdown.ts                → Timer hook
│   └── useMousePosition.ts            → For cursor glow
├── middleware.ts                        → Admin auth + rate limiting
├── scripts/
│   └── seed.ts                         → Create admin user + test waitlist entries
└── supabase/
    └── migrations/
        └── 001_create_waitlist.sql
```

---

## PACKAGES TO INSTALL

```json
{
  "dependencies": {
    "next": "^15.5",
    "react": "^19.2",
    "react-dom": "^19.2",
    "framer-motion": "^11",
    "canvas-confetti": "^1.9",
    "@supabase/ssr": "^0.9",
    "@supabase/supabase-js": "^2.98",
    "resend": "^6.9"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4.2",
    "typescript": "^5"
  }
}
```

---

## ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Resend
RESEND_API_KEY=your-resend-api-key-here

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key-here
TURNSTILE_SECRET_KEY=your-turnstile-secret-key-here

# App Config
NEXT_PUBLIC_LAUNCH_DATE=2026-06-01T09:00:00-04:00
NEXT_PUBLIC_APP_URL=https://kleanhq.com
ADMIN_EMAIL=Seva@thelevelteam.com
```

---

## DEPLOYMENT

1. Push to GitHub
2. Connect to Vercel
3. Set all environment variables above
4. Point kleanhq.com DNS to Vercel
5. Deploy

---

## LAUNCH CHECKLIST

- [ ] Supabase project created with waitlist table + admin user seeded
- [ ] Resend account with verified domain (kleanhq.com) + SPF/DKIM/DMARC DNS
- [ ] Cloudflare Turnstile site created + keys set
- [ ] Landing page fully built and tested on mobile + desktop
- [ ] All animations smooth on mobile (parallax disabled, simplified)
- [ ] All 11 sections rendering correctly
- [ ] Feature list includes: AI Assistant, Marketplace, all 95+ features
- [ ] Countdown timer targeting June 1, 2026 9:00 AM ET
- [ ] Waitlist signup flow: form → CAPTCHA → DB → email → referral link
- [ ] Share buttons working: copy, SMS, email, WhatsApp, Instagram image
- [ ] Position calculation working (share-to-move-up)
- [ ] Admin login working (Seva@thelevelteam.com / Seva@1982)
- [ ] Admin dashboard: stats, table, search, filter, export, bulk actions
- [ ] OG image renders correctly on social share
- [ ] Favicon + PWA icons set
- [ ] SEO: title, meta, sitemap, robots.txt, JSON-LD
- [ ] Cookie consent banner functional
- [ ] Rate limiting tested (can't spam signups)
- [ ] Turnstile CAPTCHA working
- [ ] DNS pointed, SSL active
- [ ] Deployed to Vercel
- [ ] Tested on iPhone Safari
- [ ] Tested on Android Chrome
- [ ] Tested on desktop Chrome + Safari
- [ ] Instagram share image generates correctly
- [ ] Shared link on social media to verify OG tags
