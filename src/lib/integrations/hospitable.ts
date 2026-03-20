import { createAdminClient } from "@/lib/supabase/admin";
import type { IntegrationSource } from "@/types/database";

const INTEGRATION_SOURCE: IntegrationSource = "hospitable";

export interface HospitableReservation {
  readonly id: string;
  readonly listing_id: string;
  readonly guest_name: string;
  readonly checkin_date: string;
  readonly checkout_date: string;
  readonly number_of_guests: number;
  readonly channel: string;
  readonly status: "confirmed" | "cancelled" | "pending";
}

export interface HospitableWebhookPayload {
  readonly event: "reservation.checkout" | "reservation.created" | "reservation.cancelled";
  readonly reservation: HospitableReservation;
  readonly timestamp: string;
}

export function parseCheckout(payload: HospitableWebhookPayload): {
  readonly checkoutDate: string;
  readonly propertyId: string;
  readonly guestName: string;
} {
  return {
    checkoutDate: payload.reservation.checkout_date,
    propertyId: payload.reservation.listing_id,
    guestName: payload.reservation.guest_name,
  };
}

export async function createJobFromReservation(
  companyId: string,
  reservation: HospitableReservation,
): Promise<{ readonly success: boolean; readonly jobId?: string; readonly error?: string }> {
  const admin = createAdminClient();

  const { data: address, error: addrError } = await admin
    .from("addresses")
    .select("id, client_id")
    .eq("company_id", companyId)
    .eq("integration_source", INTEGRATION_SOURCE)
    .eq("integration_property_id", reservation.listing_id)
    .single();

  if (addrError || !address) {
    console.error(`[hospitable] No linked address for listing ${reservation.listing_id}:`, addrError);
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
      date: reservation.checkout_date,
      total: addressService?.price ?? 0,
      source: "api_integration",
      status: "approved",
      notes: `Auto-created from Hospitable (${reservation.channel}) — Guest: ${reservation.guest_name}`,
    })
    .select("id")
    .single();

  if (jobError) {
    console.error("[hospitable] Failed to create job:", jobError);
    return { success: false, error: jobError.message };
  }

  return { success: true, jobId: job.id };
}

export async function handleHospitableWebhook(
  companyId: string,
  payload: HospitableWebhookPayload,
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
      case "reservation.checkout":
      case "reservation.created": {
        return await createJobFromReservation(companyId, payload.reservation);
      }

      case "reservation.cancelled": {
        const { error } = await admin
          .from("jobs")
          .update({ status: "cancelled" })
          .eq("company_id", companyId)
          .ilike("notes", `%${payload.reservation.id}%`)
          .in("status", ["approved", "scheduled"]);

        if (error) {
          console.error("[hospitable] Failed to cancel jobs:", error);
          return { success: false, error: error.message };
        }
        return { success: true };
      }

      default:
        return { success: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[hospitable] Webhook handling failed:", message);
    return { success: false, error: message };
  }
}
