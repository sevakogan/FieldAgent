import { createAdminClient } from "@/lib/supabase/admin";
import type { IntegrationSource } from "@/types/database";

const INTEGRATION_SOURCE: IntegrationSource = "hostaway";

export interface HostawayReservation {
  readonly id: number;
  readonly listingMapId: number;
  readonly guestName: string;
  readonly arrivalDate: string;
  readonly departureDate: string;
  readonly numberOfGuests: number;
  readonly channelName: string;
  readonly status: "new" | "modified" | "cancelled";
}

export interface HostawayWebhookPayload {
  readonly event: "reservation_created" | "reservation_updated" | "reservation_cancelled";
  readonly data: HostawayReservation;
  readonly timestamp: string;
}

export function parseCheckout(payload: HostawayWebhookPayload): {
  readonly checkoutDate: string;
  readonly propertyId: string;
  readonly guestName: string;
} {
  return {
    checkoutDate: payload.data.departureDate,
    propertyId: String(payload.data.listingMapId),
    guestName: payload.data.guestName,
  };
}

export async function createJobFromReservation(
  companyId: string,
  reservation: HostawayReservation,
): Promise<{ readonly success: boolean; readonly jobId?: string; readonly error?: string }> {
  const admin = createAdminClient();

  const { data: address, error: addrError } = await admin
    .from("addresses")
    .select("id, client_id")
    .eq("company_id", companyId)
    .eq("integration_source", INTEGRATION_SOURCE)
    .eq("integration_property_id", String(reservation.listingMapId))
    .single();

  if (addrError || !address) {
    console.error(`[hostaway] No linked address for listing ${reservation.listingMapId}:`, addrError);
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
      date: reservation.departureDate,
      total: addressService?.price ?? 0,
      source: "api_integration",
      status: "approved",
      notes: `Auto-created from Hostaway (${reservation.channelName}) — Guest: ${reservation.guestName}`,
    })
    .select("id")
    .single();

  if (jobError) {
    console.error("[hostaway] Failed to create job:", jobError);
    return { success: false, error: jobError.message };
  }

  return { success: true, jobId: job.id };
}

export async function handleHostawayWebhook(
  companyId: string,
  payload: HostawayWebhookPayload,
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
      case "reservation_created":
      case "reservation_updated": {
        return await createJobFromReservation(companyId, payload.data);
      }

      case "reservation_cancelled": {
        const { error } = await admin
          .from("jobs")
          .update({ status: "cancelled" })
          .eq("company_id", companyId)
          .ilike("notes", `%Hostaway%${payload.data.id}%`)
          .in("status", ["approved", "scheduled"]);

        if (error) {
          console.error("[hostaway] Failed to cancel jobs:", error);
          return { success: false, error: error.message };
        }
        return { success: true };
      }

      default:
        return { success: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[hostaway] Webhook handling failed:", message);
    return { success: false, error: message };
  }
}
