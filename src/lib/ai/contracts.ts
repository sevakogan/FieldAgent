const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

export interface ContractInput {
  readonly companyName: string;
  readonly clientName: string;
  readonly services: readonly {
    readonly name: string;
    readonly price: number;
    readonly recurrence: string;
  }[];
  readonly address: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly cancellationPolicyHours: number;
  readonly lateCancelFee: number;
  readonly paymentTerms: string;
  readonly additionalTerms?: string;
}

export interface GeneratedContract {
  readonly title: string;
  readonly content: string;
  readonly generatedAt: string;
}

const SYSTEM_PROMPT = `You are a contract generation assistant for KleanHQ, a cleaning and field service management platform.
Generate professional service agreements based on the provided details.
The contract should be:
- Clear and legally sound (but include a disclaimer that it's AI-generated and should be reviewed by legal counsel)
- Professional in tone
- Formatted in clean HTML with proper headings, sections, and styling
- Include all standard sections: parties, scope of services, pricing, payment terms, cancellation policy, liability, term, and signatures
- Use proper legal language without being overly complex
Output ONLY the HTML contract content. Do not include markdown or explanations.`;

export async function generateContract(
  input: ContractInput,
): Promise<{ readonly success: boolean; readonly contract?: GeneratedContract; readonly error?: string }> {
  if (!ANTHROPIC_API_KEY) {
    return { success: false, error: "ANTHROPIC_API_KEY not configured" };
  }

  const servicesDescription = input.services
    .map((s) => `- ${s.name}: $${s.price.toFixed(2)} (${s.recurrence})`)
    .join("\n");

  const prompt = `Generate a professional service agreement with these details:

Company (Service Provider): ${input.companyName}
Client: ${input.clientName}
Service Address: ${input.address}
Start Date: ${input.startDate}
${input.endDate ? `End Date: ${input.endDate}` : "Term: Ongoing until cancelled"}

Services:
${servicesDescription}

Cancellation Policy: ${input.cancellationPolicyHours} hours notice required
Late Cancellation Fee: $${input.lateCancelFee.toFixed(2)}
Payment Terms: ${input.paymentTerms}
${input.additionalTerms ? `Additional Terms: ${input.additionalTerms}` : ""}

Include signature blocks for both parties with date lines.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[ai/contracts] API error:", text);
      return { success: false, error: "AI service unavailable" };
    }

    const data = await response.json();
    const content =
      data.content?.[0]?.type === "text"
        ? data.content[0].text
        : "";

    if (!content) {
      return { success: false, error: "Failed to generate contract content" };
    }

    return {
      success: true,
      contract: {
        title: `Service Agreement — ${input.companyName} & ${input.clientName}`,
        content,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai/contracts] Generation error:", message);
    return { success: false, error: message };
  }
}
