import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRODUCT_LOCALE = "pt-BR";
export const PRODUCT_TIME_ZONE = "America/Bahia";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getDisplayName(name: string | null | undefined, email: string) {
  const cleanName = name?.trim();

  if (cleanName) {
    return cleanName;
  }

  return email.split("@")[0].replace(/[._-]+/g, " ");
}

export function formatCurrencyFromCents(valueInCents: number) {
  return new Intl.NumberFormat(PRODUCT_LOCALE, {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

export function formatProductDate(value: Date) {
  return new Intl.DateTimeFormat(PRODUCT_LOCALE, {
    dateStyle: "long",
    timeZone: PRODUCT_TIME_ZONE,
  }).format(value);
}

export function formatProductDateTime(value: Date) {
  return new Intl.DateTimeFormat(PRODUCT_LOCALE, {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: PRODUCT_TIME_ZONE,
  }).format(value);
}

export function dateToInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}
