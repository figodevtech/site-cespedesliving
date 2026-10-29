"use client";
import { useState } from "react";
import Link from "next/link";
import type { Flat } from "@/domain/types";
import { today } from "@/domain/dates";
export function PropertyInterest({ flat }: { flat: Flat }) {
  const [visit, setVisit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="booking-widget stack-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        const fields = new FormData(event.currentTarget);
        try {
          const response = await fetch(
            visit ? "/api/property-visits" : "/api/property-leads",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...Object.fromEntries(fields),
                imovelId: flat.id,
                ...(visit
                  ? {
                      desiredAt: new Date(
                        String(fields.get("desiredAt")),
                      ).toISOString(),
                    }
                  : {}),
              }),
            },
          );
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          setMessage(
            visit
              ? "Solicitação de visita registrada. A equipe confirmará o horário."
              : "Seu interesse foi registrado. A equipe entrará em contato.",
          );
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Não foi possível registrar.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Conheça este imóvel</h2>
      <label className="field">
        Como podemos ajudar?
        <select
          value={visit ? "visit" : "lead"}
          onChange={(event) => setVisit(event.target.value === "visit")}
        >
          <option value="lead">Tenho interesse</option>
          <option value="visit">Solicitar visita</option>
        </select>
      </label>
      <label className="field">
        Nome
        <input name="name" required maxLength={120} autoComplete="name" />
      </label>
      <label className="field">
        E-mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="field">
        Telefone
        <input name="phone" type="tel" required autoComplete="tel" />
      </label>
      {visit && (
        <label className="field">
          Data e horário desejados
          <input
            name="desiredAt"
            type="datetime-local"
            min={`${today()}T00:00`}
            required
          />
          <small>
            Horário local. A visita depende da confirmação da equipe.
          </small>
        </label>
      )}
      <label className="field">
        Mensagem
        <textarea name="message" maxLength={2000} />
      </label>
      <label className="checkbox-label">
        <input type="checkbox" required />
        <span>
          Li a{" "}
          <Link href="/politica-de-privacidade">política de privacidade</Link>.
        </span>
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <button className="button" disabled={busy}>
        {busy
          ? "Enviando…"
          : visit
            ? "Solicitar visita"
            : "Registrar interesse"}
      </button>
    </form>
  );
}
