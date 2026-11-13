import type { NextConfig } from "next";
const config: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
            pathname: "/storage/v1/object/public/imoveis-fotos/**",
          },
        ]
      : [],
  },
  poweredByHeader: false,
  // A og:image dos flats lê a capa de public/ em tempo de execução.
  outputFileTracingIncludes: {
    "/flats/[slug]/opengraph-image": ["./public/images/**/*.webp"],
  },
  // Service worker do PWA: sempre revalidado, para atualizações chegarem logo.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};
export default config;
