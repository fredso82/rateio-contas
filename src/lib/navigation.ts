export const APP_DEFAULT_PATH = "/app";

export function sanitizeRedirect(url: string | null | undefined) {
  if (!url) {
    return APP_DEFAULT_PATH;
  }

  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  return APP_DEFAULT_PATH;
}
