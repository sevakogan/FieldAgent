import { createAdminClient } from "@/lib/supabase/admin";

const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID ?? "";
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET ?? "";
const XERO_REDIRECT_URI = process.env.XERO_REDIRECT_URI ?? "";

export interface XeroTokens {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly tenant_id: string;
}

export function getAuthUrl(companyId: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: XERO_CLIENT_ID,
    redirect_uri: XERO_REDIRECT_URI,
    scope: "openid profile email accounting.transactions accounting.contacts offline_access",
    state: companyId,
  });
  return `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  companyId: string,
): Promise<{ readonly success: boolean; readonly tokens?: XeroTokens; readonly error?: string }> {
  if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) {
    return { success: false, error: "Xero credentials not configured" };
  }

  try {
    const credentials = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString("base64");
    const response = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: XERO_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[xero] Token exchange failed:", text);
      return { success: false, error: "Token exchange failed" };
    }

    const data = await response.json();

    // Fetch tenant ID from connections
    const connectionsRes = await fetch("https://api.xero.com/connections", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const connections = await connectionsRes.json();
    const tenantId = Array.isArray(connections) && connections.length > 0
      ? connections[0].tenantId
      : "";

    const tokens: XeroTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      tenant_id: tenantId,
    };

    const admin = createAdminClient();
    await admin.from("company_integrations").upsert({
      company_id: companyId,
      provider: "xero",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      realm_id: tokens.tenant_id,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

    return { success: true, tokens };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[xero] OAuth error:", message);
    return { success: false, error: message };
  }
}

export async function refreshAccessToken(
  companyId: string,
): Promise<{ readonly success: boolean; readonly error?: string }> {
  const admin = createAdminClient();

  const { data: integration } = await admin
    .from("company_integrations")
    .select("refresh_token, realm_id")
    .eq("company_id", companyId)
    .eq("provider", "xero")
    .single();

  if (!integration?.refresh_token) {
    return { success: false, error: "No Xero integration found" };
  }

  try {
    const credentials = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString("base64");
    const response = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: integration.refresh_token,
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Token refresh failed" };
    }

    const data = await response.json();
    await admin.from("company_integrations").update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }).eq("company_id", companyId).eq("provider", "xero");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[xero] Refresh error:", message);
    return { success: false, error: message };
  }
}

export async function syncInvoice(
  companyId: string,
  invoiceData: {
    readonly clientName: string;
    readonly clientEmail: string;
    readonly amount: number;
    readonly description: string;
    readonly dueDate: string;
  },
): Promise<{ readonly success: boolean; readonly xeroInvoiceId?: string; readonly error?: string }> {
  const admin = createAdminClient();

  const { data: integration } = await admin
    .from("company_integrations")
    .select("access_token, realm_id, expires_at")
    .eq("company_id", companyId)
    .eq("provider", "xero")
    .single();

  if (!integration?.access_token) {
    return { success: false, error: "Xero not connected" };
  }

  if (new Date(integration.expires_at) < new Date()) {
    const refreshResult = await refreshAccessToken(companyId);
    if (!refreshResult.success) return refreshResult;
  }

  try {
    // TODO: Implement full Xero invoice creation via API
    // Requires contact lookup/creation and proper line item formatting
    console.log(`[xero] Invoice sync stub for company ${companyId}:`, invoiceData);
    return { success: true, xeroInvoiceId: "stub_pending_implementation" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[xero] Invoice sync error:", message);
    return { success: false, error: message };
  }
}
