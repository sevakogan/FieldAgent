'use client'

import { type ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ViewingAsBanner from '@/components/platform/ViewingAsBanner'

// ─── SVG Icons ───────────────────────────────────────────────────────
const Icon = ({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
)

const IconOverview = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="10" width="4" height="10" rx="1" /><rect x="10" y="4" width="4" height="16" rx="1" /><rect x="16" y="8" width="4" height="12" rx="1" />
  </svg>
)
const IconCalendar = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const IconJobs = () => <Icon d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
const IconClients = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
)
const IconAddresses = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const IconTeam = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><circle cx="19" cy="7" r="3" /><path d="M23 21v-2a4 4 0 00-3-3.87" />
  </svg>
)
const IconServices = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
  </svg>
)
const IconQuotes = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const IconInvoices = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)
const IconRevenue = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)
const IconReports = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
)
const IconMessages = () => <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
const IconReviews = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IconIntegrations = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
)
const IconReferrals = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
)
const IconSettings = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
)
const IconChevron = ({ open }: { open: boolean }) => (
  <motion.svg
    className="w-3.5 h-3.5 text-[#AEAEB2]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: open ? 90 : 0 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  >
    <polyline points="9 18 15 12 9 6" />
  </motion.svg>
)

// ─── Nav Groups ──────────────────────────────────────────────────────
type NavItem = { label: string; href: string; icon: ReactNode }
type NavGroup = { title: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Overview', href: '/dashboard', icon: <IconOverview /> },
      { label: 'Calendar', href: '/dashboard/calendar', icon: <IconCalendar /> },
      { label: 'Jobs', href: '/dashboard/jobs', icon: <IconJobs /> },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Clients & Properties', href: '/dashboard/clients', icon: <IconClients /> },
      { label: 'Team', href: '/dashboard/team', icon: <IconTeam /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Services', href: '/dashboard/services', icon: <IconServices /> },
      { label: 'Quotes', href: '/dashboard/quotes', icon: <IconQuotes /> },
      { label: 'Messages', href: '/dashboard/messages', icon: <IconMessages /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Invoices', href: '/dashboard/invoices', icon: <IconInvoices /> },
      { label: 'Revenue', href: '/dashboard/revenue', icon: <IconRevenue /> },
      { label: 'Reports', href: '/dashboard/reports', icon: <IconReports /> },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Reviews', href: '/dashboard/reviews', icon: <IconReviews /> },
      { label: 'Referrals', href: '/dashboard/referrals', icon: <IconReferrals /> },
      { label: 'Integrations', href: '/dashboard/integrations', icon: <IconIntegrations /> },
    ],
  },
  {
    title: 'Config',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: <IconSettings /> },
    ],
  },
]

// ─── Collapsible Section ─────────────────────────────────────────────
function NavSection({
  group,
  collapsed,
  pathname,
  defaultOpen = true,
}: {
  group: NavGroup
  collapsed: boolean
  pathname: string
  defaultOpen?: boolean
}) {
  const hasActiveItem = group.items.some(
    (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  )
  const [open, setOpen] = useState(defaultOpen || hasActiveItem)

  return (
    <div className="mb-1">
      {!collapsed && (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#AEAEB2] hover:text-[#8E8E93] transition-colors"
        >
          {group.title}
          <IconChevron open={open} />
        </button>
      )}
      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-[#007AFF]/10 text-[#007AFF] font-medium'
                      : 'text-[#3C3C43] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]'
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Layout ──────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7]">
      <ViewingAsBanner />
      <div className="flex flex-1">

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col ${collapsed ? 'w-16' : 'w-60'} glass-sidebar transition-all duration-300`}>
        <div className="p-4 border-b border-[#E5E5EA] flex items-center justify-between">
          {!collapsed && <h1 className="text-lg font-bold text-[#1C1C1E]">KleanHQ</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-[#F2F2F7] text-[#8E8E93] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <><polyline points="9 18 15 12 9 6" /></> : <><polyline points="15 18 9 12 15 6" /></>}
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV_GROUPS.map((group) => (
            <NavSection
              key={group.title}
              group={group}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* Version footer */}
        <div className="px-3 py-1.5 border-t border-[#E5E5EA]">
          {!collapsed && (
            <p className="text-[10px] text-[#C7C7CC] font-mono">v1.0.0 · Mar 2026</p>
          )}
        </div>

        {/* God Mode */}
        <div className="p-3 border-t border-[#E5E5EA]">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#AF52DE] bg-[#AF52DE]/8 hover:bg-[#AF52DE]/15 transition-colors w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {!collapsed && 'God Mode'}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 md:p-5 max-w-7xl mx-auto pb-20">
          {children}
        </motion.div>
      </main>

      {/* Floating God Mode — mobile + always visible */}
      <Link
        href="/admin"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#AF52DE] text-white text-xs font-bold shadow-lg shadow-[#AF52DE]/30 hover:bg-[#9B3DC8] transition-colors md:hidden"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        God Mode
      </Link>
      </div>{/* close flex wrapper */}
    </div>
  )
}
