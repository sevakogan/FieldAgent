'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { inviteTeamMember } from '@/lib/actions/team'
import { getServices, type ServiceRow } from '@/lib/actions/services'

const PAY_TYPES = [
  { value: 'per_job', label: 'Per Job', icon: '$', prefix: '$' },
  { value: 'hourly', label: 'Hourly', icon: '⏱', prefix: '$' },
  { value: 'percentage', label: '%', icon: '%', prefix: '%' },
  { value: 'manual', label: 'Manual', icon: '✏️', prefix: '' },
]

type ServicePayState = {
  enabled: boolean
  pay_type: string
  pay_rate: string
}

export default function InviteTeamMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'lead' | 'worker'>('worker')

  // Services + per-service pay
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [servicePay, setServicePay] = useState<Record<string, ServicePayState>>({})

  useEffect(() => {
    async function load() {
      const result = await getServices()
      if (result.success && result.data) {
        setServices(result.data)
        // Initialize all services as enabled with per_job default
        const initial: Record<string, ServicePayState> = {}
        for (const svc of result.data) {
          initial[svc.id] = { enabled: true, pay_type: 'per_job', pay_rate: '' }
        }
        setServicePay(initial)
      }
      setLoadingServices(false)
    }
    load()
  }, [])

  function updateServicePay(serviceId: string, field: keyof ServicePayState, value: string | boolean) {
    setServicePay(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], [field]: value },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Build per-service pay config
    const servicePayConfig = Object.entries(servicePay).map(([service_id, config]) => ({
      service_id,
      enabled: config.enabled,
      pay_type: config.pay_type,
      pay_rate: config.pay_rate ? parseFloat(config.pay_rate) : null,
    }))

    // Use the first enabled service's pay type as the default
    const firstEnabled = servicePayConfig.find(s => s.enabled)

    const result = await inviteTeamMember({
      full_name: fullName,
      email,
      phone: phone || undefined,
      role,
      pay_type: firstEnabled?.pay_type || undefined,
      pay_rate: firstEnabled?.pay_rate ?? undefined,
      service_pay: servicePayConfig,
    })

    if (result.success) {
      router.push('/dashboard/team')
    } else {
      setError(result.error ?? 'Failed to invite team member')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/team" className="text-[#007AFF] text-sm mb-4 inline-block hover:underline">
        &larr; Back to Team
      </Link>

      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">Invite Team Member</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#8E8E93] uppercase tracking-wider">Basic Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {(['worker', 'lead'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      role === r
                        ? 'bg-[#007AFF] text-white border-[#007AFF]'
                        : 'bg-white text-[#1C1C1E] border-[#E5E5EA] hover:border-[#007AFF]/50'
                    }`}
                  >
                    {r === 'worker' ? '👷 Worker' : '🏷️ Lead'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pay Per Service Card */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#8E8E93] uppercase tracking-wider">Pay by Job Type</h2>
              <p className="text-xs text-[#C7C7CC] mt-0.5">Set how this worker gets paid for each service</p>
            </div>
            {services.length > 0 && (
              <span className="text-xs text-[#8E8E93] bg-[#F2F2F7] px-2 py-1 rounded-full">
                {Object.values(servicePay).filter(s => s.enabled).length}/{services.length} active
              </span>
            )}
          </div>

          {loadingServices ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-[#8E8E93] mb-2">No service types created yet</p>
              <Link href="/dashboard/services" className="text-sm text-[#007AFF] hover:underline">
                Create services first →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map(svc => {
                const config = servicePay[svc.id]
                if (!config) return null

                return (
                  <div
                    key={svc.id}
                    className={`rounded-xl border transition-all ${
                      config.enabled
                        ? 'border-[#E5E5EA] bg-white'
                        : 'border-[#F2F2F7] bg-[#F9F9FB] opacity-60'
                    }`}
                  >
                    {/* Service header row */}
                    <div className="flex items-center gap-3 p-3">
                      <button
                        type="button"
                        onClick={() => updateServicePay(svc.id, 'enabled', !config.enabled)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                          config.enabled
                            ? 'bg-[#007AFF] border-[#007AFF]'
                            : 'border-[#C7C7CC] bg-white'
                        }`}
                      >
                        {config.enabled && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#1C1C1E] truncate">{svc.name}</div>
                        <div className="text-[10px] text-[#8E8E93]">
                          Default: ${Number(svc.default_price).toFixed(2)}
                          {svc.estimated_duration_minutes ? ` · ~${svc.estimated_duration_minutes}min` : ''}
                        </div>
                      </div>

                      {/* Compact pay summary */}
                      {config.enabled && config.pay_rate && (
                        <div className="text-xs font-semibold text-[#34C759] bg-[#34C759]/10 px-2 py-1 rounded-lg">
                          {config.pay_type === 'percentage' ? `${config.pay_rate}%` : `$${config.pay_rate}`}
                          <span className="text-[#8E8E93] font-normal ml-1">
                            /{config.pay_type === 'hourly' ? 'hr' : config.pay_type === 'per_job' ? 'job' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expanded pay config */}
                    <AnimatePresence>
                      {config.enabled && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 flex items-center gap-2">
                            {/* Pay type buttons */}
                            {PAY_TYPES.map(pt => (
                              <button
                                key={pt.value}
                                type="button"
                                onClick={() => updateServicePay(svc.id, 'pay_type', pt.value)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                                  config.pay_type === pt.value
                                    ? 'bg-[#007AFF] text-white border-[#007AFF]'
                                    : 'bg-[#F2F2F7] text-[#3C3C43] border-transparent hover:bg-[#E5E5EA]'
                                }`}
                              >
                                {pt.label}
                              </button>
                            ))}

                            {/* Rate input */}
                            {config.pay_type !== 'manual' && (
                              <div className="relative flex-1 max-w-[120px] ml-auto">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8E8E93]">
                                  {config.pay_type === 'percentage' ? '%' : '$'}
                                </span>
                                <input
                                  type="number"
                                  step={config.pay_type === 'percentage' ? '1' : '0.01'}
                                  min="0"
                                  max={config.pay_type === 'percentage' ? '100' : undefined}
                                  value={config.pay_rate}
                                  onChange={(e) => updateServicePay(svc.id, 'pay_rate', e.target.value)}
                                  placeholder={config.pay_type === 'percentage' ? '50' : '75.00'}
                                  className="w-full pl-7 pr-2 py-1.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 text-right"
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-50"
          >
            {loading ? 'Inviting...' : 'Invite Team Member'}
          </button>
          <Link
            href="/dashboard/team"
            className="px-6 py-2.5 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-sm font-medium hover:text-[#1C1C1E] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  )
}
