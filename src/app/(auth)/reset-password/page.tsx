"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      router.push("/login");
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
          Reset Password
        </h2>
        <p className="text-sm mb-5" style={{ color: "#8E8E93" }}>
          Enter your new password below
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
            <label
              htmlFor="new-password"
              className="text-[10px] font-semibold tracking-widest block mb-1.5"
              style={{ color: "#8E8E93" }}
            >
              NEW PASSWORD
            </label>
            <input
              id="new-password"
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
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="text-[10px] font-semibold tracking-widest block mb-1.5"
              style={{ color: "#8E8E93" }}
            >
              CONFIRM PASSWORD
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{
                backgroundColor: "#F2F2F7",
                borderColor: confirmPassword && password !== confirmPassword ? "#FF3B30" : "#E5E5EA",
                color: "#1C1C1E",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  confirmPassword && password !== confirmPassword ? "#FF3B30" : "#E5E5EA";
              }}
              placeholder="Re-enter your password"
              minLength={6}
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] mt-1.5" style={{ color: "#FF3B30" }}>
                Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: "#007AFF" }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Back to login */}
      <p className="text-center text-sm mt-5" style={{ color: "#8E8E93" }}>
        <Link
          href="/login"
          className="font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#007AFF" }}
        >
          Back to Sign In
        </Link>
      </p>
    </motion.div>
  );
}
