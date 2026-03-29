'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type AuthMode = 'password' | 'magic-link'

const ADMIN_EMAIL = 'seva@thelevelteam.com'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<AuthMode>('password')
  const router = useRouter()
  const searchParams = useSearchParams()

  const message = searchParams.get('message')
  const nextUrl = searchParams.get('next')

  const resolveRedirect = async (userEmail: string) => {
    // If explicit next URL, use it
    if (nextUrl) {
      router.push(nextUrl)
      router.refresh()
      return
    }

    // Check profile role to determine destination
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'owner'

    if (role === 'client') {
      router.push('/portal')
    } else if (userEmail.toLowerCase() === ADMIN_EMAIL) {
      // Platform owner goes to dashboard (God Mode available there)
      router.push('/dashboard')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
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

      await resolveRedirect(email)
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (magicError) {
        setError(magicError.message)
        setLoading(false)
        return
      }

      setSuccess('Check your email for a login link.')
      setLoading(false)
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-2xl shadow-sm p-7">
        <h2 className="font-extrabold text-lg mb-1" style={{ color: '#1C1C1E' }}>
          Welcome back
        </h2>
        <p className="text-sm mb-5" style={{ color: '#8E8E93' }}>
          Sign in to your account
        </p>

        {message === 'check_email' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-50 text-blue-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4"
          >
            Check your email to confirm your account, then log in here.
          </motion.div>
        )}

        {message === 'account_created' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4"
          >
            Your account has been created! Sign in to get started.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-[13px] font-medium mb-4"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4"
          >
            {success}
          </motion.div>
        )}

        {/* Mode Toggle */}
        <div className="flex rounded-xl p-1 mb-5" style={{ backgroundColor: '#F2F2F7' }}>
          <button
            type="button"
            onClick={() => { setMode('password'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all border-none cursor-pointer ${
              mode === 'password' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
            style={{ color: mode === 'password' ? '#1C1C1E' : '#8E8E93' }}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setMode('magic-link'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all border-none cursor-pointer ${
              mode === 'magic-link' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
            style={{ color: mode === 'magic-link' ? '#1C1C1E' : '#8E8E93' }}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>
          <div className="mb-4">
            <label
              htmlFor="login-email"
              className="text-[10px] font-semibold tracking-widest block mb-1.5"
              style={{ color: '#8E8E93' }}
            >
              EMAIL
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: '#F2F2F7', borderColor: '#E5E5EA', color: '#1C1C1E' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA' }}
              placeholder="you@company.com"
              required
            />
          </div>

          {mode === 'password' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <label
                htmlFor="login-password"
                className="text-[10px] font-semibold tracking-widest block mb-1.5"
                style={{ color: '#8E8E93' }}
              >
                PASSWORD
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                style={{ backgroundColor: '#F2F2F7', borderColor: '#E5E5EA', color: '#1C1C1E' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA' }}
                placeholder="Enter your password"
                minLength={6}
                required
              />
            </motion.div>
          )}

          {mode === 'password' && (
            <div className="flex justify-end mb-4">
              <Link
                href="/forgot-password"
                className="text-[12px] font-medium hover:opacity-70 transition-opacity"
                style={{ color: '#007AFF' }}
              >
                Forgot Password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#007AFF' }}
          >
            {loading
              ? '...'
              : mode === 'password'
                ? 'Sign In'
                : 'Send Magic Link'}
          </button>
        </form>
      </div>

      {/* Create Account */}
      <p className="text-center text-sm mt-5" style={{ color: '#8E8E93' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/signup/company"
          className="font-semibold hover:opacity-70 transition-opacity"
          style={{ color: '#007AFF' }}
        >
          Create Account
        </Link>
      </p>
    </motion.div>
  )
}
