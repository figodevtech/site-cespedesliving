"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Flat } from "@/domain/types";
import { today } from "@/domain/dates";
import { modalities, modalityLabels } from "@/domain/property";
import { contactLink } from "@/lib/contact";
/**
 * Interesse em aluguel ou venda e pedido de visita. Nada é gravado: a mensagem
 * sai pronta para o WhatsApp da equipe, com o imóvel e o link da página.
 */
export function PropertyInterest({ flat }: { flat: Flat }) {
  const options = modalities(flat).filter((m) => m !== "TEMPORADA");
  const [visit, setVisit] = useState(false);
  const [error, setError] = useState("");
  const [prepared, setPrepared] =
    useState<ReturnType<typeof contactLink>>(null);
  const channel = contactLink(`Olá! Tenho interesse no imóvel ${flat.title}.`);
  return (
    <form
      className="booking-widget stack-form"
      onChange={() => setPrepared(null)}
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        setPrepared(null);
        const fd = new FormData(event.currentTarget);
        const modality = String(fd.get("modality") ?? "");
        const desired = String(fd.get("desiredAt") ?? "");
        const when = desired
          ? new Date(desired).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "";
        const message = String(fd.get("message") ?? "").trim();
        const link = contactLink(
          [
            visit
              ? `Olá! Gostaria de agendar uma visita ao imóvel ${flat.title}.`
              : `Olá! Tenho interesse no imóvel ${flat.title}.`,
            modality
              ? `Interesse: ${modalityLabels[modality as keyof typeof modalityLabels] ?? modality}`
              : "",
            visit && when ? `Data e horário desejados: ${when}` : "",
            `Nome: ${fd.get("name")}`,
            message ? `Mensagem: ${message}` : "",
            window.location.href,
          ]
            .filter(Boolean)
            .join("\n"),
        );
        if (!link) {
          setError(
            "O atendimento online ainda não está disponível. Tente novamente mais tarde.",
          );
          return;
        }
        setPrepared(link);
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
          <option value="visit">Agendar visita</option>
        </select>
      </label>
      {options.length > 1 && (
        <label className="field">
          Interesse em
          <select name="modality" defaultValue={options[0]}>
            {options.map((m) => (
              <option key={m} value={m}>
                {modalityLabels[m]}
              </option>
            ))}
          </select>
        </label>
      )}
      {options.length === 1 && (
        <input type="hidden" name="modality" value={options[0]} />
      )}
      <label className="field">
        Nome
        <input name="name" required maxLength={120} autoComplete="name" />
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
          <small>A visita depende da confirmação da equipe.</small>
        </label>
      )}
      <label className="field">
        Mensagem
        <textarea name="message" maxLength={2000} />
      </label>
      {error && (
        <p role="alert" className="form-error">
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
            <a
              className="button"
              href={prepared.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {prepared.label}
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      )}
      {channel ? (
        <button className="button">
          {visit ? "Preparar pedido de visita" : "Preparar mensagem"}
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
