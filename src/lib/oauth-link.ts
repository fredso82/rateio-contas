import { encryptOpaqueToken, decryptOpaqueToken } from "@/lib/crypto";

type OAuthLinkIntent = {
  provider: "google";
  userId: string;
  issuedAt: number;
};

const OAUTH_LINK_INTENT_TTL_MS = 10 * 60 * 1000;

export const OAUTH_LINK_COOKIE_NAME = "rateio_oauth_link";

export function createOAuthLinkIntent(userId: string) {
  const payload = JSON.stringify({
    provider: "google",
    userId,
    issuedAt: Date.now(),
  } satisfies OAuthLinkIntent);

  return encryptOpaqueToken(payload);
}

export function readOAuthLinkIntent(
  sealedIntent: string | null | undefined,
): OAuthLinkIntent | null {
  if (!sealedIntent) {
    return null;
  }

  try {
    const parsedIntent = JSON.parse(
      decryptOpaqueToken(sealedIntent),
    ) as OAuthLinkIntent;

    if (parsedIntent.provider !== "google") {
      return null;
    }

    if (Date.now() - parsedIntent.issuedAt > OAUTH_LINK_INTENT_TTL_MS) {
      return null;
    }

    return parsedIntent;
  } catch {
    return null;
  }
}
