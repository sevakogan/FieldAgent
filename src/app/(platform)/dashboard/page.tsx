'use client'

import { motion } from 'framer-motion'

const STATS = [
  { label: 'Jobs Today', value: '12', trend: '+3', color: '#007AFF' },
  { label: 'Revenue (MTD)', value: '$8,420', trend: '+12%', color: '#34C759' },
  { label: 'Pending Reviews', value: '5', trend: '-2', color: '#AF52DE' },
  { label: 'Active Workers', value: '4', trend: '', color: '#5AC8FA' },
]

const RECENT_JOBS = [
  { id: '1', address: '123 Ocean Dr, Miami Beach', service: 'Pool Cleaning', worker: 'Carlos M.', status: 'in_progress', time: '9:00 AM' },
  { id: '2', address: '456 Collins Ave, Miami', service: 'Lawn Care', worker: 'Miguel R.', status: 'scheduled', time: '10:30 AM' },
  { id: '3', address: '789 Brickell Key', service: 'Deep Clean', worker: 'Ana S.', status: 'completed', time: '8:00 AM' },
  { id: '4', address: '321 Coral Way', service: 'Pressure Wash', worker: 'Carlos M.', status: 'pending_review', time: '11:00 AM' },
  { id: '5', address: '555 NE 15th St', service: 'Pool Cleaning', worker: 'Miguel R.', status: 'scheduled', time: '1:00 PM' },
]

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#007AFF', in_progress: '#FFD60A', completed: '#34C759',
  pending_review: '#AF52DE', cancelled: '#FF6B6B',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed',
  pending_review: 'Pending Review', cancelled: 'Cancelled',
}

const ACTIVITY = [
  { text: 'Payment received from Maria G. — $150.00', time: '2 min ago' },
  { text: 'Carlos M. completed job at 789 Brickell Key', time: '15 min ago' },
  { text: 'New client added: James Wilson', time: '1 hr ago' },
  { text: 'Invoice #1082 sent to Beachside Rentals', time: '2 hrs ago' },
]

export default function DashboardOverview() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 500, damping: 30 }}
            className="bg-white rounded-2xl p-4 border border-[#E5E5EA]"
          >
            <p className="text-sm text-[#8E8E93] mb-1">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            {stat.trend && <p className="text-xs text-[#34C759] mt-1">{stat.trend}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="p-4 border-b border-[#E5E5EA] flex justify-between items-center">
            <h2 className="font-semibold text-[#1C1C1E]">Today&apos;s Jobs</h2>
            <a href="/dashboard/jobs" className="text-sm text-[#007AFF]">View All</a>
          </div>
          <div className="divide-y divide-[#E5E5EA]">
            {RECENT_JOBS.map((job) => (
              <a key={job.id} href={`/dashboard/jobs/${job.id}`} className="flex items-center justify-between p-4 hover:bg-[#F2F2F7] transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1C1C1E]">{job.address}</p>
                  <p className="text-xs text-[#8E8E93]">{job.service} · {job.worker} · {job.time}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[job.status] + '20', color: STATUS_COLORS[job.status] }}>
                  {STATUS_LABELS[job.status]}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5EA]">
          <div className="p-4 border-b border-[#E5E5EA]">
            <h2 className="font-semibold text-[#1C1C1E]">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-4">
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[#007AFF] mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-[#1C1C1E]">{item.text}</p>
                  <p className="text-xs text-[#AEAEB2]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
