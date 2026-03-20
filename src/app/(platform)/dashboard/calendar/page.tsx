'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MOCK_EVENTS: Record<number, { service: string; status: string; color: string }[]> = {
  3: [{ service: 'Pool Clean', status: 'completed', color: '#34C759' }],
  5: [{ service: 'Lawn Care', status: 'scheduled', color: '#007AFF' }, { service: 'Deep Clean', status: 'scheduled', color: '#007AFF' }],
  8: [{ service: 'Pressure Wash', status: 'in_progress', color: '#FFD60A' }],
  12: [{ service: 'Pool Clean', status: 'scheduled', color: '#007AFF' }],
  15: [{ service: 'HVAC Service', status: 'scheduled', color: '#007AFF' }, { service: 'Lawn Care', status: 'scheduled', color: '#007AFF' }, { service: 'Pool Clean', status: 'completed', color: '#34C759' }],
  20: [{ service: 'Deep Clean', status: 'pending_review', color: '#AF52DE' }],
  22: [{ service: 'Lawn Care', status: 'scheduled', color: '#007AFF' }],
  25: [{ service: 'Pool Clean', status: 'scheduled', color: '#007AFF' }],
}

export default function CalendarPage() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' })

  const cells = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">{monthName}</h1>
        <div className="flex gap-1 bg-[#F2F2F7] rounded-xl p-1">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === v ? 'bg-white text-[#007AFF] shadow-sm' : 'text-[#8E8E93]'}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#E5E5EA]">
          {DAYS.map((d) => (<div key={d} className="p-3 text-center text-xs font-medium text-[#8E8E93]">{d}</div>))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => (
            <div key={i} className={`min-h-[100px] p-2 border-b border-r border-[#E5E5EA] ${day === today.getDate() ? 'bg-[#007AFF]/5' : ''} ${!day ? 'bg-[#F2F2F7]/50' : 'hover:bg-[#F2F2F7] cursor-pointer'}`}>
              {day && (
                <>
                  <span className={`text-sm ${day === today.getDate() ? 'bg-[#007AFF] text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-[#1C1C1E]'}`}>{day}</span>
                  <div className="mt-1 space-y-1">
                    {(MOCK_EVENTS[day] || []).map((ev, j) => (
                      <div key={j} className="text-xs px-1.5 py-0.5 rounded truncate" style={{ backgroundColor: ev.color + '20', color: ev.color }}>{ev.service}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
