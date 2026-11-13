import type { OwnerOccupation } from "./types";
import { bookingStatusLabel, type OwnerReservation } from "./owner";
import { addDays, parseDate } from "./dates";

/**
 * Calendário de acompanhamento do imóvel. Cada reserva vira uma faixa contínua no
 * tempo, da hora de entrada até a hora de saída: no dia em que um hóspede sai às 11h
 * e outro entra às 14h, cada faixa ocupa só a sua parte do quadrado daquele dia.
 * As posições são medidas em dias (com fração de hora) desde 1970, no horário de
 * João Pessoa, e convertidas em porcentagem da semana.
 */

const DAY_MS = 86_400_000;
const TZ = "America/Fortaleza";
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)/;
export const DEFAULT_CHECKIN = "14:00";
export const DEFAULT_CHECKOUT = "12:00";
/** Fim de bloqueio sem data (ano ~29000): número finito, serializável para o cliente. */
const OPEN_END = 1e7;

export type CalendarTone = "info" | "success" | "warning" | "neutral" | "block" | "own" | "busy";

export type CalendarEvent = {
  id: string;
  /**
   * occupied: ocupação que o banco considera (locação, ou reserva que não está na lista
   * do proprietário) e que só aparece como "Ocupado", sem detalhes de terceiros.
   */
  kind: "reservation" | "block" | "occupied";
  /** Início e fim em dias desde 1970 (fração = hora do dia). */
  start: number;
  end: number;
  startDay: string;
  startTime: string;
  /** Sem fim: bloqueio por tempo indeterminado. */
  endDay: string | null;
  endTime: string;
  /** Texto do badge: "#13 - Confirmada" (reserva) ou "Bloqueio - motivo". */
  label: string;
  /** Titular da reserva, para a descrição completa (título/leitor de tela). */
  guest: string | null;
  status: string;
  tone: CalendarTone;
  /** Entrada/saída já registradas no ERP (horário real, não o previsto). */
  checkedIn: boolean;
  checkedOut: boolean;
  /**
   * Dias que o evento ocupa na agenda, como o banco conta: do primeiro dia (incluso) ao dia
   * final (exclusivo: dia de saída da reserva). Nulo no fim: bloqueio sem data para acabar.
   */
  days: { from: string; to: string | null };
  /** Reserva de uso próprio deste proprietário: id do bloqueio no ERP, para alterar/excluir. */
  ownUseId: string | null;
};

export type CalendarSegment = {
  event: CalendarEvent;
  /** Posição na semana, em % da largura. */
  left: number;
  width: number;
  lane: number;
  /** A faixa continua na semana anterior/seguinte (borda reta). */
  continuesBefore: boolean;
  continuesAfter: boolean;
};

const minutes = (time: string) => {
  const match = TIME_RE.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

/** Posição de um dia + hora ("HH:MM") na escala do calendário. */
export function position(day: string, time = "00:00") {
  return parseDate(day) / DAY_MS + (minutes(time) ?? 0) / 1440;
}

/** Dia civil e hora de um instante ISO em João Pessoa. */
export function localMoment(iso: string) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return null;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(time)
      .map((part) => [part.type, part.value]),
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

const validTime = (value: string | null | undefined, fallback: string) =>
  value && TIME_RE.test(value) ? value.slice(0, 5) : fallback;

export const reservationTone: Record<string, CalendarTone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  IN_PROGRESS: "success",
  COMPLETED: "neutral",
};

/**
 * Reservas (exceto canceladas) e bloqueios do imóvel como eventos do calendário.
 * Os dias vêm sempre da reserva (são eles que o banco bloqueia). A hora: a registrada no ERP
 * quando cai no próprio dia previsto (check-in antecipado, check-out tardio); senão a prevista
 * da reserva; senão a do imóvel; senão o padrão. Um registro em outro dia (ex.: check-in e
 * check-out lançados antes da data) não arrasta a faixa para fora do período reservado.
 */
export function calendarEvents(
  reservations: OwnerReservation[],
  occupations: OwnerOccupation[],
  defaults: { checkinTime?: string | null; checkoutTime?: string | null } = {},
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const baseIn = validTime(defaults.checkinTime, DEFAULT_CHECKIN);
  const baseOut = validTime(defaults.checkoutTime, DEFAULT_CHECKOUT);
  for (const reservation of reservations) {
    if (reservation.status === "CANCELLED" || !reservation.checkin || !reservation.checkout) continue;
    const registeredIn = reservation.checkedInAt ? localMoment(reservation.checkedInAt) : null;
    const registeredOut = reservation.checkedOutAt ? localMoment(reservation.checkedOutAt) : null;
    const actualIn = registeredIn?.day === reservation.checkin ? registeredIn : null;
    const actualOut = registeredOut?.day === reservation.checkout ? registeredOut : null;
    const startDay = reservation.checkin;
    const startTime = actualIn?.time ?? validTime(reservation.checkinTime, baseIn);
    const endDay = reservation.checkout;
    const endTime = actualOut?.time ?? validTime(reservation.checkoutTime, baseOut);
    let start: number;
    let end: number;
    try {
      start = position(startDay, startTime);
      end = position(endDay, endTime);
    } catch {
      continue;
    }
    if (!(end > start)) continue;
    events.push({
      id: reservation.id,
      kind: "reservation",
      start,
      end,
      startDay,
      startTime,
      endDay,
      endTime,
      label: `#${reservation.id} - ${bookingStatusLabel[reservation.status] ?? reservation.status}`,
      guest: reservation.guest?.name?.trim() || null,
      status: reservation.status,
      tone: reservationTone[reservation.status] ?? "neutral",
      checkedIn: Boolean(actualIn),
      checkedOut: Boolean(actualOut),
      days: { from: reservation.checkin, to: reservation.checkout },
      ownUseId: null,
    });
  }
  // O calendário mostra tudo o que o banco considera ocupado. A reserva do proprietário já
  // virou faixa acima; o resto (locação, reserva de outro beneficiário) vira "Ocupado".
  const listed = new Set(reservations.map((reservation) => String(reservation.id)));
  for (const occupation of occupations) {
    if (occupation.tipo === "RESERVA" || occupation.tipo === "LOCACAO") {
      // Sem reserva_id: ERP anterior a este campo (no banco ele é obrigatório para RESERVA).
      // Sem como saber de quem é, não desenha, para não duplicar as reservas do proprietário.
      if (occupation.tipo === "RESERVA" && (occupation.reserva_id == null || listed.has(String(occupation.reserva_id)))) continue;
      let start: number;
      let end: number;
      try {
        start = position(occupation.inicio, baseIn);
        end = occupation.fim ? position(occupation.fim, baseOut) : OPEN_END;
      } catch {
        continue;
      }
      if (!(end > start)) continue;
      const lease = occupation.tipo === "LOCACAO";
      events.push({
        id: `occ-${occupation.id}`,
        kind: "occupied",
        start,
        end,
        startDay: occupation.inicio,
        startTime: baseIn,
        endDay: occupation.fim,
        endTime: baseOut,
        label: lease ? "Locação" : "Ocupado",
        guest: null,
        status: occupation.tipo,
        tone: "busy",
        checkedIn: false,
        checkedOut: false,
        days: { from: occupation.inicio, to: occupation.fim },
        ownUseId: null,
      });
      continue;
    }
    if (!["MANUTENCAO", "BLOQUEIO"].includes(occupation.tipo)) continue;
    let start: number;
    let end: number;
    try {
      start = position(occupation.inicio);
      // Período [inicio, fim): o bloqueio vale até o fim do dia anterior a "fim".
      end = occupation.fim ? position(occupation.fim) : OPEN_END;
    } catch {
      continue;
    }
    if (!(end > start)) continue;
    const kindLabel = occupation.tipo === "MANUTENCAO" ? "Manutenção" : "Bloqueio";
    const reason = occupation.motivo?.trim();
    // Para o proprietário, o bloqueio que ele mesmo criou é a "reserva de uso próprio".
    const ownUse = occupation.tipo === "BLOQUEIO" && occupation.uso_proprio === true;
    events.push({
      id: `block-${occupation.id}`,
      kind: "block",
      start,
      end,
      startDay: occupation.inicio,
      startTime: "00:00",
      endDay: occupation.fim ? addDays(occupation.fim, -1) : null,
      endTime: "23:59",
      label: ownUse ? "Uso próprio" : reason ? `${kindLabel} - ${reason}` : kindLabel,
      guest: null,
      status: ownUse ? "USO_PROPRIO" : occupation.tipo,
      tone: ownUse ? "own" : "block",
      checkedIn: false,
      checkedOut: false,
      days: { from: occupation.inicio, to: occupation.fim },
      ownUseId: ownUse ? String(occupation.id) : null,
    });
  }
  return events.sort((a, b) => a.start - b.start || a.end - b.end);
}

/* ---------------------------------------------- seleção de dias (uso próprio) */

/** Limites da reserva de uso próprio (os mesmos que o ERP confere). */
export const OWN_USE_MAX_DAYS = 180;
export const OWN_USE_MAX_AHEAD_DAYS = 730;

/** Dias entre o primeiro e o último (inclusive). */
export function daysInclusive(first: string, last: string) {
  return Math.round((parseDate(last) - parseDate(first)) / DAY_MS) + 1;
}

/**
 * Eventos que ocupam algum dia de [first, last]. Mesma regra do banco: o dia de saída de uma
 * reserva fica livre (outra estadia ou o uso próprio pode começar nele).
 */
export function conflictsIn(events: CalendarEvent[], first: string, last: string, ignoreOwnUseId?: string | null) {
  return events.filter(
    (event) =>
      // Ao alterar as datas de um uso próprio, ele mesmo não conta como conflito.
      !(ignoreOwnUseId && event.ownUseId === ignoreOwnUseId) &&
      event.days.from <= last &&
      (event.days.to === null || event.days.to > first),
  );
}

/** Motivo para não poder reservar o período, ou null se pode. */
export function ownUseProblem(events: CalendarEvent[], first: string, last: string, today: string, ignoreOwnUseId?: string | null) {
  if (first < today) return "Escolha datas a partir de hoje.";
  if (first > addDays(today, OWN_USE_MAX_AHEAD_DAYS)) return "A reserva de uso próprio pode ser feita com até 2 anos de antecedência.";
  if (daysInclusive(first, last) > OWN_USE_MAX_DAYS) return `Escolha no máximo ${OWN_USE_MAX_DAYS} dias por vez.`;
  const conflicts = conflictsIn(events, first, last, ignoreOwnUseId);
  if (conflicts.length)
    return `O período escolhido já tem ${conflicts
      .map((event) =>
        event.kind === "reservation"
          ? `a reserva #${event.id}`
          : event.kind === "occupied"
            ? event.status === "LOCACAO"
              ? "uma locação"
              : "uma ocupação registrada pela equipe"
            : event.ownUseId
              ? "uso próprio"
              : event.label.toLowerCase(),
      )
      .join(", ")}.`;
  return null;
}

/** Semanas (domingo a sábado) que cobrem o mês "AAAA-MM". */
export function monthWeeks(month: string): string[][] {
  const first = `${month}-01`;
  const weekday = new Date(parseDate(first)).getUTCDay();
  const [year, monthNumber] = month.split("-").map(Number);
  const last = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
  const weeks: string[][] = [];
  for (let day = addDays(first, -weekday); day <= last; day = addDays(day, 7))
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(day, index)));
  return weeks;
}

export function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1 + offset, 1)).toISOString().slice(0, 7);
}

/**
 * Pedaços das faixas dentro de uma semana, com a linha (lane) de cada um. Faixas que
 * só se encostam (saída às 11h, entrada às 14h, ou uma terminando onde outra começa)
 * dividem a mesma linha; só sobreposição de fato abre uma linha nova.
 */
export function weekSegments(events: CalendarEvent[], week: string[]) {
  const weekStart = position(week[0]);
  const weekEnd = weekStart + 7;
  const laneEnds: number[] = [];
  const segments: CalendarSegment[] = [];
  for (const event of events) {
    const start = Math.max(event.start, weekStart);
    const end = Math.min(event.end, weekEnd);
    if (end <= start) continue;
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start + 1e-9);
    if (lane === -1) lane = laneEnds.push(end) - 1;
    else laneEnds[lane] = end;
    segments.push({
      event,
      left: ((start - weekStart) / 7) * 100,
      width: ((end - start) / 7) * 100,
      lane,
      continuesBefore: event.start < weekStart,
      continuesAfter: event.end > weekEnd,
    });
  }
  return { segments, lanes: laneEnds.length };
}
