"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarDays, LayoutDashboard, ReceiptText } from "lucide-react";

const BASE = "/painel-proprietario";
const ITEMS = [
  { href: BASE, label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: `${BASE}/imoveis`, label: "Imóveis", icon: Building2 },
  { href: `${BASE}/reservas`, label: "Reservas", icon: CalendarDays },
  { href: `${BASE}/extrato`, label: "Extrato", icon: ReceiptText },
];

/** Abas da área do proprietário; a atual fica marcada também para leitores de tela. */
export function OwnerNav() {
  const pathname = usePathname();
  return (
    <nav className="op-nav" aria-label="Seções da área do proprietário">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className="op-nav-item" aria-current={active ? "page" : undefined}>
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
