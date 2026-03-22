'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  getDashboardStats, getRecentJobs, getRecentActivity,
  getWeeklyRevenue, getJobStatusCounts,
  type DashboardStats, type RecentJob, type ActivityEntry,
  type WeeklyRevenuePoint, type JobStatusCount,
} from '@/lib/actions/dashboard'
import { StatusBadge } from '@/components/platform/Badge'
import { Button } from '@/components/platform/Button'

const PACIFIC_TZ = 'America/Los_Angeles'

function formatCurrency(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }
function formatTime(t: string | null) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h, 10)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function hashStr(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }

const SERVICE_PALETTES = [
  { bg: 'rgba(0,122,255,0.10)', border: '#007AFF', text: '#0055B3' },
  { bg: 'rgba(175,82,222,0.10)', border: '#AF52DE', text: '#8B44B8' },
  { bg: 'rgba(255,159,10,0.12)', border: '#FF9F0A', text: '#CC7F08' },
  { bg: 'rgba(52,199,89,0.10)', border: '#34C759', text: '#248A3D' },
  { bg: 'rgba(255,45,85,0.10)', border: '#FF2D55', text: '#D62246' },
  { bg: 'rgba(90,200,250,0.12)', border: '#5AC8FA', text: '#2E8EB8' },
  { bg: 'rgba(255,214,10,0.14)', border: '#FFD60A', text: '#8B7500' },
  { bg: 'rgba(88,86,214,0.10)', border: '#5856D6', text: '#4745AB' },
]

const STATUS_CHART_COLORS: Record<string, string> = {
  scheduled: '#007AFF', in_progress: '#FFD60A', completed: '#34C759',
  pending_review: '#AF52DE', cancelled: '#8E8E93', driving: '#5AC8FA',
  arrived: '#FF9F0A', charged: '#34C759', requested: '#C7C7CC',
}

function getServicePalette(name: string) { return SERVICE_PALETTES[hashStr(name) % SERVICE_PALETTES.length] }

export default function DashboardOverview() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [jobs, setJobs] = useState<RecentJob[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenuePoint[]>([])
  const [statusCounts, setStatusCounts] = useState<JobStatusCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [s, j, a, w, sc] = await Promise.all([
        getDashboardStats(), getRecentJobs(), getRecentActivity(),
        getWeeklyRevenue(), getJobStatusCounts(),
      ])
      if (s.success && s.data) setStats(s.data)
      if (j.success && j.data) setJobs(j.data)
      if (a.success && a.data) setActivity(a.data)
      if (w.success && w.data) setWeeklyRevenue(w.data)
      if (sc.success && sc.data) setStatusCounts(sc.data)
      setLoading(false)
    }
    load()
  }, [])

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: PACIFIC_TZ })
  const completedToday = jobs.filter(j => j.status === 'completed' || j.status === 'charged').length
  const totalToday = stats?.jobsToday ?? jobs.length
  const progressPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0
  const nextJob = jobs.find(j => j.status === 'scheduled' || j.status === 'driving' || j.status === 'arrived' || j.status === 'in_progress')

  // Week strip
  const weekDays = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [])

  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })

  // Jobs counts per week day
  const jobsByWeekDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const j of jobs) {
      map.set(j.scheduled_date ?? '', (map.get(j.scheduled_date ?? '') ?? 0) + 1)
    }
    return map
  }, [jobs])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Hero Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #E8F0FE 0%, #D4E4FB 40%, #C7D8F5 100%)',
          boxShadow: '0 8px 32px rgba(0,122,255,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#007AFF] uppercase tracking-wider">Today</p>
              <h1 className="text-2xl font-bold text-[#1C1C1E] mt-0.5">{todayStr}</h1>
            </div>
            {/* Progress ring */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" stroke="#E5E5EA" strokeWidth="4" fill="none" />
                <circle cx="28" cy="28" r="24" stroke="#007AFF" strokeWidth="4" fill="none"
                  strokeDasharray={`${(progressPct / 100) * 150.8} 150.8`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-[#1C1C1E]">{progressPct}%</span>
                <span className="text-[7px] text-[#8E8E93] leading-none">done</span>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="flex gap-4 mt-4">
            {[
              { label: 'Jobs', value: String(totalToday), color: '#007AFF' },
              { label: 'Revenue', value: formatCurrency(stats?.revenueMTD ?? 0), color: '#34C759' },
              { label: 'Reviews', value: String(stats?.pendingReviews ?? 0), color: '#AF52DE' },
              { label: 'Workers', value: String(stats?.activeWorkers ?? 0), color: '#5AC8FA' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex-1 rounded-2xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)' }}>
                <p className="text-[9px] text-[#8E8E93] font-semibold uppercase">{s.label}</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Today's Focus (Next Job Hero Card) ───────────────────── */}
      {nextJob && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:shadow-lg transition-all"
          style={{
            background: getServicePalette(nextJob.service_name).bg,
            borderLeft: `4px solid ${getServicePalette(nextJob.service_name).border}`,
            boxShadow: `0 4px 20px ${getServicePalette(nextJob.service_name).bg}`,
          }}
          onClick={() => router.push(`/dashboard/jobs/${nextJob.id}`)}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">Next Up</p>
              <h2 className="text-xl font-bold text-[#1C1C1E] mt-1">{nextJob.service_name}</h2>
              <p className="text-sm text-[#636366] mt-1">
                {nextJob.address_street}
                {nextJob.scheduled_time ? ` · ${formatTime(nextJob.scheduled_time)}` : ''}
              </p>
              {nextJob.worker_name && (
                <p className="text-xs text-[#8E8E93] mt-0.5">Assigned to {nextJob.worker_name}</p>
              )}
            </div>
            <StatusBadge status={nextJob.status} />
          </div>
          <div className="flex items-center justify-between mt-3">
            <Button variant="primary" size="sm" onClick={() => router.push(`/dashboard/jobs/${nextJob.id}`)}>
              ▶ Start Job
            </Button>
            <span className="text-sm font-bold text-[#1C1C1E]">
              {nextJob.price ? formatCurrency(nextJob.price) : ''}
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Charts Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-3">
          <p className="text-xs font-semibold text-[#1C1C1E] mb-2">Revenue This Week</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={(weeklyRevenue.length > 0 ? weeklyRevenue : [
              { day: 'Mon', amount: 450 }, { day: 'Tue', amount: 680 }, { day: 'Wed', amount: 520 },
              { day: 'Thu', amount: 890 }, { day: 'Fri', amount: 760 }, { day: 'Sat', amount: 340 }, { day: 'Sun', amount: 0 },
            ]) as Array<Record<string, unknown>>}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007AFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#AEAEB2' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 12, fontSize: 11 }} />
              <Area type="monotone" dataKey="amount" stroke="#007AFF" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Jobs donut */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-3">
          <p className="text-xs font-semibold text-[#1C1C1E] mb-2">Jobs by Status</p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={statusCounts.length > 0 ? statusCounts : [
                    { status: 'scheduled', count: 5 }, { status: 'in_progress', count: 3 },
                    { status: 'completed', count: 8 }, { status: 'pending_review', count: 2 },
                  ]} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={3}>
                    {(statusCounts.length > 0 ? statusCounts : [
                      { status: 'scheduled', count: 5 }, { status: 'in_progress', count: 3 },
                      { status: 'completed', count: 8 }, { status: 'pending_review', count: 2 },
                    ]).map((entry) => (
                      <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status] ?? '#8E8E93'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[#1C1C1E]">
                  {statusCounts.reduce((s, c) => s + c.count, 0) || 18}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              {(statusCounts.length > 0 ? statusCounts : [
                { status: 'scheduled', count: 5 }, { status: 'completed', count: 8 },
              ]).slice(0, 5).map(s => (
                <div key={s.status} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_CHART_COLORS[s.status] ?? '#8E8E93' }} />
                  <span className="text-[10px] text-[#8E8E93] capitalize flex-1">{s.status.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] font-bold text-[#1C1C1E]">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Today's Jobs (Colored Cards Grid) ─────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1C1C1E]">Today&apos;s Schedule</h2>
          <div className="flex gap-2">
            <Link href="/dashboard/jobs/new" className="text-xs text-[#007AFF] font-medium hover:underline">+ New Job</Link>
            <Link href="/dashboard/jobs" className="text-xs text-[#8E8E93] font-medium hover:underline">View All →</Link>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-sm text-[#8E8E93]">No jobs scheduled for today</p>
            <Link href="/dashboard/jobs/new" className="text-xs text-[#007AFF] mt-2 inline-block hover:underline">Schedule your first job</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {jobs.map((job, i) => {
              const palette = getServicePalette(job.service_name)
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ y: -2, boxShadow: `0 8px 24px ${palette.bg}` }}
                  className="rounded-2xl p-3 cursor-pointer border-l-[3px] transition-all"
                  style={{
                    background: palette.bg,
                    borderLeftColor: palette.border,
                    boxShadow: `0 2px 8px ${palette.bg}`,
                  }}
                  onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-xs font-bold truncate" style={{ color: palette.text }}>{job.service_name}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-[11px] text-[#1C1C1E] font-medium truncate">{job.address_street}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      {job.worker_name && (
                        <div className="w-5 h-5 rounded-full bg-[#34C759] text-white text-[8px] font-bold flex items-center justify-center">
                          {job.worker_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-[10px] text-[#8E8E93]">
                        {job.scheduled_time ? formatTime(job.scheduled_time) : 'No time'}
                        {job.worker_name ? ` · ${job.worker_name.split(' ')[0]}` : ''}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#1C1C1E]">
                      {job.price ? `$${Number(job.price).toFixed(0)}` : ''}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Week Strip + Activity ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Week strip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="md:col-span-2 glass rounded-2xl p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#1C1C1E]">This Week</p>
            <Link href="/dashboard/calendar" className="text-[10px] text-[#007AFF] font-medium hover:underline">Open Calendar →</Link>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map(day => {
              const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
              const isToday = key === todayKey
              const count = jobsByWeekDay.get(key) ?? 0
              return (
                <Link key={key} href="/dashboard/calendar"
                  className={`flex flex-col items-center py-2 rounded-xl transition-colors ${
                    isToday ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25' : 'hover:bg-[#F2F2F7]'
                  }`}>
                  <span className={`text-[9px] font-bold uppercase ${isToday ? 'text-white/70' : 'text-[#C7C7CC]'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'narrow', timeZone: PACIFIC_TZ })}
                  </span>
                  <span className={`text-base font-bold ${isToday ? 'text-white' : 'text-[#1C1C1E]'}`}>
                    {day.getDate()}
                  </span>
                  {count > 0 && (
                    <span className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-[#007AFF]'}`} />
                  )}
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-3">
          <p className="text-xs font-semibold text-[#1C1C1E] mb-2">Activity</p>
          {activity.length === 0 ? (
            <p className="text-[10px] text-[#8E8E93] text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {activity.slice(0, 5).map(item => (
                <div key={item.id} className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-[#1C1C1E]">{item.action} {item.entity_type}</p>
                    <p className="text-[9px] text-[#C7C7CC]">{timeAgo(item.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
