"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type CSSProperties, type KeyboardEvent } from "react";
import { Ban, CalendarPlus, ChevronLeft, ChevronRight, Home, Lock, Pencil, Trash2, Wrench, X } from "lucide-react";
import {
  daysInclusive,
  monthWeeks,
  ownUseProblem,
  shiftMonth,
  weekSegments,
  type CalendarEvent,
} from "@/domain/owner-calendar";
import { bookingStatusLabel, monthLong, plural, shortDate } from "@/domain/owner";

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
  if (event.ownUseId)
    return `Uso próprio: de ${shortDate(event.startDay)} até ${shortDate(event.endDay ?? "")}. Toque para alterar ou excluir.`;
  if (event.kind === "occupied")
    return `${event.status === "LOCACAO" ? "Locação" : "Imóvel ocupado"}: entrada em ${shortDate(event.startDay)}${
      event.endDay ? `, saída em ${shortDate(event.endDay)}` : ", sem data de saída"
    }. Para detalhes, fale com a equipe.`;
  if (event.kind === "block")
    return `${event.label}: de ${shortDate(event.startDay)}${event.endDay ? ` até ${shortDate(event.endDay)}` : ", sem data para terminar"}`;
  const status = bookingStatusLabel[event.status] ?? event.status;
  const entry = `${event.checkedIn ? "entrada registrada" : "entrada"} em ${shortDate(event.startDay)} às ${event.startTime}`;
  const exit = `${event.checkedOut ? "saída registrada" : "saída"} em ${shortDate(event.endDay ?? "")} às ${event.endTime}`;
  return `Reserva #${event.id} (${status})${event.guest ? ` de ${event.guest}` : ""}: ${entry}, ${exit}`;
}

const periodText = (first: string, last: string) =>
  `${first === last ? shortDate(first) : `${shortDate(first)} a ${shortDate(last)}`} · ${plural(daysInclusive(first, last), "dia", "dias")}`;

type Selection = { first: string; last: string | null };
type Message = { tone: "ok" | "error"; text: string };

/**
 * Calendário mensal de acompanhamento do imóvel. Recebe os eventos já calculados no
 * servidor; aqui troca o mês, posiciona as faixas e cuida da reserva de uso próprio:
 * o proprietário toca no primeiro e no último dia, confirma, e os dias ficam bloqueados
 * no ERP. Os usos próprios dele podem ter as datas alteradas ou ser excluídos antes de começar.
 */
export function OwnerCalendar({
  events,
  today,
  now,
  propertyId,
}: {
  events: CalendarEvent[];
  /** Dia de hoje (AAAA-MM-DD) e o instante atual na escala do calendário. */
  today: string;
  now: number;
  propertyId: string;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const weeks = monthWeeks(month);
  const current = month === today.slice(0, 7);
  const working = busy || refreshing;
  const focused = focusedId ? events.find((event) => event.ownUseId === focusedId) ?? null : null;
  const editing = editingId ? events.find((event) => event.ownUseId === editingId) ?? null : null;

  // Intervalo escolhido; enquanto falta o último dia, acompanha o mouse (ou fica num dia só).
  const first = selection?.first ?? null;
  const reach = selection ? (selection.last ?? (hover && hover >= selection.first ? hover : selection.first)) : null;
  const last = selection?.last ?? (selection ? selection.first : null);
  const problem = first && last ? ownUseProblem(events, first, last, today, editingId) : null;
  const previewProblem = first && reach ? ownUseProblem(events, first, reach, today, editingId) : null;

  function reset() {
    setSelection(null);
    setHover(null);
    setEditingId(null);
    setFocusedId(null);
    setConfirmDelete(false);
  }

  function pick(day: string) {
    if (working) return;
    setMessage(null);
    setFocusedId(null);
    setConfirmDelete(false);
    if (!selection || selection.last) setSelection({ first: day, last: null });
    else if (day < selection.first) setSelection({ first: day, last: selection.first });
    else setSelection({ first: selection.first, last: day });
  }

  async function send(url: string, method: "POST" | "PATCH" | "DELETE", body?: object) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Não foi possível concluir. Tente novamente.");
      return true;
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Não foi possível concluir. Tente novamente." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!first || !last || problem) return;
    const ok = await send(editingId ? `/api/owner-blocks/${editingId}` : "/api/owner-blocks", editingId ? "PATCH" : "POST", {
      imovelId: propertyId,
      inicio: first,
      ultimo: last,
    });
    if (!ok) return;
    setMessage({ tone: "ok", text: editingId ? `Uso próprio alterado para ${periodText(first, last)}.` : `Reservado para uso próprio: ${periodText(first, last)}.` });
    reset();
    startRefresh(() => router.refresh());
  }

  async function remove() {
    if (!focused?.ownUseId) return;
    const period = periodText(focused.startDay, focused.endDay ?? focused.startDay);
    const ok = await send(`/api/owner-blocks/${focused.ownUseId}`, "DELETE");
    if (!ok) return;
    setMessage({ tone: "ok", text: `Uso próprio excluído (${period}). Os dias voltaram a ficar disponíveis.` });
    reset();
    startRefresh(() => router.refresh());
  }

  function startEditing(event: CalendarEvent) {
    setEditingId(event.ownUseId);
    setFocusedId(null);
    setConfirmDelete(false);
    setSelection({ first: event.startDay, last: event.endDay ?? event.startDay });
    setMonth(event.startDay.slice(0, 7));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && (selection || focusedId)) reset();
  }

  const inSelection = (day: string) => Boolean(first && reach && day >= first && day <= reach);

  return (
    <div className="op-cal" onKeyDown={onKeyDown}>
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

      {/* Barra de ação: período escolhido, detalhes de um uso próprio ou o resultado da última operação. */}
      <div className="op-cal-actions" aria-live="polite">
        {selection && first && last ? (
          <div className={`op-cal-action${problem ? " has-problem" : ""}`}>
            <div className="op-cal-action-text">
              <b>{editing ? "Novas datas do uso próprio" : "Reserva de uso próprio"}</b>
              <span>{periodText(first, last)}</span>
              {problem ? (
                <small className="op-cal-problem">{problem}</small>
              ) : !selection.last ? (
                <small>Toque no último dia para escolher mais de um dia.</small>
              ) : null}
            </div>
            <div className="op-cal-action-buttons">
              <button type="button" className="op-button op-button-ghost" onClick={reset} disabled={working}>
                Cancelar
              </button>
              <button type="button" className="op-button" onClick={() => void save()} disabled={working || Boolean(problem)}>
                <CalendarPlus size={15} aria-hidden="true" />
                {busy ? "Salvando…" : editing ? "Salvar novas datas" : "Reservar para uso próprio"}
              </button>
            </div>
          </div>
        ) : focused ? (
          <div className="op-cal-action">
            <div className="op-cal-action-text">
              <b>Uso próprio</b>
              <span>{periodText(focused.startDay, focused.endDay ?? focused.startDay)}</span>
              {focused.startDay < today ? (
                <small>Este período já começou e não pode mais ser alterado pelo site. Para mudar, fale com a equipe.</small>
              ) : confirmDelete ? (
                <small className="op-cal-problem">Excluir este uso próprio? Os dias voltam a ficar disponíveis para hóspedes.</small>
              ) : null}
            </div>
            <div className="op-cal-action-buttons">
              {focused.startDay >= today && confirmDelete ? (
                <>
                  <button type="button" className="op-button op-button-ghost" onClick={() => setConfirmDelete(false)} disabled={working}>
                    Voltar
                  </button>
                  <button type="button" className="op-button op-button-danger" onClick={() => void remove()} disabled={working}>
                    <Trash2 size={15} aria-hidden="true" />
                    {busy ? "Excluindo…" : "Sim, excluir"}
                  </button>
                </>
              ) : focused.startDay >= today ? (
                <>
                  <button type="button" className="op-button op-button-ghost" onClick={() => setConfirmDelete(true)} disabled={working}>
                    <Trash2 size={15} aria-hidden="true" /> Excluir
                  </button>
                  <button type="button" className="op-button" onClick={() => startEditing(focused)} disabled={working}>
                    <Pencil size={15} aria-hidden="true" /> Alterar datas
                  </button>
                </>
              ) : null}
              <button type="button" className="op-cal-btn" onClick={reset} aria-label="Fechar">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : message ? (
          <p className={`op-cal-msg op-cal-msg-${message.tone}`} role={message.tone === "error" ? "alert" : "status"}>
            {message.text}
            {refreshing ? " Atualizando o calendário…" : ""}
          </p>
        ) : (
          <p className="op-cal-hint">
            <Home size={14} aria-hidden="true" /> Para usar o imóvel, toque no primeiro e no último dia livres e reserve para uso próprio.
          </p>
        )}
        {message?.tone === "error" && (selection || focused) ? (
          <p className="op-cal-msg op-cal-msg-error" role="alert">
            {message.text}
          </p>
        ) : null}
      </div>

      <div className={`op-cal-grid${working ? " is-working" : ""}`} aria-busy={working}>
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
              <div className="op-cal-days">
                {week.map((day) => {
                  const selected = inSelection(day);
                  const className = [
                    "op-cal-day",
                    day.slice(0, 7) !== month && "is-outside",
                    day < today && "is-past",
                    day === today && "is-today",
                    selected && "is-selected",
                    selected && previewProblem && "is-invalid",
                    day === first && "is-start",
                    day === reach && "is-end",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const content = (
                    <>
                      <b>{Number(day.slice(8))}</b>
                      {day.endsWith("-01") && day.slice(0, 7) !== month ? <small>{monthLong(day.slice(0, 7)).slice(0, 3)}</small> : null}
                    </>
                  );
                  // Dias passados não entram na reserva de uso próprio.
                  return day < today ? (
                    <span key={day} className={className} aria-hidden="true">
                      {content}
                    </span>
                  ) : (
                    <button
                      key={day}
                      type="button"
                      className={className}
                      aria-pressed={selected}
                      aria-label={`${shortDate(day)}${selected ? ", selecionado" : ""}`}
                      onClick={() => pick(day)}
                      onMouseEnter={() => selection && !selection.last && setHover(day)}
                      disabled={working}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
              <ul className="op-cal-bars" aria-label={`Semana de ${shortDate(week[0])} a ${shortDate(week[6])}`}>
                {segments.map((segment) => {
                  const { event } = segment;
                  const className = [
                    "op-cal-bar",
                    `op-cal-${event.tone}`,
                    segment.continuesBefore && "cont-before",
                    segment.continuesAfter && "cont-after",
                    event.ownUseId && event.ownUseId === editingId && "is-editing",
                    event.ownUseId && event.ownUseId === focusedId && "is-focused",
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
                      {event.ownUseId ? (
                        <Home size={11} aria-hidden="true" />
                      ) : event.kind === "occupied" ? (
                        <Lock size={11} aria-hidden="true" />
                      ) : event.kind === "block" ? (
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
                      ) : event.ownUseId ? (
                        <button
                          type="button"
                          className={className}
                          title={description}
                          aria-label={description}
                          onClick={() => {
                            setSelection(null);
                            setEditingId(null);
                            setConfirmDelete(false);
                            setMessage(null);
                            setFocusedId(event.ownUseId);
                          }}
                        >
                          {content}
                        </button>
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
        <span><i className="op-swatch op-cal-own" /> Uso próprio</span>
        <span><i className="op-swatch op-cal-busy" /> Ocupado ou locação</span>
        <span><i className="op-swatch op-cal-block" /> Bloqueio ou manutenção</span>
        <span><i className="op-swatch op-cal-now-swatch" /> Agora</span>
      </div>
      <p className="op-cal-note">
        Cada faixa começa na hora de entrada e termina na hora de saída, então no dia de troca de hóspedes cada reserva ocupa só a sua parte do dia.
        Toque numa reserva para ver os detalhes ou num uso próprio para alterar ou excluir.
      </p>
    </div>
  );
}
