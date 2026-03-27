'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getCalendarJobs } from '@/lib/actions/company'
import { updateJob, duplicateJob, createJob } from '@/lib/actions/jobs'
import { getClients, type ClientRow } from '@/lib/actions/clients'
import { getAddresses, type AddressRow } from '@/lib/actions/addresses'
import { getServices, type ServiceRow } from '@/lib/actions/services'

const PACIFIC_TZ = 'America/Los_Angeles'
type CalendarJob = {
  id: string; service_name: string; status: string; scheduled_date: string
  scheduled_time: string | null; address_street: string; address_city?: string
  worker_name: string | null; price: number | null; client_name?: string
}
type ViewMode = 'month' | 'week' | 'day'

const HOUR_PX = 60, START_HOUR = 7, END_HOUR = 18, ANY_H = 48, DEFAULT_DUR = 60
const TOTAL_HOURS = END_HOUR - START_HOUR, GRID_H = TOTAL_HOURS * HOUR_PX
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SVC_COLORS = [
  { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32' },
  { bg: '#FFF3E0', border: '#FFCC80', text: '#E65100' },
  { bg: '#E3F2FD', border: '#90CAF9', text: '#1565C0' },
  { bg: '#FFF9C4', border: '#FFF176', text: '#F57F17' },
  { bg: '#F3E5F5', border: '#CE93D8', text: '#7B1FA2' },
  { bg: '#E0F2F1', border: '#80CBC4', text: '#00695C' },
  { bg: '#FCE4EC', border: '#F48FB1', text: '#C2185B' },
  { bg: '#EFEBE9', border: '#BCAAA4', text: '#4E342E' },
]
const DONE_COLOR = { bg: '#F5F5F5', border: '#E0E0E0', text: '#9E9E9E' }

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
function jobColor(j: CalendarJob) { return j.status === 'completed' || j.status === 'charged' ? DONE_COLOR : SVC_COLORS[hash(j.service_name) % SVC_COLORS.length] }
function fmtKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function todayPT() { return new Date().toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ }) }
function fmtTime(t: string | null) { if (!t) return ''; const [h, m] = t.split(':'); const hr = +h; return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}` }
function toHours(t: string) { const [h, m] = t.split(':').map(Number); return h + m / 60 }
function getMonday(d: Date) { const r = new Date(d); r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); r.setHours(0, 0, 0, 0); return r }

function svcIcon(n: string): string {
  const l = n.toLowerCase()
  if (l.includes('clean') || l.includes('turnover')) return '🧹'
  if (l.includes('pool')) return '🏊'; if (l.includes('lawn') || l.includes('grass')) return '🌿'
  if (l.includes('plumb')) return '🔧'; if (l.includes('handyman')) return '🛠️'
  if (l.includes('laundry') || l.includes('linen')) return '🧺'
  if (l.includes('inspect')) return '🔍'; if (l.includes('deep')) return '✨'
  return '⚙️'
}

function computeOverlaps(jobs: CalendarJob[]) {
  const items = jobs.filter(j => j.scheduled_time).map(j => {
    const s = toHours(j.scheduled_time!); return { id: j.id, s, e: s + DEFAULT_DUR / 60 }
  }).sort((a, b) => a.s - b.s)
  const result = new Map<string, { i: number; n: number }>()
  const groups: typeof items[] = []
  for (const it of items) {
    let placed = false
    for (const g of groups) {
      if (g.some(x => x.s < it.e && it.s < x.e)) { g.push(it); placed = true; break }
    }
    if (!placed) groups.push([it])
  }
  for (const g of groups) g.forEach((x, i) => result.set(x.id, { i, n: g.length }))
  return result
}

/** Frosted tooltip shown on hover */
function Tooltip({ job }: { job: CalendarJob }) {
  return (
    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl p-2.5 pointer-events-none"
      style={{ background: 'rgba(28,28,30,0.92)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
      <p className="text-[11px] text-white font-bold mb-1">{job.client_name ?? 'Unknown'}</p>
      <p className="text-[10px] text-white/70">📍 {job.address_street}</p>
      <p className="text-[10px] text-white/70">{svcIcon(job.service_name)} {job.service_name}</p>
      {job.price != null && <p className="text-[10px] text-white/70">💰 ${Number(job.price).toFixed(0)}</p>}
      <p className="text-[10px] text-white/70">🕐 {fmtTime(job.scheduled_time) || 'Any time'}</p>
      {job.worker_name && <p className="text-[10px] text-white/70">👷 {job.worker_name}</p>}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45" style={{ background: 'rgba(28,28,30,0.92)' }} />
    </div>
  )
}

/** Small chip for any-time row */
function AnyTimeChip({ job, onDrag, hovered, setHovered }: {
  job: CalendarJob; onDrag: () => void; hovered: string | null; setHovered: (id: string | null) => void
}) {
  const c = jobColor(job)
  return (
    <div draggable onDragStart={onDrag}
      onClick={() => { window.location.href = `/dashboard/jobs/${job.id}` }}
      onMouseEnter={() => setHovered(job.id)} onMouseLeave={() => setHovered(null)}
      className="relative rounded px-1 py-0.5 text-[8px] font-medium truncate cursor-pointer border"
      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text, maxWidth: '100%' }}>
      {job.service_name}
      {hovered === job.id && <Tooltip job={job} />}
    </div>
  )
}

/** Positioned card in the time grid */
function JobCard({ job, style, onDrag, hovered, setHovered }: {
  job: CalendarJob; style: React.CSSProperties; onDrag: () => void; hovered: string | null; setHovered: (id: string | null) => void
}) {
  const c = jobColor(job)
  const done = job.status === 'completed' || job.status === 'charged'
  return (
    <div draggable onDragStart={onDrag}
      onClick={() => { window.location.href = `/dashboard/jobs/${job.id}` }}
      onMouseEnter={() => setHovered(job.id)} onMouseLeave={() => setHovered(null)}
      className="absolute rounded-lg px-1.5 py-1 cursor-pointer overflow-hidden border transition-shadow hover:shadow-md"
      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text, ...style }}>
      <div className="flex items-start gap-1 min-w-0">
        {done
          ? <span className="text-[#4CAF50] font-bold text-xs mt-0.5 shrink-0">✓</span>
          : <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: c.border }} />}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold truncate leading-tight">{job.service_name}</p>
          <p className="text-[9px] truncate leading-tight opacity-80">{job.address_street}</p>
        </div>
      </div>
      {hovered === job.id && <Tooltip job={job} />}
    </div>
  )
}

/** Renders hour lines + positioned JobCards for a column */
function TimedColumn({ jobs, overlaps, isToday, dateKey, onDrop, setDrag, hovered, setHovered }: {
  jobs: CalendarJob[]; overlaps: Map<string, { i: number; n: number }>; isToday: boolean
  dateKey: string; onDrop: (dk: string, t: string | null) => void
  setDrag: (j: CalendarJob) => void; hovered: string | null; setHovered: (id: string | null) => void
}) {
  return (
    <div className={`flex-1 min-w-0 relative border-r border-[#F0F0F0] last:border-r-0 ${isToday ? 'bg-blue-50/30' : ''}`}
      style={{ height: GRID_H }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault()
        const y = e.clientY - e.currentTarget.getBoundingClientRect().top
        const hr = Math.floor(y / HOUR_PX) + START_HOUR
        const mn = Math.round(((y % HOUR_PX) / HOUR_PX) * 2) * 30
        onDrop(dateKey, `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`)
      }}>
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={i} className="absolute w-full border-b border-[#F5F5F5]" style={{ top: i * HOUR_PX }} />
      ))}
      {jobs.map(j => {
        const hrs = toHours(j.scheduled_time!)
        const top = (hrs - START_HOUR) * HOUR_PX
        const h = (DEFAULT_DUR / 60) * HOUR_PX
        const ol = overlaps.get(j.id) ?? { i: 0, n: 1 }
        return (
          <JobCard key={j.id} job={j} onDrag={() => setDrag(j)} hovered={hovered} setHovered={setHovered}
            style={{ top: Math.max(0, top), height: Math.min(h, GRID_H - top), left: `${(ol.i / ol.n) * 100}%`, width: `${100 / ol.n - 1}%` }} />
        )
      })}
    </div>
  )
}

// ─── Main ───
export default function CalendarPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('week')
  const [weekOff, setWeekOff] = useState(0)
  const [weekN, setWeekN] = useState(1)
  const [dayKey, setDayKey] = useState<string | null>(null)
  const [dragJob, setDragJob] = useState<CalendarJob | null>(null)
  const [confirmMove, setConfirmMove] = useState<{ job: CalendarJob; date: string; time: string | null } | null>(null)
  const [moving, setMoving] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  // Schedule popup
  const [showSched, setShowSched] = useState(false)
  const [sClients, setSClients] = useState<ClientRow[]>([])
  const [sAddrs, setSAddrs] = useState<AddressRow[]>([])
  const [sSvcs, setSSvcs] = useState<ServiceRow[]>([])
  const [sLoading, setSLoading] = useState(false)
  const [sForm, setSForm] = useState({ client_id: '', address_id: '', service_type_id: '', date: '', time: '', price: '' })
  const [sErr, setSErr] = useState('')
  const [sSaving, setSSaving] = useState(false)

  const today = todayPT()
  const now = useMemo(() => new Date(), [])
  const monday = useMemo(() => { const b = getMonday(now); b.setDate(b.getDate() + weekOff * 7); return b }, [now, weekOff])
  const wDays = useMemo(() => Array.from({ length: 7 * weekN }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d }), [monday, weekN])
  const monthLabel = useMemo(() => wDays[Math.floor(wDays.length / 2)].toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: PACIFIC_TZ }), [wDays])
  const rangeLabel = useMemo(() => `${wDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${wDays[wDays.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, [wDays])

  const loadRef = useRef(false)
  const fetchJobs = useCallback(async (spin = false) => {
    if (spin) setLoading(true)
    const r = await getCalendarJobs(now.getFullYear(), now.getMonth())
    if (r.success && r.data) setJobs(r.data as CalendarJob[])
    if (spin || !loadRef.current) setLoading(false)
    loadRef.current = true
  }, [now])
  useEffect(() => { fetchJobs(true) }, [fetchJobs])

  const byDate = useMemo(() => { const m = new Map<string, CalendarJob[]>(); for (const j of jobs) m.set(j.scheduled_date, [...(m.get(j.scheduled_date) ?? []), j]); return m }, [jobs])
  const olByDate = useMemo(() => { const m = new Map<string, Map<string, { i: number; n: number }>>(); for (const [k, v] of byDate) m.set(k, computeOverlaps(v)); return m }, [byDate])
  const workers = useMemo(() => [...new Set(jobs.map(j => j.worker_name).filter(Boolean) as string[])].sort(), [jobs])

  const handleDrop = (dk: string, time: string | null) => {
    if (!dragJob) return
    if (dragJob.scheduled_date === dk && dragJob.scheduled_time === time) { setDragJob(null); return }
    setConfirmMove({ job: dragJob, date: dk, time }); setDragJob(null)
  }
  const doMove = async () => {
    if (!confirmMove) return
    setMoving(true)
    await updateJob(confirmMove.job.id, { scheduled_date: confirmMove.date, ...(confirmMove.time !== undefined && { scheduled_time: confirmMove.time }) })
    setJobs(p => p.map(j => j.id === confirmMove.job.id ? { ...j, scheduled_date: confirmMove.date, scheduled_time: confirmMove.time ?? j.scheduled_time } : j))
    fetchJobs(); setConfirmMove(null); setMoving(false)
  }
  const openSched = async (pre?: string) => {
    setShowSched(true); setSForm({ client_id: '', address_id: '', service_type_id: '', date: pre ?? '', time: '', price: '' }); setSErr(''); setSLoading(true)
    const [c, a, s] = await Promise.all([getClients(), getAddresses(), getServices()])
    if (c.success && c.data) setSClients(c.data); if (a.success && a.data) setSAddrs(a.data); if (s.success && s.data) setSSvcs(s.data)
    setSLoading(false)
  }
  const submitSched = async () => {
    if (!sForm.address_id || !sForm.service_type_id || !sForm.date) { setSErr('Select address, service, and date'); return }
    setSSaving(true)
    const r = await createJob({ address_id: sForm.address_id, service_type_id: sForm.service_type_id, scheduled_date: sForm.date, scheduled_time: sForm.time || undefined, price: parseFloat(sForm.price) || 0 })
    if (r.success) { setShowSched(false); fetchJobs() } else { setSErr(r.error ?? 'Failed') }
    setSSaving(false)
  }
  const filtAddrs = sForm.client_id ? sAddrs.filter(a => a.client_id === sForm.client_id) : sAddrs

  // ─── Time labels column (reused) ───
  const TimeLabels = ({ height }: { height: number }) => (
    <div className="w-14 shrink-0 border-r border-[#F0F0F0] relative" style={{ height }}>
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={i} className="absolute w-full flex items-start justify-end pr-2" style={{ top: i * HOUR_PX }}>
          <span className="text-[10px] text-[#AEAEB2] font-medium -mt-1.5">{(START_HOUR + i) % 12 || 12} {START_HOUR + i >= 12 ? 'PM' : 'AM'}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">{monthLabel}</h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">{rangeLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F2F2F7] rounded-xl p-0.5">
            {(['month', 'week', 'day'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => { setView(m); if (m === 'day' && !dayKey) setDayKey(today) }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all capitalize ${view === m ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93]'}`}>{m}</button>
            ))}
          </div>
          {view === 'week' && (
            <div className="flex bg-[#F2F2F7] rounded-xl p-0.5">
              {[1, 2, 3, 4].map(w => (
                <button key={w} onClick={() => setWeekN(w)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${weekN === w ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93]'}`}>{w}W</button>
              ))}
            </div>
          )}
          <button onClick={() => setWeekOff(o => o - 1)} className="w-8 h-8 rounded-lg hover:bg-[#F2F2F7] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={() => { setWeekOff(0); setDayKey(today) }} className="px-3 py-1.5 bg-[#007AFF] text-white rounded-xl text-xs font-semibold hover:bg-[#0066DD]">Today</button>
          <button onClick={() => setWeekOff(o => o + 1)} className="w-8 h-8 rounded-lg hover:bg-[#F2F2F7] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button onClick={() => openSched()} className="px-4 py-2 bg-[#1C1C1E] text-white rounded-2xl text-xs font-semibold hover:bg-[#3C3C43]">+ New Job</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" /></div>
      ) : view === 'week' ? (
        /* ═══ WEEK VIEW ═══ */
        <div className="rounded-2xl border border-[#E5E5EA]/60 bg-white overflow-hidden shadow-sm">
          {Array.from({ length: weekN }, (_, wi) => {
            const days = wDays.slice(wi * 7, (wi + 1) * 7)
            return (
              <div key={wi} className={wi > 0 ? 'border-t-2 border-[#E5E5EA]' : ''}>
                {/* Day headers */}
                <div className="flex border-b border-[#F0F0F0]">
                  <div className="w-14 shrink-0" />
                  {days.map(d => { const dk = fmtKey(d), isT = dk === today; return (
                    <div key={dk} onClick={() => { setDayKey(dk); setView('day') }}
                      className={`flex-1 min-w-0 text-center py-2 cursor-pointer hover:bg-[#F8F8FA] border-r border-[#F0F0F0] last:border-r-0 ${isT ? 'bg-blue-50/40' : ''}`}>
                      <p className={`text-[11px] font-bold ${isT ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className={`text-sm font-bold ${isT ? 'text-[#007AFF]' : 'text-[#1C1C1E]'}`}>{d.getDate()}</p>
                      <div className={`h-0.5 mx-3 mt-1 rounded-full ${isT ? 'bg-[#007AFF]' : 'bg-[#E5E5EA]'}`} />
                    </div>
                  )})}
                </div>
                {/* Any time row */}
                <div className="flex border-b border-[#F0F0F0]">
                  <div className="w-14 shrink-0 flex items-center justify-center border-r border-[#F0F0F0] bg-[#FAFAFA]" style={{ height: ANY_H }}>
                    <span className="text-[9px] text-[#AEAEB2] font-semibold">Any</span>
                  </div>
                  {days.map(d => { const dk = fmtKey(d), dj = (byDate.get(dk) ?? []).filter(j => !j.scheduled_time); return (
                    <div key={dk} className="flex-1 min-w-0 border-r border-[#F0F0F0] bg-[#FAFAFA] px-0.5 py-0.5 overflow-hidden last:border-r-0"
                      style={{ height: ANY_H }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleDrop(dk, null) }}>
                      <div className="flex flex-wrap gap-0.5">
                        {dj.map(j => <AnyTimeChip key={j.id} job={j} onDrag={() => setDragJob(j)} hovered={hovered} setHovered={setHovered} />)}
                      </div>
                    </div>
                  )})}
                </div>
                {/* Time grid */}
                <div className="flex">
                  <TimeLabels height={GRID_H} />
                  {days.map(d => { const dk = fmtKey(d); return (
                    <TimedColumn key={dk} dateKey={dk} jobs={(byDate.get(dk) ?? []).filter(j => j.scheduled_time)}
                      overlaps={olByDate.get(dk) ?? new Map()} isToday={dk === today}
                      onDrop={handleDrop} setDrag={setDragJob} hovered={hovered} setHovered={setHovered} />
                  )})}
                </div>
              </div>
            )
          })}
        </div>
      ) : view === 'day' ? (
        /* ═══ DAY VIEW — Worker Columns ═══ */
        <div>
          <button onClick={() => setView('week')} className="mb-3 flex items-center gap-1.5 text-[#007AFF] text-xs font-semibold hover:underline">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
            Back to Week
          </button>
          <h2 className="text-lg font-bold text-[#1C1C1E] mb-3">
            {dayKey ? new Date(dayKey + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: PACIFIC_TZ }) : 'Select a day'}
          </h2>
          {dayKey && (() => {
            const dj = byDate.get(dayKey) ?? [], cols = ['Unassigned', ...workers]
            return (
              <div className="rounded-2xl border border-[#E5E5EA]/60 bg-white overflow-hidden shadow-sm">
                {/* Worker headers */}
                <div className="flex border-b border-[#F0F0F0]">
                  <div className="w-14 shrink-0" />
                  {cols.map(w => (
                    <div key={w} className="flex-1 min-w-0 text-center py-3 border-r border-[#F0F0F0] last:border-r-0">
                      <div className="w-8 h-8 rounded-full bg-[#E5E5EA] mx-auto mb-1 flex items-center justify-center text-[11px] font-bold text-[#636366]">
                        {w === 'Unassigned' ? '?' : w.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-[10px] font-semibold text-[#636366] truncate px-1">{w}</p>
                    </div>
                  ))}
                </div>
                {/* Any time */}
                <div className="flex border-b border-[#F0F0F0]">
                  <div className="w-14 shrink-0 flex items-center justify-center border-r border-[#F0F0F0] bg-[#FAFAFA]" style={{ height: ANY_H }}>
                    <span className="text-[9px] text-[#AEAEB2] font-semibold">Any</span>
                  </div>
                  {cols.map(w => {
                    const cj = dj.filter(j => !j.scheduled_time && (w === 'Unassigned' ? !j.worker_name : j.worker_name === w))
                    return (
                      <div key={w} className="flex-1 min-w-0 border-r border-[#F0F0F0] bg-[#FAFAFA] px-0.5 py-0.5 last:border-r-0" style={{ height: ANY_H }}>
                        {cj.map(j => <AnyTimeChip key={j.id} job={j} onDrag={() => setDragJob(j)} hovered={hovered} setHovered={setHovered} />)}
                      </div>
                    )
                  })}
                </div>
                {/* Time grid */}
                <div className="flex">
                  <TimeLabels height={GRID_H} />
                  {cols.map(w => {
                    const cj = dj.filter(j => j.scheduled_time && (w === 'Unassigned' ? !j.worker_name : j.worker_name === w))
                    return (
                      <TimedColumn key={w} dateKey={dayKey} jobs={cj} overlaps={computeOverlaps(cj)}
                        isToday={false} onDrop={handleDrop} setDrag={setDragJob} hovered={hovered} setHovered={setHovered} />
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      ) : (
        /* ═══ MONTH VIEW ═══ */
        <div className="rounded-2xl border border-[#E5E5EA]/60 bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-[#F0F0F0]">
            {WEEKDAYS.map(d => <div key={d} className="text-center py-2 text-[10px] font-bold text-[#8E8E93] tracking-wider">{d.toUpperCase()}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 42 }, (_, i) => { const d = new Date(getMonday(new Date(now.getFullYear(), now.getMonth(), 1))); d.setDate(d.getDate() + i); return d }).map(d => {
              const dk = fmtKey(d), isT = dk === today, dj = byDate.get(dk) ?? [], isCur = d.getMonth() === now.getMonth()
              return (
                <div key={dk} onClick={() => { setDayKey(dk); setView('day') }}
                  className={`min-h-[80px] border-b border-r border-[#F5F5F5] p-1.5 cursor-pointer hover:bg-[#F8F8FA] ${isT ? 'bg-blue-50/30' : !isCur ? 'bg-[#FAFAFA]' : ''}`}>
                  <p className={`text-[11px] font-bold mb-1 ${isT ? 'text-[#007AFF]' : !isCur ? 'text-[#D1D1D6]' : 'text-[#1C1C1E]'}`}>{d.getDate()}</p>
                  {dj.slice(0, 3).map(j => { const c = jobColor(j); return (
                    <div key={j.id} className="rounded px-1 py-0.5 text-[8px] font-medium truncate mb-0.5 border"
                      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}>{j.service_name}</div>
                  )})}
                  {dj.length > 3 && <p className="text-[8px] text-[#AEAEB2] font-semibold">+{dj.length - 3} more</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && jobs.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-10">
          <p className="text-sm text-[#8E8E93] mb-3">No jobs scheduled yet</p>
          <button onClick={() => openSched()} className="px-5 py-3 rounded-2xl text-sm font-semibold text-white hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, #007AFF 0%, #0055D4 100%)', boxShadow: '0 4px 16px rgba(0,122,255,0.25)' }}>+ Schedule a Job</button>
        </motion.div>
      )}

      {/* ─── Confirm Move Modal ─── */}
      <AnimatePresence>
        {confirmMove && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4" onClick={() => setConfirmMove(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-3xl p-5"
              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
              <h3 className="text-sm font-bold text-[#1C1C1E] mb-3">Move Job?</h3>
              <div className="rounded-2xl p-3 mb-3 border" style={{ backgroundColor: jobColor(confirmMove.job).bg, borderColor: jobColor(confirmMove.job).border }}>
                <p className="text-sm font-bold" style={{ color: jobColor(confirmMove.job).text }}>{confirmMove.job.service_name}</p>
                <p className="text-[11px] text-[#636366] mt-0.5">👤 {confirmMove.job.client_name ?? 'Unknown'}</p>
                <p className="text-[11px] text-[#636366]">📍 {confirmMove.job.address_street}</p>
              </div>
              <div className="flex items-center gap-2 mb-4 text-xs text-[#636366]">
                <span className="px-2 py-1 bg-[#F2F2F7] rounded-lg font-medium">
                  {new Date(confirmMove.job.scheduled_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {confirmMove.job.scheduled_time ? ` ${fmtTime(confirmMove.job.scheduled_time)}` : ''}
                </span>
                <svg className="w-4 h-4 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="px-2 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-lg font-bold">
                  {new Date(confirmMove.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {confirmMove.time ? ` ${fmtTime(confirmMove.time)}` : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={doMove} disabled={moving} className="flex-1 py-2.5 bg-[#007AFF] text-white rounded-xl text-xs font-semibold hover:bg-[#0066DD] disabled:opacity-50">
                  {moving ? 'Moving...' : 'Confirm Move'}</button>
                <button onClick={() => setConfirmMove(null)} className="flex-1 py-2.5 bg-[#F2F2F7] text-[#1C1C1E] rounded-xl text-xs font-semibold hover:bg-[#E5E5EA]">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Schedule Job Popup ─── */}
      <AnimatePresence>
        {showSched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4" onClick={() => setShowSched(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-3xl p-5 max-h-[85vh] overflow-y-auto"
              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#1C1C1E]">Schedule a Job</h3>
                <button onClick={() => setShowSched(false)} className="w-7 h-7 rounded-full bg-[#F2F2F7] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {sErr && <p className="text-xs text-[#FF3B30] mb-3 bg-[#FF3B30]/10 rounded-xl px-3 py-2">{sErr}</p>}
              {sLoading ? (
                <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-[#8E8E93] font-semibold uppercase">Client</label>
                      <Link href="/dashboard/clients/new" onClick={() => setShowSched(false)} className="text-[10px] text-[#34C759] font-semibold hover:underline">+ Add New</Link>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                      {sClients.map(c => (
                        <button key={c.id} type="button" onClick={() => { const a = sAddrs.filter(x => x.client_id === c.id); setSForm(f => ({ ...f, client_id: c.id, address_id: a.length === 1 ? a[0].id : '' })) }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${sForm.client_id === c.id ? 'bg-[#007AFF] text-white' : 'bg-[#F2F2F7] text-[#3C3C43] hover:bg-[#E5E5EA]'}`}>{c.full_name}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8E8E93] font-semibold uppercase mb-1 block">Property</label>
                    <div className="space-y-1">
                      {filtAddrs.map(a => (
                        <button key={a.id} type="button" onClick={() => setSForm(f => ({ ...f, address_id: a.id, client_id: f.client_id || a.client_id }))}
                          className={`w-full text-left px-3 py-2 rounded-xl text-[11px] transition-all ${sForm.address_id === a.id ? 'bg-[#007AFF]/10 ring-1 ring-[#007AFF]/20 font-medium' : 'bg-[#F2F2F7] hover:bg-[#E5E5EA]'}`}>
                          📍 {a.street}, {a.city}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8E8E93] font-semibold uppercase mb-1 block">Service</label>
                    <div className="flex flex-wrap gap-1.5">
                      {sSvcs.map(s => (
                        <button key={s.id} type="button" onClick={() => setSForm(f => ({ ...f, service_type_id: s.id, price: String(s.default_price) }))}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${sForm.service_type_id === s.id ? 'bg-[#007AFF] text-white font-medium' : 'bg-[#F2F2F7] text-[#3C3C43]'}`}>{svcIcon(s.name)} {s.name}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8E8E93] font-semibold uppercase mb-1 block">Date</label>
                    <div className="flex gap-1 overflow-x-auto pb-1">
                      {wDays.slice(0, 14).map(d => { const dk = fmtKey(d), sel = sForm.date === dk, isT = dk === today; return (
                        <button key={dk} type="button" onClick={() => setSForm(f => ({ ...f, date: dk }))}
                          className={`flex flex-col items-center px-2 py-1.5 rounded-xl text-[10px] shrink-0 transition-all ${sel ? 'bg-[#007AFF] text-white shadow-sm' : isT ? 'bg-[#007AFF]/8 text-[#007AFF]' : 'bg-[#F2F2F7] text-[#3C3C43] hover:bg-[#E5E5EA]'}`}>
                          <span className="font-bold">{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                          <span className="font-semibold">{d.getDate()}</span>
                        </button>
                      )})}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#8E8E93] font-semibold uppercase mb-1 block">Time</label>
                      <input type="time" value={sForm.time} onChange={e => setSForm(f => ({ ...f, time: e.target.value }))}
                        className="w-full px-2.5 py-2 bg-[#F2F2F7] rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8E8E93] font-semibold uppercase mb-1 block">Price</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8E8E93]">$</span>
                        <input type="number" step="0.01" value={sForm.price} onChange={e => setSForm(f => ({ ...f, price: e.target.value }))}
                          className="w-full pl-6 pr-2 py-2 bg-[#F2F2F7] rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={submitSched} disabled={sSaving} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #007AFF 0%, #0055D4 100%)' }}>{sSaving ? 'Creating...' : 'Create Job'}</button>
                    <button onClick={() => setShowSched(false)} className="flex-1 py-2.5 bg-[#F2F2F7] rounded-xl text-xs font-semibold text-[#1C1C1E] hover:bg-[#E5E5EA]">Cancel</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
