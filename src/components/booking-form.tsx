"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarCheck, ShieldCheck } from "lucide-react";
import type { Booking, Flat, FlatAgenda, ReservationQuote } from "@/domain/types";
import {
  formatDate,
  money,
  today,
  validateStay,
} from "@/domain/dates";
import { post } from "@/lib/http";
import { useHydrated } from "./demo-hook";
import { DateRangePicker } from "./date-picker";
import { Select } from "./select";
import { AgendaNotes } from "./agenda-notes";
export function BookingForm({
  flat,
  checkout = false,
  customer = null,
  initial = {},
  agenda = null,
}: {
  flat: Flat;
  /** Períodos sem vaga e pacotes fechados, para o hóspede saber antes de escolher. */
  agenda?: FlatAgenda | null;
  checkout?: boolean;
  /** Cliente com sessão ativa; sem ele, confirmar leva ao login guardando a estadia. */
  customer?: { name: string; email: string } | null;
  initial?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const sequence = useRef(0);
  const idempotencyKey = useRef<string | null>(null);
  const [dates, setDates] = useState({
    // Sem datas no link, o formulário começa vazio: a pessoa escolhe o período.
    checkin: initial.checkin ?? "",
    checkout: initial.checkout ?? "",
    guests: Number(initial.guests ?? Math.min(2, flat.maxGuests)),
  });
  const [quote, setQuote] = useState<ReservationQuote | null>(null);
  const [error, setError] = useState("");
  const hasDates = Boolean(dates.checkin && dates.checkout);
  const [loading, setLoading] = useState(hasDates);
  const [sending, setSending] = useState(false);
  const [quoteRevision, setQuoteRevision] = useState(0);
  const loginHref = `/entrar?next=${encodeURIComponent(`/reservar/${flat.slug}?${new URLSearchParams({ ...dates, guests: String(dates.guests) })}`)}`;
  useEffect(() => {
    const controller = new AbortController();
    const current = ++sequence.current;
    // Sem período escolhido não há o que cotar: o resumo só pede as datas. Só acontece ao
    // abrir sem datas (o campo é obrigatório, sem "Limpar"), quando o estado inicial já está vazio.
    if (!dates.checkin || !dates.checkout) return;
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
          today(),
          { minNights: flat.minNights ?? 1, maxNights: flat.maxNights ?? 60 },
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
  }, [
    dates,
    flat.id,
    flat.maxGuests,
    flat.minNights,
    flat.maxNights,
    quoteRevision,
  ]);
  // Agenda do imóvel no calendário: noite sem vaga não é entrada, e a saída não atravessa período ocupado.
  const taken = agenda?.unavailable ?? [];
  const nightTaken = (day: string) =>
    taken.some((range) => range.start <= day && day < range.end);
  const crossesTaken = (from: string, to: string) =>
    taken.some((range) => range.start < to && range.end > from);
  const packageMark = (day: string) => {
    const pack = agenda?.packages.find(
      (p) => p.start <= day && day < p.end,
    );
    return pack ? `pacote fechado: ${pack.name}` : null;
  };
  const legend =
    taken.length || agenda?.packages.length ? (
      <>
        {taken.length ? (
          <span>
            <span className="legend-off">15</span> sem vaga
          </span>
        ) : null}
        {agenda?.packages.length ? (
          <span className="legend-mark">pacote fechado</span>
        ) : null}
      </>
    ) : undefined;
  function changeDate(key: "checkin" | "checkout" | "guests", value: string) {
    sequence.current++;
    setLoading(true);
    setQuote(null);
    idempotencyKey.current = null;
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
            today(),
            { minNights: flat.minNights ?? 1, maxNights: flat.maxNights ?? 60 },
          );
          if (!checkout) {
            router.push(
              `/reservar/${flat.slug}?${new URLSearchParams({ ...dates, guests: String(dates.guests) })}`,
            );
            return;
          }
          if (!customer) {
            router.push(loginHref);
            return;
          }
          const fd = new FormData(e.currentTarget);
          idempotencyKey.current ??= crypto.randomUUID();
          setSending(true);
          setError("");
          const booking = await post<Booking>("/api/booking-requests", {
            flatId: flat.id,
            ...dates,
            quoteId: quote.quoteId,
            expectedTotal: quote.total,
            idempotencyKey: idempotencyKey.current,
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
          // Sessão expirou entre abrir a página e confirmar: volta ao login sem perder as datas.
          if ((err as { status?: number })?.status === 401) {
            router.push(loginHref);
            return;
          }
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
          {checkout ? "SUA RESERVA" : "PLANEJE SUA ESTADIA"}
        </span>
        <div>
          <strong>{money(flat.fromPrice)}</strong>
          <span className="muted"> / noite, a partir de</span>
        </div>
      </div>
      <fieldset className="form-grid stay-dates" disabled={!hydrated}>
        <div className="field date-field span-2">
          <label htmlFor="booking-dates">Entrada e saída</label>
          <DateRangePicker
            id="booking-dates"
            startName="checkin"
            endName="checkout"
            min={today()}
            required
            value={{ start: dates.checkin, end: dates.checkout }}
            isStartDisabled={nightTaken}
            isEndDisabled={crossesTaken}
            markOf={packageMark}
            legend={legend}
            onChange={({ start, end }) => {
              changeDate("checkin", start);
              changeDate("checkout", end);
            }}
          />
        </div>
        <div className="field span-2">
          <label htmlFor="booking-guests">Hóspedes</label>
          <Select
            id="booking-guests"
            name="guests"
            value={String(dates.guests)}
            onChange={(value) => changeDate("guests", value)}
            options={Array.from({ length: flat.maxGuests }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1} hóspede${i > 0 ? "s" : ""}`,
            }))}
          />
        </div>
      </fieldset>
      {agenda ? (
        <AgendaNotes
          agenda={agenda}
          checkin={dates.checkin}
          checkout={dates.checkout}
        />
      ) : null}
      {checkout && (
        <fieldset className="guest-fields">
          <legend>
            <CalendarCheck size={20} />
            Confirme sua reserva
          </legend>
          {customer ? (
            <p className="muted">
              Reservando como <strong>{customer.name}</strong> ({customer.email}
              ).
            </p>
          ) : (
            <>
              <p className="muted">
                A reserva usa os dados da sua conta de cliente. Entre ou crie
                sua conta para confirmar; as datas escolhidas ficam guardadas.
              </p>
              <Link className="text-link" href={loginHref}>
                Entrar ou criar conta de cliente
              </Link>
            </>
          )}
          <label className="checkbox-label">
            <input type="checkbox" name="terms" required={Boolean(customer)} />
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
        {!hasDates ? (
          <p className="muted">Escolha as datas para ver o valor da estadia.</p>
        ) : loading ? (
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
            onClick={() => {
              idempotencyKey.current = null;
              setQuoteRevision((n) => n + 1);
            }}
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
          ? "Confirmando reserva…"
          : checkout
            ? customer
              ? "Confirmar reserva"
              : "Entrar para confirmar"
            : "Reservar"}
        <ArrowRight size={18} />
      </button>
      <p className="widget-footnote">
        <ShieldCheck size={15} />O pagamento é combinado com o atendimento. A
        confirmação bloqueia o período.
      </p>
    </form>
  );
}
