'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { getRevenueData, type RevenueStats } from '@/lib/actions/revenue'

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  const date = new Date(Number(y), Number(m) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function shortMonthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  const date = new Date(Number(y), Number(m) - 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}

type BarTooltipPayload = { value: number; payload: { fullLabel: string } }

function BarChartTooltip({ active, payload }: { active?: boolean; payload?: BarTooltipPayload[] }) {
  if (!active || !payload?.[0]) return null
  return (
    <div className="glass rounded-lg px-3 py-2 shadow-lg border border-[#E5E5EA]">
      <p className="text-[10px] text-[#8E8E93]">{payload[0].payload.fullLabel}</p>
      <p className="text-sm font-semibold text-[#1C1C1E]">{fmt(payload[0].value)}</p>
    </div>
  )
}

type AreaTooltipPayload = { value: number; payload: { fullLabel: string } }

function AreaChartTooltip({ active, payload }: { active?: boolean; payload?: AreaTooltipPayload[] }) {
  if (!active || !payload?.[0]) return null
  return (
    <div className="glass rounded-lg px-3 py-2 shadow-lg border border-[#E5E5EA]">
      <p className="text-[10px] text-[#8E8E93]">{payload[0].payload.fullLabel}</p>
      <p className="text-sm font-semibold text-[#34C759]">{fmt(payload[0].value)}</p>
    </div>
  )
}

// Mock data when no real data exists
const MOCK_MONTHLY = [
  { month: 'Oct', fullLabel: 'Oct 2025', revenue: 2400 },
  { month: 'Nov', fullLabel: 'Nov 2025', revenue: 3100 },
  { month: 'Dec', fullLabel: 'Dec 2025', revenue: 2800 },
  { month: 'Jan', fullLabel: 'Jan 2026', revenue: 3600 },
  { month: 'Feb', fullLabel: 'Feb 2026', revenue: 4200 },
  { month: 'Mar', fullLabel: 'Mar 2026', revenue: 3900 },
]

const MOCK_CUMULATIVE = MOCK_MONTHLY.map((item, i) => ({
  ...item,
  cumulative: MOCK_MONTHLY.slice(0, i + 1).reduce((s, m) => s + m.revenue, 0),
}))

export default function RevenuePage() {
  const [data, setData] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [csvCopied, setCsvCopied] = useState(false)

  const handleExportCsv = () => {
    if (!data) return
    const header = 'Month,Jobs,Revenue'
    const rows = data.monthly.map((m) => `${monthLabel(m.month)},${m.count},${m.total.toFixed(2)}`)
    const csv = [header, ...rows].join('\n')
    navigator.clipboard.writeText(csv)
    setCsvCopied(true)
    setTimeout(() => setCsvCopied(false), 2000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getRevenueData()
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error ?? 'Failed to load revenue data')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Prepare chart data from monthly stats (last 6 months, ascending)
  const monthlyChartData = data && data.monthly.length > 0
    ? [...data.monthly]
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6)
        .map((m) => ({
          month: shortMonthLabel(m.month),
          fullLabel: monthLabel(m.month),
          revenue: m.total,
        }))
    : null

  const cumulativeChartData = monthlyChartData
    ? monthlyChartData.map((item, i) => ({
        ...item,
        cumulative: monthlyChartData.slice(0, i + 1).reduce((s, m) => s + m.revenue, 0),
      }))
    : null

  const barData = monthlyChartData ?? MOCK_MONTHLY
  const areaData = cumulativeChartData ?? MOCK_CUMULATIVE

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Revenue</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={!data}
            className="px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-sm font-medium hover:bg-[#F2F2F7] transition-colors disabled:opacity-50"
          >
            {csvCopied ? 'Copied!' : 'Export CSV'}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-sm font-medium hover:bg-[#F2F2F7] transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Revenue', value: fmt(data.total_revenue), color: '#34C759' },
              { label: 'This Month', value: fmt(data.this_month), color: '#007AFF' },
              { label: 'Last Month', value: fmt(data.last_month), color: '#8E8E93' },
              { label: 'Avg Per Job', value: fmt(data.avg_per_job), color: '#AF52DE' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-2xl p-3">
                <p className="text-xs text-[#8E8E93] uppercase font-medium mb-1">{label}</p>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {/* Monthly Revenue Bar Chart */}
            <div className="glass rounded-2xl p-3">
              <p className="text-sm font-semibold text-[#1C1C1E] mb-2">Monthly Revenue</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#AF52DE" />
                      <stop offset="100%" stopColor="#007AFF" />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#8E8E93' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#8E8E93' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip content={<BarChartTooltip />} cursor={{ fill: 'rgba(0,122,255,0.05)' }} />
                  <Bar
                    dataKey="revenue"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Trend (Cumulative) */}
            <div className="glass rounded-2xl p-3">
              <p className="text-sm font-semibold text-[#1C1C1E] mb-2">Revenue Trend</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34C759" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#8E8E93' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#8E8E93' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip content={<AreaChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#34C759"
                    strokeWidth={2}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-3 border-b border-[#E5E5EA]">
                <h2 className="font-semibold text-[#1C1C1E]">Revenue by Month</h2>
              </div>
              {data.monthly.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#8E8E93]">No revenue data yet</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E5EA]">
                      <th className="text-left p-3 text-xs font-medium text-[#8E8E93] uppercase">Month</th>
                      <th className="text-right p-3 text-xs font-medium text-[#8E8E93] uppercase">Jobs</th>
                      <th className="text-right p-3 text-xs font-medium text-[#8E8E93] uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly.map((m) => (
                      <tr key={m.month} className="border-b border-[#E5E5EA] last:border-0">
                        <td className="p-3 text-sm text-[#1C1C1E]">{monthLabel(m.month)}</td>
                        <td className="p-3 text-sm text-right text-[#8E8E93]">{m.count}</td>
                        <td className="p-3 text-sm text-right font-medium text-[#1C1C1E]">{fmt(m.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-3 border-b border-[#E5E5EA]">
                <h2 className="font-semibold text-[#1C1C1E]">Revenue by Service</h2>
              </div>
              {data.by_service.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#8E8E93]">No service revenue data yet</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E5EA]">
                      <th className="text-left p-3 text-xs font-medium text-[#8E8E93] uppercase">Service</th>
                      <th className="text-right p-3 text-xs font-medium text-[#8E8E93] uppercase">Jobs</th>
                      <th className="text-right p-3 text-xs font-medium text-[#8E8E93] uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_service.map((s) => (
                      <tr key={s.service_name} className="border-b border-[#E5E5EA] last:border-0">
                        <td className="p-3 text-sm text-[#1C1C1E]">{s.service_name}</td>
                        <td className="p-3 text-sm text-right text-[#8E8E93]">{s.count}</td>
                        <td className="p-3 text-sm text-right font-medium text-[#1C1C1E]">{fmt(s.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
