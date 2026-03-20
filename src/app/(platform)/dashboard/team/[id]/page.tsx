'use client'
import { motion } from 'framer-motion'

const ITEM = { id: '1', name: 'Sample team', email: 'contact@example.com', phone: '(305) 555-0100', status: 'active', created: '2026-01-15' }
const HISTORY = [
  { date: '2026-03-20', description: 'Pool Cleaning completed', amount: '$75.00', status: 'completed' },
  { date: '2026-03-15', description: 'Lawn Care completed', amount: '$120.00', status: 'completed' },
  { date: '2026-03-10', description: 'Deep Clean completed', amount: '$250.00', status: 'completed' },
]

export default function teamDetailPage() {
  return (
    <div>
      <a href="/dashboard/team" className="text-[#007AFF] text-sm mb-2 inline-block">← Back</a>
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">{ITEM.name}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[#8E8E93]">Name</p><p className="text-[#1C1C1E] font-medium">{ITEM.name}</p></div>
              <div><p className="text-[#8E8E93]">Email</p><p className="text-[#1C1C1E] font-medium">{ITEM.email}</p></div>
              <div><p className="text-[#8E8E93]">Phone</p><p className="text-[#1C1C1E] font-medium">{ITEM.phone}</p></div>
              <div><p className="text-[#8E8E93]">Status</p><p className="text-[#34C759] font-medium">{ITEM.status}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">History</h2>
            <div className="divide-y divide-[#E5E5EA]">
              {HISTORY.map((h, i) => (
                <div key={i} className="flex justify-between items-center py-3">
                  <div><p className="text-sm text-[#1C1C1E]">{h.description}</p><p className="text-xs text-[#8E8E93]">{h.date}</p></div>
                  <span className="text-sm font-medium text-[#1C1C1E]">{h.amount}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
            <h2 className="font-semibold text-[#1C1C1E] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium">Edit</button>
              <button className="w-full py-2.5 bg-white text-[#007AFF] border border-[#007AFF] rounded-xl text-sm font-medium">Send Message</button>
              <button className="w-full py-2.5 bg-white text-[#FF6B6B] border border-[#FF6B6B] rounded-xl text-sm font-medium">Delete</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
