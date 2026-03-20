'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const MOCK_DATA = [
  { id: '1', name: 'Item 1', status: 'active', date: '2026-03-20', amount: '$150.00' },
  { id: '2', name: 'Item 2', status: 'pending', date: '2026-03-19', amount: '$220.00' },
  { id: '3', name: 'Item 3', status: 'completed', date: '2026-03-18', amount: '$85.00' },
  { id: '4', name: 'Item 4', status: 'active', date: '2026-03-17', amount: '$340.00' },
  { id: '5', name: 'Item 5', status: 'pending', date: '2026-03-16', amount: '$175.00' },
]

const STATUS_COLORS: Record<string, string> = { active: '#34C759', pending: '#FF9F0A', completed: '#007AFF' }

export default function quotesPage() {
  const [search, setSearch] = useState('')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">quotes</h1>
        <button className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors">+ Add New</button>
      </div>
      <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-80 px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#E5E5EA]">
            <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Name</th>
            <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
            <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Date</th>
            <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Amount</th>
          </tr></thead>
          <tbody className="divide-y divide-[#E5E5EA]">
            {MOCK_DATA.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map((item, i) => (
              <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-[#F2F2F7] cursor-pointer transition-colors">
                <td className="p-4 text-sm font-medium text-[#1C1C1E]">{item.name}</td>
                <td className="p-4"><span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: (STATUS_COLORS[item.status] || '#8E8E93') + '20', color: STATUS_COLORS[item.status] || '#8E8E93' }}>{item.status}</span></td>
                <td className="p-4 text-sm text-[#8E8E93]">{item.date}</td>
                <td className="p-4 text-sm text-right font-medium text-[#1C1C1E]">{item.amount}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
