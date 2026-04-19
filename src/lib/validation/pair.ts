import { z } from "zod";

export const pairSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Digite um nome para a dupla.")
    .max(80, "Use um nome mais curto."),
});
