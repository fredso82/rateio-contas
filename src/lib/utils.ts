import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}
