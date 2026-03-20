import { createAdminClient } from "@/lib/supabase/admin";
import type { IntegrationSource } from "@/types/database";

const INTEGRATION_SOURCE: IntegrationSource = "airbnb";

export interface AirbnbReservation {
  readonly reservation_id: string;
  readonly listing_id: string;
  readonly guest_name: string;
  readonly check_in: string;
  readonly check_out: string;
  readonly guests_count: number;
  readonly status: "confirmed" | "cancelled" | "pending";
}

export interface AirbnbWebhookPayload {
  readonly event_type: "reservation_created" | "reservation_updated" | "reservation_cancelled";
  readonly reservation: AirbnbReservation;
  readonly timestamp: string;
}

export function parseCheckout(payload: AirbnbWebhookPayload): {
  readonly checkoutDate: string;
  readonly propertyId: string;
  readonly guestName: string;
} {
  return {
    checkoutDate: payload.reservation.check_out,
    propertyId: payload.reservation.listing_id,
    guestName: payload.reservation.guest_name,
  };
}

export async function createJobFromReservation(
  companyId: string,
  reservation: AirbnbReservation,
): Promise<{ readonly success: boolean; readonly jobId?: string; readonly error?: string }> {
  const admin = createAdminClient();

  // Find address linked to this Airbnb listing
  const { data: address, error: addrError } = await admin
    .from("addresses")
    .select("id, client_id")
    .eq("company_id", companyId)
    .eq("integration_source", INTEGRATION_SOURCE)
    .eq("integration_property_id", reservation.listing_id)
    .single();

  if (addrError || !address) {
    console.error(`[airbnb] No linked address for listing ${reservation.listing_id}:`, addrError);
    return { success: false, error: "No linked address found for this listing" };
  }

  // Find the default turnover service for this address
  const { data: addressService } = await admin
    .from("address_services")
    .select("id, service_type_id, price")
    .eq("address_id", address.id)
    .eq("status", "active")
    .limit(1)
    .single();

  const { data: job, error: jobError } = await admin
    .from("jobs")
    .insert({
      company_id: companyId,
      client_id: address.client_id,
      property_id: address.id,
      service: addressService?.service_type_id ?? null,
      date: reservation.check_out,
      total: addressService?.price ?? 0,
      source: "api_integration",
      status: "approved",
      notes: `Auto-created from Airbnb reservation ${reservation.reservation_id} — Guest: ${reservation.guest_name}`,
    })
    .select("id")
    .single();

  if (jobError) {
    console.error("[airbnb] Failed to create job:", jobError);
    return { success: false, error: jobError.message };
  }

  return { success: true, jobId: job.id };
}

export async function handleAirbnbWebhook(
  companyId: string,
  payload: AirbnbWebhookPayload,
): Promise<{ readonly success: boolean; readonly error?: string }> {
  const admin = createAdminClient();

  // Log the raw webhook
  await admin.from("webhook_logs").insert({
    company_id: companyId,
    source: INTEGRATION_SOURCE,
    event_type: payload.event_type,
    payload,
    status: "received",
  });

  try {
    switch (payload.event_type) {
      case "reservation_created":
      case "reservation_updated": {
        const result = await createJobFromReservation(companyId, payload.reservation);
        await admin
          .from("webhook_logs")
          .update({ status: result.success ? "processed" : "failed" })
          .eq("company_id", companyId)
          .eq("source", INTEGRATION_SOURCE)
          .order("created_at", { ascending: false })
          .limit(1);
        return result;
      }

      case "reservation_cancelled": {
        // Cancel any pending jobs for this reservation
        const { error } = await admin
          .from("jobs")
          .update({ status: "cancelled" })
          .eq("company_id", companyId)
          .ilike("notes", `%${payload.reservation.reservation_id}%`)
          .in("status", ["approved", "scheduled"]);

        if (error) {
          console.error("[airbnb] Failed to cancel jobs:", error);
          return { success: false, error: error.message };
        }
        return { success: true };
      }

      default:
        return { success: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[airbnb] Webhook handling failed:", message);
    return { success: false, error: message };
  }
}
