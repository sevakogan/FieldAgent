'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getServices,
  createService,
  updateService,
  deleteService,
  type ServiceRow,
} from '@/lib/actions/services'
import { Button } from '@/components/platform/Button'

type FormData = {
  name: string
  description: string
  default_price: string
  estimated_duration_minutes: string
  photo_required: boolean
  is_outdoor: boolean
  checklist_items: string
}

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  default_price: '',
  estimated_duration_minutes: '',
  photo_required: false,
  is_outdoor: false,
  checklist_items: '',
}

function getServiceIcon(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('deep')) return '\u2728'
  if (lower.includes('clean')) return '\uD83E\uDDF9'
  if (lower.includes('pool')) return '\uD83C\uDFCA'
  if (lower.includes('lawn') || lower.includes('grass') || lower.includes('mow')) return '\uD83C\uDF3F'
  if (lower.includes('plumb')) return '\uD83D\uDD27'
  if (lower.includes('repair') || lower.includes('handyman')) return '\uD83D\uDEE0\uFE0F'
  if (lower.includes('laundry') || lower.includes('linen')) return '\uD83E\uDDFA'
  if (lower.includes('inspect') || lower.includes('damage')) return '\uD83D\uDD0D'
  if (lower.includes('pressure') || lower.includes('wash')) return '\uD83D\uDCA7'
  return '\u2699\uFE0F'
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getServices()
    if (result.success && result.data) {
      setServices(result.data)
    } else {
      setError(result.error ?? 'Failed to load services')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(service: ServiceRow) {
    setEditingId(service.id)
    setForm({
      name: service.name,
      description: service.description ?? '',
      default_price: String(service.default_price),
      estimated_duration_minutes: service.estimated_duration_minutes ? String(service.estimated_duration_minutes) : '',
      photo_required: service.photo_required,
      is_outdoor: service.is_outdoor,
      checklist_items: Array.isArray(service.checklist_items)
        ? (service.checklist_items as string[]).join('\n')
        : '',
    })
    setFormError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  function handleFormChange(field: keyof FormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!form.name.trim()) {
      setFormError('Service name is required')
      return
    }
    const price = parseFloat(form.default_price)
    if (isNaN(price) || price < 0) {
      setFormError('Please enter a valid price')
      return
    }

    const duration = form.estimated_duration_minutes
      ? parseInt(form.estimated_duration_minutes, 10)
      : undefined

    const checklist = form.checklist_items
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    setSubmitting(true)

    if (editingId) {
      const result = await updateService(editingId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        default_price: price,
        estimated_duration_minutes: duration ?? null,
        photo_required: form.photo_required,
        is_outdoor: form.is_outdoor,
        checklist_items: checklist,
      })

      if (result.success) {
        closeModal()
        await fetchServices()
      } else {
        setFormError(result.error ?? 'Failed to update service')
      }
    } else {
      const result = await createService({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        default_price: price,
        estimated_duration_minutes: duration,
        photo_required: form.photo_required,
        is_outdoor: form.is_outdoor,
        checklist_items: checklist,
      })

      if (result.success) {
        closeModal()
        await fetchServices()
      } else {
        setFormError(result.error ?? 'Failed to create service')
      }
    }

    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    setSubmitting(true)
    const result = await deleteService(id)
    if (result.success) {
      setDeleteConfirmId(null)
      await fetchServices()
    } else {
      setError(result.error ?? 'Failed to archive service')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-[#1C1C1E]">Services</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F2F2F7] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white shadow-sm text-[#007AFF]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}`}
              aria-label="Card view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#007AFF]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}`}
              aria-label="List view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={openCreate}>
            + Add Service
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="text-4xl mb-3">&#128736;</div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No services yet</h2>
          <p className="text-sm text-[#8E8E93] mb-5">Create your first service type to get started.</p>
          <Button variant="primary" onClick={openCreate}>
            Create Your First Service
          </Button>
        </motion.div>
      )}

      {!loading && !error && services.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => openEdit(service)}
              className="glass rounded-2xl p-3 hover:shadow-md transition-all cursor-pointer group relative"
            >
              {/* Top row: icon + name + price */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#007AFF]/8 flex items-center justify-center text-base shrink-0">
                  {getServiceIcon(service.name)}
                </div>
                <span className="text-sm font-semibold text-[#1C1C1E] truncate flex-1">
                  {service.name}
                </span>
                <span className="text-sm font-bold text-[#34C759] bg-[#34C759]/8 px-2 py-0.5 rounded-xl shrink-0">
                  ${Number(service.default_price).toFixed(2)}
                </span>
              </div>

              {/* Bottom row: duration + description + tags */}
              <div className="flex items-center gap-2 min-w-0">
                {service.estimated_duration_minutes && (
                  <span className="text-[10px] bg-[#F2F2F7] text-[#8E8E93] px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0">
                    {service.estimated_duration_minutes} min
                  </span>
                )}
                <p className="text-xs text-[#8E8E93] truncate flex-1">
                  {service.description ?? ''}
                </p>
                {service.photo_required && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AF52DE] shrink-0" title="Photo required" />
                )}
                {service.is_outdoor && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] shrink-0" title="Outdoor" />
                )}
              </div>

              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(service) }}
                  className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/80 hover:bg-white shadow-sm transition-colors text-[#8E8E93] hover:text-[#007AFF]"
                  aria-label="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                {deleteConfirmId === service.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(service.id) }}
                      disabled={submitting}
                      className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 transition-colors text-xs font-medium"
                      aria-label="Confirm archive"
                    >
                      &#10003;
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null) }}
                      className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#E5E5EA] transition-colors text-xs"
                      aria-label="Cancel"
                    >
                      &#10005;
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(service.id) }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/80 hover:bg-[#FF3B30]/10 shadow-sm transition-colors text-[#8E8E93] hover:text-[#FF3B30]"
                    aria-label="Archive"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !error && services.length > 0 && viewMode === 'list' && (
        <div className="glass rounded-2xl overflow-hidden">
          {/* List header */}
          <div className="grid grid-cols-[1fr_100px_80px_80px] sm:grid-cols-[1fr_1fr_100px_80px_80px] gap-2 px-4 py-2.5 bg-[#F2F2F7]/60 border-b border-[#E5E5EA]/40 text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
            <span>Service</span>
            <span className="hidden sm:block">Description</span>
            <span className="text-right">Price</span>
            <span className="text-center">Duration</span>
            <span className="text-center">Tags</span>
          </div>
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => openEdit(service)}
              className={`grid grid-cols-[1fr_100px_80px_80px] sm:grid-cols-[1fr_1fr_100px_80px_80px] gap-2 px-4 py-3 cursor-pointer hover:bg-[#007AFF]/4 transition-colors group ${i < services.length - 1 ? 'border-b border-[#E5E5EA]/30' : ''}`}
            >
              {/* Name with icon */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#007AFF]/8 flex items-center justify-center text-sm shrink-0">
                  {getServiceIcon(service.name)}
                </div>
                <span className="text-sm font-medium text-[#1C1C1E] truncate">
                  {service.name}
                </span>
              </div>

              {/* Description */}
              <p className="hidden sm:block text-xs text-[#8E8E93] truncate self-center">
                {service.description ?? '-'}
              </p>

              {/* Price */}
              <span className="text-sm font-semibold text-[#34C759] text-right self-center">
                ${Number(service.default_price).toFixed(2)}
              </span>

              {/* Duration */}
              <span className="text-xs text-[#8E8E93] text-center self-center">
                {service.estimated_duration_minutes ? `${service.estimated_duration_minutes} min` : '-'}
              </span>

              {/* Tags */}
              <div className="flex items-center justify-center gap-1.5 self-center">
                {service.photo_required && (
                  <span className="w-2 h-2 rounded-full bg-[#AF52DE]" title="Photo required" />
                )}
                {service.is_outdoor && (
                  <span className="w-2 h-2 rounded-full bg-[#34C759]" title="Outdoor" />
                )}
                {!service.photo_required && !service.is_outdoor && (
                  <span className="text-xs text-[#C7C7CC]">-</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal()
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg font-bold text-[#1C1C1E] mb-5">
                {editingId ? 'Edit Service' : 'New Service'}
              </h2>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="e.g., Deep Clean, Pool Cleaning"
                    className="w-full px-4 py-2.5 bg-white/60 border border-[#E5E5EA]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Brief description of the service..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white/60 border border-[#E5E5EA]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
                      Default Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.default_price}
                        onChange={(e) => handleFormChange('default_price', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2.5 bg-white/60 border border-[#E5E5EA]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Duration (min)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.estimated_duration_minutes}
                      onChange={(e) => handleFormChange('estimated_duration_minutes', e.target.value)}
                      placeholder="60"
                      className="w-full px-4 py-2.5 bg-white/60 border border-[#E5E5EA]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">
                    Checklist Items <span className="text-[#8E8E93] font-normal">(one per line)</span>
                  </label>
                  <textarea
                    value={form.checklist_items}
                    onChange={(e) => handleFormChange('checklist_items', e.target.value)}
                    placeholder={"Skim surface\nTest pH levels\nClean filter"}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/60 border border-[#E5E5EA]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none"
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.photo_required}
                      onChange={(e) => handleFormChange('photo_required', e.target.checked)}
                      className="w-4 h-4 rounded border-[#E5E5EA] text-[#007AFF] focus:ring-[#007AFF]/30"
                    />
                    <span className="text-sm text-[#1C1C1E]">Photo required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_outdoor}
                      onChange={(e) => handleFormChange('is_outdoor', e.target.checked)}
                      className="w-4 h-4 rounded border-[#E5E5EA] text-[#007AFF] focus:ring-[#007AFF]/30"
                    />
                    <span className="text-sm text-[#1C1C1E]">Outdoor service</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    loading={submitting}
                  >
                    {editingId ? 'Save Changes' : 'Create Service'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
