'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { getWorkerJobs, updateJobStatus, type WorkerJob } from '@/lib/actions/jobs'
import { StatusBadge } from '@/components/platform/Badge'

// ─── Status Flow ────────────────────────────────────────────────────
const STATUS_FLOW: Record<string, { next: string; label: string; emoji: string; color: string }> = {
  scheduled:   { next: 'driving',     label: 'Start Driving', emoji: '\u25B6',  color: 'bg-[#34C759] text-white' },
  driving:     { next: 'arrived',     label: "I've Arrived",  emoji: '\uD83D\uDCCD', color: 'bg-[#007AFF] text-white' },
  arrived:     { next: 'in_progress', label: 'Start Work',    emoji: '\uD83D\uDD27', color: 'bg-[#007AFF] text-white' },
  in_progress: { next: 'completed',   label: 'Complete Job',  emoji: '\u2713',  color: 'bg-[#34C759] text-white' },
}

const STATUS_BORDER: Record<string, string> = {
  scheduled:   'border-l-[#007AFF]',
  driving:     'border-l-[#5AC8FA]',
  arrived:     'border-l-[#FF9F0A]',
  in_progress: 'border-l-[#007AFF]',
  completed:   'border-l-[#34C759]',
}

function formatTime(time: string | null): string {
  if (!time) return 'No time set'
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function googleMapsUrl(street: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street}, ${city}`)}`
}

// ─── Job Card ───────────────────────────────────────────────────────
function JobCard({ job, onStatusUpdate }: { job: WorkerJob; onStatusUpdate: (id: string, status: string) => void }) {
  const [isPending, startTransition] = useTransition()
  const flow = STATUS_FLOW[job.status]
  const borderColor = STATUS_BORDER[job.status] ?? 'border-l-[#8E8E93]'

  function handleAction() {
    if (!flow) return
    startTransition(() => {
      onStatusUpdate(job.id, flow.next)
    })
  }

  return (
    <div
      className={`
        rounded-2xl border-l-4 ${borderColor}
        bg-white/70 backdrop-blur-xl shadow-sm
        p-4 space-y-3
      `}
      style={{ WebkitBackdropFilter: 'blur(20px)' }}
    >
      {/* Top row: service name + status */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-[#1C1C1E] leading-tight">{job.service_name}</h3>
        <StatusBadge status={job.status} />
      </div>

      {/* Address — tappable */}
      <a
        href={googleMapsUrl(job.address_street, job.address_city)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[#007AFF] text-sm font-medium active:opacity-70 transition-opacity"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <span className="underline underline-offset-2">{job.address_street}, {job.address_city}</span>
      </a>

      {/* Client + phone */}
      {job.client_name && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-[#3C3C43]">{job.client_name}</span>
          {job.client_phone && (
            <a
              href={`tel:${job.client_phone}`}
              className="inline-flex items-center gap-1.5 bg-[#34C759]/10 text-[#248A3D] px-3 py-2 rounded-xl text-sm font-semibold active:bg-[#34C759]/20 transition-colors min-h-[44px]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              Call
            </a>
          )}
        </div>
      )}

      {/* Time + Price row */}
      <div className="flex items-center justify-between text-sm text-[#8E8E93]">
        <span>{formatTime(job.scheduled_time)}</span>
        <span className="font-semibold text-[#1C1C1E]">{formatPrice(job.price)}</span>
      </div>

      {/* Action button */}
      {flow ? (
        <button
          onClick={handleAction}
          disabled={isPending}
          className={`
            w-full flex items-center justify-center gap-2
            ${flow.color} font-bold text-base
            rounded-2xl py-3 min-h-[48px]
            active:opacity-80 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isPending ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <span>{flow.emoji}</span>
              <span>{flow.label}</span>
            </>
          )}
        </button>
      ) : (
        <div className="w-full flex items-center justify-center gap-2 bg-[#F2F2F7] text-[#8E8E93] font-bold text-base rounded-2xl py-3 min-h-[48px]">
          Done
        </div>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────
export default function WorkerModePage() {
  const [jobs, setJobs] = useState<WorkerJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchJobs() {
    const result = await getWorkerJobs()
    if (result.success && result.data) {
      setJobs(result.data)
    } else {
      setError(result.error ?? 'Failed to load jobs')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  async function handleStatusUpdate(jobId: string, newStatus: string) {
    // Optimistic update
    setJobs(prev =>
      prev.map(j => j.id === jobId ? { ...j, status: newStatus as WorkerJob['status'] } : j)
    )

    const result = await updateJobStatus(jobId, newStatus)
    if (!result.success) {
      // Revert on failure
      await fetchJobs()
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-[#007AFF] text-sm font-medium active:opacity-70 transition-opacity min-h-[44px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Today&apos;s Jobs</h1>
        <p className="text-sm text-[#8E8E93] mt-0.5">{today}</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-[#007AFF]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <div className="text-4xl">🎉</div>
          <p className="text-lg font-semibold text-[#1C1C1E]">No jobs today</p>
          <p className="text-sm text-[#8E8E93]">Enjoy your day off!</p>
        </div>
      )}

      {/* Job list */}
      {!loading && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      )}

      {/* Summary footer */}
      {!loading && jobs.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between text-sm" style={{ WebkitBackdropFilter: 'blur(20px)' }}>
          <span className="text-[#8E8E93]">{jobs.length} job{jobs.length !== 1 ? 's' : ''} today</span>
          <span className="font-bold text-[#1C1C1E]">
            {formatPrice(jobs.reduce((sum, j) => sum + j.price, 0))}
          </span>
        </div>
      )}
    </div>
  )
}
