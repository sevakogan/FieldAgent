"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "signup" | "forgot";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const supabase = createClient();

    if (mode === "forgot") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setLoading(false);
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSuccess("Check your email for a password reset link.");
      return;
    }

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setLoading(false);
        setError(signUpError.message);
        return;
      }

      // With email confirmation disabled, user is auto-confirmed.
      // Send welcome email via our API.
      if (data.user) {
        try {
          await fetch("/api/welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, userId: data.user.id }),
          });
        } catch {
          // Welcome email is non-critical — don't block signup
        }
      }

      setLoading(false);
      // Auto-confirmed: redirect to onboarding
      router.push("/onboard");
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-4">
            🌿
          </div>
          <h1 className="font-black text-2xl tracking-tight">FieldPay</h1>
          <p className="text-sm text-gray-400 mt-1">Field Service CRM</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm p-7">
          <h2 className="font-extrabold text-lg mb-5">
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="you@company.com"
                required
              />
            </div>
            {mode !== "forgot" && (
              <div className="mb-4">
                <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PASSWORD</label>
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
            )}
            {mode === "login" && (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-[12px] text-gray-400 bg-transparent border-none cursor-pointer hover:text-gray-600 mb-4 block"
              >
                Forgot password?
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {loading ? "..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-sm text-gray-400 mt-5">
          {mode === "forgot" ? (
            <button
              onClick={() => switchMode("login")}
              className="text-brand font-semibold bg-transparent border-none cursor-pointer"
            >
              Back to sign in
            </button>
          ) : (
            <>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-brand font-semibold bg-transparent border-none cursor-pointer"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
