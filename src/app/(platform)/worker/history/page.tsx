'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type FilterPeriod = 'week' | 'month' | 'all';

interface CompletedJob {
  readonly id: string;
  readonly date: string;
  readonly clientName: string;
  readonly service: string;
  readonly address: string;
  readonly duration: string;
  readonly amount: number;
  readonly rating: number | null;
  readonly tip: number;
}

const COMPLETED_JOBS: readonly CompletedJob[] = [
  {
    id: 'h-001',
    date: 'Mar 20, 2026',
    clientName: 'Sarah Mitchell',
    service: 'Deep Clean - 3BR House',
    address: '1245 Elm Street, Portland',
    duration: '2h 45m',
    amount: 185,
    rating: 5,
    tip: 25,
  },
  {
    id: 'h-002',
    date: 'Mar 19, 2026',
    clientName: 'Emily Watson',
    service: 'Move-In Clean',
    address: '456 River Road',
    duration: '3h 20m',
    amount: 220,
    rating: 5,
    tip: 30,
  },
  {
    id: 'h-003',
    date: 'Mar 18, 2026',
    clientName: 'Sarah Mitchell',
    service: 'Deep Clean - 3BR House',
    address: '1245 Elm Street, Portland',
    duration: '2h 50m',
    amount: 185,
    rating: 4,
    tip: 20,
  },
  {
    id: 'h-004',
    date: 'Mar 18, 2026',
    clientName: 'Marcus Chen',
    service: 'Standard Clean - 2BR Apt',
    address: '890 Oak Avenue, Apt 4B',
    duration: '1h 55m',
    amount: 120,
    rating: 5,
    tip: 15,
  },
  {
    id: 'h-005',
    date: 'Mar 17, 2026',
    clientName: 'Tom Harris',
    service: 'Window Cleaning',
    address: '333 Pine Street',
    duration: '1h 30m',
    amount: 80,
    rating: null,
    tip: 0,
  },
  {
    id: 'h-006',
    date: 'Mar 16, 2026',
    clientName: 'Angela Davis',
    service: 'Standard Clean - 1BR',
    address: '720 Cedar Lane',
    duration: '1h 15m',
    amount: 85,
    rating: 5,
    tip: 10,
  },
  {
    id: 'h-007',
    date: 'Mar 15, 2026',
    clientName: 'Robert Kim',
    service: 'Deep Clean - 4BR House',
    address: '1890 Willow Court',
    duration: '4h 10m',
    amount: 280,
    rating: 5,
    tip: 40,
  },
  {
    id: 'h-008',
    date: 'Mar 14, 2026',
    clientName: 'Diana Cruz',
    service: 'Office Clean - Medium',
    address: '500 Commerce Blvd, Ste 300',
    duration: '2h',
    amount: 140,
    rating: 4,
    tip: 0,
  },
] as const;

function StarRating({ rating }: { readonly rating: number | null }) {
  if (rating === null) {
    return <span className="text-xs text-[#8E8E93]">No rating</span>;
  }
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i < rating ? '#FFD60A' : '#E5E5EA'}
          stroke="none"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

export default function WorkerHistoryPage() {
  const [filter, setFilter] = useState<FilterPeriod>('week');

  const totalEarnings = COMPLETED_JOBS.reduce((s, j) => s + j.amount, 0);
  const totalTips = COMPLETED_JOBS.reduce((s, j) => s + j.tip, 0);
  const avgRating =
    COMPLETED_JOBS.filter((j) => j.rating !== null).reduce(
      (s, j) => s + (j.rating ?? 0),
      0
    ) / COMPLETED_JOBS.filter((j) => j.rating !== null).length;

  return (
    <div className="p-5 max-w-lg mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-black text-gray-900 mb-5">History</h1>

      {/* Earnings Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-gray-900">
              ${totalEarnings.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Earnings</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#34C759]">
              ${totalTips}
            </p>
            <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Tips</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#FFD60A]">
              {avgRating.toFixed(1)}
            </p>
            <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {(['week', 'month', 'all'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setFilter(period)}
            className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filter === period ? 'text-white' : 'text-[#8E8E93]'
            }`}
          >
            {filter === period && (
              <motion.div
                layoutId="history-filter"
                className="absolute inset-0 bg-[#007AFF] rounded-lg"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 capitalize">
              {period === 'all' ? 'All Time' : `This ${period}`}
            </span>
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-2.5">
        {COMPLETED_JOBS.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link href={`/worker/jobs/${job.id}`} className="block no-underline">
              <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {job.clientName}
                    </p>
                    <p className="text-xs text-[#8E8E93]">{job.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${job.amount}</p>
                    {job.tip > 0 && (
                      <p className="text-[11px] font-medium text-[#34C759]">
                        +${job.tip} tip
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8E8E93]">{job.date}</span>
                    <span className="text-xs text-[#8E8E93]">&middot;</span>
                    <span className="text-xs text-[#8E8E93]">{job.duration}</span>
                  </div>
                  <StarRating rating={job.rating} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
