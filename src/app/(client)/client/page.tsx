import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function ClientDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-lg">
      <h2 className="font-extrabold text-xl mb-1">
        Welcome, {profile?.full_name || "there"} 👋
      </h2>
      <p className="text-sm text-gray-400 mb-5">Your service dashboard</p>

      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">UPCOMING JOBS</h3>
      <Card className="mb-5" padding="lg">
        <p className="text-sm text-gray-400 text-center py-4">No upcoming jobs scheduled</p>
      </Card>

      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">RECENT INVOICES</h3>
      <Card className="mb-5" padding="lg">
        <p className="text-sm text-gray-400 text-center py-4">No invoices yet</p>
      </Card>
    </div>
  );
}
