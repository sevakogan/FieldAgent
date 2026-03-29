'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Logo } from '@/components/ui/Logo'

/* ─── Data ──────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: '📅',
    title: 'Schedule & Dispatch',
    desc: 'Assign jobs to your crew. Drag-and-drop calendar. Auto-assign by distance.',
    tint: 'from-blue-50 to-blue-100/60',
    accent: 'border-blue-400',
  },
  {
    icon: '📸',
    title: 'Photo Verification',
    desc: 'Before & after proof. Timestamp + GPS on every photo. Client sees the transformation.',
    tint: 'from-green-50 to-emerald-100/60',
    accent: 'border-green-400',
  },
  {
    icon: '💳',
    title: 'Automatic Payments',
    desc: 'Stripe-powered. Per job or monthly. Client approves → payment fires. Zero chasing.',
    tint: 'from-yellow-50 to-amber-100/60',
    accent: 'border-yellow-400',
  },
  {
    icon: '🔗',
    title: 'STR Integrations',
    desc: 'Airbnb, VRBO, Hospitable, Hostaway, Guesty. Checkout → auto-schedule cleaning.',
    tint: 'from-purple-50 to-violet-100/60',
    accent: 'border-purple-400',
  },
  {
    icon: '🤖',
    title: 'AI Assistant',
    desc: '"What\'s my schedule today?" Voice input. Role-based. Takes actions for you.',
    tint: 'from-pink-50 to-rose-100/60',
    accent: 'border-pink-400',
  },
  {
    icon: '🔍',
    title: 'Find a Pro Marketplace',
    desc: 'Clients search for service providers. Pros register free. Get found. Get hired.',
    tint: 'from-teal-50 to-cyan-100/60',
    accent: 'border-teal-400',
  },
] as const

const HOW_IT_WORKS = [
  { icon: '📅', title: 'Schedule the job', desc: 'Assign to your crew with one tap' },
  { icon: '📸', title: 'Worker does the work', desc: 'Photos, GPS tracking, checklists — all automatic' },
  { icon: '✅', title: 'Client approves', desc: 'Client sees proof, taps approve, gets charged' },
] as const

const BETA_PERKS = [
  { icon: '🎁', text: 'All features free during beta' },
  { icon: '💬', text: 'Direct line to the founders' },
  { icon: '🔒', text: 'Lock in early-adopter pricing forever' },
  { icon: '🚀', text: 'Shape the product with your feedback' },
] as const

const PLANS = [
  {
    name: 'BETA',
    price: 'Free',
    period: '',
    features: ['All features included', 'No credit card required', 'Full onboarding support', 'Lock in early pricing'],
    accent: '#34C759',
    featured: true,
  },
  {
    name: 'AFTER BETA',
    price: '$7',
    period: '/addr/mo',
    features: ['All features included', 'Unlimited users', 'Volume discounts available', 'Priority support'],
    accent: '#007AFF',
    featured: false,
  },
  {
    name: 'ANNUAL',
    price: '$6.30',
    period: '/addr/mo',
    features: ['10% savings vs monthly', 'Billed yearly', 'All features included', 'Dedicated account manager'],
    accent: '#AF52DE',
    featured: false,
  },
] as const

/* ─── Animation Variants ────────────────────────────────────────────── */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.58, 1] as const } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.58, 1] as const },
  }),
}

/* ─── Components ────────────────────────────────────────────────────── */

function FeatureCard({ feature, index }: { readonly feature: typeof FEATURES[number]; readonly index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
      className={`bg-gradient-to-br ${feature.tint} border-l-4 ${feature.accent} rounded-2xl p-6 shadow-sm border border-white/60 backdrop-blur-sm`}
    >
      <span className="text-3xl block mb-3">{feature.icon}</span>
      <h3 className="font-bold text-[15px] mb-1.5" style={{ color: '#1C1C1E' }}>
        {feature.title}
      </h3>
      <p className="text-[13px] leading-relaxed" style={{ color: '#8E8E93' }}>
        {feature.desc}
      </p>
    </motion.div>
  )
}

function StepCard({ step, index }: { readonly step: typeof HOW_IT_WORKS[number]; readonly index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="flex flex-col items-center text-center gap-3"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: index * 0.15 }}
        className="w-16 h-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center"
      >
        <span className="text-3xl">{step.icon}</span>
      </motion.div>
      <div className="w-8 h-8 rounded-full bg-[#007AFF] text-white text-sm font-bold flex items-center justify-center">
        {index + 1}
      </div>
      <h3 className="text-lg font-bold" style={{ color: '#1C1C1E' }}>{step.title}</h3>
      <p className="text-sm max-w-[220px]" style={{ color: '#AEAEB2' }}>{step.desc}</p>
    </motion.div>
  )
}

function PricingCard({ plan, index }: { readonly plan: typeof PLANS[number]; readonly index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className={`relative rounded-2xl p-7 transition-all duration-200 hover:scale-[1.02] ${
        plan.featured
          ? 'bg-[#1C1C1E] text-white shadow-xl shadow-black/10'
          : 'bg-white text-[#1C1C1E] border border-[#E5E5EA]/60 shadow-sm'
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#34C759] text-white text-xs font-bold rounded-full">
          AVAILABLE NOW
        </div>
      )}
      <div className={`text-xs font-bold tracking-widest mb-5 ${plan.featured ? 'text-white/50' : 'text-[#AEAEB2]'}`}>
        {plan.name}
      </div>
      <div className="mb-6">
        <span className="text-[40px] font-bold tracking-[-0.03em]">{plan.price}</span>
        {plan.period && (
          <span className={`text-sm ${plan.featured ? 'text-white/40' : 'text-[#AEAEB2]'}`}>{plan.period}</span>
        )}
      </div>
      <ul className="space-y-3 mb-7">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.accent }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className={`text-sm leading-tight ${plan.featured ? 'text-white/70' : 'text-[#636366]'}`}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/signup/company"
        className={`block w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors no-underline ${
          plan.featured
            ? 'bg-[#34C759] text-white hover:bg-[#30B855]'
            : 'bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA]'
        }`}
      >
        {plan.featured ? 'Start Free Beta' : 'Get Started'}
      </Link>
    </motion.div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function BetaLandingPage() {
  return (
    <div className="min-h-dvh bg-[#F2F2F7]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#E5E5EA]/60">
        <div className="flex items-center justify-between px-5 py-3 max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Logo size={32} />
            <span className="font-black text-lg tracking-tight" style={{ color: '#1C1C1E' }}>
              KleanHQ
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
              style={{ backgroundColor: '#FF9500', color: '#fff' }}
            >
              Beta
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[14px] font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-70 no-underline"
              style={{ color: '#007AFF' }}
            >
              Log In
            </Link>
            <Link
              href="/signup/company"
              className="text-[14px] font-semibold text-white px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90 shadow-sm no-underline"
              style={{ backgroundColor: '#007AFF' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#F2F2F7] via-white to-[#EAF3FF]" />
          <motion.div
            className="relative text-center px-5 pt-20 pb-16 max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-6">
              <Logo size={64} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
                style={{ backgroundColor: 'rgba(52,199,89,0.12)', color: '#34C759' }}
              >
                Beta — Free Access
              </span>
            </motion.div>
            <motion.h1
              className="font-extrabold text-4xl sm:text-5xl md:text-[56px] tracking-tight leading-[1.1] mb-5"
              style={{ color: '#1C1C1E' }}
              variants={fadeUp}
            >
              Run your field service{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#007AFF] to-[#AF52DE]">
                business like a pro
              </span>
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto"
              style={{ color: '#636366' }}
              variants={fadeUp}
            >
              The all-in-one CRM for cleaning companies, pool services,
              STR turnovers, and field service teams. Schedule. Dispatch. Track. Get Paid.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3" variants={fadeUp}>
              <Link
                href="/signup/company"
                className="inline-flex items-center gap-2 text-white font-bold text-[15px] px-8 py-4 rounded-2xl transition-all hover:opacity-90 shadow-lg shadow-[#007AFF]/25 no-underline"
                style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
              >
                Create Your Account
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-semibold text-[15px] px-6 py-3.5 rounded-2xl transition-colors hover:bg-[#E5E5EA] no-underline"
                style={{ color: '#636366' }}
              >
                I already have an account
              </Link>
            </motion.div>
            <motion.p className="text-xs mt-5" style={{ color: '#AEAEB2' }} variants={fadeUp}>
              Free during Beta &middot; No credit card required &middot; Set up in 2 minutes
            </motion.p>
          </motion.div>
        </section>

        {/* Gradient transition */}
        <div className="h-16 bg-gradient-to-b from-[#EAF3FF] to-[#E0EEFF]" />

        {/* Features */}
        <section className="py-16 bg-gradient-to-b from-[#E0EEFF] to-[#E8F0FE]">
          <div className="max-w-5xl mx-auto px-5">
            <motion.h2
              className="text-3xl sm:text-[40px] font-extrabold text-center mb-14"
              style={{ color: '#1C1C1E' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Everything you need. Nothing you don&apos;t.
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} feature={f} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Gradient transition */}
        <div className="h-16 bg-gradient-to-b from-[#E8F0FE] via-[#E8E4F8] to-[#F0E6FF]" />

        {/* How it works */}
        <section className="py-16 bg-gradient-to-b from-[#F0E6FF] to-[#F5EEFF]">
          <div className="max-w-4xl mx-auto px-5">
            <motion.h2
              className="text-3xl sm:text-[40px] font-extrabold text-center mb-16"
              style={{ color: '#1C1C1E' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              How it works
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
              {HOW_IT_WORKS.map((step, i) => (
                <StepCard key={step.title} step={step} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Gradient transition */}
        <div className="h-16 bg-gradient-to-b from-[#F5EEFF] via-[#FFF0E8] to-[#FFF8F5]" />

        {/* Beta perks */}
        <section className="py-16 bg-gradient-to-b from-[#FFF8F5] to-[#FFF5F0]">
          <div className="max-w-3xl mx-auto px-5">
            <motion.h2
              className="text-3xl sm:text-[40px] font-extrabold text-center mb-4"
              style={{ color: '#1C1C1E' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Why join the beta?
            </motion.h2>
            <motion.p
              className="text-center text-base mb-12"
              style={{ color: '#8E8E93' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Early adopters get exclusive benefits that never expire.
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BETA_PERKS.map((perk, i) => (
                <motion.div
                  key={perk.text}
                  className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-[#E5E5EA]/60"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <span className="text-2xl">{perk.icon}</span>
                  <span className="text-[15px] font-medium" style={{ color: '#1C1C1E' }}>{perk.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gradient transition */}
        <div className="h-16 bg-gradient-to-b from-[#FFF5F0] via-[#EDE6FF] to-[#F0E8FF]" />

        {/* Pricing */}
        <section className="py-16 bg-gradient-to-b from-[#F0E8FF] to-[#F2F2F7]">
          <div className="max-w-[880px] mx-auto px-5">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#34C759]/10 text-[#34C759] text-xs font-bold tracking-widest uppercase mb-4">
                Free Right Now
              </span>
              <h2 className="text-3xl sm:text-[40px] font-extrabold" style={{ color: '#1C1C1E' }}>
                Simple, transparent pricing
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {PLANS.map((plan, i) => (
                <PricingCard key={plan.name} plan={plan} index={i} />
              ))}
            </div>

            {/* Migration card */}
            <motion.div
              className="rounded-2xl border-2 border-[#FF9F0A]/30 bg-gradient-to-br from-[#FFF8EF] to-white p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1C1C1E' }}>
                Switching from Jobber, Housecall Pro, ServiceTitan...?
              </h3>
              <p className="text-sm mb-5" style={{ color: '#636366' }}>
                We&apos;ll migrate your data for free. Zero downtime. Full support.
              </p>
              <Link
                href="/signup/company"
                className="inline-flex items-center gap-2 font-semibold text-sm hover:underline no-underline"
                style={{ color: '#007AFF' }}
              >
                Start Free Beta
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 py-20">
          <motion.div
            className="max-w-lg mx-auto rounded-3xl p-10 shadow-xl text-center"
            style={{ background: 'linear-gradient(135deg, #007AFF 0%, #AF52DE 50%, #FF2D55 100%)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-extrabold text-2xl sm:text-3xl text-white mb-3">
              Ready to get organized?
            </h2>
            <p className="text-white/80 text-[15px] mb-7">
              Join the beta and start managing your business today. Free forever during beta.
            </p>
            <Link
              href="/signup/company"
              className="inline-block bg-white font-bold text-[15px] px-8 py-4 rounded-2xl transition-opacity hover:opacity-90 shadow-lg no-underline"
              style={{ color: '#007AFF' }}
            >
              Create Free Account
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white" style={{ borderColor: '#E5E5EA' }}>
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg no-underline" style={{ color: '#1C1C1E' }}>
              <Logo size={28} />
              KleanHQ
            </Link>
            <div className="flex items-center gap-4 text-sm" style={{ color: '#AEAEB2' }}>
              <span>&copy; 2026</span>
              <span style={{ color: '#E5E5EA' }}>&middot;</span>
              <Link href="/terms" className="hover:text-[#1C1C1E] transition-colors no-underline">
                Terms
              </Link>
              <span style={{ color: '#E5E5EA' }}>&middot;</span>
              <Link href="/privacy" className="hover:text-[#1C1C1E] transition-colors no-underline">
                Privacy
              </Link>
            </div>
            <div className="text-sm" style={{ color: '#AEAEB2' }}>
              Built in Miami 🌴
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
