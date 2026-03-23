'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getCompany, updateCompany } from '@/lib/actions/company'
import { getServices, createService } from '@/lib/actions/services'
import { Button } from '@/components/platform/Button'
import type { Company } from '@/types/database'

// ─── Accessibility Toggle ────────────────────────────────────────────
const FONT_ENABLED_KEY = 'kleanhq_font_enabled'

function AccessibilityToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(localStorage.getItem(FONT_ENABLED_KEY) === 'true')
  }, [])

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem(FONT_ENABLED_KEY, String(next))
    // Reset font size when disabling
    if (!next) {
      document.documentElement.style.fontSize = '16px'
      localStorage.removeItem('kleanhq_font_size')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔤</span>
          <div>
            <p className="font-medium text-sm text-[#1C1C1E]">Font Size Control</p>
            <p className="text-xs text-[#8E8E93] mt-0.5">Show A+/A- button to adjust text size</p>
          </div>
        </div>
        <button
          onClick={toggle}
          className={`w-12 h-7 rounded-full transition-colors relative ${enabled ? 'bg-[#007AFF]' : 'bg-[#E5E5EA]'}`}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1"
            animate={{ left: enabled ? 26 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  )
}

// ─── Business Type Templates ─────────────────────────────────────────
type ServiceTemplate = { name: string; defaultPrice: number; duration: number; isOutdoor: boolean; checklist: string[] }

const BUSINESS_TYPES: Record<string, { label: string; icon: string; color: string; services: ServiceTemplate[] }> = {
  pool_cleaning: {
    label: 'Pool Cleaning',
    icon: '🏊',
    color: '#007AFF',
    services: [
      { name: 'Weekly Pool Maintenance', defaultPrice: 120, duration: 45, isOutdoor: true, checklist: ['Skim surface', 'Vacuum pool floor', 'Brush walls', 'Test chemicals', 'Empty skimmer basket', 'Check pump'] },
      { name: 'Pool Opening (Seasonal)', defaultPrice: 350, duration: 120, isOutdoor: true, checklist: ['Remove cover', 'Fill pool', 'Start pump', 'Add chemicals', 'Vacuum', 'Test water'] },
      { name: 'Pool Closing (Seasonal)', defaultPrice: 300, duration: 90, isOutdoor: true, checklist: ['Lower water level', 'Blow out lines', 'Add winterizing chemicals', 'Install cover'] },
      { name: 'Green Pool Recovery', defaultPrice: 500, duration: 180, isOutdoor: true, checklist: ['Shock treatment', 'Brush all surfaces', 'Vacuum waste', 'Filter clean', 'Re-test water'] },
      { name: 'Filter Cleaning', defaultPrice: 150, duration: 60, isOutdoor: true, checklist: ['Remove filter', 'Clean/soak filter', 'Inspect O-rings', 'Reinstall', 'Test flow rate'] },
    ],
  },
  grass_maintenance: {
    label: 'Grass & Lawn Care',
    icon: '🌿',
    color: '#34C759',
    services: [
      { name: 'Weekly Mowing', defaultPrice: 75, duration: 45, isOutdoor: true, checklist: ['Mow lawn', 'Edge walkways', 'Trim borders', 'Blow clippings', 'Check irrigation'] },
      { name: 'Lawn Fertilization', defaultPrice: 120, duration: 30, isOutdoor: true, checklist: ['Spread fertilizer', 'Water in', 'Mark treated areas'] },
      { name: 'Weed Control', defaultPrice: 90, duration: 45, isOutdoor: true, checklist: ['Spray pre-emergent', 'Spot-treat weeds', 'Apply mulch'] },
      { name: 'Lawn Aeration', defaultPrice: 200, duration: 90, isOutdoor: true, checklist: ['Core aerate entire lawn', 'Overseed', 'Apply starter fertilizer', 'Water'] },
      { name: 'Full Yard Cleanup', defaultPrice: 250, duration: 120, isOutdoor: true, checklist: ['Rake leaves', 'Clear debris', 'Trim hedges', 'Edge beds', 'Blow clean'] },
    ],
  },
  plumbing: {
    label: 'Plumbing',
    icon: '🔧',
    color: '#5856D6',
    services: [
      { name: 'Drain Cleaning', defaultPrice: 175, duration: 60, isOutdoor: false, checklist: ['Snake drain', 'Test flow', 'Camera inspect', 'Clean area'] },
      { name: 'Faucet Repair/Replace', defaultPrice: 200, duration: 60, isOutdoor: false, checklist: ['Remove old faucet', 'Install new', 'Test for leaks', 'Clean area'] },
      { name: 'Toilet Repair', defaultPrice: 150, duration: 45, isOutdoor: false, checklist: ['Diagnose issue', 'Replace parts', 'Test flush', 'Check for leaks'] },
      { name: 'Water Heater Service', defaultPrice: 300, duration: 90, isOutdoor: false, checklist: ['Flush tank', 'Check anode rod', 'Test thermostat', 'Inspect pipes'] },
      { name: 'Leak Detection', defaultPrice: 250, duration: 120, isOutdoor: false, checklist: ['Pressure test', 'Visual inspection', 'Locate leak', 'Provide repair estimate'] },
    ],
  },
  handyman: {
    label: 'Handyman',
    icon: '🛠️',
    color: '#FF9F0A',
    services: [
      { name: 'General Repair (1hr)', defaultPrice: 85, duration: 60, isOutdoor: false, checklist: ['Assess repair', 'Complete work', 'Test', 'Clean up'] },
      { name: 'Furniture Assembly', defaultPrice: 120, duration: 90, isOutdoor: false, checklist: ['Unbox', 'Assemble per instructions', 'Level', 'Clean up packaging'] },
      { name: 'Drywall Repair', defaultPrice: 150, duration: 120, isOutdoor: false, checklist: ['Cut out damage', 'Install patch', 'Mud & tape', 'Sand', 'Prime'] },
      { name: 'TV Mounting', defaultPrice: 130, duration: 60, isOutdoor: false, checklist: ['Locate studs', 'Install mount', 'Hang TV', 'Manage cables', 'Test'] },
      { name: 'Pressure Washing', defaultPrice: 200, duration: 120, isOutdoor: true, checklist: ['Set up equipment', 'Pre-treat surfaces', 'Pressure wash', 'Rinse', 'Inspect'] },
    ],
  },
  str_cleaning: {
    label: 'STR Cleaner',
    icon: '🏠',
    color: '#FF2D55',
    services: [
      { name: 'Standard Turnover Clean', defaultPrice: 150, duration: 90, isOutdoor: false, checklist: ['Strip beds', 'Make beds with fresh linens', 'Clean bathrooms', 'Clean kitchen', 'Vacuum/mop floors', 'Take out trash', 'Restock amenities', 'Before/after photos'] },
      { name: 'Deep Clean', defaultPrice: 300, duration: 180, isOutdoor: false, checklist: ['All standard cleaning', 'Inside appliances', 'Windows', 'Baseboards', 'Under furniture', 'Light fixtures', 'Grout cleaning'] },
      { name: 'Laundry Service', defaultPrice: 50, duration: 60, isOutdoor: false, checklist: ['Collect dirty linens', 'Wash', 'Dry', 'Fold', 'Restock'] },
      { name: 'Linen Drop-off', defaultPrice: 30, duration: 15, isOutdoor: false, checklist: ['Deliver fresh linens', 'Make beds', 'Set towels'] },
      { name: 'Damage Inspection', defaultPrice: 75, duration: 30, isOutdoor: false, checklist: ['Walk-through inspection', 'Photo documentation', 'Note damages', 'Report to owner'] },
    ],
  },
  cleaning: {
    label: 'General Cleaning',
    icon: '✨',
    color: '#AF52DE',
    services: [
      { name: 'Standard Cleaning', defaultPrice: 120, duration: 90, isOutdoor: false, checklist: ['Dust surfaces', 'Clean bathrooms', 'Clean kitchen', 'Vacuum/mop', 'Take out trash'] },
      { name: 'Deep Cleaning', defaultPrice: 250, duration: 180, isOutdoor: false, checklist: ['All standard', 'Inside appliances', 'Windows', 'Baseboards', 'Behind furniture'] },
      { name: 'Move-In/Move-Out', defaultPrice: 350, duration: 240, isOutdoor: false, checklist: ['Deep clean all rooms', 'Inside cabinets', 'Appliances', 'Windows', 'Garage sweep'] },
    ],
  },
}

// ─── Component ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [taxRate, setTaxRate] = useState('')
  const [autoApproveTimeout, setAutoApproveTimeout] = useState('')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  const [jobBuffer, setJobBuffer] = useState('')

  // Template state
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [templatePrices, setTemplatePrices] = useState<Record<string, Record<string, number>>>({})
  const [existingServiceNames, setExistingServiceNames] = useState<string[]>([])
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [companyResult, servicesResult] = await Promise.all([
      getCompany(),
      getServices(),
    ])
    if (companyResult.success && companyResult.data) {
      const c = companyResult.data
      setCompany(c)
      setName(c.name)
      setPhone(c.phone ?? '')
      setEmail(c.email ?? '')
      // Parse business_type — could be comma-separated or single
      const types = c.business_type ? c.business_type.split(',').map(t => t.trim()) : []
      setSelectedTypes(types)
      setTaxRate(String(c.tax_rate))
      setAutoApproveTimeout(String(c.auto_approve_timeout_hours))
      setCancellationPolicy(String(c.cancellation_policy_hours))
      setJobBuffer(String(c.job_buffer_minutes))
    } else {
      setError(companyResult.error ?? 'Failed to load settings')
    }
    if (servicesResult.success && servicesResult.data) {
      setExistingServiceNames(servicesResult.data.map(s => s.name))
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Initialize template prices from defaults
  useEffect(() => {
    const prices: Record<string, Record<string, number>> = {}
    for (const [key, bt] of Object.entries(BUSINESS_TYPES)) {
      prices[key] = {}
      for (const svc of bt.services) {
        prices[key][svc.name] = svc.defaultPrice
      }
    }
    setTemplatePrices(prices)
  }, [])

  const toggleType = (typeKey: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeKey)
        ? prev.filter(t => t !== typeKey)
        : [...prev, typeKey]
    )
  }

  const updateTemplatePrice = (typeKey: string, serviceName: string, price: number) => {
    setTemplatePrices(prev => ({
      ...prev,
      [typeKey]: { ...prev[typeKey], [serviceName]: price },
    }))
  }

  const applyTemplate = async (typeKey: string) => {
    setApplyingTemplate(typeKey)
    const bt = BUSINESS_TYPES[typeKey]
    const prices = templatePrices[typeKey] ?? {}
    let created = 0

    for (const svc of bt.services) {
      if (existingServiceNames.includes(svc.name)) continue
      const result = await createService({
        name: svc.name,
        description: `${bt.label} service`,
        default_price: prices[svc.name] ?? svc.defaultPrice,
        estimated_duration_minutes: svc.duration,
        photo_required: true,
        checklist_items: svc.checklist,
        is_outdoor: svc.isOutdoor,
      })
      if (result.success) {
        created++
        setExistingServiceNames(prev => [...prev, svc.name])
      }
    }

    setApplyingTemplate(null)
    if (created > 0) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const result = await updateCompany({
      name,
      phone: phone || null,
      email: email || null,
      business_type: selectedTypes.join(','),
      tax_rate: parseFloat(taxRate) || 0,
      auto_approve_timeout_hours: parseInt(autoApproveTimeout) || 0,
      cancellation_policy_hours: parseInt(cancellationPolicy) || 0,
      job_buffer_minutes: parseInt(jobBuffer) || 0,
    })
    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  const settingsLinks = [
    { label: 'Notifications', href: '/dashboard/settings/notifications', description: 'Email, SMS, and push preferences', icon: '🔔' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Settings</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">
            ✓ Settings saved successfully
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && company && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Company Info */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Company Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Company Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Types — Multi-select Pills */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <h2 className="font-semibold text-[#1C1C1E] mb-1">What do you do?</h2>
              <p className="text-xs text-[#8E8E93] mb-4">Select all that apply — we&apos;ll auto-create job templates for each</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(BUSINESS_TYPES).map(([key, bt]) => {
                  const isSelected = selectedTypes.includes(key)
                  return (
                    <motion.button
                      key={key}
                      onClick={() => toggleType(key)}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-transparent text-white shadow-md'
                          : 'border-[#E5E5EA] text-[#3C3C43] bg-white hover:bg-[#F2F2F7]'
                      }`}
                      style={isSelected ? { backgroundColor: bt.color, borderColor: bt.color } : undefined}
                    >
                      <span className="text-base">{bt.icon}</span>
                      {bt.label}
                      {isSelected && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-0.5 text-white/80">✓</motion.span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Expandable templates for selected types */}
              <AnimatePresence>
                {selectedTypes.map((typeKey) => {
                  const bt = BUSINESS_TYPES[typeKey]
                  if (!bt) return null
                  const isExpanded = expandedType === typeKey
                  const prices = templatePrices[typeKey] ?? {}
                  const allExist = bt.services.every(s => existingServiceNames.includes(s.name))

                  return (
                    <motion.div
                      key={typeKey}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border border-[#E5E5EA] rounded-xl mb-3 overflow-hidden">
                        <button
                          onClick={() => setExpandedType(isExpanded ? null : typeKey)}
                          className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#F2F2F7] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{bt.icon}</span>
                            <span className="font-medium text-sm text-[#1C1C1E]">{bt.label}</span>
                            <span className="text-xs text-[#8E8E93]">{bt.services.length} services</span>
                            {allExist && <span className="text-xs text-[#34C759] font-medium">✓ Applied</span>}
                          </div>
                          <motion.svg
                            className="w-4 h-4 text-[#8E8E93]"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </motion.svg>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-2 border-t border-[#E5E5EA] pt-3">
                                {bt.services.map((svc) => {
                                  const exists = existingServiceNames.includes(svc.name)
                                  return (
                                    <div key={svc.name} className={`flex items-center justify-between py-2 px-3 rounded-lg ${exists ? 'bg-[#34C759]/5' : 'bg-[#F2F2F7]'}`}>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-[#1C1C1E]">{svc.name}</span>
                                          {exists && <span className="text-[10px] text-[#34C759] font-semibold bg-[#34C759]/10 px-1.5 py-0.5 rounded-xl">Added</span>}
                                          {svc.isOutdoor && <span className="text-[10px] text-[#FF9F0A] font-semibold bg-[#FF9F0A]/10 px-1.5 py-0.5 rounded-xl">Outdoor</span>}
                                        </div>
                                        <p className="text-xs text-[#8E8E93]">{svc.duration} min · {svc.checklist.length} checklist items</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm text-[#8E8E93]">$</span>
                                        <input
                                          type="number"
                                          value={prices[svc.name] ?? svc.defaultPrice}
                                          onChange={(e) => updateTemplatePrice(typeKey, svc.name, parseFloat(e.target.value) || 0)}
                                          disabled={exists}
                                          className="w-20 px-2 py-1 text-sm text-right bg-white border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 disabled:opacity-50 disabled:bg-[#F2F2F7]"
                                        />
                                      </div>
                                    </div>
                                  )
                                })}

                                {!allExist && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    loading={applyingTemplate === typeKey}
                                    onClick={() => applyTemplate(typeKey)}
                                    icon={<>✓</>}
                                  >
                                    Apply {bt.label} Template
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Operations */}
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Operations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Tax Rate (%)</label>
                  <input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Auto-Approve Timeout (hrs)</label>
                  <input type="number" value={autoApproveTimeout} onChange={(e) => setAutoApproveTimeout(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Cancellation Policy (hrs)</label>
                  <input type="number" value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] uppercase mb-1">Job Buffer (min)</label>
                  <input type="number" value={jobBuffer} onChange={(e) => setJobBuffer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30" />
                </div>
              </div>
            </div>

            <Button variant="primary" onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>

          {/* Right Column — Settings Links + Accessibility */}
          <div className="space-y-3">
            <h2 className="font-semibold text-[#1C1C1E] mb-2">More Settings</h2>
            {settingsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 bg-white rounded-2xl border border-[#E5E5EA] p-4 hover:bg-[#F2F2F7] transition-colors group"
              >
                <span className="text-xl">{link.icon}</span>
                <div>
                  <p className="font-medium text-sm text-[#1C1C1E] group-hover:text-[#007AFF] transition-colors">{link.label}</p>
                  <p className="text-xs text-[#8E8E93] mt-0.5">{link.description}</p>
                </div>
              </Link>
            ))}

            {/* Accessibility — Font Size Toggle */}
            <AccessibilityToggle />
          </div>
        </div>
      )}
    </div>
  )
}
