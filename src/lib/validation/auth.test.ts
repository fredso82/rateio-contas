import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "@/lib/validation/auth";

describe("auth validation schemas", () => {
  it("normalizes a valid sign-in payload", () => {
    const result = signInSchema.parse({
      email: "  USER@Example.com ",
      password: "123456",
    });

    expect(result).toEqual({
      email: "USER@Example.com",
      password: "123456",
    });
  });

  it("rejects invalid sign-in payloads", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "123",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain(
        "Digite um email válido.",
      );
      expect(result.error.flatten().fieldErrors.password).toContain(
        "Use pelo menos 6 caracteres.",
      );
    }
  });

  it("rejects invalid sign-up names", () => {
    const result = signUpSchema.safeParse({
      name: " ",
      email: "user@example.com",
      password: "123456",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "Digite seu nome.",
      );
    }
  });
});
