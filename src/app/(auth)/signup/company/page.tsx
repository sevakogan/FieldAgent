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
  readonly fullName: string
  readonly email: string
  readonly password: string
  readonly companyName: string
  readonly businessType: string
}

const INITIAL_FORM: CompanyFormData = {
  fullName: '',
  email: '',
  password: '',
  companyName: '',
  businessType: '',
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 }

export default function CompanySignupPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CompanyFormData>(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateField = (field: keyof CompanyFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const passwordStrength = (() => {
    const p = form.password
    if (p.length === 0) return { level: 0, label: '' }
    if (p.length < 6) return { level: 1, label: 'Too short' }
    const hasUpper = /[A-Z]/.test(p)
    const hasNumber = /[0-9]/.test(p)
    const hasSpecial = /[^A-Za-z0-9]/.test(p)
    const score = [p.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
    if (score <= 1) return { level: 2, label: 'Weak' }
    if (score <= 2) return { level: 3, label: 'Fair' }
    if (score <= 3) return { level: 4, label: 'Good' }
    return { level: 5, label: 'Strong' }
  })()

  const strengthColors: Record<number, string> = {
    0: '#E5E5EA',
    1: '#FF3B30',
    2: '#FF9500',
    3: '#FFCC00',
    4: '#34C759',
    5: '#30D158',
  }

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!form.fullName || !form.email || !form.password) {
        setError('Please fill in all fields.')
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

    // Split full name into first/last for the API
    const nameParts = form.fullName.trim().split(/\s+/)
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ') || ''

    try {
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName,
          lastName,
          fullName: form.fullName.trim(),
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

      // Sign in to establish browser session
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
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
          {step === 1 && 'Create Your Account'}
          {step === 2 && 'Company Details'}
        </h2>
        <p className="text-sm mb-5" style={{ color: '#8E8E93' }}>
          {step === 1 && 'Takes about 30 seconds'}
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
              {/* Full Name */}
              <InputField
                id="full-name"
                label="FULL NAME"
                value={form.fullName}
                onChange={(v) => updateField('fullName', v)}
                placeholder="John Smith"
                autoComplete="name"
                required
              />

              {/* Email */}
              <InputField
                id="email"
                label="EMAIL"
                type="email"
                value={form.email}
                onChange={(v) => updateField('email', v)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />

              {/* Password with toggle + strength meter */}
              <div>
                <label
                  htmlFor="password"
                  className="text-[10px] font-semibold tracking-widest block mb-1.5"
                  style={{ color: '#8E8E93' }}
                >
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 pr-12 text-[14px] outline-none transition-colors"
                    style={{ backgroundColor: '#F2F2F7', borderColor: '#E5E5EA', color: '#1C1C1E' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA' }}
                    placeholder="6+ characters"
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                    style={{ color: '#8E8E93' }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {/* Strength meter */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            backgroundColor: i <= passwordStrength.level
                              ? strengthColors[passwordStrength.level]
                              : '#E5E5EA',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] mt-1 font-medium" style={{ color: strengthColors[passwordStrength.level] }}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
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
                label="COMPANY NAME"
                value={form.companyName}
                onChange={(v) => updateField('companyName', v)}
                placeholder="Sparkle Clean Co."
                autoComplete="organization"
                required
              />
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

        {/* Trust signal */}
        <p className="text-center text-[11px] mt-4" style={{ color: '#AEAEB2' }}>
          Free to start &middot; No credit card required
        </p>
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
  autoComplete,
}: {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder: string
  readonly type?: string
  readonly required?: boolean
  readonly minLength?: number
  readonly autoComplete?: string
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
        autoComplete={autoComplete}
      />
    </div>
  )
}
