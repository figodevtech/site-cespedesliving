import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Header, Footer } from "@/components/shell";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/latin-500.css";
import "@fontsource/playfair-display/latin-400-italic.css";
import "./refinements.css";
import "./date-fields.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cespedes Living | Hospedagens em João Pessoa",
    template: "%s | Cespedes Living",
  },
  description:
    "Flats selecionados e gestão de hospedagens em João Pessoa. Conforto para quem chega, cuidado para quem confia.",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      {
        url: "/logos/optimized/icon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/logos/optimized/icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/logos/optimized/icon-48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/logos/optimized/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/logos/optimized/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    locale: "pt_BR",
    type: "website",
    siteName: "Cespedes Living",
    images: [
      {
        url: "/images/hero.webp",
        width: 1920,
        height: 1100,
        alt: "Interior ilustrativo de flat no litoral paraibano",
      },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      {/* Extensões (ex.: ColorZilla) injetam atributos no body antes da hidratação. */}
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
