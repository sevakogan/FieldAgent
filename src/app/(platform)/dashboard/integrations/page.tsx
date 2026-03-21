'use client'

import { useState } from 'react'

const INTEGRATIONS = [
  {
    name: 'Airbnb',
    description: 'Sync property bookings and auto-schedule cleanings for your Airbnb listings.',
    icon: '🏠',
    category: 'Property Management',
  },
  {
    name: 'VRBO',
    description: 'Connect VRBO properties to automatically schedule turnovers.',
    icon: '🏡',
    category: 'Property Management',
  },
  {
    name: 'Hospitable',
    description: 'Import properties and booking calendars from Hospitable.',
    icon: '🔄',
    category: 'Property Management',
  },
  {
    name: 'Hostaway',
    description: 'Sync Hostaway channel manager data for automated scheduling.',
    icon: '📋',
    category: 'Property Management',
  },
  {
    name: 'Guesty',
    description: 'Pull property and reservation data from Guesty for seamless operations.',
    icon: '🗂️',
    category: 'Property Management',
  },
  {
    name: 'QuickBooks',
    description: 'Sync invoices and payments to QuickBooks for automated bookkeeping.',
    icon: '📊',
    category: 'Accounting',
  },
  {
    name: 'Xero',
    description: 'Export financial data to Xero for streamlined accounting.',
    icon: '💰',
    category: 'Accounting',
  },
  {
    name: 'Google Calendar',
    description: 'Sync job schedules to Google Calendar for your team.',
    icon: '📅',
    category: 'Productivity',
  },
  {
    name: 'Twilio',
    description: 'Send SMS notifications and reminders to clients and workers.',
    icon: '📱',
    category: 'Communication',
  },
]

export default function IntegrationsPage() {
  const categories = [...new Set(INTEGRATIONS.map(i => i.category))]
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Integrations</h1>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.filter(i => i.category === category).map((integration) => (
              <div key={integration.name} className="bg-white rounded-2xl border border-[#E5E5EA] p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{integration.icon}</span>
                  <h3 className="font-semibold text-[#1C1C1E]">{integration.name}</h3>
                </div>
                <p className="text-sm text-[#8E8E93] flex-1 mb-4">{integration.description}</p>
                <button
                  onClick={() => setActiveModal(integration.name)}
                  className="w-full py-2 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Connect Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Connect {activeModal}</h2>
              <button
                onClick={() => { setActiveModal(null); setApiKey('') }}
                className="text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-[#FF9F0A]/10 text-[#FF9F0A] rounded-xl p-4 mb-4">
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-xs mt-1">This integration is not yet available. You can enter your API key below and we will notify you when it goes live.</p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-[#8E8E93] uppercase mb-1 block">API Key (optional)</label>
              <input
                type="text"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5EA] bg-white text-sm text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setActiveModal(null); setApiKey('') }}
                className="flex-1 py-2.5 bg-[#F2F2F7] text-[#8E8E93] rounded-xl text-sm font-medium hover:bg-[#E5E5EA] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { setActiveModal(null); setApiKey('') }}
                className="flex-1 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
              >
                Save & Notify Me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
