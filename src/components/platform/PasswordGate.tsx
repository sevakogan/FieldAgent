"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const GATE_PASSWORD = "seva";

export default function PasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password === GATE_PASSWORD) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `kleanhq_gate=authenticated; path=/; expires=${expires}; SameSite=Lax`;
      router.push("/dashboard");
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-5" style={{ backgroundColor: "#F2F2F7" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
            className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#007AFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </motion.div>
          <h1 className="font-black text-2xl tracking-tight" style={{ color: "#1C1C1E" }}>
            KleanHQ
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>
            Enter password to continue
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm p-7"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-[13px] font-medium mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="gate-password"
                className="text-[10px] font-semibold tracking-widest block mb-1.5"
                style={{ color: "#8E8E93" }}
              >
                PASSWORD
              </label>
              <input
                id="gate-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
                style={{
                  backgroundColor: "#F2F2F7",
                  borderColor: error ? "#FF3B30" : "#E5E5EA",
                  color: "#1C1C1E",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#007AFF";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? "#FF3B30" : "#E5E5EA";
                }}
                placeholder="Enter access password"
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
              {loading ? "Verifying..." : "Unlock"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
