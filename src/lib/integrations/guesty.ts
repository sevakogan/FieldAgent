import { createAdminClient } from "@/lib/supabase/admin";
import type { IntegrationSource } from "@/types/database";

const INTEGRATION_SOURCE: IntegrationSource = "guesty";

export interface GuestyReservation {
  readonly _id: string;
  readonly listingId: string;
  readonly guestName: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly guestsCount: number;
  readonly source: string;
  readonly status: "confirmed" | "canceled" | "inquiry";
}

export interface GuestyWebhookPayload {
  readonly event: "reservation.new" | "reservation.updated" | "reservation.canceled";
  readonly reservation: GuestyReservation;
  readonly accountId: string;
  readonly timestamp: string;
}

export function parseCheckout(payload: GuestyWebhookPayload): {
  readonly checkoutDate: string;
  readonly propertyId: string;
  readonly guestName: string;
} {
  return {
    checkoutDate: payload.reservation.checkOut,
    propertyId: payload.reservation.listingId,
    guestName: payload.reservation.guestName,
  };
}

export async function createJobFromReservation(
  companyId: string,
  reservation: GuestyReservation,
): Promise<{ readonly success: boolean; readonly jobId?: string; readonly error?: string }> {
  const admin = createAdminClient();

  const { data: address, error: addrError } = await admin
    .from("addresses")
    .select("id, client_id")
    .eq("company_id", companyId)
    .eq("integration_source", INTEGRATION_SOURCE)
    .eq("integration_property_id", reservation.listingId)
    .single();

  if (addrError || !address) {
    console.error(`[guesty] No linked address for listing ${reservation.listingId}:`, addrError);
    return { success: false, error: "No linked address found for this listing" };
  }

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
      date: reservation.checkOut,
      total: addressService?.price ?? 0,
      source: "api_integration",
      status: "approved",
      notes: `Auto-created from Guesty (${reservation.source}) — Guest: ${reservation.guestName}`,
    })
    .select("id")
    .single();

  if (jobError) {
    console.error("[guesty] Failed to create job:", jobError);
    return { success: false, error: jobError.message };
  }

  return { success: true, jobId: job.id };
}

export async function handleGuestyWebhook(
  companyId: string,
  payload: GuestyWebhookPayload,
): Promise<{ readonly success: boolean; readonly error?: string }> {
  const admin = createAdminClient();

  await admin.from("webhook_logs").insert({
    company_id: companyId,
    source: INTEGRATION_SOURCE,
    event_type: payload.event,
    payload,
    status: "received",
  });

  try {
    switch (payload.event) {
      case "reservation.new":
      case "reservation.updated": {
        return await createJobFromReservation(companyId, payload.reservation);
      }

      case "reservation.canceled": {
        const { error } = await admin
          .from("jobs")
          .update({ status: "cancelled" })
          .eq("company_id", companyId)
          .ilike("notes", `%${payload.reservation._id}%`)
          .in("status", ["approved", "scheduled"]);

        if (error) {
          console.error("[guesty] Failed to cancel jobs:", error);
          return { success: false, error: error.message };
        }
        return { success: true };
      }

      default:
        return { success: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[guesty] Webhook handling failed:", message);
    return { success: false, error: message };
  }
}
