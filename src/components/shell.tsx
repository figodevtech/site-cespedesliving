"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, X, ArrowUpRight, UserRound } from "lucide-react";
import { useDemoValue } from "./demo-hook";
import { contactLink, contactPhoneLabel } from "@/lib/contact";
import { Brand } from "./brand";
const navigation = [
  ["Início", "/"],
  ["Imóveis", "/flats"],
  ["Serviços", "/servicos"],
  ["Para proprietários", "/proprietarios"],
  ["Sobre", "/sobre"],
  ["Contato", "/contato"],
];
type Account = { firstName: string | null; role: "guest" | "owner" } | null;
/** Rechecado a cada troca de página: login e saída acontecem no servidor. */
function useAccount(path: string) {
  const [account, setAccount] = useState<Account>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((session) =>
        setAccount(
          session?.signedIn
            ? { firstName: session.firstName ?? null, role: session.role }
            : null,
        ),
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, [path]);
  return account;
}
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const favorites = useDemoValue<string[]>("favorites", []);
  const account = useAccount(path);
  const accountHref = account
    ? account.role === "owner"
      ? "/painel-proprietario"
      : "/minha-conta"
    : "/entrar";
  const accountLabel = account
    ? account.firstName
      ? `Olá, ${account.firstName}`
      : account.role === "owner"
        ? "Meu painel"
        : "Minha conta"
    : "Entrar";
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="nav-links" aria-label="Menu principal">
            {navigation.map(([label, href]) => (
              <Link
                key={href}
                className={`nav-link ${path === href ? "active" : ""}`}
                aria-current={path === href ? "page" : undefined}
                href={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link
              href="/favoritos"
              className="header-heart"
              aria-label={`Favoritos (${favorites.length})`}
            >
              <Heart size={20} />
              {favorites.length > 0 && (
                <span className="heart-count">{favorites.length}</span>
              )}
            </Link>
            <Link
              href={accountHref}
              className={`button button-sm account-link ${account ? "signed-in" : ""}`}
              aria-label={account ? `${accountLabel} — acessar minha área` : "Entrar na minha conta"}
            >
              {account && <UserRound size={15} aria-hidden="true" />}
              {accountLabel}
            </Link>
            <button
              type="button"
              className="mobile-toggle"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <nav
          id="mobile-nav"
          className={`mobile-nav ${open ? "open" : ""}`}
          aria-label="Menu para celular"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {navigation.map(([label, href]) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/favoritos" onClick={() => setOpen(false)}>
            Favoritos
          </Link>
          <Link href={accountHref} onClick={() => setOpen(false)}>
            {account ? accountLabel : "Entrar / Minha conta"}
          </Link>
        </nav>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand variant="footer" />
            <p>
              Mais que hospedagem, cuidado em cada detalhe. Conforto para quem
              chega, tranquilidade para quem confia.
            </p>
            <span className="eyebrow gold-text">JOÃO PESSOA · PARAÍBA</span>
          </div>
          <div className="footer-col">
            <h2>Explore</h2>
            {[
              ["Nossos flats", "/flats"],
              ["Sobre nós", "/sobre"],
              ["Serviços", "/servicos"],
              ["Favoritos", "/favoritos"],
              ["Minha conta", "/minha-conta"],
            ].map(([t, h]) => (
              <Link href={h} key={h}>
                {t}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <h2>Informações</h2>
            {[
              ["Para proprietários", "/proprietarios"],
              ["Área do proprietário", "/painel-proprietario"],
              ["Perguntas frequentes", "/perguntas-frequentes"],
              ["Privacidade", "/politica-de-privacidade"],
              ["Termos de uso", "/termos-de-uso"],
            ].map(([t, h]) => (
              <Link href={h} key={h}>
                {t}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <h2>Vamos conversar</h2>
            <p>
              Sua próxima estadia.
              <br />
              Uma nova possibilidade para seu imóvel.
            </p>
            <Link href="/contato" className="footer-cta">
              Fale com a gente <ArrowUpRight size={18} />
            </Link>
            <a
              href={
                contactLink("Olá! Gostaria de falar com a Cespedes Living.")
                  ?.href
              }
            >
              {contactPhoneLabel} · WhatsApp
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Cespedes Living Hospedagens</span>
          <span>Imagens de ambientação geradas por IA.</span>
        </div>
      </div>
    </footer>
  );
}
