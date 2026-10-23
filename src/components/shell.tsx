"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, X, ArrowUpRight } from "lucide-react";
import { useDemoValue } from "./demo-hook";
import { contactLink, contactPhoneLabel } from "@/lib/contact";
import { Brand } from "./brand";
const navigation = [
  ["Início", "/"],
  ["Flats", "/flats"],
  ["Serviços", "/servicos"],
  ["Para proprietários", "/proprietarios"],
  ["Sobre", "/sobre"],
  ["Contato", "/contato"],
];
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const favorites = useDemoValue<string[]>("favorites", []);
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
            <Link href="/entrar" className="button button-sm account-link">
              Minha conta
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
          <Link href="/entrar" onClick={() => setOpen(false)}>
            Minha conta
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
                contactLink("Olá! Gostaria de falar com a Céspedes Living.")
                  ?.href
              }
            >
              {contactPhoneLabel} · WhatsApp
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Céspedes Living Hospedagens</span>
          <span>Imagens de ambientação geradas por IA.</span>
        </div>
      </div>
    </footer>
  );
}
