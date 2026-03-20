"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "loading" | "preview" | "auth" | "profile" | "done" | "error";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [invite, setInvite] = useState<{ role: string; companyName: string; email: string | null } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setInvite(data);
        if (data.email) setEmail(data.email);
        setStep("preview");
      })
      .catch(() => {
        setError("This invite link is invalid or has expired.");
        setStep("error");
      });
  }, [token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    if (authMode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
    }

    setLoading(false);
    setStep("profile");
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/invites/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error); return; }

    setStep("done");
    const redirect = data.role === "crew" ? "/crew" : "/client";
    setTimeout(() => { router.push(redirect); router.refresh(); }, 1500);
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
          {step === "loading" && (
            <p className="text-center text-gray-400">Loading invite...</p>
          )}

          {step === "error" && (
            <div className="text-center">
              <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>
              <button onClick={() => router.push("/login")} className="text-brand font-semibold bg-transparent border-none cursor-pointer text-sm">
                Go to login
              </button>
            </div>
          )}

          {step === "preview" && invite && (
            <div className="text-center">
              <h2 className="font-extrabold text-lg mb-2">You're invited!</h2>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-bold text-gray-900">{invite.companyName}</span> has invited you as a
              </p>
              <span className="inline-block bg-brand/10 text-brand font-bold rounded-lg px-3 py-1 text-sm capitalize mb-5">
                {invite.role}
              </span>
              <button
                onClick={() => setStep("auth")}
                className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity"
              >
                Accept Invite
              </button>
            </div>
          )}

          {step === "auth" && (
            <>
              <h2 className="font-extrabold text-lg mb-5">
                {authMode === "signup" ? "Create your account" : "Sign in"}
              </h2>
              {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>}
              <form onSubmit={handleAuth}>
                <div className="mb-4">
                  <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">EMAIL</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                    placeholder="you@email.com" required />
                </div>
                <div className="mb-6">
                  <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PASSWORD</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                    placeholder="••••••••" minLength={6} required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
                  {loading ? "..." : authMode === "signup" ? "Create Account" : "Sign In"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-400 mt-4">
                {authMode === "signup" ? "Already have an account? " : "Need an account? "}
                <button onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setError(""); }}
                  className="text-brand font-semibold bg-transparent border-none cursor-pointer">
                  {authMode === "signup" ? "Sign in" : "Sign up"}
                </button>
              </p>
            </>
          )}

          {step === "profile" && (
            <>
              <h2 className="font-extrabold text-lg mb-5">Your details</h2>
              {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>}
              <form onSubmit={handleAccept}>
                <div className="mb-4">
                  <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">FULL NAME</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                    placeholder="Your name" required />
                </div>
                <div className="mb-6">
                  <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PHONE</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                    placeholder="(786) 555-0100" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
                  {loading ? "..." : "Complete Setup"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="font-extrabold text-lg mb-1">You're in!</h2>
              <p className="text-sm text-gray-400">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
