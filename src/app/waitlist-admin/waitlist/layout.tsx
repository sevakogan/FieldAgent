import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

const ADMIN_EMAIL = "Seva@thelevelteam.com";

export default async function AdminWaitlistLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
