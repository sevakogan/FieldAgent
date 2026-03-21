'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/actions/clients'

export default function NewClientPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentSchedule, setPaymentSchedule] = useState('per_job')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setSubmitting(true)
    const result = await createClient({
      full_name: fullName,
      email,
      phone: phone || undefined,
      payment_schedule: paymentSchedule,
    })

    if (result.success) {
      router.push('/dashboard/clients')
    } else {
      setError(result.error ?? 'Failed to create client')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/dashboard/clients" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
        &larr; Back to Clients
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E5E5EA] p-6"
      >
        <h1 className="text-xl font-bold text-[#1C1C1E] mb-6">Add New Client</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[#1C1C1E] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1C1C1E] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#1C1C1E] mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(305) 555-0100"
              className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="paymentSchedule" className="block text-sm font-medium text-[#1C1C1E] mb-1">
              Payment Schedule
            </label>
            <select
              id="paymentSchedule"
              value={paymentSchedule}
              onChange={(e) => setPaymentSchedule(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white"
            >
              <option value="per_job">Per Job</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Client'}
            </button>
            <Link
              href="/dashboard/clients"
              className="flex-1 py-2.5 bg-white text-[#1C1C1E] border border-[#E5E5EA] rounded-xl text-sm font-medium text-center hover:bg-[#F2F2F7] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
