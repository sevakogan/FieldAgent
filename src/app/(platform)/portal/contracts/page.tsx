'use client';

import { useState, useEffect } from 'react';
import { getPortalContracts, signPortalContract } from '@/lib/actions/portal';
import type { PortalContract } from '@/lib/actions/portal';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-yellow-50 text-yellow-700',
  signed: 'bg-green-50 text-green-700',
  expired: 'bg-gray-100 text-gray-500',
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<PortalContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    getPortalContracts().then(result => {
      setContracts(result.success && result.data ? result.data : []);
      setLoading(false);
    });
  }, []);

  const handleSign = async (contractId: string) => {
    setSigning(true);
    const result = await signPortalContract(contractId);
    if (result.success) {
      setContracts(prev => prev.map(c =>
        c.id === contractId
          ? { ...c, status: 'signed', signedAt: new Date().toISOString() }
          : c
      ));
    }
    setSigningId(null);
    setSignatureName('');
    setSigning(false);
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AF52DE] border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>

      {contracts.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400">No contracts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{contract.title}</h3>
                  <p className="text-sm text-gray-500">{contract.companyName}</p>
                  <p className="text-xs text-gray-400">
                    Created {new Date(contract.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[contract.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {contract.status}
                </span>
              </div>

              {/* Content preview */}
              {contract.content && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="line-clamp-3 text-sm text-gray-600">{contract.content}</p>
                </div>
              )}

              {/* Signature area */}
              {contract.status === 'signed' && contract.signedAt ? (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-700">
                      Signed on {new Date(contract.signedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ) : contract.status === 'sent' ? (
                signingId === contract.id ? (
                  <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                    <p className="text-sm font-medium text-gray-700">Type your full name to sign</p>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-xl border border-gray-200 bg-[#F2F2F7] px-3 py-2.5 text-sm outline-none focus:border-[#AF52DE]"
                    />
                    {signatureName && (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-[#F2F2F7] p-4 text-center">
                        <p className="font-serif text-2xl italic text-gray-700">{signatureName}</p>
                        <p className="mt-1 text-xs text-gray-400">Electronic Signature Preview</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setSigningId(null); setSignatureName(''); }}
                        className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSign(contract.id)}
                        disabled={!signatureName.trim() || signing}
                        className="flex-1 rounded-2xl bg-[#AF52DE] py-3 text-sm font-semibold text-white disabled:opacity-40"
                      >
                        {signing ? 'Signing...' : 'Sign Contract'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => setSigningId(contract.id)}
                      className="w-full rounded-2xl bg-[#AF52DE] py-3 text-sm font-semibold text-white"
                    >
                      Review &amp; Sign
                    </button>
                  </div>
                )
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
