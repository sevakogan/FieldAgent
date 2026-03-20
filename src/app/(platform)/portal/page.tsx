'use client';

import { useState } from 'react';
import Link from 'next/link';

const UPCOMING_JOBS = [
  { id: 'job-1', service: 'Deep Clean', address: '742 Evergreen Terrace', date: '2026-03-22', time: '9:00 AM', provider: 'SparkleClean Co.', status: 'confirmed' as const },
  { id: 'job-2', service: 'Window Washing', address: '742 Evergreen Terrace', date: '2026-03-25', time: '1:00 PM', provider: 'ClearView Pros', status: 'pending' as const },
  { id: 'job-3', service: 'Carpet Cleaning', address: '123 Ocean Ave, Unit 4B', date: '2026-03-28', time: '10:00 AM', provider: 'SparkleClean Co.', status: 'confirmed' as const },
];

const RECENT_INVOICES = [
  { id: 'inv-101', service: 'Standard Clean', amount: 150.00, date: '2026-03-15', status: 'paid' as const },
  { id: 'inv-100', service: 'Deep Clean', amount: 285.00, date: '2026-03-08', status: 'paid' as const },
  { id: 'inv-099', service: 'Move-Out Clean', amount: 420.00, date: '2026-02-28', status: 'overdue' as const },
];

const QUICK_ACTIONS = [
  { href: '/portal/request', label: 'Request Service', icon: '🧹', color: 'bg-purple-50 text-[#AF52DE]' },
  { href: '/portal/quotes', label: 'View Quotes', icon: '📋', color: 'bg-blue-50 text-blue-600' },
  { href: '/portal/payments', label: 'Pay Invoice', icon: '💳', color: 'bg-green-50 text-green-600' },
  { href: '/portal/messages', label: 'Messages', icon: '💬', color: 'bg-orange-50 text-orange-600' },
];

const STATUS_STYLES = {
  confirmed: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
  unpaid: 'bg-yellow-50 text-yellow-700',
} as const;

export default function PortalDashboard() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, Sarah</h1>
        <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your properties.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${action.color}`}>
              {action.icon}
            </span>
            <span className="text-xs font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#AF52DE]">3</p>
          <p className="text-xs text-gray-500">Upcoming Jobs</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">$435</p>
          <p className="text-xs text-gray-500">Paid This Month</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-500">$420</p>
          <p className="text-xs text-gray-500">Outstanding</p>
        </div>
      </div>

      {/* Upcoming Jobs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Jobs</h2>
          <Link href="/portal/calendar" className="text-sm font-medium text-[#AF52DE]">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {UPCOMING_JOBS.map((job) => (
            <Link
              key={job.id}
              href={`/portal/jobs/${job.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{job.service}</h3>
                  <p className="text-sm text-gray-500">{job.address}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {new Date(job.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {job.time}
                  </p>
                  <p className="text-xs text-gray-400">{job.provider}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[job.status]}`}>
                  {job.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Invoices */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
          <Link href="/portal/invoices" className="text-sm font-medium text-[#AF52DE]">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {RECENT_INVOICES.map((inv) => (
            <Link
              key={inv.id}
              href={`/portal/invoices/${inv.id}`}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <h3 className="font-medium text-gray-900">{inv.service}</h3>
                <p className="text-sm text-gray-500">{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${inv.amount.toFixed(2)}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[inv.status]}`}>
                  {inv.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
