'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getJob, updateJobStatus, updateJob, deleteJob, type JobDetail } from '@/lib/actions/jobs'
import type { JobStatus } from '@/types/database'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'

const STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  approved: 'Approved',
  scheduled: 'Scheduled',
  driving: 'Driving',
  arrived: 'Arrived',
  in_progress: 'In Progress',
  pending_review: 'Pending Review',
  revision_needed: 'Revision Needed',
  completed: 'Completed',
  charged: 'Charged',
  cancelled: 'Cancelled',
}

const STATUS_FLOW: Record<string, string[]> = {
  requested: ['approved', 'cancelled'],
  approved: ['scheduled', 'cancelled'],
  scheduled: ['driving', 'in_progress', 'cancelled'],
  driving: ['arrived', 'cancelled'],
  arrived: ['in_progress', 'cancelled'],
  in_progress: ['pending_review', 'completed', 'cancelled'],
  pending_review: ['completed', 'revision_needed'],
  revision_needed: ['in_progress', 'cancelled'],
  completed: ['charged'],
  charged: [],
  cancelled: [],
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editPrice, setEditPrice] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')

  const fetchJob = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getJob(jobId)
    if (result.success && result.data) {
      setJob(result.data)
      setEditPrice(String(result.data.price))
      setEditDate(result.data.scheduled_date)
      setEditTime(result.data.scheduled_time ?? '')
    } else {
      setError(result.error ?? 'Failed to load job')
    }
    setLoading(false)
  }, [jobId])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  async function handleStatusChange(newStatus: string) {
    if (!job) return
    setUpdating(true)
    const result = await updateJobStatus(jobId, newStatus)
    if (result.success) {
      setJob({ ...job, status: newStatus as JobStatus })
    } else {
      setError(result.error ?? 'Failed to update status')
    }
    setUpdating(false)
  }

  async function handleSaveEdit() {
    if (!job) return
    setUpdating(true)
    const price = parseFloat(editPrice)
    if (isNaN(price) || price < 0) {
      setError('Invalid price')
      setUpdating(false)
      return
    }

    const result = await updateJob(jobId, {
      price,
      scheduled_date: editDate,
      scheduled_time: editTime || null,
    })

    if (result.success) {
      setJob({
        ...job,
        price,
        scheduled_date: editDate,
        scheduled_time: editTime || null,
      })
      setEditing(false)
    } else {
      setError(result.error ?? 'Failed to update job')
    }
    setUpdating(false)
  }

  async function handleDelete() {
    setUpdating(true)
    const result = await deleteJob(jobId)
    if (result.success) {
      router.push('/dashboard/jobs')
    } else {
      setError(result.error ?? 'Failed to delete job')
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !job) {
    return (
      <div>
        <Link href="/dashboard/jobs" className="text-[#007AFF] text-sm mb-4 inline-block">&larr; Back to Jobs</Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      </div>
    )
  }

  if (!job) return null

  const nextStatuses = STATUS_FLOW[job.status] ?? []
  const fullAddress = [job.address_street, job.address_unit, job.address_city, job.address_state, job.address_zip]
    .filter(Boolean)
    .join(', ')

  return (
    <div>
      <Link href="/dashboard/jobs" className="text-[#007AFF] text-sm mb-2 inline-block">&larr; Jobs</Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Job Details</h1>
        <StatusBadge status={job.status} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Details card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1E]">Details</h2>
              {!editing && job.status !== 'completed' && job.status !== 'charged' && job.status !== 'cancelled' && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-[#007AFF] text-sm font-medium hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">Scheduled Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8E8E93] mb-1">Time</label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#8E8E93] mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={updating}
                    loading={updating}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditing(false)
                      setEditPrice(String(job.price))
                      setEditDate(job.scheduled_date)
                      setEditTime(job.scheduled_time ?? '')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#8E8E93]">Address</p>
                  <p className="text-[#1C1C1E] font-medium">{fullAddress}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Service</p>
                  <p className="text-[#1C1C1E] font-medium">{job.service_name}</p>
                  {job.service_description && (
                    <p className="text-xs text-[#8E8E93]">{job.service_description}</p>
                  )}
                </div>
                <div>
                  <p className="text-[#8E8E93]">Worker</p>
                  <p className="text-[#1C1C1E] font-medium">{job.worker_name ?? 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Source</p>
                  <p className="text-[#1C1C1E] font-medium capitalize">{job.source.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Date</p>
                  <p className="text-[#1C1C1E] font-medium">
                    {new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[#8E8E93]">Time</p>
                  <p className="text-[#1C1C1E] font-medium">{job.scheduled_time ?? 'Not set'}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Checklist */}
          {job.checklist_results && Object.keys(job.checklist_results).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
            >
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Checklist</h2>
              <div className="space-y-2">
                {Object.entries(job.checklist_results).map(([key, value]) => {
                  const done = Boolean(value)
                  return (
                  <div key={key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F2F2F7]">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        done ? 'bg-[#34C759] border-[#34C759]' : 'border-[#E5E5EA]'
                      }`}
                    >
                      {done && <span className="text-white text-xs">&#10003;</span>}
                    </div>
                    <span className={`text-sm ${done ? 'text-[#8E8E93] line-through' : 'text-[#1C1C1E]'}`}>
                      {key}
                    </span>
                  </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-5"
          >
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Pricing</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Service</span>
                <span className="text-[#1C1C1E]">${Number(job.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Expenses</span>
                <span className="text-[#1C1C1E]">${Number(job.expenses_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Tax</span>
                <span className="text-[#1C1C1E]">${Number(job.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Tip</span>
                <span className="text-[#34C759]">${Number(job.tip_amount).toFixed(2)}</span>
              </div>
              {job.total_charged !== null && (
                <div className="border-t border-[#E5E5EA] pt-2 flex justify-between font-semibold">
                  <span className="text-[#1C1C1E]">Total Charged</span>
                  <span className="text-[#1C1C1E]">${Number(job.total_charged).toFixed(2)}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Status actions */}
          {nextStatuses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              {nextStatuses.map((s) => {
                const isCancel = s === 'cancelled'
                const variant = isCancel ? 'danger' : s === 'completed' || s === 'charged' ? 'success' : 'primary'
                return (
                  <Button
                    key={s}
                    variant={variant}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating}
                    className="w-full"
                  >
                    {isCancel ? 'Cancel Job' : `Mark as ${STATUS_LABELS[s] ?? s}`}
                  </Button>
                )
              })}
            </motion.div>
          )}

          {/* Delete */}
          {job.status !== 'charged' && (
            <div>
              {showDeleteConfirm ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-red-700">Are you sure you want to delete this job? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      disabled={updating}
                      loading={updating}
                      className="flex-1"
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      No, Keep
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full"
                >
                  Delete Job
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
