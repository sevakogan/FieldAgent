'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getPortalProviders, leaveProvider } from '@/lib/actions/portal';
import type { PortalProvider } from '@/lib/actions/portal';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<PortalProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const loadProviders = useCallback(() => {
    getPortalProviders().then(result => {
      setProviders(result.success && result.data ? result.data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleLeaveProvider = useCallback(async (companyId: string) => {
    setLeaving(true);
    const result = await leaveProvider(companyId);
    if (result.success) {
      setProviders(prev => prev.filter(p => p.companyId !== companyId));
    }
    setConfirmLeave(null);
    setLeaving(false);
  }, []);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Providers</h1>
      <p className="text-sm text-gray-500">Companies you&apos;re connected with on KleanHQ.</p>

      <div className="space-y-3">
        {providers.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400">No providers connected</p>
          </div>
        ) : (
          providers.map((provider) => (
            <div key={provider.companyId} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#AF52DE]/10 text-sm font-bold text-[#AF52DE]">
                  {provider.companyName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{provider.companyName}</h3>
                  {provider.phone && <p className="text-sm text-gray-500">{provider.phone}</p>}
                  {provider.email && <p className="text-sm text-gray-500">{provider.email}</p>}
                  <p className="mt-1 text-xs text-gray-400">
                    Connected since {new Date(provider.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <Link
                  href={`/portal/messages/${provider.companyId}`}
                  className="flex-1 rounded-xl bg-[#AF52DE] py-2 text-center text-sm font-medium text-white"
                >
                  Message
                </Link>
                <Link
                  href="/portal/request"
                  className="flex-1 rounded-xl border border-gray-200 py-2 text-center text-sm font-medium text-gray-700"
                >
                  Request Service
                </Link>
              </div>
              {confirmLeave === provider.companyId ? (
                <div className="mt-2 flex gap-2 rounded-xl bg-red-50 p-3">
                  <p className="flex-1 text-xs text-red-600">Remove this provider? This cannot be undone.</p>
                  <button
                    onClick={() => setConfirmLeave(null)}
                    className="rounded-lg px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleLeaveProvider(provider.companyId)}
                    disabled={leaving}
                    className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {leaving ? 'Removing...' : 'Confirm'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmLeave(provider.companyId)}
                  className="mt-2 w-full py-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                >
                  Leave Provider
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
