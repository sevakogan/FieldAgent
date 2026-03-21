'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getWorkerTodayJobs, updateWorkerJobStatus } from '@/lib/actions/worker';
import type { WorkerJobRow } from '@/lib/actions/worker';
import type { JobStatus } from '@/types/database';

type CheckInState = { jobId: string; loading: boolean } | null;

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  driving: { color: '#5AC8FA', bg: '#5AC8FA1A', label: 'Driving' },
  arrived: { color: '#FFD60A', bg: '#FFD60A1A', label: 'Arrived' },
  in_progress: { color: '#007AFF', bg: '#007AFF1A', label: 'In Progress' },
  completed: { color: '#34C759', bg: '#34C7591A', label: 'Complete' },
  charged: { color: '#34C759', bg: '#34C7591A', label: 'Charged' },
  scheduled: { color: '#8E8E93', bg: '#8E8E931A', label: 'Scheduled' },
  approved: { color: '#8E8E93', bg: '#8E8E931A', label: 'Approved' },
  requested: { color: '#FF9F0A', bg: '#FF9F0A1A', label: 'Requested' },
  pending_review: { color: '#AF52DE', bg: '#AF52DE1A', label: 'Pending Review' },
  cancelled: { color: '#FF3B30', bg: '#FF3B301A', label: 'Cancelled' },
};

function formatTime(time: string | null): string {
  if (!time) return 'TBD';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function StatusBadge({ status }: { readonly status: JobStatus }) {
  const config = STATUS_CONFIG[status] ?? { color: '#8E8E93', bg: '#8E8E931A', label: status };
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

function JobCard({
  job,
  index,
  checkInState,
  onCheckIn,
}: {
  readonly job: WorkerJobRow;
  readonly index: number;
  readonly checkInState: CheckInState;
  readonly onCheckIn: (jobId: string) => void;
}) {
  const address = [job.street, job.city, job.state].filter(Boolean).join(', ');
  const canCheckIn = job.status === 'scheduled' || job.status === 'approved';
  const isCheckingIn = checkInState?.jobId === job.id && checkInState.loading;

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
                {formatTime(job.scheduledTime)}
              </span>
              <span className="text-xs text-[#8E8E93]">{formatDuration(job.estimatedDuration)}</span>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
            {job.serviceName}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8E8E93] flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {address}
            </p>
            <span className="text-sm font-bold text-gray-900">
              ${job.price}
            </span>
          </div>
          {canCheckIn && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCheckIn(job.id);
              }}
              disabled={isCheckingIn}
              className="mt-3 w-full py-2 rounded-xl bg-[#5AC8FA] text-white text-sm font-semibold hover:bg-[#5AC8FA]/90 transition-colors disabled:opacity-50"
            >
              {isCheckingIn ? 'Checking In...' : 'Check In — Start Driving'}
            </button>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function WorkerTodayPage() {
  const [jobs, setJobs] = useState<WorkerJobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInState, setCheckInState] = useState<CheckInState>(null);

  const loadJobs = () => {
    getWorkerTodayJobs().then((res) => {
      if (res.success && res.data) {
        setJobs(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCheckIn = async (jobId: string) => {
    setCheckInState({ jobId, loading: true });
    const result = await updateWorkerJobStatus(jobId, 'driving');
    if (result.success) {
      loadJobs();
    }
    setCheckInState(null);
  };

  const completedCount = jobs.filter((j) => j.status === 'completed' || j.status === 'charged').length;
  const totalEarnings = jobs.reduce((sum, j) => sum + j.price, 0);
  const earnedToday = jobs
    .filter((j) => j.status === 'completed' || j.status === 'charged')
    .reduce((sum, j) => sum + j.price, 0);

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
          <p className="text-2xl font-black text-gray-900">{jobs.length}</p>
          <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Jobs</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-2xl font-black text-[#34C759]">
            {completedCount}/{jobs.length}
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
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-full bg-[#F2F2F7] flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">No jobs scheduled for today</p>
          <p className="text-xs text-[#8E8E93]">Check your calendar for upcoming jobs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} checkInState={checkInState} onCheckIn={handleCheckIn} />
          ))}
        </div>
      )}
    </div>
  );
}
