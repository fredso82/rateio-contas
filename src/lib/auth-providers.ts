import { isIP } from "node:net";

function getPublicAppUrl() {
  return process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
}

export function isGoogleAuthEnabled() {
  const publicAppUrl = getPublicAppUrl();

  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    return false;
  }

  if (!publicAppUrl) {
    return false;
  }

  let hostname: string;

  try {
    hostname = new URL(publicAppUrl).hostname;
  } catch {
    return false;
  }

  if (hostname === "localhost") {
    return true;
  }

  return isIP(hostname) === 0;
}
