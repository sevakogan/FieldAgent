'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 }

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-5"
      style={{ background: 'linear-gradient(180deg, #1C1C1E 0%, #2C2C2E 100%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#2C2C2E', border: '1px solid #3A3A3C' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF9F0A"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="font-black text-2xl tracking-tight text-white">
            KleanHQ
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ backgroundColor: '#FF9F0A', color: '#1C1C1E' }}
            >
              Admin
            </span>
            <span className="text-sm" style={{ color: '#8E8E93' }}>
              Platform Control
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div
            className="rounded-2xl shadow-lg p-7"
            style={{ backgroundColor: '#2C2C2E', border: '1px solid #3A3A3C' }}
          >
            <h2 className="font-extrabold text-lg mb-1 text-white">
              Owner Login
            </h2>
            <p className="text-sm mb-5" style={{ color: '#8E8E93' }}>
              Platform administration access
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-900/30 text-red-400 rounded-xl px-4 py-3 text-[13px] font-medium mb-4 border border-red-800/30"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  htmlFor="admin-email"
                  className="text-[10px] font-semibold tracking-widest block mb-1.5"
                  style={{ color: '#8E8E93' }}
                >
                  EMAIL
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: '#3A3A3C', borderColor: '#48484A', color: '#FFFFFF' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9F0A' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#48484A' }}
                  placeholder="admin@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="admin-password"
                  className="text-[10px] font-semibold tracking-widest block mb-1.5"
                  style={{ color: '#8E8E93' }}
                >
                  PASSWORD
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: '#3A3A3C', borderColor: '#48484A', color: '#FFFFFF' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#FF9F0A' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#48484A' }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-[#1C1C1E] border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: '#FF9F0A' }}
              >
                {loading ? 'Signing in...' : 'Sign In as Admin'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: '#636366' }}>
            Not an admin?{' '}
            <a
              href="/login"
              className="font-semibold hover:opacity-70 transition-opacity"
              style={{ color: '#FF9F0A' }}
            >
              Company Login →
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
