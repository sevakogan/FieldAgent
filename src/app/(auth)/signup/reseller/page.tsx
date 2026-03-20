"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ResellerSignupPage() {
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be under 5MB.");
      return;
    }

    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "reseller",
            brand_name: brandName,
            phone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Upload logo if provided
      if (logo) {
        console.log("Logo to upload:", logo.name);
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-2xl shadow-sm p-7">
        <h2 className="font-extrabold text-lg mb-1" style={{ color: "#1C1C1E" }}>
          Reseller Sign Up
        </h2>
        <p className="text-sm mb-5" style={{ color: "#8E8E93" }}>
          White-label KleanHQ under your brand
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload */}
          <div className="flex flex-col items-center mb-2">
            <label htmlFor="reseller-logo" className="cursor-pointer">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed transition-colors"
                style={{
                  borderColor: "#E5E5EA",
                  backgroundColor: "#F2F2F7",
                }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C7C7CC"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8"
                  >
                    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
                    <circle cx={8.5} cy={8.5} r={1.5} />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
            </label>
            <input
              id="reseller-logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <p className="text-[11px] mt-2" style={{ color: "#8E8E93" }}>
              Tap to upload your brand logo
            </p>
          </div>

          <div>
            <label htmlFor="reseller-brand" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              BRAND NAME *
            </label>
            <input
              id="reseller-brand"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
              placeholder="Your Brand Name"
              required
            />
          </div>

          <div>
            <label htmlFor="reseller-email" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              EMAIL *
            </label>
            <input
              id="reseller-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
              placeholder="reseller@brand.com"
              required
            />
          </div>

          <div>
            <label htmlFor="reseller-phone" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              PHONE
            </label>
            <input
              id="reseller-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="reseller-password" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              PASSWORD *
            </label>
            <input
              id="reseller-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: "#007AFF" }}
          >
            {loading ? "Creating..." : "Create Reseller Account"}
          </button>
        </form>
      </div>

      {/* Back */}
      <p className="text-center text-sm mt-5" style={{ color: "#8E8E93" }}>
        <Link
          href="/signup"
          className="font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#007AFF" }}
        >
          Back to role selection
        </Link>
      </p>
    </motion.div>
  );
}
