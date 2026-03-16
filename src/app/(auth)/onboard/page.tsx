"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardPage() {
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, fullName, phone }),
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
            🌿
          </div>
          <h1 className="font-black text-2xl tracking-tight">Welcome to FieldPay</h1>
          <p className="text-sm text-gray-400 mt-1">Set up your business</p>
        </div>

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
                placeholder="John's Lawn Care"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {loading ? "..." : "Get Started"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
