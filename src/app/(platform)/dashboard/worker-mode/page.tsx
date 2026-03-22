'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getWorkerJobs, updateJobStatus, type WorkerJob } from '@/lib/actions/jobs'
import { StatusBadge } from '@/components/platform/Badge'

const PACIFIC_TZ = 'America/Los_Angeles'

const STATUS_FLOW: Record<string, { next: string; label: string; emoji: string; color: string }> = {
  scheduled:   { next: 'driving',     label: 'Start Driving', emoji: '▶',  color: 'bg-[#34C759] text-white' },
  driving:     { next: 'arrived',     label: "I've Arrived",  emoji: '📍', color: 'bg-[#007AFF] text-white' },
  arrived:     { next: 'in_progress', label: 'Start Work',    emoji: '🔧', color: 'bg-[#007AFF] text-white' },
  in_progress: { next: 'completed',   label: 'Complete Job',  emoji: '✓',  color: 'bg-[#34C759] text-white' },
}

const STATUS_BORDER: Record<string, string> = {
  scheduled: 'border-l-[#007AFF]', driving: 'border-l-[#5AC8FA]',
  arrived: 'border-l-[#FF9F0A]', in_progress: 'border-l-[#007AFF]',
  completed: 'border-l-[#34C759]',
}

function fmtTime(t: string | null) {
  if (!t) return 'No time set'
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

type Tab = 'jobs' | 'history' | 'account'

export default function WorkerModePage() {
  const [jobs, setJobs] = useState<WorkerJob[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('jobs')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await getWorkerJobs()
      if (result.success && result.data) setJobs(result.data)
      setLoading(false)
    }
    load()
  }, [])

  const handleStatusChange = (jobId: string, newStatus: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } as WorkerJob : j))
    startTransition(async () => {
      await updateJobStatus(jobId, newStatus)
    })
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: PACIFIC_TZ })
  const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'charged' && j.status !== 'cancelled')
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'charged')
  const totalEarned = completedJobs.reduce((s, j) => s + (j.price ?? 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-[#007AFF] text-sm font-medium hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
          Dashboard
        </Link>
        <span className="text-[10px] text-[#8E8E93] font-medium">{todayStr}</span>
      </div>

      {/* Worker header card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-4"
        style={{ background: 'linear-gradient(135deg, #34C759 0%, #30B350 100%)', boxShadow: '0 4px 20px rgba(52,199,89,0.2)' }}>
        <h1 className="text-lg font-bold text-white">Worker Mode</h1>
        <p className="text-white/70 text-xs mt-0.5">{activeJobs.length} active · {completedJobs.length} done · ${totalEarned.toFixed(0)} earned</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-[#F2F2F7] rounded-2xl p-0.5 mb-4">
        {([
          { key: 'jobs' as Tab, label: 'My Jobs', count: activeJobs.length },
          { key: 'history' as Tab, label: 'Completed', count: completedJobs.length },
          { key: 'account' as Tab, label: 'Account', count: 0 },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all relative ${
              tab === t.key ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93]'
            }`}>
            {t.label}
            {t.count > 0 && tab !== t.key && (
              <span className="ml-1 text-[9px] bg-[#007AFF]/10 text-[#007AFF] px-1.5 py-0.5 rounded-lg">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 border-3 border-[#34C759] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* Active Jobs Tab */}
          {tab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              {activeJobs.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-sm font-semibold text-[#1C1C1E]">All caught up!</p>
                  <p className="text-xs text-[#8E8E93] mt-1">No active jobs right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeJobs.map((job, i) => {
                    const flow = STATUS_FLOW[job.status]
                    const border = STATUS_BORDER[job.status] ?? 'border-l-[#8E8E93]'
                    return (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`glass rounded-2xl p-4 border-l-[4px] ${border}`}>
                        {/* Service + Status */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-base font-bold text-[#1C1C1E]">{job.service_name}</h3>
                            <p className="text-xs text-[#8E8E93] mt-0.5">{fmtTime(job.scheduled_time)}</p>
                          </div>
                          <StatusBadge status={job.status} />
                        </div>

                        {/* Address — Google Maps link */}
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(job.address_street + ', ' + job.address_city)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 py-2 px-3 bg-[#F2F2F7] rounded-xl mb-2 hover:bg-[#E5E5EA] transition-colors"
                          onClick={e => e.stopPropagation()}>
                          <svg className="w-4 h-4 text-[#007AFF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="text-xs text-[#007AFF] font-medium">{job.address_street}, {job.address_city}</span>
                        </a>

                        {/* Client phone */}
                        {job.client_phone && (
                          <a href={`tel:${job.client_phone}`}
                            className="flex items-center gap-2 py-2 px-3 bg-[#34C759]/8 rounded-xl mb-3 hover:bg-[#34C759]/15 transition-colors"
                            onClick={e => e.stopPropagation()}>
                            <svg className="w-4 h-4 text-[#34C759] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-xs text-[#34C759] font-medium">
                              {job.client_name ? `${job.client_name} · ` : ''}{job.client_phone}
                            </span>
                          </a>
                        )}

                        {/* Price + Action */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-[#1C1C1E]">${(job.price ?? 0).toFixed(0)}</span>
                          {flow && (
                            <button
                              onClick={() => handleStatusChange(job.id, flow.next)}
                              disabled={isPending}
                              className={`px-4 py-2.5 rounded-2xl text-sm font-bold ${flow.color} transition-all active:scale-95 disabled:opacity-50 shadow-sm`}>
                              {flow.emoji} {flow.label}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Completed Jobs Tab */}
          {tab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {completedJobs.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl">
                  <p className="text-sm text-[#8E8E93]">No completed jobs yet today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {completedJobs.map(job => (
                    <div key={job.id} className="glass rounded-2xl p-3 flex items-center gap-3 border-l-[3px] border-l-[#34C759]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1C1C1E] truncate">{job.service_name}</p>
                        <p className="text-[10px] text-[#8E8E93] truncate">{job.address_street} · {fmtTime(job.scheduled_time)}</p>
                      </div>
                      <span className="text-sm font-bold text-[#34C759]">${(job.price ?? 0).toFixed(0)}</span>
                      <span className="text-xs">✓</span>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <p className="text-xs text-[#8E8E93]">Total earned today: <strong className="text-[#1C1C1E]">${totalEarned.toFixed(2)}</strong></p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Account Tab */}
          {tab === 'account' && (
            <motion.div key="account" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="glass rounded-2xl p-4 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#34C759] flex items-center justify-center text-white text-xl font-bold mx-auto">
                    👷
                  </div>
                  <p className="text-sm font-bold text-[#1C1C1E] mt-2">Worker Account</p>
                  <p className="text-xs text-[#8E8E93]">View your stats and settings</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#F2F2F7] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-[#007AFF]">{jobs.length}</p>
                    <p className="text-[9px] text-[#8E8E93] font-medium">Today</p>
                  </div>
                  <div className="bg-[#F2F2F7] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-[#34C759]">{completedJobs.length}</p>
                    <p className="text-[9px] text-[#8E8E93] font-medium">Done</p>
                  </div>
                  <div className="bg-[#F2F2F7] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-[#FF9F0A]">${totalEarned.toFixed(0)}</p>
                    <p className="text-[9px] text-[#8E8E93] font-medium">Earned</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
