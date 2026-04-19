import { z } from "zod";

function normalizeCurrencyInput(value: string) {
  return value.replace(/\s+/g, "").replace(/^R\$/i, "");
}

export function parseBrlInputToCents(value: string) {
  const normalizedValue = normalizeCurrencyInput(value.trim());

  if (!normalizedValue) {
    return null;
  }

  const canonicalValue = normalizedValue.includes(",")
    ? normalizedValue.replace(/\./g, "").replace(",", ".")
    : normalizedValue;

  if (!/^\d+(?:\.\d{1,2})?$/.test(canonicalValue)) {
    return null;
  }

  const numericValue = Number(canonicalValue);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.round(numericValue * 100);
}

export function parseExpenseDateInput(value: string) {
  const normalizedValue = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return null;
  }

  const parsedDate = new Date(`${normalizedValue}T12:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.valueOf()) ||
    parsedDate.toISOString().slice(0, 10) !== normalizedValue
  ) {
    return null;
  }

  return parsedDate;
}

export const expenseSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(2, "Digite uma descrição para a despesa.")
      .max(120, "Use uma descrição mais curta."),
    amount: z.string().trim().min(1, "Digite o valor da despesa."),
    occurredOn: z.string().trim().min(1, "Escolha a data da despesa."),
  })
  .superRefine(({ amount, occurredOn }, context) => {
    const amountCents = parseBrlInputToCents(amount);

    if (amountCents === null || amountCents <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Digite um valor em BRL maior que zero.",
      });
    }

    if (!parseExpenseDateInput(occurredOn)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["occurredOn"],
        message: "Escolha uma data válida para a despesa.",
      });
    }
  });

export type ExpenseSchemaInput = z.infer<typeof expenseSchema>;
