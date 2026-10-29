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
};
export default config;
