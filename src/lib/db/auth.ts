/**
 * Shared helper — get the current user + their company_id in one call.
 * Use this at the top of every page that queries company-scoped data.
 */
import { createClient } from "@/lib/supabase/client";

export interface AuthContext {
  userId: string;
  companyId: string;
  role: string;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    userId: user.id,
    companyId: profile.company_id,
    role: profile.role,
  };
}
