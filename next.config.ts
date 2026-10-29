import type { NextConfig } from "next";
const config: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
  // A og:image dos flats lê a capa de public/ em tempo de execução.
  outputFileTracingIncludes: {
    "/flats/[slug]/opengraph-image": ["./public/images/**/*.webp"],
  },
};
export default config;
