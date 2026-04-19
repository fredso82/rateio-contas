import { describe, expect, it } from "vitest";

import { pairSchema } from "@/lib/validation/pair";

describe("pairSchema", () => {
  it("accepts a short pair name", () => {
    expect(
      pairSchema.parse({
        name: "Casa",
      }),
    ).toEqual({
      name: "Casa",
    });
  });

  it("rejects blank pair names", () => {
    const result = pairSchema.safeParse({
      name: " ",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.name).toContain(
      "Digite um nome para a dupla.",
    );
  });
});
