"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ClientSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
            role: "client",
            full_name: name,
            phone,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-2xl shadow-sm p-7">
        <h2 className="font-extrabold text-lg mb-1" style={{ color: "#1C1C1E" }}>
          Client Sign Up
        </h2>
        <p className="text-sm mb-5" style={{ color: "#8E8E93" }}>
          Create your account to book services
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
          <div>
            <label htmlFor="client-name" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              FULL NAME *
            </label>
            <input
              id="client-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
              placeholder="John Smith"
              required
            />
          </div>

          <div>
            <label htmlFor="client-email" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              EMAIL *
            </label>
            <input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
              placeholder="john@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="client-phone" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              PHONE
            </label>
            <input
              id="client-phone"
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
            <label htmlFor="client-password" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              PASSWORD *
            </label>
            <input
              id="client-password"
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
            {loading ? "Creating..." : "Create Account"}
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
