import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rateio Contas",
    short_name: "Rateio",
    description:
      "Rateio de despesas entre duas pessoas com foco em rotina simples e fechamento claro.",
    start_url: "/app",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4ebdd",
    theme_color: "#1c6a62",
    lang: "pt-BR",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/pwa/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
