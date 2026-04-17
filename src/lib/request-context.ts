import { headers } from "next/headers";

export async function getClientIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    headerStore.get("x-real-ip") ??
    headerStore.get("cf-connecting-ip") ??
    "unknown"
  );
}
