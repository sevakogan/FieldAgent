import { createClient } from "@/lib/supabase/server";

export default async function CrewDashboard() {
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
        Hey, {profile?.full_name || "there"} 👋
      </h2>
      <p className="text-sm text-gray-400 mb-5">Here are your assigned jobs</p>

      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">TODAY</h3>

      <div className="text-center py-12 text-gray-400 text-sm">
        No jobs assigned yet. Your owner will add them soon.
      </div>
    </div>
  );
}
