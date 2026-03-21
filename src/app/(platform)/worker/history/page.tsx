'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getWorkerCompletedJobs } from '@/lib/actions/worker';
import type { CompletedJobRow } from '@/lib/actions/worker';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt || !endedAt) return '—';
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const diffMs = end - start;
  if (diffMs <= 0) return '—';
  const totalMin = Math.round(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

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
  const [jobs, setJobs] = useState<CompletedJobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkerCompletedJobs().then((res) => {
      if (res.success && res.data) {
        setJobs(res.data);
      }
      setLoading(false);
    });
  }, []);

  const totalEarnings = jobs.reduce((s, j) => s + j.price, 0);
  const totalTips = jobs.reduce((s, j) => s + j.tipAmount, 0);
  const ratedJobs = jobs.filter((j) => j.rating !== null);
  const avgRating = ratedJobs.length > 0
    ? ratedJobs.reduce((s, j) => s + (j.rating ?? 0), 0) / ratedJobs.length
    : 0;

  const handleDownloadSummary = useCallback(() => {
    const lines = [
      'Job History Summary',
      '='.repeat(40),
      `Total Jobs: ${jobs.length}`,
      `Total Earnings: $${totalEarnings.toLocaleString()}`,
      `Total Tips: $${totalTips}`,
      `Average Rating: ${ratedJobs.length > 0 ? avgRating.toFixed(1) : 'N/A'}`,
      '',
      'Jobs:',
      '-'.repeat(40),
      ...jobs.map(
        (j) =>
          `${formatDate(j.scheduledDate)} | ${j.serviceName} | ${j.street} | $${j.price}${j.tipAmount > 0 ? ` (+$${j.tipAmount} tip)` : ''} | ${j.rating !== null ? `${j.rating}/5` : 'No rating'}`
      ),
    ];
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [jobs, totalEarnings, totalTips, ratedJobs.length, avgRating]);

  const [copied, setCopied] = useState(false);

  return (
    <div className="p-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black text-gray-900">History</h1>
        {jobs.length > 0 && (
          <button
            onClick={handleDownloadSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-sm font-semibold text-[#007AFF] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:bg-blue-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
            {copied ? 'Copied!' : 'Download Summary'}
          </button>
        )}
      </div>

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
              {ratedJobs.length > 0 ? avgRating.toFixed(1) : '—'}
            </p>
            <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-full bg-[#F2F2F7] flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">No completed jobs yet</p>
          <p className="text-xs text-[#8E8E93]">Completed jobs will appear here</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job, i) => (
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
                        {job.serviceName}
                      </p>
                      <p className="text-xs text-[#8E8E93]">{job.street}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${job.price}</p>
                      {job.tipAmount > 0 && (
                        <p className="text-[11px] font-medium text-[#34C759]">
                          +${job.tipAmount} tip
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8E8E93]">{formatDate(job.scheduledDate)}</span>
                      <span className="text-xs text-[#8E8E93]">&middot;</span>
                      <span className="text-xs text-[#8E8E93]">{formatDuration(job.startedAt, job.endedAt)}</span>
                    </div>
                    <StarRating rating={job.rating} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
