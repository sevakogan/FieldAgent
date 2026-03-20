"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { TIERS, getTier, type Tier } from "@/lib/pricing";

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────
type InviteStatus = "paying" | "trial" | "pending" | "expired" | "joined";
type InviteType = "owner" | "client";

interface Invite {
  readonly id: number;
  readonly type: InviteType;
  readonly name: string;
  readonly email: string;
  readonly sentDate: string;
  readonly status: InviteStatus;
  readonly signupDate: string | null;
  readonly trialEnds: string | null;
  readonly properties: number | null;
  readonly daysRewardedToMe: number | null;
  readonly rewardCycleDate: string | null;
}

interface Me {
  readonly name: string;
  readonly ini: string;
  readonly tier: Tier;
  readonly referralCode: string;
  readonly referralLink: string;
  readonly daysEarned: number;
  readonly nextBillingDate: string;
  readonly payingOwnerReferrals: number;
  readonly milestoneTarget: number;
}

interface ReferredByClient {
  readonly clientName: string;
  readonly clientEmail: string;
  readonly date: string;
  readonly reward: string;
}

// ─────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────
const ME: Me = {
  name:                 "John Martinez",
  ini:                  "JM",
  tier:                 getTier(8),
  referralCode:         "JOHN-4X9K",
  referralLink:         "kleanhq.com/join?ref=JOHN-4X9K",
  daysEarned:           30,
  nextBillingDate:      "Apr 6, 2026",
  payingOwnerReferrals: 3,
  milestoneTarget:      5,
};

const INVITES: Invite[] = [
  { id: 1, type: "owner",  name: "Carlos Rivera",  email: "carlos@rvlawn.com",     sentDate: "Mar 1, 2026",  status: "paying",  signupDate: "Mar 3, 2026",  trialEnds: "Apr 17, 2026", properties: 14,   daysRewardedToMe: 30,   rewardCycleDate: "Apr 6, 2026"  },
  { id: 2, type: "owner",  name: "Sandra Ortiz",   email: "sandra@ortizlawn.com",  sentDate: "Mar 4, 2026",  status: "trial",   signupDate: "Mar 6, 2026",  trialEnds: "Apr 20, 2026", properties: 6,    daysRewardedToMe: null, rewardCycleDate: null           },
  { id: 3, type: "owner",  name: "Mike Thompson",  email: "mike@thompsongreen.com",sentDate: "Feb 20, 2026", status: "paying",  signupDate: "Feb 22, 2026", trialEnds: "Apr 8, 2026",  properties: 22,   daysRewardedToMe: 30,   rewardCycleDate: "Mar 6, 2026"  },
  { id: 4, type: "owner",  name: "Lisa Chen",      email: "lisa@chenlawncare.com", sentDate: "Mar 10, 2026", status: "pending", signupDate: null,           trialEnds: null,           properties: null, daysRewardedToMe: null, rewardCycleDate: null           },
  { id: 5, type: "owner",  name: "Derek Wills",    email: "derek@willsyard.com",   sentDate: "Jan 15, 2026", status: "expired", signupDate: null,           trialEnds: null,           properties: null, daysRewardedToMe: null, rewardCycleDate: null           },
  { id: 6, type: "client", name: "Maria Lopez",    email: "maria@email.com",       sentDate: "Mar 8, 2026",  status: "joined",  signupDate: "Mar 9, 2026",  trialEnds: null,           properties: null, daysRewardedToMe: null, rewardCycleDate: null           },
  { id: 7, type: "client", name: "David Park",     email: "david@email.com",       sentDate: "Mar 12, 2026", status: "pending", signupDate: null,           trialEnds: null,           properties: null, daysRewardedToMe: null, rewardCycleDate: null           },
];

const REFERRED_BY_CLIENT: ReferredByClient = {
  clientName:  "Ana Rodriguez",
  clientEmail: "ana@email.com",
  date:        "Jan 10, 2026",
  reward:      "[PLACEHOLDER — client reward pending]",
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function daysAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────
const STATUS_VARIANT: Record<InviteStatus, "success" | "info" | "default" | "danger" | "purple"> = {
  paying:  "success",
  trial:   "info",
  pending: "default",
  expired: "danger",
  joined:  "purple",
};

const STATUS_LABEL: Record<InviteStatus, string> = {
  paying:  "Paying",
  trial:   "Trial",
  pending: "Pending",
  expired: "Expired",
  joined:  "Joined",
};

function StatusBadge({ status }: { readonly status: InviteStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────
// TRIAL COUNTDOWN
// ─────────────────────────────────────────────────────────────────
function TrialCountdown({ trialEnds }: { readonly trialEnds: string | null }) {
  const days = daysUntil(trialEnds);
  if (days === null) return null;

  if (days < 0) {
    return <span className="text-[11px] text-red-600 font-semibold">Trial ended</span>;
  }

  const colorClass = days <= 7 ? "bg-red-500" : days <= 15 ? "bg-amber-400" : "bg-green-500";
  const textClass  = days <= 7 ? "text-red-500" : days <= 15 ? "text-amber-500" : "text-green-500";
  const pct = Math.max(0, Math.min(100, (days / 45) * 100));

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-gray-400 font-bold">TRIAL ENDS</span>
        <span className={`text-[11px] font-bold ${textClass}`}>
          {days}d left · {trialEnds}
        </span>
      </div>
      <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MILESTONE BAR
// ─────────────────────────────────────────────────────────────────
function MilestoneBar({
  current,
  target,
  onClaim,
}: {
  readonly current: number;
  readonly target: number;
  readonly onClaim?: () => void;
}) {
  const remaining = target - current;

  return (
    <Card padding="lg" className="mb-3.5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-[12px] font-bold text-gray-400 tracking-wide mb-1">
            MILESTONE REWARD
          </div>
          <div className="text-[17px] font-extrabold tracking-tight">
            Every 5 paying owner referrals
          </div>
          <div className="text-[12px] text-gray-400 mt-0.5">
            {remaining > 0
              ? `${remaining} more paying owner${remaining !== 1 ? "s" : ""} to unlock`
              : "🎉 Milestone unlocked!"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[32px] font-black tracking-[-1px] leading-none">
            {current}
            <span className="text-base text-gray-300 font-normal">/{target}</span>
          </div>
          <div className="text-[10px] text-gray-300 mt-0.5">paying owners</div>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full ${i < current ? "bg-[#111]" : "bg-gray-100"}`}
          />
        ))}
      </div>

      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">🎁</span>
        <div className="flex-1">
          <div className="font-bold text-[13px] text-gray-500">
            Reward at 5 paying referrals
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            [PLACEHOLDER — reward TBD]
          </div>
        </div>
        {current >= target && (
          <button
            onClick={onClaim}
            className="bg-[#111] text-white rounded-[10px] px-3.5 py-1.5 text-xs font-bold hover:opacity-85 transition-opacity"
          >
            Claim
          </button>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// REWARD BANKED
// ─────────────────────────────────────────────────────────────────
function RewardBanked({
  daysEarned,
  nextBillingDate,
  tier,
}: {
  readonly daysEarned: number;
  readonly nextBillingDate: string;
  readonly tier: Tier;
}) {
  const dollarValue = tier.price
    ? Math.round((daysEarned / 30) * tier.price)
    : null;

  return (
    <div className="bg-green-50 rounded-2xl p-6 shadow-sm mb-3.5">
      <div className="text-[12px] font-bold text-green-700 tracking-wide mb-2">
        YOUR REWARD BALANCE
      </div>
      <div className="flex items-end gap-2 mb-1.5">
        <div className="text-[40px] font-black tracking-[-2px] leading-none">
          {daysEarned}
        </div>
        <div className="text-base text-gray-500 font-semibold mb-1">
          free days banked
        </div>
      </div>
      {dollarValue !== null && (
        <div className="text-[13px] text-green-600 font-semibold mb-1.5">
          ≈ ${dollarValue} value at your {tier.label} plan (${tier.price}/mo)
        </div>
      )}
      <div className="text-[12px] text-gray-500">
        Applied automatically · next billing{" "}
        <strong>{nextBillingDate}</strong>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// COPY LINK BOX
// ─────────────────────────────────────────────────────────────────
function CopyLinkBox({ link }: { readonly link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[12px] text-gray-500 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
        {link}
      </div>
      <button
        onClick={copy}
        className={`shrink-0 text-white border-0 rounded-[10px] px-4 py-2.5 font-bold text-[12px] cursor-pointer transition-colors whitespace-nowrap ${
          copied ? "bg-green-500" : "bg-[#111] hover:opacity-85"
        }`}
      >
        {copied ? "✓ Copied" : "Copy Link"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// INVITE CARD
// ─────────────────────────────────────────────────────────────────
function InviteCard({
  invite,
  isOwner,
}: {
  readonly invite: Invite;
  readonly isOwner: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const tier = invite.properties ? getTier(invite.properties) : null;
  const isExpandable = isOwner && !["pending", "expired"].includes(invite.status);

  return (
    <div
      onClick={() => isOwner && setExpanded((e) => !e)}
      className={`bg-white rounded-2xl px-5 py-4 shadow-sm mb-2 transition-shadow ${
        isOwner ? "cursor-pointer hover:shadow-md" : "cursor-default"
      } ${invite.status === "expired" ? "opacity-50" : ""}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <Avatar
          initials={getInitials(invite.name)}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-bold text-[14px]">{invite.name}</span>
            <StatusBadge status={invite.status} />
            {!isOwner && (
              <Badge variant="purple">Client</Badge>
            )}
          </div>
          <div className="text-[11px] text-gray-300">
            {invite.email} · Invited {daysAgo(invite.sentDate)} ({invite.sentDate})
          </div>
        </div>

        {/* Reward info (owners only) */}
        {isOwner && (
          <div className="text-right shrink-0">
            {invite.daysRewardedToMe && (
              <div className="text-[13px] font-bold text-green-700">
                +{invite.daysRewardedToMe}d free
              </div>
            )}
            {invite.rewardCycleDate && (
              <div className="text-[10px] text-gray-300 mt-0.5">
                Applied {invite.rewardCycleDate}
              </div>
            )}
            {!invite.daysRewardedToMe && !["expired", "pending"].includes(invite.status) && (
              <div className="text-[11px] text-gray-400">Reward pending</div>
            )}
            <div className="text-[14px] text-gray-300 mt-1">
              {expanded ? "▲" : "▼"}
            </div>
          </div>
        )}
      </div>

      {/* Expanded detail (owner invites only) */}
      {isExpandable && expanded && (
        <div className="mt-3.5 pt-3.5 border-t border-gray-50">
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {[
              ["Signed up",  invite.signupDate ?? "—"],
              ["Properties", invite.properties ? `${invite.properties} props` : "—"],
              ["Plan",       tier ? `${tier.label} · $${tier.price}/mo` : "—"],
            ].map(([lbl, val]) => (
              <div key={lbl} className="bg-gray-50 rounded-[10px] px-3 py-2.5">
                <div className="text-[9px] font-bold text-gray-300 tracking-wide mb-1">
                  {lbl.toUpperCase()}
                </div>
                <div className="text-[13px] font-bold">{val}</div>
              </div>
            ))}
          </div>

          {invite.status === "trial" && (
            <TrialCountdown trialEnds={invite.trialEnds} />
          )}

          <div
            className={`rounded-[10px] px-3.5 py-2.5 flex items-center gap-2.5 mt-2.5 ${
              invite.daysRewardedToMe ? "bg-green-50" : "bg-gray-50"
            }`}
          >
            <span className="text-[18px]">
              {invite.daysRewardedToMe ? "✓" : "⏳"}
            </span>
            <div>
              {invite.daysRewardedToMe ? (
                <>
                  <div className="text-[12px] font-bold text-green-700">
                    You earned 30 free days
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Applied {invite.rewardCycleDate}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[12px] font-bold text-gray-600">
                    30 free days pending
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Applied when they become paying
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// INVITE BOTTOM SHEET
// ─────────────────────────────────────────────────────────────────
function InviteSheet({ open, onClose }: { readonly open: boolean; readonly onClose: () => void }) {
  const [type, setType]   = useState<InviteType>("owner");
  const [email, setEmail] = useState("");
  const [name, setName]   = useState("");
  const [sent, setSent]   = useState(false);

  const isValid = email.trim().length > 0 && name.trim().length > 0;

  const send = () => {
    if (!isValid) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail("");
      setName("");
      onClose();
    }, 1800);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Send Invite">
      {/* Type toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {(["owner", "client"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setType(v)}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-bold transition-all ${
              type === v
                ? "bg-[#111] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {v === "owner" ? "Owner" : "Client"}
          </button>
        ))}
      </div>

      {/* Reward info callout */}
      <div
        className={`rounded-xl px-3.5 py-3 mb-5 flex gap-2.5 ${
          type === "owner" ? "bg-green-50" : "bg-gray-50"
        }`}
      >
        <span className="text-xl">{type === "owner" ? "🎁" : "ℹ️"}</span>
        <div>
          {type === "owner" ? (
            <>
              <div className="text-[12px] font-bold text-green-700 mb-0.5">
                Owner referral reward
              </div>
              <div className="text-[11px] text-gray-500 leading-relaxed">
                They get <strong>45 days free</strong> on signup.
                <br />
                You get <strong>30 days free</strong> when they pay.
              </div>
            </>
          ) : (
            <>
              <div className="text-[12px] font-bold text-gray-600 mb-0.5">
                Client invite
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed">
                Clients join to view jobs and invoices. No referral reward for client invites.
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form fields */}
      {(
        [
          { label: "Name",  value: name,  setter: setName,  type: "text",  placeholder: type === "owner" ? "Business owner name" : "Client name" },
          { label: "Email", value: email, setter: setEmail, type: "email", placeholder: "Email address" },
        ] as const
      ).map(({ label, value, setter, type: inputType, placeholder }) => (
        <div key={label} className="mb-3.5">
          <div className="text-[10px] font-bold text-gray-300 tracking-wide mb-1.5">
            {label.toUpperCase()}
          </div>
          <input
            type={inputType}
            value={value}
            onChange={(e) => setter(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111] transition-colors"
          />
        </div>
      ))}

      {/* Submit */}
      <button
        onClick={send}
        disabled={!isValid}
        className={`w-full rounded-xl py-3.5 font-bold text-[14px] transition-all ${
          sent
            ? "bg-green-500 text-white"
            : isValid
            ? "bg-[#111] text-white hover:opacity-85"
            : "bg-gray-100 text-gray-400 cursor-default"
        }`}
      >
        {sent ? "✓ Invite Sent!" : "Send Invite"}
      </button>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────
export default function ReferralsPage() {
  const [tab, setTab]         = useState<"owners" | "clients">("owners");
  const [showInvite, setShowInvite] = useState(false);

  const ownerInvites  = INVITES.filter((i) => i.type === "owner");
  const clientInvites = INVITES.filter((i) => i.type === "client");
  const payingOwners  = ownerInvites.filter((i) => i.status === "paying").length;

  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="font-extrabold text-lg tracking-tight">Referrals</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Invite owners · track rewards · earn free days
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="shrink-0 bg-[#111] text-white rounded-[10px] px-5 py-2.5 text-[13px] font-bold flex items-center gap-1.5 hover:opacity-85 transition-opacity"
        >
          + Send Invite
        </button>
      </div>

      <div className="max-w-[860px]">
        {/* Reward balance */}
        <RewardBanked
          daysEarned={ME.daysEarned}
          nextBillingDate={ME.nextBillingDate}
          tier={ME.tier}
        />

        {/* Milestone progress */}
        <MilestoneBar
          current={ME.payingOwnerReferrals}
          target={ME.milestoneTarget}
        />

        {/* Referral link */}
        <Card padding="lg" className="mb-3.5">
          <div className="flex justify-between items-center mb-3.5 gap-3 flex-wrap">
            <div>
              <div className="text-[12px] font-bold text-gray-400 tracking-wide mb-0.5">
                YOUR REFERRAL LINK
              </div>
              <div className="text-[14px] font-semibold">
                Code:{" "}
                <span className="font-mono bg-gray-100 rounded-md px-2 py-0.5 text-[13px]">
                  {ME.referralCode}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-400">Owner signups get</div>
              <div className="text-[14px] font-extrabold">45 days free</div>
            </div>
          </div>
          <CopyLinkBox link={ME.referralLink} />
        </Card>

        {/* Referred by client banner */}
        <div className="bg-purple-50 rounded-2xl px-5 py-3.5 mb-5 flex items-center gap-3">
          <span className="text-[22px]">🔗</span>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-purple-700 mb-0.5">
              You were referred by a client
            </div>
            <div className="text-[12px] text-gray-500">
              <strong>{REFERRED_BY_CLIENT.clientName}</strong> referred you on{" "}
              {REFERRED_BY_CLIENT.date}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-purple-600 font-bold mb-0.5">
              CLIENT REWARD
            </div>
            <div className="text-[11px] text-gray-400">
              {REFERRED_BY_CLIENT.reward}
            </div>
          </div>
        </div>

        {/* How it works */}
        <Card padding="lg" className="mb-5">
          <div className="text-[12px] font-bold text-gray-400 tracking-wide mb-4">
            HOW IT WORKS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { icon: "👤", title: "Owner → Client",        detail: "Client joins to view jobs + invoices",      reward: "No referral reward",            bg: "bg-gray-100",   rc: "text-gray-400"    },
              { icon: "🤝", title: "Owner → Owner",          detail: "They get 45 days free on signup",           reward: "You get 30 days when they pay", bg: "bg-green-50",   rc: "text-green-700"   },
              { icon: "🏆", title: "Every 5 paying owners",  detail: "5 referrals convert to paying subscribers", reward: "[MILESTONE REWARD — TBD]",      bg: "bg-yellow-50",  rc: "text-yellow-700"  },
              { icon: "⭐", title: "Client → Owner",         detail: "A client refers you, you become paying",    reward: "[CLIENT REWARD — TBD]",         bg: "bg-purple-50",  rc: "text-purple-700"  },
            ].map((r) => (
              <div key={r.title} className={`${r.bg} rounded-xl px-4 py-3.5`}>
                <div className="text-[22px] mb-2">{r.icon}</div>
                <div className="font-bold text-[12px] mb-1">{r.title}</div>
                <div className="text-[11px] text-gray-500 leading-relaxed mb-1.5">
                  {r.detail}
                </div>
                <div className={`text-[11px] font-bold ${r.rc}`}>
                  {r.reward}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tab bar */}
        <div className="flex justify-between items-center mb-3.5 flex-wrap gap-2.5">
          <div className="flex bg-white rounded-xl p-0.5 shadow-sm">
            {(
              [
                ["owners",  `Owners (${ownerInvites.length})`],
                ["clients", `Clients (${clientInvites.length})`],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setTab(v)}
                className={`px-4 py-1.5 rounded-[10px] border-0 cursor-pointer font-semibold text-[13px] transition-all ${
                  tab === v
                    ? "bg-[#111] text-white"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="text-[12px] text-gray-400">
            {tab === "owners"
              ? `${payingOwners} paying · ${ownerInvites.filter((i) => i.status === "trial").length} in trial · ${ownerInvites.filter((i) => i.status === "pending").length} pending`
              : `${clientInvites.filter((i) => i.status === "joined").length} joined · ${clientInvites.filter((i) => i.status === "pending").length} pending`}
          </div>
        </div>

        {/* Invite lists */}
        {tab === "owners" && (
          <>
            {ownerInvites.map((i) => (
              <InviteCard key={i.id} invite={i} isOwner={true} />
            ))}
            {ownerInvites.length === 0 && (
              <div className="text-center py-10 text-gray-300">
                <div className="text-[32px] mb-2">👋</div>
                <div className="font-semibold">No owner invites yet</div>
                <div className="text-[12px] mt-1">
                  Send your first invite to start earning free days
                </div>
              </div>
            )}
          </>
        )}

        {tab === "clients" && (
          <>
            <div className="bg-gray-100 rounded-xl px-4 py-2.5 mb-3.5 text-[12px] text-gray-500 flex gap-2 items-center">
              <span>ℹ️</span> Client invites don&apos;t earn referral rewards.
            </div>
            {clientInvites.map((i) => (
              <InviteCard key={i.id} invite={i} isOwner={false} />
            ))}
          </>
        )}

        {/* Pricing reference */}
        <Card padding="lg" className="mt-5">
          <div className="text-[12px] font-bold text-gray-400 tracking-wide mb-3.5">
            PRICING TIERS · Different address = different property
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {TIERS.map((t) => {
              const isCurrentTier = ME.tier.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`relative rounded-xl px-4 py-3.5 ${
                    isCurrentTier
                      ? "bg-[#111] text-white"
                      : "bg-gray-50 text-[#111]"
                  }`}
                >
                  {isCurrentTier && (
                    <div className="absolute top-2.5 right-2.5 bg-green-500 text-white rounded-md px-1.5 py-px text-[9px] font-extrabold">
                      YOU
                    </div>
                  )}
                  <div
                    className={`text-[11px] font-bold tracking-wide mb-1.5 ${
                      isCurrentTier ? "text-white/50" : "text-gray-400"
                    }`}
                  >
                    {t.label.toUpperCase()}
                  </div>
                  <div className="text-[22px] font-black tracking-[-1px] leading-none mb-1">
                    {t.price ? `$${t.price}` : "Custom"}
                    {t.price && (
                      <span
                        className={`text-[11px] font-normal ${
                          isCurrentTier ? "text-white/50" : "text-gray-300"
                        }`}
                      >
                        /mo
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[11px] ${
                      isCurrentTier ? "text-white/60" : "text-gray-400"
                    }`}
                  >
                    {t.max === Infinity
                      ? `${t.min}+ props`
                      : `${t.min}–${t.max} props`}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Invite bottom sheet */}
      <InviteSheet open={showInvite} onClose={() => setShowInvite(false)} />
    </>
  );
}
