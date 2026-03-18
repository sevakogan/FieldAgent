// ── User Management ──────────────────────────────────────────────

export type UserRole = "owner" | "crew" | "client";

export type BusinessType =
  | "lawn_care"
  | "pool_service"
  | "property_cleaning"
  | "pressure_washing"
  | "pest_control"
  | "hvac"
  | "window_cleaning"
  | "handyman"
  | "multi_service";

export interface Company {
  readonly id: string;
  readonly name: string;
  readonly owner_id: string;
  readonly phone: string;
  readonly business_type: BusinessType;
  readonly created_at: string;
}

export interface CompanyService {
  readonly id: string;
  readonly company_id: string;
  readonly name: string;
  readonly default_price: number;
  readonly category: string;
  readonly sort_order: number;
  readonly is_active: boolean;
  readonly created_at: string;
}

export interface Profile {
  readonly id: string;
  readonly company_id: string;
  readonly role: UserRole;
  readonly full_name: string;
  readonly phone: string;
  readonly avatar_url: string | null;
  readonly created_at: string;
}

export type InviteStatus = "pending" | "accepted" | "expired";

export interface Invite {
  readonly id: string;
  readonly company_id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly role: "crew" | "client";
  readonly token: string;
  readonly status: InviteStatus;
  readonly invited_by: string;
  readonly created_at: string;
  readonly expires_at: string;
}

export type JobRequestStatus = "pending" | "approved" | "confirmed" | "declined" | "cancelled";

export interface JobRequest {
  readonly id: string;
  readonly company_id: string;
  readonly client_id: string;
  readonly service_description: string;
  readonly estimated_amount: number;
  readonly owner_amount: number | null;
  readonly status: JobRequestStatus;
  readonly created_at: string;
}

// ── Core Business Entities (Supabase-backed) ─────────────────────

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export interface Lead {
  readonly id: string;
  readonly company_id: string;
  readonly name: string;
  readonly phone: string | null;
  readonly service: string | null;
  readonly value: number;           // cents
  readonly status: LeadStatus;
  readonly spanish_speaker: boolean;
  readonly created_at: string;
}

export interface Client {
  readonly id: string;
  readonly company_id: string;
  readonly name: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly tag: "VIP" | "Monthly" | null;
  readonly created_at: string;
}

export interface Property {
  readonly id: string;
  readonly company_id: string;
  readonly client_id: string;
  readonly address: string;
  readonly nickname: string | null;
  readonly services: string[];
  readonly monthly_rate: number;    // cents
  readonly is_active: boolean;
  readonly created_at: string;
}

export type JobStatus = "upcoming" | "active" | "done";

export interface Job {
  readonly id: string;
  readonly company_id: string;
  readonly client_id: string;
  readonly property_id: string | null;
  readonly service: string;
  readonly worker: string | null;
  readonly date: string;            // ISO date string
  readonly time: string | null;
  readonly status: JobStatus;
  readonly total: number;           // cents
  readonly photos: number;
  readonly notes: string | null;
  readonly created_at: string;
  // Joined fields (when queried with joins)
  readonly clients?: Pick<Client, "id" | "name">;
  readonly properties?: Pick<Property, "id" | "address" | "nickname">;
}

export interface InvoiceItem {
  readonly description: string;
  readonly quantity: number;
  readonly unit_price: number;      // cents
  readonly total: number;           // cents
}

export type InvoiceStatus = "paid" | "unpaid" | "overdue" | "partial";

export interface Invoice {
  readonly id: string;
  readonly company_id: string;
  readonly client_id: string;
  readonly property_id: string | null;
  readonly job_id: string | null;
  readonly date: string;
  readonly due_date: string;
  readonly items: readonly InvoiceItem[];
  readonly subtotal: number;        // cents
  readonly tax: number;             // cents
  readonly total: number;           // cents
  readonly status: InvoiceStatus;
  readonly paid_date: string | null;
  readonly payment_method: string | null;
  readonly created_at: string;
}

export interface Call {
  readonly id: string;
  readonly company_id: string;
  readonly name: string | null;
  readonly number: string | null;
  readonly duration: string | null;
  readonly outbound: boolean;
  readonly created_at: string;
}
