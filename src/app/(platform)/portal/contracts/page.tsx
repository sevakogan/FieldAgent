'use client';

import { useState } from 'react';

interface Contract {
  readonly id: string;
  readonly title: string;
  readonly provider: string;
  readonly property: string;
  readonly startDate: string;
  readonly endDate: string;
  status: 'active' | 'pending' | 'expired';
  signed: boolean;
  signedDate: string | null;
  readonly monthlyRate: number | null;
  readonly terms: string[];
}

const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'ctr-1',
    title: 'Annual Cleaning Service Agreement',
    provider: 'SparkleClean Co.',
    property: '742 Evergreen Terrace',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active',
    signed: true,
    signedDate: '2025-12-20',
    monthlyRate: 150.00,
    terms: [
      'Bi-weekly standard cleaning service',
      'Includes kitchen, bathrooms, bedrooms, living areas',
      'Eco-friendly products upon request (+$15/visit)',
      '48-hour cancellation policy',
      'Rate locked for contract duration',
      'Provider maintains $2M liability insurance',
    ],
  },
  {
    id: 'ctr-2',
    title: 'STR Turnover Cleaning Agreement',
    provider: 'SparkleClean Co.',
    property: '123 Ocean Ave, Unit 4B',
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    status: 'pending',
    signed: false,
    signedDate: null,
    monthlyRate: null,
    terms: [
      'Per-turnover cleaning at $120/visit (1BR unit)',
      'Automated scheduling via Airbnb integration',
      'Linen service included',
      'Same-day turnover guaranteed if booked by 10 AM',
      'Quality photo documentation after each clean',
      'Provider maintains $2M liability insurance',
    ],
  },
  {
    id: 'ctr-3',
    title: 'Window Washing Service Contract',
    provider: 'ClearView Pros',
    property: '742 Evergreen Terrace',
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    status: 'expired',
    signed: true,
    signedDate: '2025-09-25',
    monthlyRate: null,
    terms: [
      'Quarterly window washing (interior + exterior)',
      '12 windows per visit',
      'Screen cleaning included',
      'Weather reschedule at no charge',
    ],
  },
];

const STATUS_STYLES = {
  active: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  expired: 'bg-gray-100 text-gray-500',
} as const;

export default function ContractsPage() {
  const [contracts, setContracts] = useState(MOCK_CONTRACTS);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState('');

  const handleSign = (contractId: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, signed: true, signedDate: '2026-03-20', status: 'active' as const }
          : c
      )
    );
    setSigningId(null);
    setSignatureName('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{contract.title}</h3>
                <p className="text-sm text-gray-500">{contract.provider}</p>
                <p className="text-xs text-gray-400">{contract.property}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[contract.status]}`}>
                {contract.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-400">Start</p>
                <p className="font-medium text-gray-900">{new Date(contract.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-gray-400">End</p>
                <p className="font-medium text-gray-900">{new Date(contract.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="mb-2 text-sm font-medium text-gray-700">Terms</p>
              <ul className="space-y-1">
                {contract.terms.map((term, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            {/* Signature area */}
            {contract.signed ? (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700">
                    Signed on {new Date(contract.signedDate!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ) : signingId === contract.id ? (
              <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                <p className="text-sm font-medium text-gray-700">Type your full name to sign</p>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Sarah Miller"
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
                    disabled={!signatureName.trim()}
                    className="flex-1 rounded-2xl bg-[#AF52DE] py-3 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Sign Contract
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <button
                  onClick={() => setSigningId(contract.id)}
                  className="w-full rounded-2xl bg-[#AF52DE] py-3 text-sm font-semibold text-white"
                >
                  Review & Sign
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
