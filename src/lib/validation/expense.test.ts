import { describe, expect, it } from "vitest";

import {
  expenseSchema,
  parseBrlInputToCents,
  parseExpenseDateInput,
} from "@/lib/validation/expense";

describe("expenseSchema", () => {
  it("accepts a valid BRL expense payload", () => {
    expect(
      expenseSchema.parse({
        description: "Mercado",
        amount: "123,45",
        occurredOn: "2026-04-16",
      }),
    ).toEqual({
      description: "Mercado",
      amount: "123,45",
      occurredOn: "2026-04-16",
    });
  });

  it("rejects invalid currency values", () => {
    const result = expenseSchema.safeParse({
      description: "Mercado",
      amount: "12,345",
      occurredOn: "2026-04-16",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.amount).toContain(
      "Digite um valor em BRL maior que zero.",
    );
  });

  it("rejects invalid dates", () => {
    const result = expenseSchema.safeParse({
      description: "Mercado",
      amount: "10,00",
      occurredOn: "2026-02-30",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.occurredOn).toContain(
      "Escolha uma data válida para a despesa.",
    );
  });
});

describe("parseBrlInputToCents", () => {
  it("supports comma and thousand separators", () => {
    expect(parseBrlInputToCents("1.234,56")).toBe(123456);
  });

  it("supports dot decimal input", () => {
    expect(parseBrlInputToCents("45.9")).toBe(4590);
  });
});

describe("parseExpenseDateInput", () => {
  it("converts a date input into a safe midday UTC date", () => {
    expect(parseExpenseDateInput("2026-04-16")?.toISOString()).toBe(
      "2026-04-16T12:00:00.000Z",
    );
  });
});
