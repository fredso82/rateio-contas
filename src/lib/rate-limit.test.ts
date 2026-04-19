import { beforeEach, describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";
import { assertRateLimit } from "@/lib/rate-limit";

describe("assertRateLimit", () => {
  beforeEach(() => {
    const rateLimitStore = globalThis as typeof globalThis & {
      rateLimitStore?: Map<string, { count: number; resetAt: number }>;
    };

    rateLimitStore.rateLimitStore = new Map();
  });

  it("allows attempts until the configured limit", () => {
    expect(() =>
      assertRateLimit({
        key: "test:bucket",
        limit: 2,
        windowMs: 60_000,
      }),
    ).not.toThrow();

    expect(() =>
      assertRateLimit({
        key: "test:bucket",
        limit: 2,
        windowMs: 60_000,
      }),
    ).not.toThrow();
  });

  it("throws an app error after the limit is exceeded", () => {
    assertRateLimit({
      key: "test:bucket",
      limit: 1,
      windowMs: 60_000,
    });

    expect(() =>
      assertRateLimit({
        key: "test:bucket",
        limit: 1,
        windowMs: 60_000,
      }),
    ).toThrow(AppError);
  });
});
