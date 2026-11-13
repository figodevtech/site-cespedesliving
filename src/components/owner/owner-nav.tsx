"use client";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { Building2, CalendarDays, LayoutDashboard, ReceiptText } from "lucide-react";

const BASE = "/painel-proprietario";
const ITEMS = [
  { href: BASE, label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: `${BASE}/imoveis`, label: "Imóveis", icon: Building2 },
  { href: `${BASE}/reservas`, label: "Reservas", icon: CalendarDays },
  { href: `${BASE}/extrato`, label: "Extrato", icon: ReceiptText },
];

const matches = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Abas da área do proprietário; a atual fica marcada também para leitores de tela.
 * A aba clicada é marcada na hora, antes de a página responder: numa rede lenta o
 * clique nunca parece ignorado. Ela vale até a rota mudar.
 */
export function OwnerNav() {
  const pathname = usePathname();
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null);
  const optimistic = pending && pending.from === pathname ? pending.href : null;

  function onClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (href !== pathname) setPending({ href, from: pathname });
  }

  return (
    <nav className="op-nav" aria-label="Seções da área do proprietário">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = optimistic ? optimistic === href : matches(pathname, href, exact);
        const loading = optimistic === href;
        return (
          <Link
            key={href}
            href={href}
            className={`op-nav-item${loading ? " is-loading" : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={(event) => onClick(event, href)}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
            {loading ? <span className="op-nav-progress" aria-hidden="true" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
