'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import ViewingAsBanner from '@/components/platform/ViewingAsBanner'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: '📊' },
  { label: 'Calendar', href: '/dashboard/calendar', icon: '📅' },
  { label: 'Jobs', href: '/dashboard/jobs', icon: '🔧' },
  { label: 'Clients', href: '/dashboard/clients', icon: '👥' },
  { label: 'Addresses', href: '/dashboard/addresses', icon: '📍' },
  { label: 'Team', href: '/dashboard/team', icon: '👷' },
  { label: 'Services', href: '/dashboard/services', icon: '⚙️' },
  { label: 'Quotes', href: '/dashboard/quotes', icon: '📝' },
  { label: 'Invoices', href: '/dashboard/invoices', icon: '💳' },
  { label: 'Revenue', href: '/dashboard/revenue', icon: '💰' },
  { label: 'Reports', href: '/dashboard/reports', icon: '📈' },
  { label: 'Messages', href: '/dashboard/messages', icon: '💬' },
  { label: 'Reviews', href: '/dashboard/reviews', icon: '⭐' },
  { label: 'Integrations', href: '/dashboard/integrations', icon: '🔗' },
  { label: 'Referrals', href: '/dashboard/referrals', icon: '🎁' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F2F2F7]">
      <ViewingAsBanner />
      <aside className={`hidden md:flex flex-col ${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-[#E5E5EA] transition-all duration-300`}>
        <div className="p-4 border-b border-[#E5E5EA] flex items-center justify-between">
          {!collapsed && <h1 className="text-lg font-bold text-[#1C1C1E]">KleanHQ</h1>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-[#F2F2F7] text-[#8E8E93]">
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm transition-colors ${
                  isActive ? 'bg-[#007AFF]/10 text-[#007AFF] font-medium' : 'text-[#3C3C43] hover:bg-[#F2F2F7]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-[#E5E5EA]">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#AF52DE] bg-[#AF52DE]/8 hover:bg-[#AF52DE]/15 transition-colors w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            God Mode
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </motion.div>
      </main>
    </div>
  )
}
