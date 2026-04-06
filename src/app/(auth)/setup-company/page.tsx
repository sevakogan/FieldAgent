'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const BUSINESS_TYPES = [
  'Pool Cleaning',
  'Residential Cleaning',
  'Commercial Cleaning',
  'STR / Vacation Rental Turnovers',
  'Janitorial Services',
  'Carpet & Upholstery',
  'Window Cleaning',
  'Pressure Washing',
  'Lawn Care & Landscaping',
  'Move-In/Move-Out',
  'Other',
] as const

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 }

export default function SetupCompanyPage() {
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Pre-fill name from Google metadata
      const meta = user.user_metadata ?? {}
      setUserName(meta.full_name || meta.name || user.email?.split('@')[0] || '')

      // Check if already has a company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (profile?.company_id) {
        router.push('/onboard')
        return
      }

      setChecking(false)
    }
    check()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!companyName || !businessType) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          fullName: userName,
          businessType,
          sendWelcomeEmail: true,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to set up your company.')
        setLoading(false)
        return
      }

      router.push('/onboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
      <div className="bg-white rounded-2xl shadow-sm p-7">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
          style={{ backgroundColor: '#E8F5E9' }}
        >
          🏢
        </div>
        <h2 className="font-extrabold text-lg mb-1 text-center" style={{ color: '#1C1C1E' }}>
          Set Up Your Business
        </h2>
        <p className="text-sm mb-5 text-center" style={{ color: '#8E8E93' }}>
          Just two more things and you&apos;re in, {userName.split(' ')[0] || 'there'}
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-[13px] font-medium mb-4"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="company-name"
              className="text-[10px] font-semibold tracking-widest block mb-1.5"
              style={{ color: '#8E8E93' }}
            >
              COMPANY NAME
            </label>
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: '#F2F2F7', borderColor: '#E5E5EA', color: '#1C1C1E' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA' }}
              placeholder="Sparkle Clean Co."
              autoComplete="organization"
              required
            />
          </div>

          <div>
            <label
              htmlFor="business-type"
              className="text-[10px] font-semibold tracking-widest block mb-1.5"
              style={{ color: '#8E8E93' }}
            >
              BUSINESS TYPE
            </label>
            <select
              id="business-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors appearance-none cursor-pointer"
              style={{
                backgroundColor: '#F2F2F7',
                borderColor: '#E5E5EA',
                color: businessType ? '#1C1C1E' : '#8E8E93',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA' }}
              required
            >
              <option value="" disabled>Select type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#007AFF' }}
          >
            {loading ? 'Setting up...' : 'Get Started'}
          </button>
        </form>

        <p className="text-center text-[11px] mt-4" style={{ color: '#AEAEB2' }}>
          We&apos;ll pre-load services based on your business type
        </p>
      </div>
    </motion.div>
  )
}
