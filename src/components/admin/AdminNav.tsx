"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <span className="text-lg font-bold text-[#1C1C1E]">
          KleanHQ <span className="text-[#007AFF]">Admin</span>
        </span>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-[#1C1C1E]"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
