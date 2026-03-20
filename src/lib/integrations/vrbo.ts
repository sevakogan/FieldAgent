import { createAdminClient } from "@/lib/supabase/admin";
import type { IntegrationSource } from "@/types/database";

const INTEGRATION_SOURCE: IntegrationSource = "vrbo";

export interface VrboReservation {
  readonly reservation_id: string;
  readonly property_id: string;
  readonly guest_name: string;
  readonly arrival_date: string;
  readonly departure_date: string;
  readonly guest_count: number;
  readonly status: "booked" | "cancelled" | "modified";
}

export interface VrboWebhookPayload {
  readonly event: "booking.created" | "booking.modified" | "booking.cancelled";
  readonly data: VrboReservation;
  readonly sent_at: string;
}

export function parseCheckout(payload: VrboWebhookPayload): {
  readonly checkoutDate: string;
  readonly propertyId: string;
  readonly guestName: string;
} {
  return {
    checkoutDate: payload.data.departure_date,
    propertyId: payload.data.property_id,
    guestName: payload.data.guest_name,
  };
}

export async function createJobFromReservation(
  companyId: string,
  reservation: VrboReservation,
): Promise<{ readonly success: boolean; readonly jobId?: string; readonly error?: string }> {
  const admin = createAdminClient();

  const { data: address, error: addrError } = await admin
    .from("addresses")
    .select("id, client_id")
    .eq("company_id", companyId)
    .eq("integration_source", INTEGRATION_SOURCE)
    .eq("integration_property_id", reservation.property_id)
    .single();

  if (addrError || !address) {
    console.error(`[vrbo] No linked address for property ${reservation.property_id}:`, addrError);
    return { success: false, error: "No linked address found for this property" };
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
      date: reservation.departure_date,
      total: addressService?.price ?? 0,
      source: "api_integration",
      status: "approved",
      notes: `Auto-created from VRBO reservation ${reservation.reservation_id} — Guest: ${reservation.guest_name}`,
    })
    .select("id")
    .single();

  if (jobError) {
    console.error("[vrbo] Failed to create job:", jobError);
    return { success: false, error: jobError.message };
  }

  return { success: true, jobId: job.id };
}

export async function handleVrboWebhook(
  companyId: string,
  payload: VrboWebhookPayload,
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
      case "booking.created":
      case "booking.modified": {
        const result = await createJobFromReservation(companyId, payload.data);
        return result;
      }

      case "booking.cancelled": {
        const { error } = await admin
          .from("jobs")
          .update({ status: "cancelled" })
          .eq("company_id", companyId)
          .ilike("notes", `%${payload.data.reservation_id}%`)
          .in("status", ["approved", "scheduled"]);

        if (error) {
          console.error("[vrbo] Failed to cancel jobs:", error);
          return { success: false, error: error.message };
        }
        return { success: true };
      }

      default:
        return { success: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[vrbo] Webhook handling failed:", message);
    return { success: false, error: message };
  }
}
