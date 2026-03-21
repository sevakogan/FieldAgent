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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Services</h1>
        <Button variant="primary" onClick={openCreate}>
          + Add Service
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center"
        >
          <div className="text-4xl mb-3">&#128736;</div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">No services yet</h2>
          <p className="text-sm text-[#8E8E93] mb-5">Create your first service type to get started.</p>
          <Button variant="primary" onClick={openCreate}>
            Create Your First Service
          </Button>
        </motion.div>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-[#E5E5EA] p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-[#1C1C1E]">{service.name}</h3>
                <div className="flex gap-1">
                  {service.photo_required && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#AF52DE20] text-[#AF52DE] font-medium">
                      Photo
                    </span>
                  )}
                  {service.is_outdoor && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#34C75920] text-[#34C759] font-medium">
                      Outdoor
                    </span>
                  )}
                </div>
              </div>

              {service.description && (
                <p className="text-sm text-[#8E8E93] mb-3 line-clamp-2">{service.description}</p>
              )}

              <div className="mt-auto space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-[#1C1C1E]">
                    ${Number(service.default_price).toFixed(2)}
                  </span>
                  {service.estimated_duration_minutes && (
                    <span className="text-xs text-[#8E8E93]">
                      {service.estimated_duration_minutes} min
                    </span>
                  )}
                </div>

                {Array.isArray(service.checklist_items) && service.checklist_items.length > 0 && (
                  <p className="text-xs text-[#8E8E93]">
                    {service.checklist_items.length} checklist item{service.checklist_items.length !== 1 ? 's' : ''}
                  </p>
                )}

                <div className="flex gap-2 pt-2 border-t border-[#E5E5EA]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(service)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  {deleteConfirmId === service.id ? (
                    <div className="flex-1 flex gap-1">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        disabled={submitting}
                        className="flex-1"
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteConfirmId(service.id)}
                      className="flex-1"
                    >
                      Archive
                    </Button>
                  )}
                </div>
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
              className="bg-white rounded-2xl border border-[#E5E5EA] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
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
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Brief description of the service..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none"
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
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
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
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
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
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-none"
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
