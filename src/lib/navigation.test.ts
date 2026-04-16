import { describe, expect, it } from "vitest";

import { APP_DEFAULT_PATH, sanitizeRedirect } from "@/lib/navigation";

describe("sanitizeRedirect", () => {
  it("returns the default app path when the callback is missing", () => {
    expect(sanitizeRedirect(undefined)).toBe(APP_DEFAULT_PATH);
    expect(sanitizeRedirect(null)).toBe(APP_DEFAULT_PATH);
    expect(sanitizeRedirect("")).toBe(APP_DEFAULT_PATH);
  });

  it("keeps internal relative paths untouched", () => {
    expect(sanitizeRedirect("/app")).toBe("/app");
    expect(sanitizeRedirect("/convite/abc123")).toBe("/convite/abc123");
  });

  it("rejects external or protocol-relative URLs", () => {
    expect(sanitizeRedirect("https://evil.example")).toBe(APP_DEFAULT_PATH);
    expect(sanitizeRedirect("//evil.example")).toBe(APP_DEFAULT_PATH);
  });
});
