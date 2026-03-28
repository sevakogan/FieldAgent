'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: '📋',
    title: 'Job Management',
    desc: 'Schedule, assign, and track every job from start to finish.',
  },
  {
    icon: '👥',
    title: 'Client & Property CRM',
    desc: 'Manage clients, properties, service history, and billing in one place.',
  },
  {
    icon: '📅',
    title: 'Smart Calendar',
    desc: 'Visual scheduling with drag & drop, recurring jobs, and team views.',
  },
  {
    icon: '💰',
    title: 'Invoicing & Payments',
    desc: 'Auto-generate invoices, accept payments via Stripe, track revenue.',
  },
  {
    icon: '👷',
    title: 'Team Management',
    desc: 'Invite workers, assign roles, track hours, and manage pay rates.',
  },
  {
    icon: '📊',
    title: 'Reports & Insights',
    desc: 'Revenue dashboards, job completion rates, and client analytics.',
  },
] as const

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
}

export default function BetaLandingPage() {
  return (
    <div className="min-h-dvh" style={{ background: 'linear-gradient(180deg, #F2F2F7 0%, #FFFFFF 50%, #F2F2F7 100%)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: '#007AFF' }}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-black text-lg tracking-tight" style={{ color: '#1C1C1E' }}>
            KleanHQ
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#FF9500', color: '#fff' }}
          >
            Beta
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[14px] font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-70"
            style={{ color: '#007AFF' }}
          >
            Log In
          </Link>
          <Link
            href="/signup/company"
            className="text-[14px] font-semibold text-white px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#007AFF' }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        className="text-center px-5 pt-16 pb-12 max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ backgroundColor: 'rgba(0,122,255,0.1)', color: '#007AFF' }}
          >
            Beta Access
          </span>
        </motion.div>
        <motion.h1
          className="font-black text-4xl sm:text-5xl tracking-tight leading-tight mb-4"
          style={{ color: '#1C1C1E' }}
          variants={fadeUp}
        >
          Run your field service
          <br />
          <span style={{ color: '#007AFF' }}>business like a pro</span>
        </motion.h1>
        <motion.p
          className="text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto"
          style={{ color: '#8E8E93' }}
          variants={fadeUp}
        >
          KleanHQ is the all-in-one CRM for pool cleaners, cleaning companies,
          STR turnovers, and field service teams. Manage clients, jobs, invoicing,
          and your team — all from your phone.
        </motion.p>
        <motion.div className="flex items-center justify-center gap-3" variants={fadeUp}>
          <Link
            href="/signup/company"
            className="inline-flex items-center gap-2 text-white font-bold text-[15px] px-7 py-3.5 rounded-2xl transition-opacity hover:opacity-90 shadow-lg"
            style={{ backgroundColor: '#007AFF' }}
          >
            Create Your Account
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
        <motion.p
          className="text-xs mt-4"
          style={{ color: '#AEAEB2' }}
          variants={fadeUp}
        >
          Free during Beta &middot; No credit card required
        </motion.p>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        className="px-5 pb-16 max-w-4xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={stagger}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              className="bg-white rounded-2xl p-5 shadow-sm border"
              style={{ borderColor: '#E5E5EA' }}
              variants={fadeUp}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-[15px] mb-1" style={{ color: '#1C1C1E' }}>
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: '#8E8E93' }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <section className="px-5 pb-20 text-center">
        <div
          className="max-w-lg mx-auto rounded-3xl p-8 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
        >
          <h2 className="font-extrabold text-2xl text-white mb-2">
            Ready to get organized?
          </h2>
          <p className="text-white/80 text-[15px] mb-6">
            Join the beta and start managing your business today.
          </p>
          <Link
            href="/signup/company"
            className="inline-block bg-white font-bold text-[15px] px-7 py-3.5 rounded-2xl transition-opacity hover:opacity-90"
            style={{ color: '#007AFF' }}
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center px-5 py-6 border-t" style={{ borderColor: '#E5E5EA' }}>
        <div className="flex items-center justify-center gap-3 text-xs" style={{ color: '#AEAEB2' }}>
          <span>&copy; 2026 TheLevelTeam LLC</span>
          <span style={{ color: '#E5E5EA' }}>&middot;</span>
          <Link href="/terms" className="hover:text-[#1C1C1E] transition-colors no-underline">
            Terms
          </Link>
          <span style={{ color: '#E5E5EA' }}>&middot;</span>
          <Link href="/privacy" className="hover:text-[#1C1C1E] transition-colors no-underline">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  )
}
