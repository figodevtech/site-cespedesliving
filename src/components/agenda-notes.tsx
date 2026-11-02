"use client";
import type { FlatAgenda } from "@/domain/types";
import { addDays } from "@/domain/dates";

const MAX_RANGES = 6;

/** "12 jan" ou "12 jan 2027" quando o ano não é o atual. */
function shortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return date
    .toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      ...(date.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
    })
    .replace(/\./g, "")
    .replace(/ de /g, " ");
}

/** Noites ocupadas vão até a véspera do fim (o dia do fim fica livre para nova entrada). */
function rangeLabel(start: string, end: string) {
  const last = addDays(end, -1);
  return last === start ? shortDate(start) : `${shortDate(start)} a ${shortDate(last)}`;
}

/**
 * O seletor de data do navegador não marca dias: o quadro avisa antes da escolha quais
 * períodos estão sem vaga e quais só aceitam o pacote completo. A cotação continua sendo a
 * palavra final; aqui só se adianta o que ela diria.
 */
export function AgendaNotes({
  agenda,
  checkin,
  checkout,
}: {
  agenda: FlatAgenda;
  checkin?: string;
  checkout?: string;
}) {
  const valid = Boolean(checkin && checkout && checkout > checkin);
  const overlaps = (start: string, end: string) =>
    valid && start < checkout! && end > checkin!;
  if (!agenda.unavailable.length && !agenda.packages.length) return null;
  const ranges = agenda.unavailable.slice(0, MAX_RANGES);
  const hidden = agenda.unavailable.length - ranges.length;

  return (
    <div className="agenda-notes" aria-live="polite">
      {agenda.unavailable.length ? (
        <div>
          <h3>Sem disponibilidade</h3>
          <ul className="agenda-chips">
            {ranges.map((range) => (
              <li
                key={range.start}
                className={overlaps(range.start, range.end) ? "is-hit" : ""}
              >
                {rangeLabel(range.start, range.end)}
              </li>
            ))}
          </ul>
          {hidden > 0 ? (
            <p className="agenda-more">
              E mais {hidden} {hidden === 1 ? "período" : "períodos"} nos próximos meses.
            </p>
          ) : null}
        </div>
      ) : null}
      {agenda.packages.length ? (
        <div>
          <h3>Pacotes fechados</h3>
          {agenda.packages.map((pack) => {
            const hit = overlaps(pack.start, pack.end);
            return (
              <p
                key={pack.start}
                className={`agenda-package ${hit ? "is-hit" : ""}`}
              >
                <strong>{pack.name}</strong>: entrada a partir de{" "}
                {shortDate(pack.start)} e saída até {shortDate(pack.end)}
                {pack.minNights > 1 ? `, mínimo de ${pack.minNights} noites` : ""}.
                {hit ? " Suas datas tocam este pacote." : ""}
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
