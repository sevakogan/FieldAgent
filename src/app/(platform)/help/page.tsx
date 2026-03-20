"use client";

import { useState, useMemo } from "react";

interface FaqItem {
  readonly question: string;
  readonly answer: string;
  readonly category: string;
}

const FAQ_DATA: readonly FaqItem[] = [
  {
    category: "Getting Started",
    question: "How do I set up my company on KleanHQ?",
    answer: "After signing up, you'll go through our onboarding flow where you'll set your business type, add services and pricing, and invite your team. It takes about 5 minutes.",
  },
  {
    category: "Getting Started",
    question: "Can I invite my team members?",
    answer: "Yes! Go to Settings and use the invite feature. You can invite workers and leads with different permission levels. They'll receive an email to create their account.",
  },
  {
    category: "Getting Started",
    question: "How do I add clients?",
    answer: "Go to Contacts and click 'Add Client'. You can add their details, properties, and services. They'll optionally receive an invite to access their client portal.",
  },
  {
    category: "Jobs & Scheduling",
    question: "How do I create a job?",
    answer: "Go to Jobs and click 'New Job'. Select the client, property, service, date, and assign a worker. The job will appear on everyone's calendar.",
  },
  {
    category: "Jobs & Scheduling",
    question: "What is auto-approve?",
    answer: "Auto-approve automatically approves requested jobs after a set time period. Configure it in Settings. This is useful for STR turnovers where speed matters.",
  },
  {
    category: "Jobs & Scheduling",
    question: "Can jobs be created automatically from Airbnb or VRBO?",
    answer: "Yes! Connect your property management platform (Airbnb, VRBO, Hospitable, Hostaway, or Guesty) in Settings > Integrations. Jobs will be auto-created on checkout.",
  },
  {
    category: "Billing & Payments",
    question: "How does billing work?",
    answer: "KleanHQ supports per-job and monthly billing. Invoices are generated automatically and can be paid via credit card or ACH through Stripe.",
  },
  {
    category: "Billing & Payments",
    question: "Can I connect QuickBooks or Xero?",
    answer: "Yes! Go to Settings > Integrations and connect your accounting software. Invoices will sync automatically.",
  },
  {
    category: "Billing & Payments",
    question: "What happens if a payment fails?",
    answer: "Failed payments are automatically retried up to 3 times over 9 days. Both you and your client will be notified. After all retries, the invoice is marked as overdue.",
  },
  {
    category: "Client Portal",
    question: "What can clients see in their portal?",
    answer: "Clients can view their upcoming and past services, request new jobs, manage payments, see invoices, and communicate with your team.",
  },
  {
    category: "Client Portal",
    question: "Can clients book services directly?",
    answer: "Yes! Each company gets a public booking page. Share your link and clients can book services, choose dates, and pay online.",
  },
  {
    category: "Account & Settings",
    question: "How do I change my subscription plan?",
    answer: "Go to Settings > Billing to manage your subscription. You can upgrade, downgrade, or cancel at any time.",
  },
  {
    category: "Account & Settings",
    question: "Is my data secure?",
    answer: "Yes. KleanHQ uses industry-standard encryption, secure authentication, and follows best practices for data protection. We never sell your data.",
  },
  {
    category: "Account & Settings",
    question: "How do I contact support?",
    answer: "Use the AI assistant in your dashboard for instant help, or email support@kleanhq.com. We typically respond within a few hours.",
  },
];

const CATEGORIES = [...new Set(FAQ_DATA.map((f) => f.category))];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const lower = search.toLowerCase();
    return FAQ_DATA.filter((faq) => {
      const matchesSearch = !search
        || faq.question.toLowerCase().includes(lower)
        || faq.answer.toLowerCase().includes(lower);
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-[#1d1d1f] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-white/60 mb-8">Find answers to common questions</p>
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for help..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory
                ? "bg-[#1d1d1f] text-white"
                : "bg-white text-[#1d1d1f] hover:bg-[#e5e5e7]"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white text-[#1d1d1f] hover:bg-[#e5e5e7]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {search && (
          <p className="text-[#86868b] text-sm mb-4">
            {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* FAQ List */}
        <div className="space-y-2">
          {filteredFaqs.map((faq, i) => {
            const globalIndex = FAQ_DATA.indexOf(faq);
            const isOpen = openIndex === globalIndex;
            return (
              <div key={globalIndex} className="bg-white rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center gap-4"
                >
                  <div>
                    <span className="text-xs font-medium text-[#0071e3] block mb-1">{faq.category}</span>
                    <span className="font-medium text-[#1d1d1f]">{faq.question}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#86868b] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-[#424245] text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#86868b] text-lg">No results found</p>
            <p className="text-[#86868b] text-sm mt-2">Try a different search term or browse all categories</p>
          </div>
        )}

        {/* Contact */}
        <div className="mt-12 bg-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">Still need help?</h2>
          <p className="text-[#86868b] mb-4">Our team is here for you</p>
          <a
            href="mailto:support@kleanhq.com"
            className="inline-block px-8 py-3 rounded-full bg-[#0071e3] text-white font-medium hover:bg-[#0077ED] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
