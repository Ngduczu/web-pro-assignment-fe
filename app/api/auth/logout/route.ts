import { clearSession } from "@/lib/api/session-route";

export async function POST() {
  return clearSession();
}
