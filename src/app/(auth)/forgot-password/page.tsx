"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess("Check your email for a password reset link.");
      setLoading(false);
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
          Forgot Password
        </h2>
        <p className="text-sm mb-5" style={{ color: "#8E8E93" }}>
          Enter your email to receive a reset link
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

        {success && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="forgot-email"
              className="text-[10px] font-semibold tracking-widest block mb-1.5"
              style={{ color: "#8E8E93" }}
            >
              EMAIL
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: "#007AFF" }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>

      {/* Back to login */}
      <p className="text-center text-sm mt-5" style={{ color: "#8E8E93" }}>
        Remember your password?{" "}
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
