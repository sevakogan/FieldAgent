'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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

const TOTAL_STEPS = 2

interface CompanyFormData {
  readonly firstName: string
  readonly lastName: string
  readonly username: string
  readonly email: string
  readonly phone: string
  readonly password: string
  readonly companyName: string
  readonly businessType: string
  readonly smsOptIn: boolean
}

const INITIAL_FORM: CompanyFormData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  companyName: '',
  businessType: '',
  smsOptIn: false,
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 }

export default function CompanySignupPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CompanyFormData>(INITIAL_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateField = (field: keyof CompanyFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError('Please fill in all required fields.')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  const handleBack = () => {
    setError('')
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.companyName || !form.businessType) {
      setError('Please fill in your company details.')
      return
    }
    setLoading(true)

    try {
      // 1. Create user + company via our API (auto-confirmed, welcome email via Resend)
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          phone: form.phone,
          companyName: form.companyName,
          businessType: form.businessType,
        }),
      })

      if (!signupRes.ok) {
        const body = await signupRes.json().catch(() => ({}))
        setError(body.error ?? 'Failed to create your account. Please try again.')
        setLoading(false)
        return
      }

      // 2. Sign in to establish browser session
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        // Account was created but sign-in failed — send to login
        router.push('/login?message=account_created')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const progressPercent = (step / TOTAL_STEPS) * 100

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
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
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={spring}
            />
          </div>
        </div>

        <h2 className="font-extrabold text-lg mb-1" style={{ color: '#1C1C1E' }}>
          {step === 1 && 'Your Information'}
          {step === 2 && 'Company Details'}
        </h2>
        <p className="text-sm mb-5" style={{ color: '#8E8E93' }}>
          {step === 1 && 'Tell us about yourself'}
          {step === 2 && 'Tell us about your business'}
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

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={spring}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  id="first-name"
                  label="FIRST NAME *"
                  value={form.firstName}
                  onChange={(v) => updateField('firstName', v)}
                  placeholder="John"
                  required
                />
                <InputField
                  id="last-name"
                  label="LAST NAME *"
                  value={form.lastName}
                  onChange={(v) => updateField('lastName', v)}
                  placeholder="Smith"
                  required
                />
              </div>
              <InputField
                id="username"
                label="USERNAME"
                value={form.username}
                onChange={(v) => updateField('username', v)}
                placeholder="johnsmith (optional)"
              />
              <InputField
                id="email"
                label="EMAIL *"
                type="email"
                value={form.email}
                onChange={(v) => updateField('email', v)}
                placeholder="you@company.com"
                required
              />
              <InputField
                id="phone"
                label="PHONE"
                type="tel"
                value={form.phone}
                onChange={(v) => updateField('phone', v)}
                placeholder="(555) 123-4567"
              />
              <InputField
                id="password"
                label="PASSWORD *"
                type="password"
                value={form.password}
                onChange={(v) => updateField('password', v)}
                placeholder="Min 6 characters"
                minLength={6}
                required
              />

              {/* SMS Consent — visible alongside phone field for 10DLC compliance */}
              <div className="flex items-start gap-3 mt-2">
                <input
                  id="sms-opt-in"
                  type="checkbox"
                  checked={form.smsOptIn}
                  onChange={(e) => setForm((prev) => ({ ...prev, smsOptIn: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#007AFF]"
                />
                <label htmlFor="sms-opt-in" className="text-[12px] leading-relaxed cursor-pointer" style={{ color: '#8E8E93' }}>
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

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={spring}
              className="space-y-4"
            >
              <InputField
                id="company-name"
                label="COMPANY NAME *"
                value={form.companyName}
                onChange={(v) => updateField('companyName', v)}
                placeholder="Sparkle Clean Co."
                required
              />
              <div>
                <label
                  htmlFor="business-type"
                  className="text-[10px] font-semibold tracking-widest block mb-1.5"
                  style={{ color: '#8E8E93' }}
                >
                  BUSINESS TYPE *
                </label>
                <select
                  id="business-type"
                  value={form.businessType}
                  onChange={(e) => updateField('businessType', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundColor: '#F2F2F7',
                    borderColor: '#E5E5EA',
                    color: form.businessType ? '#1C1C1E' : '#8E8E93',
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
              <p className="text-[12px]" style={{ color: '#8E8E93' }}>
                We&apos;ll pre-load services based on your business type. You can customize everything later.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 border rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity hover:opacity-70"
              style={{ borderColor: '#E5E5EA', color: '#1C1C1E', backgroundColor: 'transparent' }}
            >
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#007AFF' }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: '#007AFF' }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          )}
        </div>
      </div>

      {/* Sign In */}
      <p className="text-center text-sm mt-5" style={{ color: '#8E8E93' }}>
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold hover:opacity-70 transition-opacity"
          style={{ color: '#007AFF' }}
        >
          Sign In
        </Link>
      </p>
    </motion.div>
  )
}

// ── Shared Input Field Component ─────────────────────────────────
function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  minLength,
}: {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder: string
  readonly type?: string
  readonly required?: boolean
  readonly minLength?: number
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[10px] font-semibold tracking-widest block mb-1.5"
        style={{ color: '#8E8E93' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
        style={{ backgroundColor: '#F2F2F7', borderColor: '#E5E5EA', color: '#1C1C1E' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA' }}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
    </div>
  )
}
