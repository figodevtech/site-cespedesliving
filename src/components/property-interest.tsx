"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Flat } from "@/domain/types";
import { today } from "@/domain/dates";
import { modalities, modalityLabels } from "@/domain/property";
import { contactLink } from "@/lib/contact";
import { DatePicker } from "./date-picker";
import { Select } from "./select";

// Horários de visita oferecidos (a equipe confirma o agendamento).
const VISIT_TIMES = Array.from({ length: 21 }, (_, i) => {
  const minutes = 8 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});
/**
 * Interesse em aluguel ou venda e pedido de visita. Nada é gravado: a mensagem
 * sai pronta para o WhatsApp da equipe, com o imóvel e o link da página.
 */
export function PropertyInterest({ flat }: { flat: Flat }) {
  const options = modalities(flat).filter((m) => m !== "TEMPORADA");
  const [visit, setVisit] = useState(false);
  const [visitDay, setVisitDay] = useState("");
  const [visitTime, setVisitTime] = useState("");
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
      <div className="field">
        <label htmlFor="interest-kind">Como podemos ajudar?</label>
        <Select
          id="interest-kind"
          value={visit ? "visit" : "lead"}
          onChange={(value) => {
            setVisit(value === "visit");
            setPrepared(null);
          }}
          options={[
            { value: "lead", label: "Tenho interesse" },
            { value: "visit", label: "Agendar visita" },
          ]}
        />
      </div>
      {options.length > 1 && (
        <div className="field">
          <label htmlFor="interest-modality">Interesse em</label>
          <Select
            id="interest-modality"
            name="modality"
            defaultValue={options[0]}
            onChange={() => setPrepared(null)}
            options={options.map((m) => ({ value: m, label: modalityLabels[m] }))}
          />
        </div>
      )}
      {options.length === 1 && (
        <input type="hidden" name="modality" value={options[0]} />
      )}
      <label className="field">
        Nome
        <input name="name" required maxLength={120} autoComplete="name" />
      </label>
      {visit && (
        <div className="field">
          <label htmlFor="visit-day">Data e horário desejados</label>
          <div className="visit-when">
            <DatePicker
              id="visit-day"
              min={today()}
              required
              placeholder="Escolha o dia"
              value={visitDay}
              onChange={(day) => {
                setVisitDay(day);
                setPrepared(null);
              }}
            />
            <Select
              aria-label="Horário da visita"
              required
              placeholder="Horário"
              value={visitTime}
              onChange={(time) => {
                setVisitTime(time);
                setPrepared(null);
              }}
              options={VISIT_TIMES.map((time) => ({ value: time, label: time }))}
            />
          </div>
          {/* Mesmo campo de antes (data e hora juntas) para a mensagem do WhatsApp. */}
          <input
            type="hidden"
            name="desiredAt"
            value={visitDay && visitTime ? `${visitDay}T${visitTime}` : ""}
          />
          <small>A visita depende da confirmação da equipe.</small>
        </div>
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
