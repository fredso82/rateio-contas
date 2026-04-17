import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Digite como você quer aparecer.")
    .max(80, "Use um nome mais curto."),
  pixKey: z
    .string()
    .trim()
    .max(120, "Use uma chave Pix mais curta.")
    .optional()
    .or(z.literal("")),
});
