'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type UndoItem = {
  id: string
  message: string
  onUndo: () => void
  onExpire: () => void
}

let addToastFn: ((item: Omit<UndoItem, 'id'>) => void) | null = null

/** Call this from anywhere to show an undo toast */
export function showUndoToast(message: string, onUndo: () => void, onExpire: () => void) {
  if (addToastFn) {
    addToastFn({ message, onUndo, onExpire })
  } else {
    // Fallback: just expire immediately
    onExpire()
  }
}

export function UndoToastProvider() {
  const [toasts, setToasts] = useState<(UndoItem & { createdAt: number })[]>([])

  const addToast = useCallback((item: Omit<UndoItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...item, id, createdAt: Date.now() }])
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  // Expire toasts after 15 seconds
  useEffect(() => {
    if (toasts.length === 0) return
    const interval = setInterval(() => {
      const now = Date.now()
      setToasts(prev => {
        const expired = prev.filter(t => now - t.createdAt >= 15000)
        const remaining = prev.filter(t => now - t.createdAt < 15000)
        expired.forEach(t => t.onExpire())
        return remaining
      })
    }, 500)
    return () => clearInterval(interval)
  }, [toasts])

  const handleUndo = (toast: UndoItem & { createdAt: number }) => {
    toast.onUndo()
    setToasts(prev => prev.filter(t => t.id !== toast.id))
  }

  const handleDismiss = (toast: UndoItem & { createdAt: number }) => {
    toast.onExpire()
    setToasts(prev => prev.filter(t => t.id !== toast.id))
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
      <AnimatePresence>
        {toasts.map(toast => {
          const elapsed = (Date.now() - toast.createdAt) / 15000
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl min-w-[280px]"
              style={{
                background: 'rgba(28, 28, 30, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium truncate">{toast.message}</p>
              </div>
              <button
                onClick={() => handleUndo(toast)}
                className="text-xs font-bold text-[#007AFF] hover:text-[#4DA3FF] transition-colors shrink-0"
              >
                Undo
              </button>
              <button
                onClick={() => handleDismiss(toast)}
                className="text-[#8E8E93] hover:text-white transition-colors shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#007AFF]"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 15 - (elapsed * 15), ease: 'linear' }}
                />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
