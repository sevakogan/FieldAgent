# KleanHQ Mobile-First Simplification Design

**Date:** 2026-03-15
**Status:** Approved

## Goal

Simplify KleanHQ from 8 pages to 5, reduce client JS bundle by ~37%, and optimize for mobile-first field workers.

## Navigation Change

| Before (8) | After (5) |
|---|---|
| Dashboard | Dashboard (+ dialer FAB) |
| Dialer | Contacts (leads + clients tabs) |
| Leads | Jobs |
| Clients | Business (revenue + reviews) |
| Jobs | Settings (mobile-stripped) |
| Revenue | |
| Reviews | |
| Settings | |

## Phase 1: Code Performance

1. **next.config.ts** — Add Turbopack, image optimization, optimizePackageImports, compress, remove poweredByHeader
2. **Layout split** — Extract dialer state to DialerProvider context. Layout becomes server component
3. **Suspense** — Wrap data sections in Suspense with skeleton fallbacks
4. **Dynamic imports** — next/dynamic for DialerModal, KanbanBoard

## Phase 2: Page Consolidation

1. **Contacts** (`/contacts`) — Two tabs: Prospects (leads) | Clients. Shared search
2. **Business** (`/business`) — Revenue stats + Reviews stacked
3. **Dialer FAB** — Floating action button on all pages, opens bottom sheet dialpad
4. **Navigation** — Update sidebar (5 items), mobile nav (5 labeled icons), topbar (remove dial button)

## Phase 3: Mobile UX

1. Dashboard: 2 stat cards (MRR + Jobs Today), 3 quick actions, remove Recent Leads widget
2. Leads: List-only on mobile (Kanban = desktop only)
3. Client profile: Bottom sheet overlay on mobile
4. Settings: 3 fields on mobile (Name, Phone, Notifications)
5. Mobile nav: Labeled icons instead of dots

## Files

### New
- `src/components/layout/dialer-provider.tsx`
- `src/components/layout/dialer-fab.tsx`
- `src/app/(dashboard)/contacts/page.tsx`
- `src/app/(dashboard)/business/page.tsx`
- `src/components/ui/bottom-sheet.tsx`
- `src/components/ui/skeleton.tsx`

### Deleted
- `src/app/(dashboard)/dialer/page.tsx`
- `src/app/(dashboard)/leads/page.tsx`
- `src/app/(dashboard)/clients/page.tsx` (list only; keep [id])
- `src/app/(dashboard)/revenue/page.tsx`
- `src/app/(dashboard)/reviews/page.tsx`

### Unchanged
- Database schema, types, mock-data, auth flow, Jobs page, Client [id] page
