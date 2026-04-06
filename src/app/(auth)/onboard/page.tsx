'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const TOTAL_STEPS = 4
const spring = { type: 'spring' as const, stiffness: 300, damping: 30 }

interface ServiceRow {
  readonly id: string
  readonly name: string
  readonly default_price: number
  readonly category: string
  readonly is_active: boolean
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [services, setServices] = useState<ServiceRow[]>([])
  const [userName, setUserName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Load user info and services on mount
  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if already onboarded
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, onboarding_completed, phone, company_id')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/dashboard')
        return
      }

      setUserName(profile?.full_name?.split(' ')[0] || 'there')
      if (profile?.phone) setPhone(profile.phone)

      // Get company name
      if (profile?.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', profile.company_id)
          .single()
        if (company) setCompanyName(company.name)

        // Get seeded services
        const { data: svcData } = await supabase
          .from('company_services')
          .select('id, name, default_price, category, is_active')
          .eq('company_id', profile.company_id)
          .order('sort_order')
        if (svcData) setServices(svcData)
      }

      setLoading(false)
    }
    load()
  }, [router])

  const handleSavePhone = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ phone, sms_opt_in: smsOptIn })
        .eq('id', user.id)

      // Also update company phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()
      if (profile?.company_id) {
        await supabase
          .from('companies')
          .update({ phone })
          .eq('id', profile.company_id)
      }
    }
    setSaving(false)
    setStep(3)
  }

  const handleToggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    )
  }

  const handleSaveServices = async () => {
    setSaving(true)
    const supabase = createClient()
    // Update each service's active status
    for (const svc of services) {
      await supabase
        .from('company_services')
        .update({ is_active: svc.is_active })
        .eq('id', svc.id)
    }
    setSaving(false)
    setStep(4)
  }

  const handleFinish = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)
    }
    router.push('/dashboard')
    router.refresh()
  }

  const handleSkipToDashboard = async () => {
    await handleFinish()
  }

  const progressPercent = (step / TOTAL_STEPS) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="w-full"
    >
      <div className="bg-white rounded-2xl shadow-sm p-7">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-[11px] font-semibold mb-2" style={{ color: '#8E8E93' }}>
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F2F2F7' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#007AFF' }}
              animate={{ width: `${progressPercent}%` }}
              transition={spring}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Welcome ──────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={spring}
              className="text-center py-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ backgroundColor: '#E8F5E9' }}
              >
                🎉
              </div>
              <h2 className="font-extrabold text-xl mb-2" style={{ color: '#1C1C1E' }}>
                Welcome, {userName}!
              </h2>
              <p className="text-sm mb-1" style={{ color: '#8E8E93' }}>
                {companyName} is all set up.
              </p>
              <p className="text-sm mb-6" style={{ color: '#8E8E93' }}>
                Let&apos;s finish a few things to get you rolling.
              </p>

              <div className="space-y-3 text-left mb-6">
                {[
                  { icon: '📱', label: 'Add your phone number', desc: 'Get job reminders via SMS' },
                  { icon: '🛠', label: 'Review your services', desc: 'We pre-loaded them for you' },
                  { icon: '🚀', label: 'You\'re live!', desc: 'Start scheduling jobs' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{ backgroundColor: '#F2F2F7' }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: '#1C1C1E' }}>
                        {item.label}
                      </p>
                      <p className="text-[11px]" style={{ color: '#8E8E93' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Phone + SMS Opt-In ────────────────────── */}
          {step === 2 && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={spring}
              className="space-y-4"
            >
              <h2 className="font-extrabold text-lg mb-1" style={{ color: '#1C1C1E' }}>
                Add Your Phone
              </h2>
              <p className="text-sm mb-4" style={{ color: '#8E8E93' }}>
                We&apos;ll use this for job reminders and account recovery.
              </p>

              <div>
                <label
                  htmlFor="phone"
                  className="text-[10px] font-semibold tracking-widest block mb-1.5"
                  style={{ color: '#8E8E93' }}
                >
                  PHONE NUMBER
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: '#F2F2F7', borderColor: '#E5E5EA', color: '#1C1C1E' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA' }}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                />
              </div>

              {/* SMS Consent — 10DLC compliant */}
              <div className="flex items-start gap-3 mt-2">
                <input
                  id="sms-opt-in"
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#007AFF]"
                />
                <label
                  htmlFor="sms-opt-in"
                  className="text-[12px] leading-relaxed cursor-pointer"
                  style={{ color: '#8E8E93' }}
                >
                  I agree to receive SMS notifications from KleanHQ for job reminders and account updates.
                  Message frequency may vary. Msg&amp;data rates may apply. Consent is not a condition of purchase.
                  Reply STOP to opt out, HELP for help.
                  Your mobile information will not be sold or shared with third parties for promotional or marketing purposes.{' '}
                  <a href="/privacy" target="_blank" className="underline" style={{ color: '#007AFF' }}>
                    Privacy Policy
                  </a>
                </label>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Review Services ───────────────────────── */}
          {step === 3 && (
            <motion.div
              key="services"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={spring}
            >
              <h2 className="font-extrabold text-lg mb-1" style={{ color: '#1C1C1E' }}>
                Your Services
              </h2>
              <p className="text-sm mb-4" style={{ color: '#8E8E93' }}>
                We pre-loaded these based on your business type. Toggle off any you don&apos;t offer.
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleToggleService(svc.id)}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all cursor-pointer border"
                    style={{
                      backgroundColor: svc.is_active ? '#F0F9FF' : '#F2F2F7',
                      borderColor: svc.is_active ? '#007AFF' : '#E5E5EA',
                      opacity: svc.is_active ? 1 : 0.5,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[11px] font-bold"
                        style={{ backgroundColor: svc.is_active ? '#007AFF' : '#C7C7CC' }}
                      >
                        {svc.is_active ? '✓' : ''}
                      </div>
                      <span
                        className="text-[13px] font-medium text-left"
                        style={{ color: svc.is_active ? '#1C1C1E' : '#8E8E93' }}
                      >
                        {svc.name}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: '#8E8E93' }}>
                      {formatCurrency(svc.default_price)}
                    </span>
                  </button>
                ))}
                {services.length === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: '#8E8E93' }}>
                    No services found. You can add them in Settings later.
                  </p>
                )}
              </div>

              <p className="text-[11px] mt-3" style={{ color: '#AEAEB2' }}>
                You can always add, edit, or remove services in Settings → Services.
              </p>
            </motion.div>
          )}

          {/* ── Step 4: All Done ──────────────────────────────── */}
          {step === 4 && (
            <motion.div
              key="done"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={spring}
              className="text-center py-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ backgroundColor: '#E8F5E9' }}
              >
                🚀
              </div>
              <h2 className="font-extrabold text-xl mb-2" style={{ color: '#1C1C1E' }}>
                You&apos;re All Set!
              </h2>
              <p className="text-sm mb-2" style={{ color: '#8E8E93' }}>
                {companyName} is ready to go.
              </p>
              <p className="text-sm mb-6" style={{ color: '#8E8E93' }}>
                Start by creating your first job or adding a client.
              </p>

              <div className="space-y-3 text-left">
                {[
                  { icon: '📋', label: 'Create your first job', href: '/dashboard/jobs/new' },
                  { icon: '👤', label: 'Add a client', href: '/dashboard/clients/new' },
                  { icon: '👥', label: 'Invite a team member', href: '/dashboard/team' },
                ].map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      handleFinish().then(() => {
                        router.push(item.href)
                      })
                    }}
                    className="w-full flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors hover:bg-[#E5E5EA]"
                    style={{ backgroundColor: '#F2F2F7' }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[13px] font-semibold" style={{ color: '#1C1C1E' }}>
                      {item.label}
                    </span>
                    <span className="ml-auto text-[#C7C7CC]">→</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#007AFF' }}
            >
              Let&apos;s Go
            </button>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => { setStep(3) }}
                className="border rounded-xl py-3.5 px-5 font-bold text-[15px] cursor-pointer transition-opacity hover:opacity-70"
                style={{ borderColor: '#E5E5EA', color: '#8E8E93', backgroundColor: 'transparent' }}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSavePhone}
                disabled={saving || !phone}
                className="flex-1 text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: '#007AFF' }}
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
            </>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleSaveServices}
              disabled={saving}
              className="flex-1 text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: '#007AFF' }}
            >
              {saving ? 'Saving...' : 'Looks Good'}
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleSkipToDashboard}
              disabled={saving}
              className="flex-1 text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: '#34C759' }}
            >
              {saving ? 'Loading...' : 'Go to Dashboard →'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
