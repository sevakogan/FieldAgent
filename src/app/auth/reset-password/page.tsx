"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">
            🌿
          </div>
          <h1 className="font-black text-2xl tracking-tight">KleanHQ</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-7">
          <h2 className="font-extrabold text-lg mb-5">Set new password</h2>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">NEW PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <div className="mb-6">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {loading ? "..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
