'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STATUSES = ['all', 'scheduled', 'in_progress', 'pending_review', 'completed', 'cancelled'] as const
const STATUS_COLORS: Record<string, string> = { scheduled: '#007AFF', in_progress: '#FFD60A', pending_review: '#AF52DE', completed: '#34C759', cancelled: '#FF6B6B', driving: '#5AC8FA', arrived: '#FFD60A', charged: '#34C759' }
const STATUS_LABELS: Record<string, string> = { scheduled: 'Scheduled', in_progress: 'In Progress', pending_review: 'Review', completed: 'Completed', cancelled: 'Cancelled', driving: 'Driving', arrived: 'Arrived', charged: 'Charged' }

const MOCK_JOBS = [
  { id: '1', address: '123 Ocean Dr, Miami Beach', service: 'Pool Cleaning', worker: 'Carlos M.', status: 'in_progress', date: '2026-03-20', price: 75 },
  { id: '2', address: '456 Collins Ave', service: 'Lawn Care', worker: 'Miguel R.', status: 'scheduled', date: '2026-03-20', price: 120 },
  { id: '3', address: '789 Brickell Key', service: 'Deep Clean', worker: 'Ana S.', status: 'completed', date: '2026-03-19', price: 250 },
  { id: '4', address: '321 Coral Way', service: 'Pressure Wash', worker: 'Carlos M.', status: 'pending_review', date: '2026-03-19', price: 180 },
  { id: '5', address: '555 NE 15th St', service: 'Pool Cleaning', worker: 'Miguel R.', status: 'scheduled', date: '2026-03-21', price: 75 },
  { id: '6', address: '100 Bayshore Dr', service: 'HVAC Service', worker: 'Ana S.', status: 'completed', date: '2026-03-18', price: 300 },
  { id: '7', address: '200 SW 8th St', service: 'Lawn Care', worker: 'Carlos M.', status: 'cancelled', date: '2026-03-17', price: 90 },
]

export default function JobsPage() {
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const filtered = MOCK_JOBS.filter(j => (filter === 'all' || j.status === filter) && (j.address.toLowerCase().includes(search.toLowerCase()) || j.service.toLowerCase().includes(search.toLowerCase())))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Jobs</h1>
        <Link href="/dashboard/jobs/new" className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors">+ New Job</Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-[#007AFF] text-white' : 'bg-white text-[#3C3C43] border border-[#E5E5EA]'}`}>
            {s === 'all' ? 'All' : STATUS_LABELS[s] || s}
          </button>
        ))}
      </div>
      <input type="text" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-80 px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="divide-y divide-[#E5E5EA]">
          {filtered.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/dashboard/jobs/${job.id}`} className="flex items-center justify-between p-4 hover:bg-[#F2F2F7] transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1C1C1E]">{job.address}</p>
                  <p className="text-xs text-[#8E8E93]">{job.service} · {job.worker} · {job.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#1C1C1E]">${job.price}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: (STATUS_COLORS[job.status] || '#8E8E93') + '20', color: STATUS_COLORS[job.status] || '#8E8E93' }}>{STATUS_LABELS[job.status] || job.status}</span>
                </div>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="p-8 text-center text-[#8E8E93]">No jobs found</div>}
        </div>
      </div>
    </div>
  )
}
