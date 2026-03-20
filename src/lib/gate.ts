import { type NextRequest } from "next/server";

export const GATE_PASSWORD = "seva";
export const GATE_COOKIE_NAME = "kleanhq_gate";
export const GATE_COOKIE_VALUE = "authenticated";

export function checkGate(request: NextRequest): boolean {
  const cookie = request.cookies.get(GATE_COOKIE_NAME);
  return cookie?.value === GATE_COOKIE_VALUE;
}
