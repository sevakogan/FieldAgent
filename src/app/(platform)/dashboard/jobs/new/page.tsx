'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createJob } from '@/lib/actions/jobs'
import { getTeamMembers, type TeamMember } from '@/lib/actions/jobs'
import { getAddresses, type AddressRow } from '@/lib/actions/addresses'
import { getServices, type ServiceRow } from '@/lib/actions/services'
import { getClients, createClient, type ClientRow } from '@/lib/actions/clients'

type JobFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly'
type PayFrequency = 'per_job' | 'monthly'

const JOB_FREQ_OPTIONS: { value: JobFrequency; label: string; icon: string }[] = [
  { value: 'one_time', label: 'One Time', icon: '1×' },
  { value: 'weekly', label: 'Weekly', icon: '📅' },
  { value: 'biweekly', label: 'Bi-Weekly', icon: '📆' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️' },
]

const PAY_FREQ_OPTIONS: { value: PayFrequency; label: string; desc: string }[] = [
  { value: 'per_job', label: 'Per Job', desc: 'Charge after each visit' },
  { value: 'monthly', label: 'Monthly', desc: 'Roll up into monthly invoice' },
]

type FormData = {
  client_id: string
  address_id: string
  service_type_id: string
  assigned_worker_id: string
  scheduled_date: string
  scheduled_time: string
  price: string
  job_frequency: JobFrequency
  pay_frequency: PayFrequency
}

const INITIAL_FORM: FormData = {
  client_id: '',
  address_id: '',
  service_type_id: '',
  assigned_worker_id: '',
  scheduled_date: '',
  scheduled_time: '',
  price: '',
  job_frequency: 'one_time',
  pay_frequency: 'per_job',
}

export default function NewJobPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clients, setClients] = useState<ClientRow[]>([])
  const [addresses, setAddresses] = useState<AddressRow[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(true)

  // New client inline form
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [creatingClient, setCreatingClient] = useState(false)

  useEffect(() => {
    async function loadDropdowns() {
      setLoadingDropdowns(true)
      const [clientResult, addrResult, svcResult, memberResult] = await Promise.all([
        getClients(),
        getAddresses(),
        getServices(),
        getTeamMembers(),
      ])

      if (clientResult.success && clientResult.data) setClients(clientResult.data)
      if (addrResult.success && addrResult.data) setAddresses(addrResult.data)
      if (svcResult.success && svcResult.data) setServices(svcResult.data)
      if (memberResult.success && memberResult.data) setMembers(memberResult.data)
      setLoadingDropdowns(false)
    }
    loadDropdowns()
  }, [])

  // Filter addresses by selected client
  const filteredAddresses = useMemo(() => {
    if (!form.client_id) return addresses
    return addresses.filter(a => a.client_id === form.client_id)
  }, [addresses, form.client_id])

  function handleChange(field: keyof FormData, value: string) {
    const updated = { ...form, [field]: value }

    // When client changes, reset address if it doesn't belong to the new client
    if (field === 'client_id') {
      const clientAddresses = addresses.filter(a => a.client_id === value)
      if (!clientAddresses.some(a => a.id === form.address_id)) {
        updated.address_id = ''
      }
    }

    // When address changes, auto-select the client who owns it
    if (field === 'address_id' && value) {
      const selectedAddr = addresses.find(a => a.id === value)
      if (selectedAddr) {
        updated.client_id = selectedAddr.client_id
      }
    }

    // Auto-fill price when service is selected
    if (field === 'service_type_id' && value) {
      const selected = services.find(s => s.id === value)
      if (selected) {
        updated.price = String(selected.default_price)
      }
    }

    setForm(updated)
  }

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    if (!newClientName.trim() || !newClientEmail.trim()) return

    setCreatingClient(true)
    const result = await createClient({
      full_name: newClientName,
      email: newClientEmail,
      phone: newClientPhone || undefined,
    })

    if (result.success && result.data) {
      // Refresh clients list and select the new one
      const refreshed = await getClients()
      if (refreshed.success && refreshed.data) {
        setClients(refreshed.data)
        // Find the newly created client
        const newClient = refreshed.data.find(c => c.email === newClientEmail)
        if (newClient) {
          setForm(prev => ({ ...prev, client_id: newClient.id }))
        }
      }
      setShowNewClient(false)
      setNewClientName('')
      setNewClientEmail('')
      setNewClientPhone('')
    } else {
      setError(result.error ?? 'Failed to create client')
    }
    setCreatingClient(false)
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
      <Link href="/dashboard/jobs" className="text-[#007AFF] text-sm mb-2 inline-block hover:underline">
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
        {/* Client Picker */}
        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Client <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={form.client_id}
              onChange={(e) => handleChange('client_id', e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — {c.email}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewClient(!showNewClient)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                showNewClient
                  ? 'bg-[#FF3B30] text-white hover:bg-[#FF2D20]'
                  : 'bg-[#34C759] text-white hover:bg-[#2DB84D]'
              }`}
            >
              {showNewClient ? 'Cancel' : '+ New'}
            </button>
          </div>

          {/* Inline New Client Form */}
          <AnimatePresence>
            {showNewClient && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 bg-[#F2F2F7] rounded-xl border border-[#E5E5EA] space-y-3">
                  <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">New Client</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    disabled={creatingClient || !newClientName.trim() || !newClientEmail.trim()}
                    className="w-full py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
                  >
                    {creatingClient ? 'Creating...' : 'Create & Select Client'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Address — filtered by client */}
        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            Address <span className="text-red-500">*</span>
          </label>
          {filteredAddresses.length === 0 ? (
            <div className="text-sm text-[#8E8E93] bg-[#F2F2F7] rounded-xl p-3">
              {form.client_id
                ? <>This client has no addresses. <Link href={`/dashboard/addresses?client=${form.client_id}`} className="text-[#007AFF] hover:underline">Add an address</Link></>
                : <>No addresses found. <Link href="/dashboard/addresses" className="text-[#007AFF] hover:underline">Add an address first</Link></>
              }
            </div>
          ) : (
            <select
              value={form.address_id}
              onChange={(e) => handleChange('address_id', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            >
              <option value="">Select address...</option>
              {filteredAddresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.street}{a.unit ? `, ${a.unit}` : ''}, {a.city}, {a.state} {a.zip}
                  {!form.client_id && ` (${a.client_name})`}
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
            <div className="text-sm text-[#8E8E93] bg-[#F2F2F7] rounded-xl p-3">
              No services found.{' '}
              <Link href="/dashboard/services" className="text-[#007AFF] hover:underline">Create a service first</Link>
            </div>
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

        {/* Job Frequency + Payment Frequency side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
              Job Frequency
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {JOB_FREQ_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('job_frequency', opt.value)}
                  className={`py-2 px-2 rounded-xl text-center transition-all border ${
                    form.job_frequency === opt.value
                      ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm'
                      : 'bg-white text-[#3C3C43] border-[#E5E5EA] hover:bg-[#F2F2F7]'
                  }`}
                >
                  <div className="text-sm">{opt.icon}</div>
                  <div className={`text-[10px] font-semibold ${form.job_frequency === opt.value ? 'text-white/90' : 'text-[#8E8E93]'}`}>
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
            {form.job_frequency !== 'one_time' && (
              <p className="text-[10px] text-[#8E8E93] mt-1.5">
                Recurring from the start date
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
              Payment
            </label>
            <div className="space-y-1.5">
              {PAY_FREQ_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('pay_frequency', opt.value)}
                  className={`w-full py-2.5 px-3 rounded-xl text-left transition-all border flex items-center gap-3 ${
                    form.pay_frequency === opt.value
                      ? 'bg-[#34C759]/10 border-[#34C759] text-[#1C1C1E]'
                      : 'bg-white border-[#E5E5EA] text-[#3C3C43] hover:bg-[#F2F2F7]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    form.pay_frequency === opt.value ? 'border-[#34C759]' : 'border-[#C7C7CC]'
                  }`}>
                    {form.pay_frequency === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-[#34C759]" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-[10px] text-[#8E8E93]">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cost of Service */}
        <div>
          <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
            $ Cost of Service <span className="text-red-500">*</span>
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
