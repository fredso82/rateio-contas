import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rateio Contas",
    short_name: "Rateio",
    description:
      "Rateio de despesas entre duas pessoas com foco em rotina simples e fechamento claro.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f4ebdd",
    theme_color: "#1c6a62",
    lang: "pt-BR",
  };
}
