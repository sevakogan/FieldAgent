'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getViewAsCompany, clearViewAsCompany, isActingAsCompany, setActAsCompany, type CompanyOption } from '@/lib/actions/godmode'

export default function ViewingAsBanner() {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyOption | null>(null)
  const [isActing, setIsActing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    async function load() {
      const [viewAs, acting] = await Promise.all([
        getViewAsCompany(),
        isActingAsCompany(),
      ])
      setCompany(viewAs)
      setIsActing(acting)
    }
    load()
  }, [])

  if (!company) return null

  const handleExit = async () => {
    setClearing(true)
    await clearViewAsCompany()
    router.push('/admin')
    router.refresh()
  }

  const handleActAs = async () => {
    setActivating(true)
    const result = await setActAsCompany(company.id)
    if (result.success) {
      setIsActing(true)
      router.refresh()
    }
    setActivating(false)
  }

  // Acting as company — green banner, full rights
  if (isActing) {
    return (
      <div className="w-full bg-[#34C759] text-white px-4 py-2 flex items-center justify-between shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold">
            ACTING AS: <strong>{company.name}</strong>
            <span className="opacity-80 ml-1">({company.owner_name})</span>
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Full Access
          </span>
        </div>
        <button
          onClick={handleExit}
          disabled={clearing}
          className="text-[12px] font-bold bg-white/25 hover:bg-white/35 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {clearing ? '...' : 'Back to Admin'}
        </button>
      </div>
    )
  }

  // Read-only — orange banner with "Act as Company" button (no password needed)
  return (
    <div className="w-full bg-[#FF9F0A] text-white px-4 py-2 flex items-center justify-between shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold">
          READ-ONLY — <strong>{company.name}</strong>
        </span>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          View Only
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleActAs}
          disabled={activating}
          className="text-[12px] font-bold bg-[#34C759] hover:bg-[#2DB84E] px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {activating ? 'Activating...' : 'Act as Company'}
        </button>
        <button
          onClick={handleExit}
          disabled={clearing}
          className="text-[12px] font-bold bg-white/25 hover:bg-white/35 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {clearing ? '...' : 'Exit'}
        </button>
      </div>
    </div>
  )
}
