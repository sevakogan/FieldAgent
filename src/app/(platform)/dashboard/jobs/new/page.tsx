'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createJob } from '@/lib/actions/jobs'
import { getTeamMembers, type TeamMember } from '@/lib/actions/jobs'
import { getAddresses, type AddressRow } from '@/lib/actions/addresses'
import { getServices, type ServiceRow } from '@/lib/actions/services'

type FormData = {
  address_id: string
  service_type_id: string
  assigned_worker_id: string
  scheduled_date: string
  scheduled_time: string
  price: string
}

const INITIAL_FORM: FormData = {
  address_id: '',
  service_type_id: '',
  assigned_worker_id: '',
  scheduled_date: '',
  scheduled_time: '',
  price: '',
}

export default function NewJobPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [addresses, setAddresses] = useState<AddressRow[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(true)

  useEffect(() => {
    async function loadDropdowns() {
      setLoadingDropdowns(true)
      const [addrResult, svcResult, memberResult] = await Promise.all([
        getAddresses(),
        getServices(),
        getTeamMembers(),
      ])

      if (addrResult.success && addrResult.data) setAddresses(addrResult.data)
      if (svcResult.success && svcResult.data) setServices(svcResult.data)
      if (memberResult.success && memberResult.data) setMembers(memberResult.data)
      setLoadingDropdowns(false)
    }
    loadDropdowns()
  }, [])

  function handleChange(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))

    // Auto-fill price when service is selected
    if (field === 'service_type_id' && value) {
      const selected = services.find(s => s.id === value)
      if (selected) {
        setForm(prev => ({ ...prev, [field]: value, price: String(selected.default_price) }))
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.address_id) {
      setError('Please select an address')
      return
    }
    if (!form.service_type_id) {
      setError('Please select a service type')
      return
    }
    if (!form.scheduled_date) {
      setError('Please select a scheduled date')
      return
    }
    const price = parseFloat(form.price)
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price')
      return
    }

    setSubmitting(true)
    const result = await createJob({
      address_id: form.address_id,
      service_type_id: form.service_type_id,
      assigned_worker_id: form.assigned_worker_id || undefined,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time || undefined,
      price,
    })

    if (result.success) {
      router.push('/dashboard/jobs')
    } else {
      setError(result.error ?? 'Failed to create job')
      setSubmitting(false)
    }
  }

  if (loadingDropdowns) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/jobs" className="text-[#007AFF] text-sm mb-2 inline-block">
        &larr; Back to Jobs
      </Link>
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">New Job</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-5"
      >
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Address <span className="text-red-500">*</span>
          </label>
          {addresses.length === 0 ? (
            <p className="text-sm text-[#8E8E93]">
              No addresses found.{' '}
              <Link href="/dashboard/addresses/new" className="text-[#007AFF] hover:underline">
                Add an address first
              </Link>
            </p>
          ) : (
            <select
              value={form.address_id}
              onChange={(e) => handleChange('address_id', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            >
              <option value="">Select address...</option>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.street}{a.unit ? `, ${a.unit}` : ''}, {a.city}, {a.state} {a.zip}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Service Type <span className="text-red-500">*</span>
          </label>
          {services.length === 0 ? (
            <p className="text-sm text-[#8E8E93]">
              No services found.{' '}
              <Link href="/dashboard/services" className="text-[#007AFF] hover:underline">
                Create a service first
              </Link>
            </p>
          ) : (
            <select
              value={form.service_type_id}
              onChange={(e) => handleChange('service_type_id', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            >
              <option value="">Select service...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — ${Number(s.default_price).toFixed(2)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Worker Assignment */}
        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Assign Worker <span className="text-[#8E8E93] font-normal">(optional)</span>
          </label>
          <select
            value={form.assigned_worker_id}
            onChange={(e) => handleChange('assigned_worker_id', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.member_id} value={m.member_id}>
                {m.full_name} ({m.role})
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.scheduled_date}
              onChange={(e) => handleChange('scheduled_date', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
              Time <span className="text-[#8E8E93] font-normal">(optional)</span>
            </label>
            <input
              type="time"
              value={form.scheduled_time}
              onChange={(e) => handleChange('scheduled_time', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Job'}
          </button>
          <Link
            href="/dashboard/jobs"
            className="px-6 py-2.5 bg-white text-[#3C3C43] border border-[#E5E5EA] rounded-xl text-sm font-medium hover:bg-[#F2F2F7] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  )
}
