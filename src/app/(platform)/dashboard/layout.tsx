'use client'

import { type ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ViewingAsBanner from '@/components/platform/ViewingAsBanner'
import { UndoToastProvider } from '@/components/platform/UndoToast'

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

// ─── Smaller icons for mobile tab bar ────────────────────────────────
function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? '#007AFF' : '#8E8E93'
  const fill = active ? '#007AFF' : 'none'

  switch (name) {
    case 'overview':
      return (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />{!active && <polyline points="9 22 9 12 15 12 15 22" />}
        </svg>
      )
    case 'calendar':
      return (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={active ? 'none' : color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="3" fill={active ? color : 'none'} /><path d="M16 2v4M8 2v4" stroke={active ? 'white' : color} strokeWidth={1.5} /><path d="M3 10h18" stroke={active ? 'white' : color} strokeWidth={1.5} />
        </svg>
      )
    case 'jobs':
      return (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={fill} stroke={active ? 'none' : color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'clients':
      return (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={fill} stroke={active ? 'none' : color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      )
    case 'more':
      return (
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
          <circle cx="12" cy="5" r="1" fill={color} /><circle cx="12" cy="12" r="1" fill={color} /><circle cx="12" cy="19" r="1" fill={color} />
        </svg>
      )
    default:
      return null
  }
}

// ─── More Sheet Nav Items ────────────────────────────────────────────
const MORE_SHEET_ITEMS: { label: string; href: string; icon: ReactNode }[] = [
  { label: 'My Jobs', href: '/dashboard/worker-mode', icon: <IconTeam /> },
  { label: 'Team', href: '/dashboard/team', icon: <IconTeam /> },
  { label: 'Services', href: '/dashboard/services', icon: <IconServices /> },
  { label: 'Invoices', href: '/dashboard/invoices', icon: <IconInvoices /> },
  { label: 'Referrals', href: '/dashboard/referrals', icon: <IconReferrals /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <IconSettings /> },
]

// ─── Nav Groups ──────────────────────────────────────────────────────
type NavItem = { label: string; href: string; icon: ReactNode }
type NavGroup = { title: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Home',
    items: [
      { label: 'Overview', href: '/dashboard', icon: <IconOverview /> },
      { label: 'Calendar', href: '/dashboard/calendar', icon: <IconCalendar /> },
      { label: 'Jobs', href: '/dashboard/jobs', icon: <IconJobs /> },
      { label: 'My Jobs', href: '/dashboard/worker-mode', icon: <IconTeam /> },
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
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Invoices', href: '/dashboard/invoices', icon: <IconInvoices /> },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Referrals', href: '/dashboard/referrals', icon: <IconReferrals /> },
    ],
  },
  {
    title: 'Settings',
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

// ─── Mobile Bottom Tab Bar ───────────────────────────────────────────
function MobileBottomNav({ pathname }: { pathname: string }) {
  const [moreOpen, setMoreOpen] = useState(false)

  const tabs = [
    { name: 'overview', label: 'Overview', href: '/dashboard' },
    { name: 'calendar', label: 'Calendar', href: '/dashboard/calendar' },
    { name: 'jobs', label: 'Jobs', href: '/dashboard/jobs' },
    { name: 'clients', label: 'Clients', href: '/dashboard/clients' },
    { name: 'more', label: 'More', href: '' },
  ]

  const isTabActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return href !== '' && pathname.startsWith(href)
  }

  // Check if "More" should appear active (any deeper nav item is active)
  const moreHrefs = MORE_SHEET_ITEMS.map(i => i.href)
  const isMoreActive = moreHrefs.some(h => pathname === h || pathname.startsWith(h))

  return (
    <>
      {/* Bottom Tab Bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-around px-2" style={{ height: '84px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {tabs.map(tab => {
            const active = tab.name === 'more' ? isMoreActive || moreOpen : isTabActive(tab.href)

            if (tab.name === 'more') {
              return (
                <button
                  key={tab.name}
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
                >
                  <TabIcon name={tab.name} active={active} />
                  <span className={`text-[11px] font-bold ${active ? 'text-[#007AFF]' : 'text-[#1C1C1E]'}`}>
                    {tab.label}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
              >
                <TabIcon name={tab.name} active={active} />
                <span className={`text-[11px] font-bold ${active ? 'text-[#007AFF]' : 'text-[#1C1C1E]'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* More Bottom Sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="md:hidden fixed inset-0 z-[55] bg-black/30"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[56] rounded-t-3xl max-h-[70vh] overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#D1D1D6]" />
              </div>

              {/* Close button + title */}
              <div className="flex items-center justify-between px-5 py-2">
                <h3 className="text-base font-bold text-[#1C1C1E]">More</h3>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F2F2F7] flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav items */}
              <div className="px-4 pb-4 space-y-0.5">
                {MORE_SHEET_ITEMS.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-[#007AFF]/10 text-[#007AFF] font-medium'
                          : 'text-[#1C1C1E] active:bg-[#F2F2F7]'
                      }`}
                    >
                      <span className={isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'}>{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}

                {/* God Mode link in More sheet */}
                <Link
                  href="/admin"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#AF52DE] active:bg-[#AF52DE]/10 transition-all"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium">God Mode</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
          {!collapsed && (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1C1C1E]">KleanHQ</h1>
              <span className="text-[8px] bg-[#FF9F0A] text-white px-1.5 py-0.5 rounded-lg font-bold uppercase tracking-wider">Beta</span>
            </div>
          )}
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 md:p-5 max-w-7xl mx-auto pb-24 md:pb-20">
          {children}
        </motion.div>
      </main>


      {/* Floating admin eye — mobile, above bottom nav */}
      <Link
        href="/admin"
        className="fixed bottom-[100px] right-4 z-50 w-10 h-10 rounded-full bg-[#AF52DE] text-white flex items-center justify-center shadow-lg shadow-[#AF52DE]/30 hover:bg-[#9B3DC8] active:scale-90 transition-all md:hidden"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </Link>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav pathname={pathname} />

      </div>{/* close flex wrapper */}
      <UndoToastProvider />
    </div>
  )
}
