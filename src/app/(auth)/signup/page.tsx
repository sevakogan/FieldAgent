"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface RoleOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly icon: React.ReactNode;
}

const ROLES: readonly RoleOption[] = [
  {
    id: "company",
    label: "Company Owner",
    description: "Manage your cleaning business, staff, and clients",
    href: "/signup/company",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "client",
    label: "Client",
    description: "Book services and manage your property",
    href: "/signup/client",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx={12} cy={7} r={4} />
      </svg>
    ),
  },
  {
    id: "worker",
    label: "Worker",
    description: "Join a team via invite code",
    href: "/signup/worker/invite",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1={16} y1={13} x2={8} y2={13} />
        <line x1={16} y1={17} x2={8} y2={17} />
      </svg>
    ),
  },
  {
    id: "reseller",
    label: "Reseller",
    description: "White-label KleanHQ under your brand",
    href: "/signup/reseller",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x={2} y={7} width={20} height={14} rx={2} ry={2} />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

export default function SignupPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-2xl shadow-sm p-7">
        <h2 className="font-extrabold text-lg mb-1" style={{ color: "#1C1C1E" }}>
          Create Account
        </h2>
        <p className="text-sm mb-5" style={{ color: "#8E8E93" }}>
          Choose your role to get started
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {ROLES.map((role) => (
            <motion.div key={role.id} variants={cardVariants}>
              <Link
                href={role.href}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                style={{
                  borderColor: "#E5E5EA",
                  color: "#1C1C1E",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#007AFF";
                  e.currentTarget.style.backgroundColor = "#F2F2F7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E5EA";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#F2F2F7", color: "#007AFF" }}
                >
                  {role.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px]">{role.label}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#8E8E93" }}>
                    {role.description}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C7C7CC"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 flex-shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Sign In */}
      <p className="text-center text-sm mt-5" style={{ color: "#8E8E93" }}>
        Already have an account?{" "}
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
