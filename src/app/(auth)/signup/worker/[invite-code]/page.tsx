"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function WorkerSignupPage() {
  const params = useParams();
  const inviteCode = params["invite-code"] as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // In production, this would fetch company info from the invite code
  const companyName = "Loading company...";

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB.");
      return;
    }

    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
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
            role: "worker",
            invite_code: inviteCode,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Upload profile photo if provided
      if (profilePhoto) {
        // In production, upload to Supabase storage
        console.log("Profile photo to upload:", profilePhoto.name);
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
          Join the Team
        </h2>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 mb-5"
          style={{ backgroundColor: "#F2F2F7" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#007AFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 flex-shrink-0"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[13px] font-medium" style={{ color: "#1C1C1E" }}>
            {companyName}
          </span>
        </div>

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
          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-2">
            <label htmlFor="worker-photo" className="cursor-pointer">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed transition-colors"
                style={{
                  borderColor: "#E5E5EA",
                  backgroundColor: "#F2F2F7",
                }}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
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
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx={12} cy={13} r={4} />
                  </svg>
                )}
              </div>
            </label>
            <input
              id="worker-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-[11px] mt-2" style={{ color: "#8E8E93" }}>
              Tap to upload profile photo
            </p>
          </div>

          <div>
            <label htmlFor="worker-email" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              EMAIL *
            </label>
            <input
              id="worker-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: "#F2F2F7", borderColor: "#E5E5EA", color: "#1C1C1E" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5EA"; }}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="worker-password" className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "#8E8E93" }}>
              SET PASSWORD *
            </label>
            <input
              id="worker-password"
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

          <div
            className="rounded-xl px-4 py-3 text-[12px]"
            style={{ backgroundColor: "#F2F2F7", color: "#8E8E93" }}
          >
            Invite code: <span className="font-mono font-semibold" style={{ color: "#1C1C1E" }}>{inviteCode}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: "#007AFF" }}
          >
            {loading ? "Joining..." : "Join Team"}
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
