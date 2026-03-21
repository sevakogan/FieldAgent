'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPortalDashboard } from '@/lib/actions/portal';
import type { PortalDashboardData } from '@/lib/actions/portal';

const QUICK_ACTIONS = [
  { href: '/portal/request', label: 'Request Service', icon: 'plus', color: 'bg-purple-50 text-[#AF52DE]' },
  { href: '/portal/quotes', label: 'View Quotes', icon: 'quote', color: 'bg-blue-50 text-blue-600' },
  { href: '/portal/payments', label: 'Pay Invoice', icon: 'card', color: 'bg-green-50 text-green-600' },
  { href: '/portal/messages', label: 'Messages', icon: 'message', color: 'bg-orange-50 text-orange-600' },
];

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-green-50 text-green-700',
  confirmed: 'bg-green-50 text-green-700',
  requested: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-blue-50 text-blue-700',
  pending: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
};

function ActionIcon({ type }: { type: string }) {
  if (type === 'plus') return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
  if (type === 'quote') return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>;
  if (type === 'card') return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>;
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
}

export default function PortalDashboard() {
  const [data, setData] = useState<PortalDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortalDashboard().then(result => {
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error ?? 'Failed to load dashboard');
      }
      setLoading(false);
    });
  }, []);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500">{error ?? 'No client account found'}</p>
      </div>
    );
  }

  const firstName = data.client.fullName.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {firstName}</h1>
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
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
              <ActionIcon type={action.icon} />
            </span>
            <span className="text-xs font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-[#AF52DE]">{data.upcomingJobsCount}</p>
          <p className="text-xs text-gray-500">Upcoming Jobs</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-500">${data.outstandingBalance.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Outstanding</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-500">{data.unreadMessages}</p>
          <p className="text-xs text-gray-500">Unread Messages</p>
        </div>
      </div>

      {/* Upcoming Jobs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Jobs</h2>
          <Link href="/portal/calendar" className="text-sm font-medium text-[#AF52DE]">View All</Link>
        </div>
        {data.recentJobs.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-400">No upcoming jobs</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/portal/jobs/${job.id}`}
                className="block rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.serviceName}</h3>
                    <p className="text-sm text-gray-500">{job.address}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(job.scheduledDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {job.scheduledTime && ` at ${job.scheduledTime}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Invoices */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
          <Link href="/portal/invoices" className="text-sm font-medium text-[#AF52DE]">View All</Link>
        </div>
        {data.recentInvoices.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-400">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/portal/invoices/${inv.id}`}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{inv.invoiceNumber}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${inv.total.toFixed(2)}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {inv.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
