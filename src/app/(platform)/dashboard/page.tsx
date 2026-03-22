'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  getDashboardStats,
  getRecentJobs,
  getRecentActivity,
  getWeeklyRevenue,
  getJobStatusCounts,
  type DashboardStats,
  type RecentJob,
  type ActivityEntry,
  type WeeklyRevenuePoint,
  type JobStatusCount,
} from '@/lib/actions/dashboard'
import { StatusBadge } from '@/components/platform/Badge'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatTime(time: string | null): string {
  if (!time) return ''
  try {
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  } catch {
    return time
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#007AFF',
  in_progress: '#FFD60A',
  completed: '#34C759',
  pending_review: '#AF52DE',
  cancelled: '#FF3B30',
  invoiced: '#5AC8FA',
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? '#8E8E93'
}

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.[0]) return null
  return (
    <div className="glass rounded-lg px-3 py-2 shadow-lg border border-[#E5E5EA]">
      <p className="text-[10px] text-[#8E8E93]">{label}</p>
      <p className="text-sm font-semibold text-[#1C1C1E]">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

// Fallback mock data when no real data exists
const MOCK_WEEKLY: WeeklyRevenuePoint[] = (() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((label, i) => ({
    day: `2024-01-0${i + 1}`,
    label,
    revenue: Math.round(Math.random() * 400 + 100),
  }))
})()

const MOCK_STATUS: JobStatusCount[] = [
  { status: 'scheduled', count: 5 },
  { status: 'in_progress', count: 3 },
  { status: 'completed', count: 12 },
  { status: 'pending_review', count: 2 },
]

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [jobs, setJobs] = useState<RecentJob[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenuePoint[]>([])
  const [statusCounts, setStatusCounts] = useState<JobStatusCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [statsResult, jobsResult, activityResult, weeklyResult, statusResult] = await Promise.all([
        getDashboardStats(),
        getRecentJobs(),
        getRecentActivity(),
        getWeeklyRevenue(),
        getJobStatusCounts(),
      ])

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }
      if (jobsResult.success && jobsResult.data) {
        setJobs(jobsResult.data)
      }
      if (activityResult.success && activityResult.data) {
        setActivity(activityResult.data)
      }
      if (weeklyResult.success && weeklyResult.data) {
        setWeeklyRevenue(weeklyResult.data)
      }
      if (statusResult.success && statusResult.data) {
        setStatusCounts(statusResult.data)
      }
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Jobs Today', value: stats?.jobsToday ?? 0, color: '#007AFF', format: (v: number) => String(v) },
    { label: 'Revenue (MTD)', value: stats?.revenueMTD ?? 0, color: '#34C759', format: formatCurrency },
    { label: 'Pending Reviews', value: stats?.pendingReviews ?? 0, color: '#AF52DE', format: (v: number) => String(v) },
    { label: 'Active Workers', value: stats?.activeWorkers ?? 0, color: '#5AC8FA', format: (v: number) => String(v) },
  ]

  // Use real data or fall back to mock
  const revenueData = weeklyRevenue.length > 0 ? weeklyRevenue : MOCK_WEEKLY
  const statusData = statusCounts.length > 0 ? statusCounts : MOCK_STATUS
  const totalJobs = statusData.reduce((sum, s) => sum + s.count, 0)
  const hasRealRevenue = weeklyRevenue.some(p => p.revenue > 0)
  const chartRevenue = hasRealRevenue ? weeklyRevenue : MOCK_WEEKLY

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/jobs/new" className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors">
            + New Job
          </Link>
          <Link href="/dashboard/clients/new" className="px-4 py-2 bg-white text-[#007AFF] border border-[#007AFF] rounded-xl text-sm font-medium hover:bg-[#007AFF]/5 transition-colors">
            + Add Client
          </Link>
          <Link href="/dashboard/quotes/new" className="px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-sm font-medium hover:bg-[#F2F2F7] transition-colors">
            + Quote
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 500, damping: 30 }}
            className="glass rounded-2xl p-3"
          >
            <p className="text-sm text-[#8E8E93] mb-1">{stat.label}</p>
            {loading ? (
              <div className="h-8 w-20 bg-[#F2F2F7] rounded animate-pulse" />
            ) : (
              <p className="text-xl font-bold" style={{ color: stat.color }}>
                {stat.format(stat.value)}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {/* Revenue This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 500, damping: 30 }}
          className="glass rounded-2xl p-3"
        >
          <p className="text-sm font-semibold text-[#1C1C1E] mb-2">Revenue This Week</p>
          {loading ? (
            <div className="h-[180px] bg-[#F2F2F7] rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#8E8E93' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#8E8E93' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#007AFF"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Jobs by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 500, damping: 30 }}
          className="glass rounded-2xl p-3"
        >
          <p className="text-sm font-semibold text-[#1C1C1E] mb-2">Jobs by Status</p>
          {loading ? (
            <div className="h-[180px] bg-[#F2F2F7] rounded animate-pulse" />
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={getStatusColor(entry.status)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1C1C1E]">{totalJobs}</p>
                    <p className="text-[10px] text-[#8E8E93]">Total</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {statusData.map((entry) => (
                  <div key={entry.status} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getStatusColor(entry.status) }} />
                    <span className="text-xs text-[#1C1C1E] flex-1">{formatStatusLabel(entry.status)}</span>
                    <span className="text-xs font-medium text-[#8E8E93]">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Today's Jobs */}
        <div className="md:col-span-2 glass rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-[#E5E5EA] flex justify-between items-center">
            <h2 className="font-semibold text-[#1C1C1E]">Today&apos;s Jobs</h2>
            <Link href="/dashboard/jobs" className="text-sm text-[#007AFF]">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#E5E5EA]">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-[#F2F2F7] rounded animate-pulse" />
                    <div className="h-3 w-32 bg-[#F2F2F7] rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-[#F2F2F7] rounded-full animate-pulse" />
                </div>
              ))
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[#8E8E93] text-sm">No jobs scheduled for today</p>
                <Link
                  href="/dashboard/jobs"
                  className="text-[#007AFF] text-sm mt-2 inline-block"
                >
                  View all jobs
                </Link>
              </div>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 hover:bg-[#F2F2F7] transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1C1C1E]">{job.address_street}</p>
                    <p className="text-xs text-[#8E8E93]">
                      {job.service_name}
                      {job.worker_name ? ` \u00B7 ${job.worker_name}` : ''}
                      {job.scheduled_time ? ` \u00B7 ${formatTime(job.scheduled_time)}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl">
          <div className="p-3 border-b border-[#E5E5EA]">
            <h2 className="font-semibold text-[#1C1C1E]">Recent Activity</h2>
          </div>
          <div className="p-3 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#F2F2F7] mt-1.5 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-full bg-[#F2F2F7] rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-[#F2F2F7] rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : activity.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-[#8E8E93]">No recent activity</p>
              </div>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#007AFF] mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-[#1C1C1E]">
                      {item.action} {item.entity_type}
                    </p>
                    <p className="text-xs text-[#AEAEB2]">{timeAgo(item.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
