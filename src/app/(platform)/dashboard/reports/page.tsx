'use client'

import { useState, useEffect, useCallback } from 'react'
import { getReportData, type ReportData } from '@/lib/actions/reports'

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#007AFF',
  in_progress: '#FFD60A',
  pending_review: '#AF52DE',
  completed: '#34C759',
  cancelled: '#FF6B6B',
  driving: '#5AC8FA',
  arrived: '#FF9F0A',
  charged: '#34C759',
  requested: '#8E8E93',
  approved: '#007AFF',
  revision_needed: '#FF9F0A',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  pending_review: 'Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
  driving: 'Driving',
  arrived: 'Arrived',
  charged: 'Charged',
  requested: 'Requested',
  approved: 'Approved',
  revision_needed: 'Revision',
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [csvCopied, setCsvCopied] = useState(false)

  const handleExportReport = () => {
    if (!data) return
    const lines: string[] = [
      `Total Jobs,${data.total_jobs}`,
      `Total Revenue,${data.total_revenue.toFixed(2)}`,
      `Total Clients,${data.total_clients}`,
      `Avg Rating,${data.avg_rating.toFixed(1)}`,
      '',
      'Status,Count',
      ...data.jobs_by_status.map((s) => `${s.status},${s.count}`),
      '',
      'Service,Jobs,Revenue',
      ...data.top_services.map((s) => `${s.name},${s.count},${s.revenue.toFixed(2)}`),
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    setCsvCopied(true)
    setTimeout(() => setCsvCopied(false), 2000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getReportData()
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error ?? 'Failed to load report data')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportReport}
            disabled={!data}
            className="px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E5EA] rounded-xl text-sm font-medium hover:bg-[#F2F2F7] transition-colors disabled:opacity-50"
          >
            {csvCopied ? 'Copied!' : 'Export Report'}
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
              { label: 'Total Jobs', value: data.total_jobs.toString(), color: '#007AFF' },
              { label: 'Total Revenue', value: fmt(data.total_revenue), color: '#34C759' },
              { label: 'Total Clients', value: data.total_clients.toString(), color: '#AF52DE' },
              { label: 'Avg Rating', value: data.avg_rating > 0 ? `${data.avg_rating.toFixed(1)} ★` : 'N/A', color: '#FFD60A' },
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
                <h2 className="font-semibold text-[#1C1C1E]">Jobs by Status</h2>
              </div>
              {data.jobs_by_status.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#8E8E93]">No jobs yet</div>
              ) : (
                <div className="p-4 space-y-3">
                  {data.jobs_by_status.map(({ status, count }) => {
                    const color = STATUS_COLORS[status] ?? '#8E8E93'
                    const label = STATUS_LABELS[status] ?? status
                    const pct = data.total_jobs > 0 ? (count / data.total_jobs) * 100 : 0
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm text-[#1C1C1E]">{label}</span>
                          </div>
                          <span className="text-sm font-medium text-[#1C1C1E]">{count}</span>
                        </div>
                        <div className="h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
              <div className="p-4 border-b border-[#E5E5EA]">
                <h2 className="font-semibold text-[#1C1C1E]">Top Services</h2>
              </div>
              {data.top_services.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#8E8E93]">No services yet</div>
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
                    {data.top_services.map((s) => (
                      <tr key={s.name} className="border-b border-[#E5E5EA] last:border-0">
                        <td className="p-3 text-sm text-[#1C1C1E]">{s.name}</td>
                        <td className="p-3 text-sm text-right text-[#8E8E93]">{s.count}</td>
                        <td className="p-3 text-sm text-right font-medium text-[#1C1C1E]">{fmt(s.revenue)}</td>
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
