import { describe, expect, it } from "vitest";

import { profileSchema } from "@/lib/validation/profile";

describe("profileSchema", () => {
  it("accepts a valid profile with optional pix key", () => {
    expect(
      profileSchema.parse({
        name: "Maria",
        pixKey: "",
      }),
    ).toEqual({
      name: "Maria",
      pixKey: "",
    });
  });

  it("rejects profiles without a valid display name", () => {
    const result = profileSchema.safeParse({
      name: " ",
      pixKey: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.name).toContain(
      "Digite como você quer aparecer.",
    );
  });
});
