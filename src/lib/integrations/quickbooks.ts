import { createAdminClient } from "@/lib/supabase/admin";

const QB_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID ?? "";
const QB_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET ?? "";
const QB_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI ?? "";
const QB_BASE_URL = process.env.QUICKBOOKS_SANDBOX === "true"
  ? "https://sandbox-quickbooks.api.intuit.com"
  : "https://quickbooks.api.intuit.com";

export interface QuickBooksTokens {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly realm_id: string;
}

export function getAuthUrl(companyId: string): string {
  const params = new URLSearchParams({
    client_id: QB_CLIENT_ID,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    redirect_uri: QB_REDIRECT_URI,
    state: companyId,
  });
  return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  companyId: string,
): Promise<{ readonly success: boolean; readonly tokens?: QuickBooksTokens; readonly error?: string }> {
  if (!QB_CLIENT_ID || !QB_CLIENT_SECRET) {
    return { success: false, error: "QuickBooks credentials not configured" };
  }

  try {
    const credentials = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString("base64");
    const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: QB_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[quickbooks] Token exchange failed:", text);
      return { success: false, error: "Token exchange failed" };
    }

    const data = await response.json();
    const tokens: QuickBooksTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      realm_id: data.realmId ?? "",
    };

    // Store tokens in company integrations
    const admin = createAdminClient();
    await admin.from("company_integrations").upsert({
      company_id: companyId,
      provider: "quickbooks",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      realm_id: tokens.realm_id,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

    return { success: true, tokens };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[quickbooks] OAuth error:", message);
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
    .eq("provider", "quickbooks")
    .single();

  if (!integration?.refresh_token) {
    return { success: false, error: "No QuickBooks integration found" };
  }

  try {
    const credentials = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString("base64");
    const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
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
    }).eq("company_id", companyId).eq("provider", "quickbooks");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[quickbooks] Refresh error:", message);
    return { success: false, error: message };
  }
}

export async function syncInvoice(
  companyId: string,
  invoiceData: {
    readonly clientName: string;
    readonly amount: number;
    readonly description: string;
    readonly dueDate: string;
  },
): Promise<{ readonly success: boolean; readonly qbInvoiceId?: string; readonly error?: string }> {
  const admin = createAdminClient();

  const { data: integration } = await admin
    .from("company_integrations")
    .select("access_token, realm_id, expires_at")
    .eq("company_id", companyId)
    .eq("provider", "quickbooks")
    .single();

  if (!integration?.access_token) {
    return { success: false, error: "QuickBooks not connected" };
  }

  // Refresh if expired
  if (new Date(integration.expires_at) < new Date()) {
    const refreshResult = await refreshAccessToken(companyId);
    if (!refreshResult.success) return refreshResult;
  }

  try {
    // TODO: Implement full QuickBooks invoice creation via API
    // This is a stub — actual implementation requires customer lookup/creation
    // and proper line item formatting per QuickBooks API spec
    console.log(`[quickbooks] Invoice sync stub for company ${companyId}:`, invoiceData);
    return { success: true, qbInvoiceId: "stub_pending_implementation" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[quickbooks] Invoice sync error:", message);
    return { success: false, error: message };
  }
}
