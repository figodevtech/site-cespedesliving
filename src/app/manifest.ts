import type { MetadataRoute } from "next";
/**
 * App instalável (PWA). Ele sempre abre no login único: quem já entrou é
 * levado direto à própria área (cliente ou proprietário) pela página /entrar.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/entrar",
    name: "Cespedes Living",
    short_name: "Cespedes",
    description:
      "Acesse sua conta Cespedes Living: reservas de clientes e painel de proprietários.",
    lang: "pt-BR",
    dir: "ltr",
    start_url: "/entrar",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#060f18",
    theme_color: "#0a1d28",
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/logos/optimized/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logos/optimized/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logos/optimized/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logos/optimized/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
