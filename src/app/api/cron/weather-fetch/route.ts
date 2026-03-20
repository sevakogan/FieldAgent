import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchWeatherForLocation } from "@/lib/integrations/weather";
import { sendNotification } from "@/lib/notifications/send";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  try {
    // Get tomorrow's outdoor jobs with address coordinates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: jobs, error } = await admin
      .from("jobs")
      .select(`
        id, company_id, worker_id, service,
        addresses:property_id (lat, lng, street, city)
      `)
      .eq("date", tomorrowStr)
      .in("status", ["approved", "scheduled"])
      .not("property_id", "is", null);

    if (error) {
      console.error("[cron/weather-fetch] Failed to fetch jobs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let checked = 0;
    let alerts = 0;

    // Deduplicate by location to avoid redundant API calls
    const locationResults = new Map<string, Awaited<ReturnType<typeof fetchWeatherForLocation>>>();

    for (const job of jobs ?? []) {
      const addressRaw = job.addresses as unknown;
      const address = (Array.isArray(addressRaw) ? addressRaw[0] : addressRaw) as { lat: number | null; lng: number | null; street: string; city: string } | null;
      if (!address?.lat || !address?.lng) continue;

      const locationKey = `${address.lat.toFixed(2)},${address.lng.toFixed(2)}`;

      if (!locationResults.has(locationKey)) {
        const result = await fetchWeatherForLocation(address.lat, address.lng);
        locationResults.set(locationKey, result);
      }

      const weather = locationResults.get(locationKey);
      checked++;

      if (weather?.success && weather.data && !weather.data.isOutdoorFriendly) {
        alerts++;

        // Check if this service type is outdoor
        const { data: serviceType } = await admin
          .from("company_services")
          .select("is_outdoor")
          .eq("id", job.service)
          .single();

        if (serviceType?.is_outdoor && job.worker_id) {
          await sendNotification(job.worker_id, "weather_alert", {
            service: job.service,
            date: tomorrowStr,
            conditions: weather.data.summary,
            address: `${address.street}, ${address.city}`,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked,
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/weather-fetch] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
