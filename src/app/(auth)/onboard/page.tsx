"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_CATALOG, type BusinessType } from "@/lib/service-catalog";

const PLACEHOLDER_COMPANY_NAMES: Record<BusinessType, string> = {
  lawn_care: "John's Lawn Care",
  pool_service: "Rivera Pool Service",
  property_cleaning: "Sparkle Property Cleaning",
  pressure_washing: "PowerBlast Washing",
  pest_control: "Guardian Pest Control",
  hvac: "CoolAir HVAC",
  window_cleaning: "Crystal Clear Windows",
  handyman: "Mike's Handyman",
  multi_service: "AllPro Services",
};

export default function OnboardPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedConfig = businessType
    ? SERVICE_CATALOG[businessType]
    : null;

  const handleTypeSelect = (type: BusinessType) => {
    setBusinessType(type);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, fullName, phone, businessType }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">
            {selectedConfig?.icon ?? "🌿"}
          </div>
          <h1 className="font-black text-2xl tracking-tight">Welcome to FieldPay</h1>
          <p className="text-sm text-gray-400 mt-1">
            {step === 1 ? "What type of business?" : "Set up your business"}
          </p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(SERVICE_CATALOG) as [BusinessType, typeof SERVICE_CATALOG[BusinessType]][]).map(
              ([type, config]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-all cursor-pointer hover:shadow-md ${
                    businessType === type
                      ? "border-[#0071e3]"
                      : "border-transparent"
                  }`}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <span className="text-[12px] font-semibold text-[#1d1d1f] text-center leading-tight">
                    {config.label}
                  </span>
                </button>
              ),
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-sm p-7">
            {error && (
              <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">COMPANY NAME</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                  placeholder={businessType ? PLACEHOLDER_COMPANY_NAMES[businessType] : "John's Lawn Care"}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">YOUR NAME</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PHONE</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                  placeholder="(786) 555-0100"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-100 text-[#1d1d1f] border-none rounded-xl py-3.5 px-5 font-bold text-[15px] cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
                >
                  {loading ? "..." : "Get Started"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
