'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { getWorkerInfo } from '@/lib/actions/worker';
import type { WorkerInfo } from '@/lib/actions/worker';

const NAV_ITEMS = [
  { href: '/worker', icon: 'calendar-today', label: 'Today' },
  { href: '/worker/calendar', icon: 'calendar', label: 'Calendar' },
  { href: '/worker/jobs/active', icon: 'play-circle', label: 'Active' },
  { href: '/worker/history', icon: 'history', label: 'History' },
  { href: '/worker/profile', icon: 'person', label: 'Profile' },
] as const;

function TabIcon({ name, active }: { readonly name: string; readonly active: boolean }) {
  const color = active ? '#007AFF' : '#8E8E93';
  const icons: Record<string, React.ReactNode> = {
    'calendar-today': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="16" r="2" fill={active ? '#007AFF' : 'none'} />
      </svg>
    ),
    calendar: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    'play-circle': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10,8 16,12 10,16" fill={active ? '#007AFF' : 'none'} />
      </svg>
    ),
    history: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    person: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    ),
  };
  return <>{icons[name]}</>;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 flex justify-around items-end px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/worker'
              ? pathname === '/worker'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 min-w-[56px] py-1 no-underline"
            >
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-2 w-8 h-0.5 rounded-full bg-[#007AFF]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <TabIcon name={item.icon} active={active} />
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  active ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function DesktopSidebar({ worker }: { readonly worker: WorkerInfo | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = worker ? getInitials(worker.fullName) : '..';
  const displayName = worker?.fullName ?? 'Loading...';
  const roleName = worker?.role === 'owner' ? 'Owner' : worker?.role === 'lead' ? 'Lead' : 'Cleaner';

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200/50 h-dvh sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-black tracking-tight text-gray-900">
          KleanHQ
        </h1>
        <p className="text-xs text-[#8E8E93] mt-0.5">Worker Portal</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/worker'
              ? pathname === '/worker'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all ${
                active
                  ? 'bg-[#007AFF]/10 text-[#007AFF]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TabIcon name={item.icon} active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="text-[11px] text-[#8E8E93]">{roleName}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="mt-3 flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px] font-medium text-[#FF3B30] hover:bg-[#FF3B30]/8 transition-all"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function WorkerLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [worker, setWorker] = useState<WorkerInfo | null>(null);

  useEffect(() => {
    getWorkerInfo().then((res) => {
      if (res.success && res.data) {
        setWorker(res.data);
      }
    });
  }, []);

  return (
    <div className="flex min-h-dvh bg-[#F2F2F7]">
      <DesktopSidebar worker={worker} />
      <main className="flex-1 pb-24 md:pb-6 md:p-6">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
}
