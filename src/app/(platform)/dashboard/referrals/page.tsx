'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getReferrals, createReferral, type ReferralRow } from '@/lib/actions/referrals'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FF9F0A20', text: '#FF9F0A' },
  signed_up: { bg: '#007AFF20', text: '#007AFF' },
  qualified: { bg: '#AF52DE20', text: '#AF52DE' },
  rewarded: { bg: '#34C75920', text: '#34C759' },
  expired: { bg: '#8E8E9320', text: '#8E8E93' },
}

const REFERRAL_TYPES = [
  { key: 'company_company', icon: '🏢', label: 'Company → Company', desc: 'Refer a service business', reward: 'Recurring credit off platform billing', active: true },
  { key: 'client_client', icon: '👥', label: 'Client → Client', desc: 'Tell a friend about your cleaner', reward: '$25 credit toward next service', active: true },
  { key: 'client_company', icon: '👤→🏢', label: 'Client → Company', desc: 'Invite a company to KleanHQ', reward: 'Service credit + 1st month free', active: false },
  { key: 'company_client', icon: '🏢→👤', label: 'Company → Client', desc: 'Onboard customers to portal', reward: 'Tier badges → lower fees', active: false },
  { key: 'worker_worker', icon: '👷', label: 'Worker → Worker', desc: 'Bring a friend', reward: 'Flat bonus after X completed jobs', active: false },
  { key: 'reseller_reseller', icon: '🔗', label: 'Reseller → Reseller', desc: 'Refer a reseller', reward: 'Recurring % of revenue', active: false },
]

const SHARE_CHANNELS = [
  { key: 'copy', icon: '📋', label: 'Copy Link', color: '#8E8E93' },
  { key: 'sms', icon: '💬', label: 'Text', color: '#34C759' },
  { key: 'email', icon: '📧', label: 'Email', color: '#007AFF' },
  { key: 'whatsapp', icon: '📱', label: 'WhatsApp', color: '#25D366' },
]

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Share panel state
  const [showShare, setShowShare] = useState(false)
  const [shareChannel, setShareChannel] = useState<string | null>(null)
  const [referredEmail, setReferredEmail] = useState('')
  const [referredPhone, setReferredPhone] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getReferrals()
    if (result.success && result.data) {
      setReferrals(result.data)
    } else {
      setError(result.error ?? 'Failed to load referrals')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500)
      return () => clearTimeout(t)
    }
  }, [toast])

  function handleShareAction(channel: string, code: string, link: string) {
    // Link points to signup, not landing page
    const signupLink = `${link}?signup=true`
    const message = `Join KleanHQ with my referral code ${code}! Create your account here: ${signupLink}`

    switch (channel) {
      case 'copy':
        navigator.clipboard.writeText(signupLink)
        setToast('Link copied!')
        setShareChannel(null)
        break
      case 'sms':
        if (referredPhone.trim()) {
          window.open(`sms:${referredPhone.trim()}?body=${encodeURIComponent(message)}`)
          // Also create referral record
          createReferral({ referred_email: referredPhone.trim(), referred_type: 'company' })
            .then(() => fetchData())
          setReferredPhone('')
          setShareChannel(null)
        } else {
          setShareChannel('sms')
        }
        break
      case 'email':
        if (referredEmail.trim()) {
          window.open(`mailto:${referredEmail.trim()}?subject=${encodeURIComponent('Join KleanHQ!')}&body=${encodeURIComponent(message)}`)
          createReferral({ referred_email: referredEmail.trim(), referred_type: 'company' })
            .then(() => fetchData())
          setReferredEmail('')
          setShareChannel(null)
        } else {
          setShareChannel('email')
        }
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`)
        setShareChannel(null)
        break
    }
  }

  const handleSendEmail = async () => {
    if (!referredEmail.trim() || !myCode || !myLink) return
    setCreating(true)
    const signupLink = `${myLink}?signup=true`
    const message = `Join KleanHQ with my referral code ${myCode}! Create your account here: ${signupLink}`
    window.open(`mailto:${referredEmail.trim()}?subject=${encodeURIComponent('Join KleanHQ!')}&body=${encodeURIComponent(message)}`)
    await createReferral({ referred_email: referredEmail.trim(), referred_type: 'company' })
    await fetchData()
    setReferredEmail('')
    setShareChannel(null)
    setCreating(false)
    setToast('Email invite sent!')
  }

  const handleSendSms = () => {
    if (!referredPhone.trim() || !myCode || !myLink) return
    const signupLink = `${myLink}?signup=true`
    const message = `Join KleanHQ with my referral code ${myCode}! Create your account here: ${signupLink}`
    window.open(`sms:${referredPhone.trim()}?body=${encodeURIComponent(message)}`)
    createReferral({ referred_email: referredPhone.trim(), referred_type: 'company' })
      .then(() => fetchData())
    setReferredPhone('')
    setShareChannel(null)
    setToast('Text invite opened!')
  }

  // Stats
  const stats = {
    total: referrals.length,
    signedUp: referrals.filter(r => r.status === 'signed_up' || r.status === 'qualified' || r.status === 'rewarded').length,
    qualified: referrals.filter(r => r.status === 'qualified' || r.status === 'rewarded').length,
    earned: referrals.reduce((sum, r) => sum + (r.total_earned ?? 0), 0),
  }

  const myCode = referrals.length > 0 ? referrals[0].referral_code : null
  const myLink = referrals.length > 0 ? referrals[0].referral_link : null

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#34C759] text-white text-sm font-semibold shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Referrals</h1>
          <p className="text-sm text-[#8E8E93] mt-0.5">Grow your network. Earn rewards.</p>
        </div>
        <button
          onClick={() => { setShowShare(!showShare); setShareChannel(null) }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            showShare ? 'bg-[#FF3B30] text-white' : 'bg-[#007AFF] text-white hover:bg-[#0066DD]'
          }`}
        >
          {showShare ? 'Close' : '+ Invite Someone'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {/* Your Referral Code + Share */}
      {myCode && myLink && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#007AFF] to-[#AF52DE] rounded-2xl p-5 mb-6 text-white"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/60 uppercase font-semibold tracking-wider mb-1">Your Referral Code</p>
              <code className="text-2xl font-mono font-bold tracking-[3px]">{myCode}</code>
              <p className="text-xs text-white/50 mt-1 truncate max-w-[300px]">{myLink}</p>
            </div>
            <div className="flex gap-1.5">
              {SHARE_CHANNELS.map(ch => (
                <button
                  key={ch.key}
                  onClick={() => {
                    if (ch.key === 'copy' || ch.key === 'whatsapp') {
                      handleShareAction(ch.key, myCode, myLink)
                    } else {
                      setShowShare(true)
                      setShareChannel(ch.key)
                    }
                  }}
                  className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm transition-colors"
                  title={ch.label}
                >
                  {ch.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Inline share input — slides down from banner */}
          <AnimatePresence>
            {shareChannel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-white/15">
                  {shareChannel === 'email' && (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter their email address"
                        value={referredEmail}
                        onChange={e => setReferredEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
                        autoFocus
                        className="flex-1 px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <button
                        onClick={handleSendEmail}
                        disabled={creating || !referredEmail.trim()}
                        className="px-4 py-2 bg-white text-[#007AFF] rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                      >
                        {creating ? '...' : 'Send'}
                      </button>
                      <button onClick={() => setShareChannel(null)} className="px-3 py-2 text-white/50 hover:text-white text-sm">✕</button>
                    </div>
                  )}
                  {shareChannel === 'sms' && (
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="Enter their phone number"
                        value={referredPhone}
                        onChange={e => setReferredPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendSms()}
                        autoFocus
                        className="flex-1 px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <button
                        onClick={handleSendSms}
                        disabled={!referredPhone.trim()}
                        className="px-4 py-2 bg-white text-[#34C759] rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                      >
                        Text
                      </button>
                      <button onClick={() => setShareChannel(null)} className="px-3 py-2 text-white/50 hover:text-white text-sm">✕</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Invite panel — shows when + Invite Someone is clicked */}
      <AnimatePresence>
        {showShare && !myCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 text-center">
              <p className="text-sm text-[#8E8E93]">Create your first referral to get your unique code</p>
              <div className="flex gap-2 mt-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Their email address"
                  value={referredEmail}
                  onChange={e => setReferredEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                />
                <button
                  onClick={async () => {
                    if (!referredEmail.trim()) return
                    setCreating(true)
                    await createReferral({ referred_email: referredEmail.trim() })
                    await fetchData()
                    setReferredEmail('')
                    setShowShare(false)
                    setCreating(false)
                    setToast('Referral created!')
                  }}
                  disabled={creating || !referredEmail.trim()}
                  className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {creating ? '...' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite panel — when code exists, show share options */}
      <AnimatePresence>
        {showShare && myCode && myLink && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
              <h2 className="font-semibold text-[#1C1C1E] mb-3">How do you want to invite?</h2>
              <div className="grid grid-cols-4 gap-3">
                {SHARE_CHANNELS.map(ch => (
                  <button
                    key={ch.key}
                    onClick={() => {
                      if (ch.key === 'copy') {
                        handleShareAction('copy', myCode, myLink)
                      } else if (ch.key === 'whatsapp') {
                        handleShareAction('whatsapp', myCode, myLink)
                      } else {
                        setShareChannel(shareChannel === ch.key ? null : ch.key)
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all ${
                      shareChannel === ch.key
                        ? 'border-[#007AFF] bg-[#007AFF]/5 ring-1 ring-[#007AFF]/20'
                        : 'border-[#E5E5EA] hover:bg-[#F2F2F7]'
                    }`}
                  >
                    <span className="text-2xl">{ch.icon}</span>
                    <span className="text-xs font-medium text-[#1C1C1E]">{ch.label}</span>
                  </button>
                ))}
              </div>

              {/* Expanded input for selected channel */}
              <AnimatePresence>
                {shareChannel === 'email' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#E5E5EA]">
                      <input
                        type="email"
                        placeholder="Enter their email address"
                        value={referredEmail}
                        onChange={e => setReferredEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
                        autoFocus
                        className="flex-1 px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                      <button
                        onClick={handleSendEmail}
                        disabled={creating || !referredEmail.trim()}
                        className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        {creating ? '...' : 'Send Email'}
                      </button>
                    </div>
                  </motion.div>
                )}
                {shareChannel === 'sms' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#E5E5EA]">
                      <input
                        type="tel"
                        placeholder="Enter their phone number"
                        value={referredPhone}
                        onChange={e => setReferredPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendSms()}
                        autoFocus
                        className="flex-1 px-4 py-2.5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                      />
                      <button
                        onClick={handleSendSms}
                        disabled={!referredPhone.trim()}
                        className="px-5 py-2.5 bg-[#34C759] text-white rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        Send Text
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Invited', value: stats.total, color: '#007AFF' },
          { label: 'Signed Up', value: stats.signedUp, color: '#5AC8FA' },
          { label: 'Qualified', value: stats.qualified, color: '#AF52DE' },
          { label: 'Earned', value: `$${stats.earned.toFixed(0)}`, color: '#34C759' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E5E5EA] p-4">
            <p className="text-xs text-[#8E8E93] mb-1">{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 6 Referral Types */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Referral Programs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {REFERRAL_TYPES.map(rt => (
            <div
              key={rt.key}
              className={`rounded-xl border p-3 transition-all ${
                rt.active
                  ? 'bg-white border-[#E5E5EA] hover:border-[#007AFF]/30'
                  : 'bg-[#F9F9FB] border-[#F2F2F7] opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{rt.icon}</span>
                <span className="text-xs font-semibold text-[#1C1C1E]">{rt.label}</span>
              </div>
              <p className="text-[10px] text-[#8E8E93] mb-1.5">{rt.desc}</p>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-[#34C759] font-medium">🎁 {rt.reward}</span>
              </div>
              {!rt.active && (
                <span className="text-[9px] text-[#C7C7CC] italic mt-1 block">Coming soon</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : referrals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-10 text-center">
          <div className="text-3xl mb-2">🔗</div>
          <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">No referrals yet</h3>
          <p className="text-sm text-[#8E8E93] mb-4">Share your code to start earning rewards</p>
          <button
            onClick={() => setShowShare(true)}
            className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0066DD] transition-colors"
          >
            Invite Someone
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="p-4 border-b border-[#E5E5EA]">
            <h2 className="font-semibold text-[#1C1C1E]">Referral History</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5EA]">
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Referred</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Type</th>
                <th className="text-left p-4 text-xs font-medium text-[#8E8E93] uppercase">Status</th>
                <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Earned</th>
                <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Date</th>
                <th className="text-right p-4 text-xs font-medium text-[#8E8E93] uppercase">Share</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(r => {
                const statusStyle = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending
                return (
                  <tr key={r.id} className="border-b border-[#E5E5EA] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                    <td className="p-4 text-sm text-[#1C1C1E]">
                      {r.referred_user_email ?? <span className="text-[#C7C7CC] italic">Awaiting signup</span>}
                    </td>
                    <td className="p-4 text-xs text-[#8E8E93] capitalize">{r.referred_type}</td>
                    <td className="p-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right font-medium text-[#34C759]">
                      {r.total_earned > 0 ? `$${r.total_earned.toFixed(2)}` : '—'}
                    </td>
                    <td className="p-4 text-xs text-right text-[#8E8E93]">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(r.referral_link)
                          setToast('Link copied!')
                        }}
                        className="text-[11px] text-[#007AFF] font-medium hover:underline"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
