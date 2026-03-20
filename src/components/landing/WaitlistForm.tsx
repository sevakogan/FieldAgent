"use client";

import { useState, useCallback, useEffect, useRef, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { WaitlistSuccess } from "@/components/landing/WaitlistSuccess";

const USER_TYPES = ["Company", "Client", "Reseller", "Pro"] as const;
type UserType = (typeof USER_TYPES)[number];

interface SignupResponse {
  readonly position: number;
  readonly referralCode: string;
  readonly referralLink: string;
  readonly referredBy?: string;
  readonly alreadyRegistered?: boolean;
}

function fireConfetti() {
  const defaults = {
    spread: 360,
    ticks: 80,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors: ["#007AFF", "#AF52DE", "#FF6B6B", "#5AC8FA", "#FFD60A", "#FF9F0A"],
  };

  confetti({ ...defaults, particleCount: 50, origin: { x: 0.3, y: 0.6 } });
  confetti({ ...defaults, particleCount: 50, origin: { x: 0.7, y: 0.6 } });
}

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<UserType>("Company");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SignupResponse | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !turnstileRef.current) return;

    // Load Turnstile script
    if (!document.getElementById("turnstile-script")) {
      const script = document.createElement("script");
      script.id = "turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Render widget once script loads
    const interval = setInterval(() => {
      if (
        typeof window !== "undefined" &&
        "turnstile" in window &&
        turnstileRef.current &&
        !turnstileRef.current.hasChildNodes()
      ) {
        (window as any).turnstile.render(turnstileRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "invisible",
        });
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!name.trim() || !email.trim()) {
        setError("Please fill in all fields.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      setLoading(true);

      try {
        // Get referral code from URL if present
        const params = new URLSearchParams(window.location.search);
        const referralCode = params.get("ref") ?? undefined;

        // Get turnstile token if available
        const turnstileToken =
          (
            document.querySelector<HTMLInputElement>(
              '[name="cf-turnstile-response"]'
            )
          )?.value ?? "";

        const res = await fetch("/api/waitlist/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            type,
            referralCode,
            turnstileToken,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.error ?? `Something went wrong (${res.status})`
          );
        }

        const data: SignupResponse = await res.json();

        // Fire confetti
        fireConfetti();

        // Push dataLayer event
        if (typeof window !== "undefined" && "dataLayer" in window) {
          (window as Record<string, unknown[]>).dataLayer.push({
            event: "waitlist_signup",
            waitlist_type: type,
            waitlist_position: data.position,
          });
        }

        setResult(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    [name, email, type]
  );

  return (
    <section id="waitlist" className="py-20 md:py-28">
      <div className="max-w-lg mx-auto px-6">
        {/* Animated gradient border card */}
        <div className="relative rounded-3xl p-[2px] overflow-hidden">
          {/* Rotating gradient ring */}
          <div className="absolute inset-0 rounded-3xl animate-gradient-rotate">
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#007AFF,#AF52DE,#FF6B6B,#5AC8FA,#FFD60A,#FF9F0A,#007AFF)] animate-spin-slow" />
          </div>

          {/* Glassmorphism card */}
          <div className="relative rounded-[22px] bg-white/90 backdrop-blur-xl p-8 md:p-10">
            <AnimatePresence mode="wait">
              {result ? (
                <WaitlistSuccess
                  key="success"
                  position={result.position}
                  referralCode={result.referralCode}
                  referredBy={result.referredBy}
                />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2
                    className="text-[40px] font-bold text-[#1C1C1E] text-center tracking-[-0.03em] mb-2"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Join the Waitlist
                  </h2>
                  <p
                    className="text-center text-[#AEAEB2] text-sm mb-8"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    Be first in line. Share to move up.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-[#F2F2F7] rounded-xl text-[#1C1C1E] text-[15px] placeholder:text-[#AEAEB2] outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                        disabled={loading}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-[#F2F2F7] rounded-xl text-[#1C1C1E] text-[15px] placeholder:text-[#AEAEB2] outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                        disabled={loading}
                      />
                    </div>

                    {/* Segmented Control */}
                    <div>
                      <label
                        className="block text-xs text-[#AEAEB2] font-medium mb-2 ml-1"
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      >
                        I am a...
                      </label>
                      <SegmentedControl
                        options={[...USER_TYPES]}
                        value={type}
                        onChange={(v) => setType(v as UserType)}
                        className="w-full"
                      />
                    </div>

                    {/* Turnstile (invisible) */}
                    <div ref={turnstileRef} className="flex justify-center" />

                    {/* Error */}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-[#FF3B30] text-center"
                      >
                        {error}
                      </motion.p>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl font-semibold text-white text-[16px] bg-gradient-to-r from-[#007AFF] to-[#AF52DE] hover:from-[#0071E3] hover:to-[#9B3DC8] disabled:opacity-60 disabled:cursor-not-allowed transition-all animate-pulse-gentle shadow-lg shadow-[#007AFF]/20"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Joining...
                        </span>
                      ) : (
                        "\uD83D\uDE80 Join the Waitlist"
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient-rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          .animate-gradient-rotate {
            animation: gradient-rotate 4s linear infinite;
          }
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes pulse-gentle {
            0%,
            100% {
              box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.3);
            }
            50% {
              box-shadow: 0 0 0 6px rgba(0, 122, 255, 0);
            }
          }
          .animate-pulse-gentle {
            animation: pulse-gentle 2.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    </section>
  );
}
