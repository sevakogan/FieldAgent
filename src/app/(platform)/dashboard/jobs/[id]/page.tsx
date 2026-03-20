'use client'
import { motion } from 'framer-motion'

const JOB = {
  id: '1', address: '123 Ocean Dr, Miami Beach, FL 33139', service: 'Pool Cleaning', worker: 'Carlos Martinez',
  client: 'Maria Gonzalez', status: 'in_progress', date: '2026-03-20', time: '9:00 AM', price: 75, expenses: 12.50, tax: 6.56, tip: 10, total: 104.06,
  checklist: [{ item: 'Skim surface', done: true }, { item: 'Test pH levels', done: true }, { item: 'Add chemicals', done: false }, { item: 'Clean filter', done: false }],
  timeline: [
    { time: '8:45 AM', event: 'Job assigned to Carlos M.' },
    { time: '8:55 AM', event: 'Worker started driving' },
    { time: '9:02 AM', event: 'Worker arrived at location' },
    { time: '9:05 AM', event: 'Before photos uploaded (3)' },
    { time: '9:08 AM', event: 'Job started' },
  ],
}

const STATUS_COLORS: Record<string, string> = { scheduled: '#007AFF', driving: '#5AC8FA', arrived: '#FFD60A', in_progress: '#007AFF', pending_review: '#AF52DE', completed: '#34C759' }

export default function JobDetailPage() {
  return (
    <div>
      <a href="/dashboard/jobs" className="text-[#007AFF] text-sm mb-2 inline-block">← Jobs</a>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Job #{JOB.id}</h1>
        <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: (STATUS_COLORS[JOB.status] || '#8E8E93') + '20', color: STATUS_COLORS[JOB.status] || '#8E8E93' }}>
          {JOB.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[#8E8E93]">Address</p><p className="text-[#1C1C1E] font-medium">{JOB.address}</p></div>
              <div><p className="text-[#8E8E93]">Service</p><p className="text-[#1C1C1E] font-medium">{JOB.service}</p></div>
              <div><p className="text-[#8E8E93]">Worker</p><p className="text-[#1C1C1E] font-medium">{JOB.worker}</p></div>
              <div><p className="text-[#8E8E93]">Client</p><p className="text-[#1C1C1E] font-medium">{JOB.client}</p></div>
              <div><p className="text-[#8E8E93]">Date</p><p className="text-[#1C1C1E] font-medium">{JOB.date}</p></div>
              <div><p className="text-[#8E8E93]">Time</p><p className="text-[#1C1C1E] font-medium">{JOB.time}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Checklist</h2>
            <div className="space-y-2">
              {JOB.checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F2F2F7]">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${c.done ? 'bg-[#34C759] border-[#34C759]' : 'border-[#E5E5EA]'}`}>
                    {c.done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm ${c.done ? 'text-[#8E8E93] line-through' : 'text-[#1C1C1E]'}`}>{c.item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Timeline</h2>
            <div className="space-y-4">
              {JOB.timeline.map((t, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full bg-[#007AFF]" />{i < JOB.timeline.length - 1 && <div className="w-0.5 flex-1 bg-[#E5E5EA]" />}</div>
                  <div className="pb-4"><p className="text-sm text-[#1C1C1E]">{t.event}</p><p className="text-xs text-[#AEAEB2]">{t.time}</p></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Pricing</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#8E8E93]">Service</span><span>${JOB.price.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#8E8E93]">Expenses</span><span>${JOB.expenses.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#8E8E93]">Tax</span><span>${JOB.tax.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#8E8E93]">Tip</span><span className="text-[#34C759]">${JOB.tip.toFixed(2)}</span></div>
              <div className="border-t border-[#E5E5EA] pt-2 flex justify-between font-semibold"><span>Total</span><span>${JOB.total.toFixed(2)}</span></div>
            </div>
          </motion.div>
          <button className="w-full py-2.5 bg-[#34C759] text-white rounded-xl text-sm font-medium">Approve Job</button>
          <button className="w-full py-2.5 bg-white text-[#FF6B6B] border border-[#FF6B6B] rounded-xl text-sm font-medium">Cancel Job</button>
        </div>
      </div>
    </div>
  )
}
