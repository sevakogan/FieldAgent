export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export interface Lead {
  readonly id: number;
  readonly name: string;
  readonly phone: string;
  readonly service: string;
  readonly value: number;
  readonly status: LeadStatus;
  readonly ago: string;
  readonly es: boolean;
}

export interface Client {
  readonly id: number;
  readonly ini: string;
  readonly name: string;
  readonly phone: string;
  readonly props: number;
  readonly mrr: number;
  readonly bal: number;
  readonly tag: "VIP" | "Monthly" | null;
  readonly last: string;
}

export interface Job {
  readonly id: number;
  readonly ini: string;
  readonly client: string;
  readonly addr: string;
  readonly svc: string;
  readonly worker: string;
  readonly time: string;
  readonly st: "done" | "active" | "upcoming";
  readonly total: number;
  readonly photos: number;
}

export interface Call {
  readonly name: string;
  readonly num: string;
  readonly dur: string;
  readonly out: boolean;
  readonly ago: string;
}

// ── User Management ──────────────────────────────────────────────

export type UserRole = "owner" | "crew" | "client";

export interface Company {
  readonly id: string;
  readonly name: string;
  readonly owner_id: string;
  readonly phone: string;
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
