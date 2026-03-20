"use client";

const INTEGRATIONS = [
  "Airbnb",
  "VRBO",
  "Hospitable",
  "Hostaway",
  "Guesty",
  "Stripe",
  "QuickBooks",
  "Xero",
  "Google Calendar",
  "Twilio",
  "WhatsApp",
] as const;

function IntegrationPill({ name }: { readonly name: string }) {
  return (
    <span className="inline-flex items-center px-5 py-2.5 bg-white rounded-full text-sm font-medium text-[#636366] border border-[#E5E5EA]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] grayscale hover:grayscale-0 hover:text-[#1C1C1E] hover:border-[#007AFF]/30 hover:shadow-[0_2px_8px_rgba(0,122,255,0.1)] transition-all duration-300 select-none whitespace-nowrap">
      {name}
    </span>
  );
}

export function IntegrationsMarquee() {
  // Duplicate for seamless loop
  const items = [...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <section className="py-16 md:py-20 bg-[#F2F2F7] overflow-hidden">
      <div className="max-w-[980px] mx-auto px-6 mb-8">
        <h3
          className="text-center text-[#636366] text-[24px] font-medium"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          Works with the tools you already use
        </h3>
      </div>

      {/* Marquee container */}
      <div className="relative group">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F2F2F7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F2F2F7] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused]">
          {items.map((name, i) => (
            <IntegrationPill key={`${name}-${i}`} name={name} />
          ))}
        </div>
      </div>

      <div className="max-w-[980px] mx-auto px-6 mt-8 text-center">
        <button
          type="button"
          onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-sm text-[#007AFF] font-semibold hover:underline transition-all"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          Join the waitlist for early access &rarr;
        </button>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          width: max-content;
        }
      `}</style>
    </section>
  );
}
