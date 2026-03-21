'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRevenueData, type RevenueStats } from '@/lib/actions/revenue'

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  const date = new Date(Number(y), Number(m) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Revenue', value: fmt(data.total_revenue), color: '#34C759' },
              { label: 'This Month', value: fmt(data.this_month), color: '#007AFF' },
              { label: 'Last Month', value: fmt(data.last_month), color: '#8E8E93' },
              { label: 'Avg Per Job', value: fmt(data.avg_per_job), color: '#AF52DE' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
                <p className="text-xs text-[#8E8E93] uppercase font-medium mb-1">{label}</p>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
              <div className="p-4 border-b border-[#E5E5EA]">
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

            <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
              <div className="p-4 border-b border-[#E5E5EA]">
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
