"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { contactLink } from "@/lib/contact";
import { neighborhoods } from "./search-form";
export function LeadForm({ contact = false }: { contact?: boolean }) {
  const [error, setError] = useState("");
  const [prepared, setPrepared] =
    useState<ReturnType<typeof contactLink>>(null);
  const channel = contactLink("Olá! Gostaria de falar com a Cespedes Living.");
  return (
    <form
      className="lead-form stack-form"
      onChange={() => setPrepared(null)}
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setError("");
        setPrepared(null);
        try {
          if (fd.get("website"))
            throw new Error("Não foi possível preparar a mensagem.");
          if (!contact) {
            const response = await fetch("/api/owner-leads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(Object.fromEntries(fd)),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
          }
          const link = contactLink(
            `${contact ? "Contato" : "Interesse em gestão de imóvel"} — Cespedes Living\nNome: ${fd.get("name")}\nE-mail: ${fd.get("email")}\nTelefone: ${fd.get("phone")}\n${contact ? "" : `Região: ${fd.get("neighborhood")}\n`}Mensagem: ${fd.get("message") ?? ""}`,
          );
          if (!link)
            throw new Error(
              "O atendimento online ainda não está disponível. Tente novamente mais tarde.",
            );
          setPrepared(link);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Tente novamente.");
        }
      }}
    >
      <div>
        <p className="eyebrow gold-text">
          {contact ? "ESTAMOS POR AQUI" : "UMA NOVA POSSIBILIDADE"}
        </p>
        <h2>{contact ? "Vamos conversar?" : "Conte sobre seu imóvel."}</h2>
        <p className="muted">
          Preencha os dados para continuar pelo nosso canal de atendimento.
        </p>
      </div>
      <div className="form-grid">
        <div className="field span-2">
          <label htmlFor="lead-name">Seu nome</label>
          <input
            id="lead-name"
            name="name"
            autoComplete="name"
            maxLength={120}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="lead-email">E-mail</label>
          <input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="lead-phone">Telefone com DDD</label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            required
          />
        </div>
        {!contact && (
          <div className="field span-2">
            <label htmlFor="lead-neighborhood">Região do imóvel</label>
            <select id="lead-neighborhood" name="neighborhood" required>
              <option value="">Selecione a região</option>
              {neighborhoods.map((n) => (
                <option key={n}>{n}</option>
              ))}
              <option>Outra região</option>
            </select>
          </div>
        )}
        <div className="field span-2">
          <label htmlFor="lead-message">
            {contact ? "Sua mensagem" : "O que você gostaria de nos contar?"}
          </label>
          <textarea
            id="lead-message"
            name="message"
            maxLength={2000}
            required={contact}
          />
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="lead-website">Deixe este campo vazio</label>
        <input
          id="lead-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <label className="checkbox-label">
        <input type="checkbox" required />
        <span>
          Li a{" "}
          <Link href="/politica-de-privacidade">política de privacidade</Link>.
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {prepared && (
        <div className="notice success-message" role="status">
          <div>
            <p>
              Sua mensagem está pronta. Continue no canal de atendimento para
              enviá-la.
            </p>
            <a className="button" href={prepared.href}>
              {prepared.label}
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      )}
      {channel ? (
        <button className="button">
          {contact ? "Preparar mensagem" : "Quero ser parceiro"}
          <ArrowRight size={17} />
        </button>
      ) : (
        <p className="notice">
          O atendimento online ainda não está disponível.
        </p>
      )}
    </form>
  );
}
