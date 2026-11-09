import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/site-session";
import { SignOut } from "@/components/auth-form";
import { OwnerNav } from "@/components/owner/owner-nav";
import "./owner-portal.css";

export const metadata: Metadata = { title: "Área do proprietário" };

/**
 * Moldura da área do proprietário: saudação, sair e as abas (visão geral, imóveis, reservas e
 * extrato). Cada página traz o próprio título (h1) e busca os dados dela.
 */
export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile("owner");
  const firstName = profile.name?.trim().split(/\s+/)[0] || "proprietário";
  return (
    <div className="op">
      <div className="op-top">
        <div className="container op-top-inner">
          <div>
            <p className="op-eyebrow">Área do proprietário</p>
            <p className="op-hello">Olá, {firstName}.</p>
          </div>
          <div className="op-signout">
            <SignOut />
          </div>
        </div>
        <div className="container">
          <OwnerNav />
        </div>
      </div>
      <div className="container op-body">{children}</div>
    </div>
  );
}
