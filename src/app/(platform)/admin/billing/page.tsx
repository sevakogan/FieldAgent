"use client";

const BILLING_STATS = [
  { label: "Monthly Recurring", value: "$184,500", sub: "1,247 active subscriptions" },
  { label: "Collected This Month", value: "$178,200", sub: "96.6% collection rate" },
  { label: "Outstanding", value: "$6,300", sub: "23 invoices overdue" },
  { label: "Avg Revenue/Company", value: "$148", sub: "+$12 from last month" },
] as const;

const INVOICES = [
  { id: "INV-2024-1201", company: "Elite Maids Inc.", amount: 299, status: "paid", date: "2024-10-01", method: "Visa ****4242" },
  { id: "INV-2024-1200", company: "Sparkle Clean Co.", amount: 149, status: "paid", date: "2024-10-01", method: "Mastercard ****8888" },
  { id: "INV-2024-1199", company: "GreenClean Atlanta", amount: 149, status: "paid", date: "2024-10-01", method: "ACH Transfer" },
  { id: "INV-2024-1198", company: "Pristine Homes", amount: 299, status: "overdue", date: "2024-09-01", method: "Visa ****1234" },
  { id: "INV-2024-1197", company: "TidyUp Boston", amount: 49, status: "paid", date: "2024-10-01", method: "Visa ****5678" },
  { id: "INV-2024-1196", company: "Fresh Start LLC", amount: 49, status: "pending", date: "2024-10-05", method: "Pending" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-[#34C759]/10 text-[#34C759]",
  pending: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  overdue: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

export default function AdminBillingPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">Platform Billing</h1>
        <p className="text-[14px] text-[#8E8E93] mt-1">Subscription revenue, invoices, and payment status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {BILLING_STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
            <div className="text-[12px] text-[#8E8E93] font-medium mb-1">{stat.label}</div>
            <div className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">{stat.value}</div>
            <div className="text-[11px] text-[#8E8E93] mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F2F2F7]">
          <h2 className="text-[16px] font-bold text-[#1C1C1E]">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Invoice</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Method</th>
                <th className="text-left text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="border-b border-[#F2F2F7] last:border-0 hover:bg-[#F9F9FB] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-mono text-[#8E8E93]">{inv.id}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1C1C1E]">{inv.company}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-bold text-[#1C1C1E]">${inv.amount}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{inv.method}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#8E8E93]">{inv.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
