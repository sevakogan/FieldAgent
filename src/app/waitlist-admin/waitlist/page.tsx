import { createClient } from "@/lib/supabase/server";
import WaitlistStats from "@/components/admin/WaitlistStats";
import WaitlistTable from "@/components/admin/WaitlistTable";
import TopReferrers from "@/components/admin/TopReferrers";

interface WaitlistEntry {
  readonly id: string;
  readonly full_name: string;
  readonly email: string;
  readonly type: string;
  readonly referral_code: string;
  readonly referred_by: string | null;
  readonly referral_count: number;
  readonly position: number;
  readonly status: string;
  readonly created_at: string;
}

export default async function AdminWaitlistPage() {
  const supabase = await createClient();

  // Fetch all waitlist entries
  const { data: entries } = await supabase
    .from("waitlist")
    .select("*")
    .order("position", { ascending: true });

  const waitlist: readonly WaitlistEntry[] = entries ?? [];

  // Breakdown by type
  const typeCounts = waitlist.reduce<Record<string, number>>((acc, entry) => {
    const key = entry.type ?? "unknown";
    return { ...acc, [key]: (acc[key] ?? 0) + 1 };
  }, {});

  // Signups today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const signupsToday = waitlist.filter(
    (e) => new Date(e.created_at) >= today,
  ).length;

  // Signups this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const signupsThisWeek = waitlist.filter(
    (e) => new Date(e.created_at) >= weekAgo,
  ).length;

  // Top referrers
  const topReferrers = [...waitlist]
    .filter((e) => e.referral_count > 0)
    .sort((a, b) => b.referral_count - a.referral_count)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-[#1C1C1E]">Waitlist Dashboard</h1>

      <WaitlistStats
        total={waitlist.length}
        typeCounts={typeCounts}
        signupsToday={signupsToday}
        signupsThisWeek={signupsThisWeek}
      />

      {topReferrers.length > 0 && <TopReferrers referrers={topReferrers} />}

      <WaitlistTable initialData={waitlist as WaitlistEntry[]} />
    </div>
  );
}
