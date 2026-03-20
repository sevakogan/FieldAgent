'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

type JobStatus = 'DRIVING' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETE' | 'SCHEDULED';

const STATUS_CONFIG: Record<JobStatus, { color: string; bg: string; label: string }> = {
  DRIVING: { color: '#5AC8FA', bg: '#5AC8FA1A', label: 'Driving' },
  ARRIVED: { color: '#FFD60A', bg: '#FFD60A1A', label: 'Arrived' },
  IN_PROGRESS: { color: '#007AFF', bg: '#007AFF1A', label: 'In Progress' },
  COMPLETE: { color: '#34C759', bg: '#34C7591A', label: 'Complete' },
  SCHEDULED: { color: '#8E8E93', bg: '#8E8E931A', label: 'Scheduled' },
};

interface Job {
  readonly id: string;
  readonly time: string;
  readonly clientName: string;
  readonly address: string;
  readonly service: string;
  readonly duration: string;
  readonly status: JobStatus;
  readonly amount: number;
}

const TODAYS_JOBS: readonly Job[] = [
  {
    id: 'j-001',
    time: '8:00 AM',
    clientName: 'Sarah Mitchell',
    address: '1245 Elm Street, Portland, OR',
    service: 'Deep Clean - 3BR House',
    duration: '3h',
    status: 'COMPLETE',
    amount: 185,
  },
  {
    id: 'j-002',
    time: '11:30 AM',
    clientName: 'Marcus Chen',
    address: '890 Oak Avenue, Apt 4B',
    service: 'Standard Clean - 2BR Apt',
    duration: '2h',
    status: 'IN_PROGRESS',
    amount: 120,
  },
  {
    id: 'j-003',
    time: '2:00 PM',
    clientName: 'Linda Park',
    address: '567 Maple Drive, Suite 200',
    service: 'Office Clean - Small',
    duration: '1.5h',
    status: 'SCHEDULED',
    amount: 95,
  },
  {
    id: 'j-004',
    time: '4:30 PM',
    clientName: 'James Rodriguez',
    address: '2100 Pine Blvd, Portland, OR',
    service: 'Move-Out Clean - 1BR',
    duration: '2.5h',
    status: 'SCHEDULED',
    amount: 150,
  },
] as const;

function StatusBadge({ status }: { readonly status: JobStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}

function JobCard({ job, index }: { readonly job: Job; readonly index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link
        href={`/worker/jobs/${job.id}`}
        className="block no-underline"
      >
        <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {job.time}
              </span>
              <span className="text-xs text-[#8E8E93]">{job.duration}</span>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
            {job.clientName}
          </h3>
          <p className="text-sm text-[#8E8E93] mb-2">{job.service}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8E8E93] flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.address}
            </p>
            <span className="text-sm font-bold text-gray-900">
              ${job.amount}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function WorkerTodayPage() {
  const completedCount = TODAYS_JOBS.filter((j) => j.status === 'COMPLETE').length;
  const totalEarnings = TODAYS_JOBS.reduce((sum, j) => sum + j.amount, 0);
  const earnedToday = TODAYS_JOBS.filter((j) => j.status === 'COMPLETE').reduce(
    (sum, j) => sum + j.amount,
    0
  );

  return (
    <div className="p-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-[#8E8E93] font-medium">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h1 className="text-2xl font-black text-gray-900 mt-1">
          Today&apos;s Schedule
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-2xl font-black text-gray-900">{TODAYS_JOBS.length}</p>
          <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Jobs</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-2xl font-black text-[#34C759]">
            {completedCount}/{TODAYS_JOBS.length}
          </p>
          <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Done</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-2xl font-black text-gray-900">
            ${earnedToday}
          </p>
          <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">
            of ${totalEarnings}
          </p>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {TODAYS_JOBS.map((job, i) => (
          <JobCard key={job.id} job={job} index={i} />
        ))}
      </div>
    </div>
  );
}
