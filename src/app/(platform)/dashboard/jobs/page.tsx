'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getJobs, updateJobStatus, type JobRow } from '@/lib/actions/jobs'
import { StatusBadge } from '@/components/platform/Badge'

const STATUSES = ['all', 'scheduled', 'in_progress', 'pending_review', 'completed', 'cancelled'] as const

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  pending_review: 'Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [startingJobId, setStartingJobId] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getJobs({ status: filter })
    if (result.success && result.data) {
      setJobs(result.data)
    } else {
      setError(result.error ?? 'Failed to load jobs')
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase()
    return (
      j.address_street.toLowerCase().includes(q) ||
      j.address_city.toLowerCase().includes(q) ||
      j.service_name.toLowerCase().includes(q) ||
      (j.worker_name ?? '').toLowerCase().includes(q)
    )
  })

  async function handleStartJob(e: React.MouseEvent, jobId: string) {
    e.stopPropagation()
    setStartingJobId(jobId)
    const result = await updateJobStatus(jobId, 'driving')
    if (result.success) {
      await fetchJobs()
    } else {
      setError(result.error ?? 'Failed to start job')
    }
    setStartingJobId(null)
  }

  function handleRowClick(jobId: string) {
    router.push(`/dashboard/jobs/${jobId}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Jobs</h1>
        <Link
          href="/dashboard/jobs/new"
          className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
        >
          + New Job
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-[#3C3C43] border border-[#E5E5EA]'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by address, service, or worker..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No jobs yet</h2>
          <p className="text-sm text-[#8E8E93] mb-5">Schedule your first job to get started.</p>
          <Link
            href="/dashboard/jobs/new"
            className="inline-block px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
          >
            Schedule Your First Job
          </Link>
        </motion.div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <table className="w-full hidden md:table">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-3 text-xs font-medium text-[#8E8E93] uppercase">Address</th>
                <th className="text-left p-3 text-xs font-medium text-[#8E8E93] uppercase">Service</th>
                <th className="text-left p-3 text-xs font-medium text-[#8E8E93] uppercase">Worker</th>
                <th className="text-left p-3 text-xs font-medium text-[#8E8E93] uppercase">Date / Time</th>
                <th className="text-right p-3 text-xs font-medium text-[#8E8E93] uppercase">Price</th>
                <th className="text-center p-3 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {filtered.map((job, i) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleRowClick(job.id)}
                  className="group cursor-pointer transition-all duration-150 hover:bg-[#F2F2F7] border-l-2 border-l-transparent hover:border-l-[#007AFF]"
                >
                  <td className="p-3">
                    <p className="text-sm font-medium text-[#1C1C1E] group-hover:text-[#007AFF] transition-colors">
                      {job.address_street}
                    </p>
                    <p className="text-xs text-[#8E8E93]">{job.address_city}</p>
                  </td>
                  <td className="p-3 text-sm text-[#1C1C1E]">{job.service_name}</td>
                  <td className="p-3 text-sm text-[#8E8E93]">{job.worker_name ?? 'Unassigned'}</td>
                  <td className="p-3">
                    <p className="text-sm text-[#1C1C1E]">{new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString()}</p>
                    {job.scheduled_time && (
                      <p className="text-xs text-[#8E8E93]">{job.scheduled_time}</p>
                    )}
                  </td>
                  <td className="p-3 text-sm text-right font-medium text-[#1C1C1E]">
                    ${Number(job.price).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <StatusBadge status={job.status} />
                      {job.status === 'scheduled' && (
                        <button
                          onClick={(e) => handleStartJob(e, job.id)}
                          disabled={startingJobId === job.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded-lg bg-[#34C759] text-white font-semibold hover:bg-[#2DB84E] active:bg-[#28A745] disabled:opacity-50"
                        >
                          {startingJobId === job.id ? '...' : 'Start'}
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-[#8E8E93]">
                    No jobs match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile list */}
          <div className="md:hidden divide-y divide-[#E5E5EA]">
            {filtered.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 hover:bg-[#F2F2F7] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1C1E] truncate">{job.address_street}</p>
                    <p className="text-xs text-[#8E8E93]">
                      {job.service_name} · {job.worker_name ?? 'Unassigned'} · {new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-sm font-medium text-[#1C1C1E]">${Number(job.price).toFixed(2)}</span>
                    <StatusBadge status={job.status} />
                  </div>
                </Link>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-[#8E8E93]">
                No jobs match your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
