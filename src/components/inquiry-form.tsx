"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Flat } from "@/domain/types";
import { addDays, today, validateStay } from "@/domain/dates";
import { contactLink } from "@/lib/contact";
import { useHydrated } from "./demo-hook";
export function InquiryForm({
  flat,
  initial = {},
}: {
  flat: Flat;
  initial?: Record<string, string | undefined>;
}) {
  const hydrated = useHydrated();
  const [error, setError] = useState("");
  const [prepared, setPrepared] =
    useState<ReturnType<typeof contactLink>>(null);
  const channel = contactLink("Olá! Gostaria de consultar uma hospedagem.");
  return (
    <form
      className="booking-widget"
      aria-label="Consultar hospedagem"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        setPrepared(null);
        const fd = new FormData(e.currentTarget);
        const checkin = String(fd.get("checkin") ?? "");
        const checkout = String(fd.get("checkout") ?? "");
        const guests = Number(fd.get("guests"));
        try {
          validateStay(checkin, checkout, guests, flat.maxGuests);
          const link = contactLink(
            `Olá! Gostaria de consultar o ${flat.title}.\nEntrada: ${checkin}\nSaída: ${checkout}\nHóspedes: ${guests}`,
          );
          if (!link)
            throw new Error(
              "O atendimento online ainda não está disponível. Tente novamente mais tarde.",
            );
          setPrepared(link);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Confira as datas.");
        }
      }}
    >
      <div className="widget-heading">
        <p className="eyebrow gold-text">PLANEJE SUA ESTADIA</p>
        <h2 className="service-title">Consulte datas e tarifas.</h2>
        <p className="muted">
          A disponibilidade e o valor final são confirmados pelo atendimento
          antes da reserva.
        </p>
      </div>
      <fieldset
        className="form-grid"
        disabled={!hydrated}
        aria-label="Datas e hóspedes"
        onChange={() => {
          setPrepared(null);
          setError("");
        }}
      >
        <div className="field">
          <label htmlFor="inquiry-checkin">Entrada</label>
          <input
            id="inquiry-checkin"
            type="date"
            name="checkin"
            min={today()}
            required
            defaultValue={initial.checkin ?? addDays(today(), 3)}
          />
        </div>
        <div className="field">
          <label htmlFor="inquiry-checkout">Saída</label>
          <input
            id="inquiry-checkout"
            type="date"
            name="checkout"
            min={addDays(today(), 1)}
            required
            defaultValue={initial.checkout ?? addDays(today(), 6)}
          />
        </div>
        <div className="field span-2">
          <label htmlFor="inquiry-guests">Hóspedes</label>
          <select
            name="guests"
            id="inquiry-guests"
            defaultValue={initial.guests ?? "2"}
          >
            {Array.from({ length: flat.maxGuests }, (_, i) => (
              <option value={i + 1} key={i}>
                {i + 1} hóspede{i ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {channel ? (
        <>
          <button className="button button-block inquiry-submit" type="submit">
            Consultar disponibilidade
            <ArrowRight size={17} />
          </button>
          {prepared && (
            <div className="notice" role="status">
              <p>
                Sua consulta está pronta. Continue no canal de atendimento para
                enviá-la.
              </p>
              <a href={prepared.href} className="button button-block">
                {prepared.label}
                <ArrowRight size={17} />
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="notice">
          <p>O atendimento online ainda não está disponível.</p>
          <Link className="text-link" href="/contato">
            Informações de contato
          </Link>
        </div>
      )}
      <p className="widget-footnote">
        Uma consulta não garante nem confirma a reserva.
      </p>
    </form>
  );
}
