'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getViewAsCompany, clearViewAsCompany, isActingAsCompany, setActAsCompany, type CompanyOption } from '@/lib/actions/godmode'
import { getOrCreateCompany } from '@/lib/actions/bootstrap'

export default function ViewingAsBanner() {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyOption | null>(null)
  const [isOwnCompany, setIsOwnCompany] = useState(false)
  const [isActing, setIsActing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    async function load() {
      const [viewAs, ownData, acting] = await Promise.all([
        getViewAsCompany(),
        getOrCreateCompany(),
        isActingAsCompany(),
      ])
      setCompany(viewAs)
      setIsActing(acting)
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

  const handleActAs = async () => {
    if (!password.trim()) {
      setPasswordError('Enter admin password')
      return
    }
    setActivating(true)
    setPasswordError('')
    const result = await setActAsCompany(company.id, password)
    if (result.success) {
      setIsActing(true)
      setShowPasswordPrompt(false)
      setPassword('')
      router.refresh()
    } else {
      setPasswordError(result.error ?? 'Incorrect password')
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
          {clearing ? '...' : 'Back to God Mode'}
        </button>
      </div>
    )
  }

  // Read-only — orange banner with "Act as Company" option
  return (
    <>
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
            onClick={() => setShowPasswordPrompt(true)}
            className="text-[12px] font-bold bg-[#34C759] hover:bg-[#2DB84E] px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Act as Company
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

      {/* Password confirmation modal */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
            onClick={() => { setShowPasswordPrompt(false); setPassword(''); setPasswordError('') }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1C1C1E]">Act as {company.name}</h3>
                <p className="text-sm text-[#8E8E93] mt-1">Enter admin password for full access</p>
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleActAs() }}
                placeholder="Admin password"
                autoFocus
                className="w-full px-4 py-3 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#34C759]/30 mb-3"
              />

              {passwordError && (
                <p className="text-red-500 text-xs text-center mb-3">{passwordError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPasswordPrompt(false); setPassword(''); setPasswordError('') }}
                  className="flex-1 py-2.5 bg-[#F2F2F7] text-[#1C1C1E] rounded-xl text-sm font-medium hover:bg-[#E5E5EA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActAs}
                  disabled={activating}
                  className="flex-1 py-2.5 bg-[#34C759] text-white rounded-xl text-sm font-medium hover:bg-[#2DB84E] transition-colors disabled:opacity-50"
                >
                  {activating ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
