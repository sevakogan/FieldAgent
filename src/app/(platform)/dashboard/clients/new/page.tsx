'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/actions/clients'
import { createAddress } from '@/lib/actions/addresses'
import { Button } from '@/components/platform/Button'

type Step = 'client' | 'address' | 'done'

export default function NewClientPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('client')

  // Client fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentSchedule, setPaymentSchedule] = useState('per_job')

  // Address fields
  const [street, setStreet] = useState('')
  const [unit, setUnit] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [isStr, setIsStr] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) { setError('Full name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }

    setSubmitting(true)
    const result = await createClient({
      full_name: fullName,
      email,
      phone: phone || undefined,
      payment_schedule: paymentSchedule,
    })

    if (result.success && result.data) {
      setClientId(result.data.id)
      setStep('address')
    } else {
      setError(result.error ?? 'Failed to create client')
    }
    setSubmitting(false)
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setError('Street, city, state, and zip are required')
      return
    }

    if (!clientId) { setError('No client ID'); return }

    setSubmitting(true)
    const result = await createAddress({
      client_id: clientId,
      street,
      unit: unit || undefined,
      city,
      state,
      zip,
      is_str: isStr,
    })

    if (result.success) {
      setStep('done')
      setTimeout(() => router.push(`/dashboard/clients/${clientId}`), 1500)
    } else {
      setError(result.error ?? 'Failed to add address')
    }
    setSubmitting(false)
  }

  const handleSkipAddress = () => {
    router.push('/dashboard/clients')
  }

  const INPUT = "w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-colors"

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/dashboard/clients" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
        &larr; Back to Clients
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Client Info', 'Property'].map((label, i) => {
          const stepIdx = i === 0 ? 'client' : 'address'
          const isActive = step === stepIdx || (step === 'done' && i <= 1)
          const isComplete = (step === 'address' && i === 0) || step === 'done'
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isComplete ? 'bg-[#34C759] text-white' : isActive ? 'bg-[#007AFF] text-white' : 'bg-[#E5E5EA] text-[#8E8E93]'
              }`}>
                {isComplete ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${isActive || isComplete ? 'text-[#1C1C1E] font-medium' : 'text-[#8E8E93]'}`}>{label}</span>
              {i === 0 && <div className={`flex-1 h-0.5 rounded ${isComplete ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`} />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Client Info */}
        {step === 'client' && (
          <motion.div
            key="client"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-6"
          >
            <h1 className="text-xl font-bold text-[#1C1C1E] mb-1">Add New Client</h1>
            <p className="text-sm text-[#8E8E93] mb-6">Enter client contact information</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(305) 555-0100" className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Payment Schedule</label>
                <div className="flex gap-2">
                  {['per_job', 'monthly'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPaymentSchedule(opt)}
                      className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                        paymentSchedule === opt
                          ? 'bg-[#007AFF] text-white'
                          : 'bg-[#F2F2F7] text-[#3C3C43] hover:bg-[#E5E5EA]'
                      }`}
                    >
                      {opt === 'per_job' ? 'Per Job' : 'Monthly'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                  Next: Add Property
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 2: Address (optional) */}
        {step === 'address' && (
          <motion.div
            key="address"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-6"
          >
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-xl font-bold text-[#1C1C1E]">Add Property</h1>
              <span className="text-xs text-[#8E8E93] bg-[#F2F2F7] px-2.5 py-1 rounded-full">Optional</span>
            </div>
            <p className="text-sm text-[#8E8E93] mb-6">Add {fullName}&apos;s first property address</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Street Address <span className="text-red-500">*</span></label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Ocean Drive" className={INPUT} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Unit</label>
                  <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Apt 4B" className={INPUT} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">City <span className="text-red-500">*</span></label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Miami Beach" className={INPUT} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">State <span className="text-red-500">*</span></label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="FL" maxLength={2} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1">ZIP <span className="text-red-500">*</span></label>
                  <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="33139" maxLength={10} className={INPUT} />
                </div>
              </div>

              {/* STR toggle */}
              <div className="flex items-center justify-between py-3 px-4 bg-[#F2F2F7] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-[#1C1C1E]">Short-Term Rental (STR)</p>
                  <p className="text-xs text-[#8E8E93]">Airbnb, VRBO, etc.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStr(!isStr)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${isStr ? 'bg-[#007AFF]' : 'bg-[#E5E5EA]'}`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1"
                    animate={{ left: isStr ? 26 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="success" loading={submitting} className="flex-1" icon={<>📍</>}>
                  Save Property
                </Button>
                <Button type="button" variant="secondary" onClick={handleSkipAddress} className="flex-1">
                  Skip for Now
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Done state */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-[#E5E5EA] p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-[#34C759]/10 flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-3xl">✓</span>
            </motion.div>
            <h2 className="text-xl font-bold text-[#1C1C1E] mb-1">Client Created!</h2>
            <p className="text-sm text-[#8E8E93]">{fullName} has been added with their property</p>
            <p className="text-xs text-[#AEAEB2] mt-2">Redirecting...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
