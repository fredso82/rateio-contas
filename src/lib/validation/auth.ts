import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Use pelo menos 8 caracteres.")
  .max(72, "Use no máximo 72 caracteres.");

export const signInSchema = z.object({
  email: z.string().trim().email("Digite um email válido."),
  password: passwordSchema,
});

export const signUpSchema = signInSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Digite seu nome.")
    .max(80, "Use um nome mais curto."),
});
