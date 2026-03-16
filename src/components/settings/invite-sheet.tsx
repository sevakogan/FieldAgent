"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface InviteSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly defaultRole: "crew" | "client";
}

export function InviteSheet({ open, onClose, defaultRole }: InviteSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setName(""); setEmail(""); setPhone("");
    setResult(null); setError(""); setCopied(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSend = async (method: "email" | "sms" | "link") => {
    setError("");

    if (method === "email" && !email) { setError("Email is required"); return; }
    if (method === "sms" && !phone) { setError("Phone is required"); return; }

    setLoading(true);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || undefined, phone: phone || undefined, role: defaultRole, name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error); return; }

    if (method === "link" || method === "sms") {
      setResult({ token: data.invite.token });
    } else {
      handleClose();
    }
  };

  const copyLink = async () => {
    if (!result) return;
    const link = `${window.location.origin}/invite/${result.token}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title={`Invite ${defaultRole === "crew" ? "Crew Member" : "Client"}`}>
      <div className="p-5 pt-0">
        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">{error}</div>
        )}

        {result ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 mb-3">Share this invite link:</p>
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-[13px] font-mono break-all mb-4">
              {`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${result.token}`}
            </div>
            <button onClick={copyLink}
              className="w-full bg-brand-dark text-white border-none rounded-xl py-3 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity">
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">NAME</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="Their name" />
            </div>
            <div className="mb-3">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="them@email.com" />
            </div>
            <div className="mb-5">
              <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">PHONE</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors"
                placeholder="(786) 555-0100" />
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleSend("email")} disabled={loading}
                className="w-full bg-brand-dark text-white border-none rounded-xl py-3 font-bold text-sm cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50">
                {loading ? "..." : "Send Email Invite"}
              </button>
              <button onClick={() => handleSend("sms")} disabled={loading}
                className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50">
                {loading ? "..." : "Send SMS Invite"}
              </button>
              <button onClick={() => handleSend("link")} disabled={loading}
                className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50">
                {loading ? "..." : "Get Invite Link"}
              </button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
