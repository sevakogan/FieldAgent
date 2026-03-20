/**
 * Seed script for KleanHQ development.
 * Creates an admin user and 5 fake waitlist entries.
 *
 * Usage: npx tsx src/scripts/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const ADMIN_EMAIL = "Seva@thelevelteam.com";
const ADMIN_PASSWORD = "Seva@1982";
const ADMIN_ROLE = "super_admin";

const FAKE_WAITLIST_ENTRIES = [
  {
    email: "maria.garcia@example.com",
    full_name: "Maria Garcia",
    type: "company" as const,
    referral_code: "MG2K01",
    referral_count: 4,
    source: "organic",
  },
  {
    email: "james.wilson@example.com",
    full_name: "James Wilson",
    type: "independent_pro" as const,
    referral_code: "JW3X92",
    referral_count: 1,
    source: "twitter",
  },
  {
    email: "sophie.chen@example.com",
    full_name: "Sophie Chen",
    type: "reseller" as const,
    referral_code: "SC7B45",
    referral_count: 7,
    source: "referral",
  },
  {
    email: "david.brown@example.com",
    full_name: "David Brown",
    type: "client" as const,
    referral_code: "DB1F88",
    referral_count: 0,
    source: "google",
  },
  {
    email: "aisha.johnson@example.com",
    full_name: "Aisha Johnson",
    type: "company" as const,
    referral_code: "AJ9K33",
    referral_count: 2,
    source: "organic",
  },
] as const;

async function seedAdminUser(): Promise<void> {
  console.log("Creating admin user...");

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingAdmin = existingUsers?.users?.find(
    (u) => u.email === ADMIN_EMAIL
  );

  if (existingAdmin) {
    console.log(`Admin user ${ADMIN_EMAIL} already exists. Skipping.`);
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { role: ADMIN_ROLE, full_name: "Seva" },
  });

  if (error) {
    console.error("Failed to create admin user:", error.message);
    return;
  }

  console.log(`Admin user created: ${ADMIN_EMAIL} (role: ${ADMIN_ROLE})`);
}

async function seedWaitlistEntries(): Promise<void> {
  console.log("Inserting fake waitlist entries...");

  const entries = FAKE_WAITLIST_ENTRIES.map((entry, index) => ({
    ...entry,
    position: index + 1,
    status: "waiting" as const,
    ip_address: `192.168.1.${10 + index}`,
  }));

  const { error } = await supabase.from("waitlist").upsert(entries, {
    onConflict: "email",
    ignoreDuplicates: true,
  });

  if (error) {
    console.error("Failed to insert waitlist entries:", error.message);
    return;
  }

  console.log(`Inserted ${entries.length} waitlist entries.`);
}

async function main(): Promise<void> {
  console.log("--- KleanHQ Seed Script ---\n");

  await seedAdminUser();
  await seedWaitlistEntries();

  console.log("\n--- Seed complete ---");
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
