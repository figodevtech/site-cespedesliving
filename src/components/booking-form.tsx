"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarCheck, ShieldCheck } from "lucide-react";
import type { Booking, Flat, ReservationQuote } from "@/domain/types";
import {
  addDays,
  formatDate,
  money,
  today,
  validateStay,
} from "@/domain/dates";
import { post } from "@/lib/http";
import { useHydrated } from "./demo-hook";
import { DateInput } from "./date-input";
export function BookingForm({
  flat,
  checkout = false,
  initial = {},
}: {
  flat: Flat;
  checkout?: boolean;
  initial?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const sequence = useRef(0);
  const [dates, setDates] = useState({
    checkin: initial.checkin ?? addDays(today(), 3),
    checkout: initial.checkout ?? addDays(today(), 6),
    guests: Number(initial.guests ?? 2),
  });
  const [quote, setQuote] = useState<ReservationQuote | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [quoteRevision, setQuoteRevision] = useState(0);
  let minimumCheckout = today();
  try {
    if (dates.checkin) minimumCheckout = addDays(dates.checkin, 1);
  } catch {
    /* The quote error describes malformed URL dates. */
  }
  useEffect(() => {
    const controller = new AbortController();
    const current = ++sequence.current;
    // Each input change invalidates the previous response before another request begins.
    const timer = setTimeout(async () => {
      setLoading(true);
      setQuote(null);
      setError("");
      try {
        validateStay(
          dates.checkin,
          dates.checkout,
          dates.guests,
          flat.maxGuests,
        );
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flatId: flat.id, ...dates }),
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (current === sequence.current) setQuote(result);
      } catch (e) {
        if (!controller.signal.aborted && current === sequence.current)
          setError(
            e instanceof Error
              ? e.message
              : "Não foi possível consultar as datas.",
          );
      } finally {
        if (!controller.signal.aborted && current === sequence.current)
          setLoading(false);
      }
    }, 180);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [dates, flat.id, flat.maxGuests, quoteRevision]);
  function changeDate(key: "checkin" | "checkout" | "guests", value: string) {
    sequence.current++;
    setLoading(true);
    setQuote(null);
    setDates((d) => ({
      ...d,
      [key]: key === "guests" ? Number(value) : value,
    }));
  }
  return (
    <form
      className={`booking-widget ${checkout ? "checkout-widget" : ""}`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!quote?.available || loading || sending) return;
        try {
          validateStay(
            dates.checkin,
            dates.checkout,
            dates.guests,
            flat.maxGuests,
          );
          if (!checkout) {
            router.push(
              `/reservar/${flat.slug}?${new URLSearchParams({ ...dates, guests: String(dates.guests) })}`,
            );
            return;
          }
          const fd = new FormData(e.currentTarget);
          setSending(true);
          setError("");
          const booking = await post<Booking>("/api/booking-requests", {
            flatId: flat.id,
            ...dates,
            guest: {
              name: fd.get("name"),
              email: fd.get("email"),
              phone: fd.get("phone"),
            },
            acceptedTerms: fd.get("terms") === "on",
          });
          if (booking.demo)
            throw new Error(
              "Não foi possível enviar a solicitação. Fale com o atendimento.",
            );
          router.push(
            `/reserva-confirmada?id=${encodeURIComponent(booking.id)}`,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível registrar. Tente novamente.",
          );
          setSending(false);
        }
      }}
    >
      <div className="widget-heading">
        <span className="eyebrow gold-text">
          {checkout ? "SUA SOLICITAÇÃO" : "PLANEJE SUA ESTADIA"}
        </span>
        <div>
          <strong>{money(flat.fromPrice)}</strong>
          <span className="muted"> / noite, a partir de</span>
        </div>
      </div>
      <fieldset className="form-grid stay-dates" disabled={!hydrated}>
        <div className="field date-field">
          <label htmlFor="booking-checkin">Entrada</label>
          <DateInput
            id="booking-checkin"
            name="checkin"
            min={today()}
            required
            value={dates.checkin}
            onChange={(e) => changeDate("checkin", e.target.value)}
          />
        </div>
        <div className="field date-field">
          <label htmlFor="booking-checkout">Saída</label>
          <DateInput
            id="booking-checkout"
            name="checkout"
            min={minimumCheckout}
            required
            value={dates.checkout}
            onChange={(e) => changeDate("checkout", e.target.value)}
          />
        </div>
        <div className="field span-2">
          <label htmlFor="booking-guests">Hóspedes</label>
          <select
            id="booking-guests"
            name="guests"
            value={dates.guests}
            onChange={(e) => changeDate("guests", e.target.value)}
          >
            {Array.from({ length: flat.maxGuests }, (_, i) => (
              <option value={i + 1} key={i}>
                {i + 1} hóspede{i > 0 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
      {checkout && (
        <fieldset className="guest-fields">
          <legend>
            <CalendarCheck size={20} />
            Dados do hóspede
          </legend>
          <p className="muted">Preencha os dados para solicitar sua estadia.</p>
          <div className="field">
            <label htmlFor="guest-name">Nome completo</label>
            <input
              id="guest-name"
              name="name"
              autoComplete="name"
              maxLength={120}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="guest-email">E-mail</label>
            <input
              id="guest-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="guest-phone">Telefone com DDD</label>
            <input
              id="guest-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              pattern="[+()0-9 .-]{10,30}"
              title="Informe um telefone com DDD, de 10 a 30 caracteres."
              required
            />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" name="terms" required />
            <span>
              Li os <Link href="/termos-de-uso">termos de uso</Link> e a{" "}
              <Link href="/politica-de-privacidade">
                política de privacidade
              </Link>
              .
            </span>
          </label>
        </fieldset>
      )}
      <div className="quote-summary" aria-live="polite" aria-busy={loading}>
        {loading ? (
          <p className="muted">Consultando período e tarifa…</p>
        ) : quote ? (
          <>
            {!quote.available ? (
              <p className="form-error" role="alert">
                Período indisponível. Escolha outras datas.
              </p>
            ) : (
              <>
                <div>
                  <span>{quote.nightlyBreakdown.length} noites · diárias</span>
                  <span>{money(quote.subtotal)}</span>
                </div>
                <details className="nightly-details">
                  <summary>Ver diárias por noite</summary>
                  {quote.nightlyBreakdown.map((n) => (
                    <div key={n.date}>
                      <span>{formatDate(n.date)}</span>
                      <span>{money(n.amount)}</span>
                    </div>
                  ))}
                </details>
                <div>
                  <span>Taxa de limpeza</span>
                  <span>{money(quote.fees)}</span>
                </div>
                <div>
                  <span>Tributos incluídos</span>
                  <span>{money(quote.taxes)}</span>
                </div>
                <div className="quote-total">
                  <strong>Total estimado</strong>
                  <strong>{money(quote.total)}</strong>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
          <button
            type="button"
            className="text-link"
            onClick={() => setQuoteRevision((n) => n + 1)}
          >
            Tentar consulta novamente
          </button>
        </div>
      )}
      <button
        type="submit"
        className="button button-block"
        disabled={loading || !quote?.available || sending}
      >
        {sending
          ? "Registrando solicitação…"
          : checkout
            ? "Enviar solicitação"
            : "Solicitar reserva"}
        <ArrowRight size={18} />
      </button>
      <p className="widget-footnote">
        <ShieldCheck size={15} />
        Você não será cobrado nesta etapa.
      </p>
    </form>
  );
}
