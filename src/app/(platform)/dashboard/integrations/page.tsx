'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const INTEGRATIONS = [
  {
    name: 'Airbnb',
    icon: '🏠',
    category: 'Property Management',
    iconBg: 'bg-[#FF5A5F]/10',
  },
  {
    name: 'VRBO',
    icon: '🏡',
    category: 'Property Management',
    iconBg: 'bg-[#3B5998]/10',
  },
  {
    name: 'Hospitable',
    icon: '🔄',
    category: 'Property Management',
    iconBg: 'bg-[#007AFF]/10',
  },
  {
    name: 'Hostaway',
    icon: '📋',
    category: 'Property Management',
    iconBg: 'bg-[#FF9F0A]/10',
  },
  {
    name: 'Guesty',
    icon: '🗂️',
    category: 'Property Management',
    iconBg: 'bg-[#AF52DE]/10',
  },
  {
    name: 'QuickBooks',
    icon: '📊',
    category: 'Accounting',
    iconBg: 'bg-[#2CA01C]/10',
  },
  {
    name: 'Xero',
    icon: '💰',
    category: 'Accounting',
    iconBg: 'bg-[#13B5EA]/10',
  },
  {
    name: 'Google Calendar',
    icon: '📅',
    category: 'Productivity',
    iconBg: 'bg-[#4285F4]/10',
  },
  {
    name: 'Twilio',
    icon: '📱',
    category: 'Communication',
    iconBg: 'bg-[#F22F46]/10',
  },
]

export default function IntegrationsPage() {
  const categories = [...new Set(INTEGRATIONS.map(i => i.category))]
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [connected, setConnected] = useState<Set<string>>(new Set())

  function toggleConnection(name: string) {
    setConnected(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-[#1C1C1E]">Integrations</h1>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#AEAEB2] mt-4 mb-2">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {INTEGRATIONS.filter(i => i.category === category).map((integration, idx) => {
              const isConnected = connected.has(integration.name)
              return (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setActiveModal(integration.name)}
                  className="flex items-center px-3 py-2.5 rounded-xl glass hover:bg-white/50 transition-colors cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${integration.iconBg}`}>
                    {integration.icon}
                  </div>
                  <div className="ml-2.5 min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1C1C1E] truncate">{integration.name}</p>
                    <p className="text-[10px] text-[#8E8E93]">{integration.category}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#34C759]' : 'bg-[#C7C7CC]'}`} />
                    <span className="text-xs text-[#007AFF]">
                      {isConnected ? 'Connected' : 'Connect'}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Connect Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveModal(null)
                setApiKey('')
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl w-full max-w-md p-5"
              style={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#1C1C1E]">Connect {activeModal}</h2>
                <button
                  onClick={() => { setActiveModal(null); setApiKey('') }}
                  className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-white/60 transition-colors text-[#8E8E93]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-[#FF9F0A]/10 text-[#FF9F0A] rounded-xl p-3 mb-4">
                <p className="text-xs font-medium">Coming Soon</p>
                <p className="text-[10px] mt-0.5">This integration is not yet available. Enter your API key and we&#39;ll notify you when it goes live.</p>
              </div>

              <div className="mb-4">
                <label className="text-[10px] font-medium text-[#8E8E93] uppercase mb-1 block">API Key (optional)</label>
                <input
                  type="text"
                  placeholder="Enter your API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E5E5EA]/60 bg-white/60 text-sm text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveModal(null); setApiKey('') }}
                  className="flex-1 py-2 bg-white/50 text-[#8E8E93] rounded-xl text-xs font-medium hover:bg-white/70 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (activeModal) toggleConnection(activeModal)
                    setActiveModal(null)
                    setApiKey('')
                  }}
                  className="flex-1 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-medium hover:bg-[#0066DD] transition-colors"
                >
                  {activeModal && connected.has(activeModal) ? 'Disconnect' : 'Save & Notify Me'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
