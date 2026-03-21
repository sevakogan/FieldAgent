'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllCompanies, setViewAsCompany, clearViewAsCompany, getViewAsCompany, type CompanyOption } from '@/lib/actions/godmode'

export default function GodModeSwitcher() {
  const router = useRouter()
  const [companies, setCompanies] = useState<readonly CompanyOption[]>([])
  const [viewingAs, setViewingAs] = useState<CompanyOption | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    async function load() {
      const [companiesResult, currentView] = await Promise.all([
        getAllCompanies(),
        getViewAsCompany(),
      ])
      if (companiesResult.success && companiesResult.data) {
        setCompanies(companiesResult.data)
      }
      setViewingAs(currentView)
      setLoading(false)
    }
    load()
  }, [])

  const handleSelectCompany = async (company: CompanyOption) => {
    setSwitching(true)
    await setViewAsCompany(company.id)
    setViewingAs(company)
    setIsOpen(false)
    setSwitching(false)
    router.push('/dashboard')
    router.refresh()
  }

  const handleExitGodMode = async () => {
    setSwitching(true)
    await clearViewAsCompany()
    setViewingAs(null)
    setSwitching(false)
    router.push('/admin')
    router.refresh()
  }

  const isGodMode = viewingAs === null

  if (loading) {
    return (
      <div className="px-3 py-3 border-b border-[#E5E5EA]">
        <div className="h-10 bg-[#F2F2F7] rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="px-3 py-3 border-b border-[#E5E5EA]">
      {/* Mode indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-widest text-[#8E8E93] uppercase">
          View Mode
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isGodMode
            ? 'bg-[#AF52DE]/15 text-[#AF52DE]'
            : 'bg-[#007AFF]/15 text-[#007AFF]'
        }`}>
          {isGodMode ? 'GOD MODE' : 'COMPANY'}
        </span>
      </div>

      {/* Current state */}
      {isGodMode ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#AF52DE]/10 to-[#007AFF]/10 border border-[#AF52DE]/20 text-left transition-all hover:from-[#AF52DE]/15 hover:to-[#007AFF]/15"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#AF52DE] to-[#007AFF] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-[#1C1C1E]">All Companies</div>
            <div className="text-[10px] text-[#8E8E93]">Click to view as company</div>
          </div>
          <svg className={`w-4 h-4 text-[#8E8E93] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/20">
            <div className="w-7 h-7 rounded-lg bg-[#007AFF] flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">
                {viewingAs.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-[#1C1C1E] truncate">{viewingAs.name}</div>
              <div className="text-[10px] text-[#8E8E93]">{viewingAs.owner_name}</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex-1 text-[11px] font-medium text-[#007AFF] bg-[#007AFF]/8 hover:bg-[#007AFF]/15 rounded-lg py-1.5 transition-colors"
            >
              Switch
            </button>
            <button
              onClick={handleExitGodMode}
              disabled={switching}
              className="flex-1 text-[11px] font-medium text-[#AF52DE] bg-[#AF52DE]/8 hover:bg-[#AF52DE]/15 rounded-lg py-1.5 transition-colors disabled:opacity-50"
            >
              {switching ? '...' : 'God Mode'}
            </button>
          </div>
        </div>
      )}

      {/* Company dropdown */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-xl border border-[#E5E5EA] shadow-lg max-h-[240px] overflow-y-auto">
          {companies.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-[#8E8E93]">
              No companies yet
            </div>
          ) : (
            companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company)}
                disabled={switching}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#F2F2F7] transition-colors border-b border-[#F2F2F7] last:border-b-0 disabled:opacity-50 ${
                  viewingAs?.id === company.id ? 'bg-[#007AFF]/5' : ''
                }`}
              >
                <div className="w-6 h-6 rounded-md bg-[#007AFF]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#007AFF] text-[9px] font-bold">
                    {company.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[#1C1C1E] truncate">{company.name}</div>
                  <div className="text-[10px] text-[#8E8E93]">{company.owner_name} · {company.business_type}</div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                  company.status === 'active' ? 'bg-[#34C759]/15 text-[#34C759]' : 'bg-[#FF9F0A]/15 text-[#FF9F0A]'
                }`}>
                  {company.status}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
