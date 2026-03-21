'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getViewAsCompany, clearViewAsCompany, type CompanyOption } from '@/lib/actions/godmode'
import { getOrCreateCompany } from '@/lib/actions/bootstrap'

export default function ViewingAsBanner() {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyOption | null>(null)
  const [isOwnCompany, setIsOwnCompany] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    async function load() {
      const [viewAs, ownData] = await Promise.all([
        getViewAsCompany(),
        getOrCreateCompany(),
      ])
      setCompany(viewAs)
      if (viewAs && ownData.company.id === viewAs.id) {
        setIsOwnCompany(true)
      }
    }
    load()
  }, [])

  // Don't show banner for own company or when not viewing as anyone
  if (!company || isOwnCompany) return null

  const handleExit = async () => {
    setClearing(true)
    await clearViewAsCompany()
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#FF9F0A] text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold">
          READ-ONLY — Viewing: <strong>{company.name}</strong>
          <span className="opacity-80 ml-1">({company.owner_name})</span>
        </span>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          View Only
        </span>
      </div>
      <button
        onClick={handleExit}
        disabled={clearing}
        className="text-[12px] font-bold bg-white/25 hover:bg-white/35 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {clearing ? '...' : 'Back to God Mode'}
      </button>
    </div>
  )
}
