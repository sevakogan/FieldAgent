"use client";

interface ChangelogEntry {
  readonly date: string;
  readonly version: string;
  readonly title: string;
  readonly description: string;
  readonly changes: readonly {
    readonly type: "feature" | "improvement" | "fix";
    readonly text: string;
  }[];
}

const CHANGELOG: readonly ChangelogEntry[] = [
  {
    date: "2026-03-20",
    version: "1.2.0",
    title: "AI Assistant & Smart Reviews",
    description: "Meet your new AI assistant and let smart review gating boost your online reputation.",
    changes: [
      { type: "feature", text: "AI Assistant — get instant help with scheduling, pricing, and client communication" },
      { type: "feature", text: "Smart Review Gate — automatically route happy clients to public reviews" },
      { type: "feature", text: "AI Contract Generation — create professional service agreements in seconds" },
      { type: "improvement", text: "Faster job calendar rendering with virtual scrolling" },
      { type: "fix", text: "Fixed timezone display in worker mobile view" },
    ],
  },
  {
    date: "2026-03-10",
    version: "1.1.0",
    title: "Integrations & Automation",
    description: "Connect your favorite tools and automate your workflow.",
    changes: [
      { type: "feature", text: "Airbnb, VRBO, Hospitable, Hostaway, and Guesty integrations" },
      { type: "feature", text: "QuickBooks and Xero invoice sync" },
      { type: "feature", text: "Google Calendar sync for workers" },
      { type: "feature", text: "Weather alerts for outdoor jobs" },
      { type: "improvement", text: "Webhook reliability improvements with retry logic" },
      { type: "improvement", text: "Faster notification delivery across all channels" },
      { type: "fix", text: "Monthly invoice calculation for partial months" },
    ],
  },
  {
    date: "2026-02-28",
    version: "1.0.0",
    title: "KleanHQ Launch",
    description: "The complete platform for cleaning and field service businesses.",
    changes: [
      { type: "feature", text: "Full job management — create, assign, track, and complete" },
      { type: "feature", text: "Client portal with self-service booking" },
      { type: "feature", text: "Worker mobile experience with GPS tracking" },
      { type: "feature", text: "Invoicing and Stripe payment processing" },
      { type: "feature", text: "Multi-channel notifications (in-app, email, SMS, WhatsApp)" },
      { type: "feature", text: "Photo/video documentation with before/after" },
      { type: "feature", text: "Referral program with tiered rewards" },
      { type: "feature", text: "Reseller white-label support" },
    ],
  },
];

const TYPE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  feature: { label: "New", color: "text-green-700", bg: "bg-green-100" },
  improvement: { label: "Improved", color: "text-blue-700", bg: "bg-blue-100" },
  fix: { label: "Fixed", color: "text-orange-700", bg: "bg-orange-100" },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-[#1d1d1f] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Changelog</h1>
          <p className="text-white/60">See what&apos;s new in KleanHQ</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {CHANGELOG.map((entry) => (
            <article key={entry.version} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-medium text-[#0071e3] bg-[#0071e3]/10 px-2 py-1 rounded">
                    v{entry.version}
                  </span>
                  <span className="text-xs text-[#86868b]">
                    {new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#1d1d1f] mb-1">{entry.title}</h2>
                <p className="text-[#86868b] text-sm">{entry.description}</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {entry.changes.map((change, i) => {
                    const style = TYPE_STYLES[change.type];
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${style.color} ${style.bg} shrink-0 mt-0.5`}>
                          {style.label}
                        </span>
                        <span className="text-sm text-[#424245]">{change.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
