"use client";
import type { FlatAgenda } from "@/domain/types";

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

/**
 * Avisa antes da escolha quais períodos só aceitam o pacote completo. As noites sem vaga
 * aparecem só no calendário (riscadas). A cotação continua sendo a palavra final; aqui só se
 * adianta o que ela diria.
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
  if (!agenda.packages.length) return null;

  return (
    <div className="agenda-notes" aria-live="polite">
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
    </div>
  );
}
