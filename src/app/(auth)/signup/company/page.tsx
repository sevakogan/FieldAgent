"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const BUSINESS_TYPES = [
  "Residential Cleaning",
  "Commercial Cleaning",
  "Janitorial Services",
  "Carpet & Upholstery",
  "Window Cleaning",
  "Pressure Washing",
  "Move-In/Move-Out",
  "Other",
] as const;

const TOTAL_STEPS = 3;

interface CompanyFormData {
  readonly businessName: string;
  readonly businessType: string;
  readonly email: string;
  readonly phone: string;
  readonly password: string;
  readonly firstService: string;
  readonly firstClientEmail: string;
}

const INITIAL_FORM: CompanyFormData = {
  businessName: "",
  businessType: "",
  email: "",
  phone: "",
  password: "",
  firstService: "",
  firstClientEmail: "",
};

export default function CompanySignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CompanyFormData>(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateField = (field: keyof CompanyFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!form.businessName || !form.businessType || !form.email || !form.password) {
        setError("Please fill in all required fields.");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            role: "company_owner",
            business_name: form.businessName,
            business_type: form.businessType,
            phone: form.phone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const progressPercent = (step / TOTAL_STEPS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-2xl shadow-sm p-7">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-[11px] font-semibold mb-2" style={{ color: "#8E8E93" }}>
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F2F2F7" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "#007AFF" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        <h2 className="font-extrabold text-lg mb-1" style={{ color: "#1C1C1E" }}>
          {step === 1 && "Business Details"}
          {step === 2 && "Add First Service"}
          {step === 3 && "Invite First Client"}
        </h2>
        <p className="text-sm mb-5" style={{ color: "#8E8E93" }}>
          {step === 1 && "Tell us about your cleaning business"}
          {step === 2 && "Set up your first service offering"}
          {step === 3 && "Optionally invite your first client"}
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-[13px] font-medium mb-4"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="business-name" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
                  BUSINESS NAME *
                </label>
                <input
                  id="business-name"
                  type="text"
                  value={form.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
                  placeholder="Sparkle Clean Co."
                  required
                />
              </div>
              <div>
                <label htmlFor="business-type" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
                  BUSINESS TYPE *
                </label>
                <select
                  id="business-type"
                  value={form.businessType}
                  onChange={(e) => updateField("businessType", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors appearance-none cursor-pointer"
                  style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: form.businessType ? "#1C1C1E" : "#8E8E93" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
                  required
                >
                  <option value="" disabled>Select type</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="company-email" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
                  EMAIL *
                </label>
                <input
                  id="company-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
                  placeholder="owner@company.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="company-phone" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
                  PHONE
                </label>
                <input
                  id="company-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label htmlFor="company-password" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
                  PASSWORD *
                </label>
                <input
                  id="company-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div>
                <label htmlFor="first-service" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
                  SERVICE NAME
                </label>
                <input
                  id="first-service"
                  type="text"
                  value={form.firstService}
                  onChange={(e) => updateField("firstService", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
                  placeholder="e.g. Standard Home Cleaning"
                />
              </div>
              <p className="text-[12px] mt-3" style={{ color: "#8E8E93" }}>
                You can skip this step and add services later from your dashboard.
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div>
                <label htmlFor="first-client" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
                  CLIENT EMAIL
                </label>
                <input
                  id="first-client"
                  type="email"
                  value={form.firstClientEmail}
                  onChange={(e) => updateField("firstClientEmail", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                  style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
                  placeholder="client@email.com"
                />
              </div>
              <p className="text-[12px] mt-3" style={{ color: "#8E8E93" }}>
                We&apos;ll send them an invite. You can skip and invite clients later.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 border rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity hover:opacity-70"
              style={{ borderColor: "#E5E5EA", color: "#1C1C1E", backgroundColor: "transparent" }}
            >
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#007AFF" }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: "#007AFF" }}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          )}
        </div>
      </div>

      {/* Sign In */}
      <p className="text-center text-sm mt-5" style={{ color: "#8E8E93" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#007AFF" }}
        >
          Sign In
        </Link>
      </p>
    </motion.div>
  );
}
