// URL pública absoluta, usada em og:image e links compartilhados.
// Na Vercel, sem NEXT_PUBLIC_SITE_URL, cai para o domínio de produção do projeto.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
