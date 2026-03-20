/**
 * Seeds 32 realistic waitlist entries into the KleanHQ database.
 * Usage: npx tsx src/scripts/seed-waitlist.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const TYPES = ["company", "client", "reseller", "independent_pro"] as const;
const SOURCES = ["organic", "google", "instagram", "twitter", "referral", "facebook", "tiktok", "direct"] as const;

const PEOPLE = [
  { name: "Carlos Mendez", email: "carlos.mendez@example.com", type: "company" },
  { name: "Sarah Thompson", email: "sarah.t@example.com", type: "company" },
  { name: "Miguel Rodriguez", email: "miguel.r@example.com", type: "independent_pro" },
  { name: "Ashley Williams", email: "ashley.w@example.com", type: "client" },
  { name: "Jose Ramirez", email: "jose.ramirez@example.com", type: "company" },
  { name: "Emily Chen", email: "emily.chen@example.com", type: "reseller" },
  { name: "Marcus Johnson", email: "marcus.j@example.com", type: "company" },
  { name: "Diana Lopez", email: "diana.lopez@example.com", type: "independent_pro" },
  { name: "Tyler Davis", email: "tyler.d@example.com", type: "client" },
  { name: "Maria Fernandez", email: "maria.f@example.com", type: "company" },
  { name: "Brandon Lee", email: "brandon.lee@example.com", type: "company" },
  { name: "Nicole Martinez", email: "nicole.m@example.com", type: "reseller" },
  { name: "Kevin Nguyen", email: "kevin.n@example.com", type: "independent_pro" },
  { name: "Jessica Brown", email: "jessica.b@example.com", type: "client" },
  { name: "Ricardo Silva", email: "ricardo.s@example.com", type: "company" },
  { name: "Amanda Taylor", email: "amanda.t@example.com", type: "company" },
  { name: "Daniel Park", email: "daniel.park@example.com", type: "independent_pro" },
  { name: "Stephanie Garcia", email: "steph.g@example.com", type: "client" },
  { name: "Chris Robinson", email: "chris.r@example.com", type: "company" },
  { name: "Laura Hernandez", email: "laura.h@example.com", type: "reseller" },
  { name: "Ryan Mitchell", email: "ryan.m@example.com", type: "company" },
  { name: "Jasmine White", email: "jasmine.w@example.com", type: "independent_pro" },
  { name: "Derek Thomas", email: "derek.t@example.com", type: "client" },
  { name: "Patricia Reyes", email: "patricia.r@example.com", type: "company" },
  { name: "Alex Cooper", email: "alex.c@example.com", type: "company" },
  { name: "Vanessa Cruz", email: "vanessa.c@example.com", type: "independent_pro" },
  { name: "Jonathan Kim", email: "jonathan.k@example.com", type: "reseller" },
  { name: "Monica Alvarez", email: "monica.a@example.com", type: "client" },
  { name: "Steven Jackson", email: "steven.j@example.com", type: "company" },
  { name: "Camila Torres", email: "camila.t@example.com", type: "company" },
  { name: "Nathan Wright", email: "nathan.w@example.com", type: "independent_pro" },
  { name: "Isabel Morales", email: "isabel.m@example.com", type: "client" },
] as const;

async function main() {
  console.log("Seeding 32 waitlist entries...\n");

  // Generate entries with staggered created_at dates over the past 2 weeks
  const now = Date.now();
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

  const entries = PEOPLE.map((person, i) => ({
    email: person.email,
    full_name: person.name,
    type: person.type,
    referral_code: randomCode(),
    referral_count: Math.floor(Math.random() * 8),
    position: i + 1,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    ip_address: `${72 + Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    status: "waiting" as const,
    created_at: new Date(now - twoWeeksMs + (i * twoWeeksMs / 32)).toISOString(),
  }));

  const { data, error } = await supabase
    .from("waitlist")
    .upsert(entries, { onConflict: "email", ignoreDuplicates: true })
    .select("id, full_name, email, type, position");

  if (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }

  console.log(`Inserted ${data?.length ?? 0} entries:`);
  for (const entry of data ?? []) {
    console.log(`  #${entry.position} ${entry.full_name} (${entry.type}) — ${entry.email}`);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
