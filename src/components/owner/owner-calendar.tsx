"use client";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { Ban, ChevronLeft, ChevronRight, Wrench } from "lucide-react";
import {
  monthWeeks,
  shiftMonth,
  weekSegments,
  type CalendarEvent,
} from "@/domain/owner-calendar";
import { bookingStatusLabel, monthLong, shortDate } from "@/domain/owner";

const WEEKDAYS = [
  ["D", "Domingo"],
  ["S", "Segunda"],
  ["T", "Terça"],
  ["Q", "Quarta"],
  ["Q", "Quinta"],
  ["S", "Sexta"],
  ["S", "Sábado"],
] as const;

function describe(event: CalendarEvent) {
  if (event.kind === "block")
    return `${event.label}: de ${shortDate(event.startDay)}${event.endDay ? ` até ${shortDate(event.endDay)}` : ", sem data para terminar"}`;
  const status = bookingStatusLabel[event.status] ?? event.status;
  const entry = `${event.checkedIn ? "entrada registrada" : "entrada"} em ${shortDate(event.startDay)} às ${event.startTime}`;
  const exit = `${event.checkedOut ? "saída registrada" : "saída"} em ${shortDate(event.endDay ?? "")} às ${event.endTime}`;
  return `Reserva #${event.id} (${status})${event.guest ? ` de ${event.guest}` : ""}: ${entry}, ${exit}`;
}

/**
 * Calendário mensal de acompanhamento do imóvel. Recebe os eventos já calculados no
 * servidor; aqui só troca o mês e posiciona as faixas.
 */
export function OwnerCalendar({
  events,
  today,
  now,
}: {
  events: CalendarEvent[];
  /** Dia de hoje (AAAA-MM-DD) e o instante atual na escala do calendário. */
  today: string;
  now: number;
}) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const weeks = monthWeeks(month);
  const current = month === today.slice(0, 7);

  return (
    <div className="op-cal">
      <div className="op-cal-toolbar">
        <h3 className="op-cal-month" aria-live="polite">
          {monthLong(month)}
        </h3>
        <div className="op-cal-nav">
          <button type="button" className="op-cal-btn" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mês anterior">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button type="button" className="op-cal-btn op-cal-today" onClick={() => setMonth(today.slice(0, 7))} disabled={current}>
            Hoje
          </button>
          <button type="button" className="op-cal-btn" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Próximo mês">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="op-cal-grid">
        <div className="op-cal-weekdays" aria-hidden="true">
          {WEEKDAYS.map(([short, long], index) => (
            <span key={index} title={long}>
              {short}
            </span>
          ))}
        </div>
        {weeks.map((week) => {
          const { segments, lanes } = weekSegments(events, week);
          const weekStart = Date.parse(`${week[0]}T00:00:00Z`) / 86_400_000;
          const nowLeft = now >= weekStart && now < weekStart + 7 ? ((now - weekStart) / 7) * 100 : null;
          return (
            <div key={week[0]} className="op-cal-week" style={{ "--lanes": Math.max(lanes, 1) } as CSSProperties}>
              <div className="op-cal-days" aria-hidden="true">
                {week.map((day) => (
                  <span
                    key={day}
                    className={[
                      "op-cal-day",
                      day.slice(0, 7) !== month && "is-outside",
                      day < today && "is-past",
                      day === today && "is-today",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <b>{Number(day.slice(8))}</b>
                    {day.endsWith("-01") && day.slice(0, 7) !== month ? <small>{monthLong(day.slice(0, 7)).slice(0, 3)}</small> : null}
                  </span>
                ))}
              </div>
              <ul className="op-cal-bars" aria-label={`Semana de ${shortDate(week[0])} a ${shortDate(week[6])}`}>
                {segments.map((segment) => {
                  const { event } = segment;
                  const className = [
                    "op-cal-bar",
                    `op-cal-${event.tone}`,
                    segment.continuesBefore && "cont-before",
                    segment.continuesAfter && "cont-after",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const style = {
                    left: `${segment.left}%`,
                    width: `${segment.width}%`,
                    "--lane": segment.lane,
                  } as CSSProperties;
                  const description = describe(event);
                  const content = (
                    <>
                      {event.kind === "block" ? (
                        event.status === "MANUTENCAO" ? <Wrench size={11} aria-hidden="true" /> : <Ban size={11} aria-hidden="true" />
                      ) : null}
                      <span>{event.label}</span>
                    </>
                  );
                  return (
                    <li key={event.id} className="op-cal-slot" style={style}>
                      {event.kind === "reservation" ? (
                        <Link
                          href={`/painel-proprietario/reservas/${encodeURIComponent(event.id)}`}
                          className={className}
                          title={description}
                          aria-label={description}
                        >
                          {content}
                        </Link>
                      ) : (
                        <span className={className} title={description} aria-label={description} role="img">
                          {content}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {nowLeft !== null ? <i className="op-cal-now" style={{ left: `${nowLeft}%` }} aria-hidden="true" /> : null}
            </div>
          );
        })}
      </div>

      <div className="op-legend">
        <span><i className="op-swatch op-cal-info" /> Confirmada</span>
        <span><i className="op-swatch op-cal-success" /> Hospedado</span>
        <span><i className="op-swatch op-cal-warning" /> Pendente</span>
        <span><i className="op-swatch op-cal-neutral" /> Concluída</span>
        <span><i className="op-swatch op-cal-block" /> Bloqueio ou manutenção</span>
        <span><i className="op-swatch op-cal-now-swatch" /> Agora</span>
      </div>
      <p className="op-cal-note">
        Cada faixa começa na hora de entrada e termina na hora de saída, então no dia de troca de hóspedes cada reserva ocupa só a sua parte do dia.
        Toque numa reserva para ver os detalhes.
      </p>
    </div>
  );
}
