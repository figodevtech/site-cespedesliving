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

export type CalendarTone = "info" | "success" | "warning" | "neutral" | "block";

export type CalendarEvent = {
  id: string;
  kind: "reservation" | "block";
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
 * Horário: o registrado no ERP quando houver; senão o previsto da reserva; senão o do
 * imóvel; senão o padrão.
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
    const actualIn = reservation.checkedInAt ? localMoment(reservation.checkedInAt) : null;
    const actualOut = reservation.checkedOutAt ? localMoment(reservation.checkedOutAt) : null;
    const startDay = actualIn?.day ?? reservation.checkin;
    const startTime = actualIn?.time ?? validTime(reservation.checkinTime, baseIn);
    const endDay = actualOut?.day ?? reservation.checkout;
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
    });
  }
  for (const occupation of occupations) {
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
    events.push({
      id: `block-${occupation.id}`,
      kind: "block",
      start,
      end,
      startDay: occupation.inicio,
      startTime: "00:00",
      endDay: occupation.fim ? addDays(occupation.fim, -1) : null,
      endTime: "23:59",
      label: reason ? `${kindLabel} - ${reason}` : kindLabel,
      guest: null,
      status: occupation.tipo,
      tone: "block",
      checkedIn: false,
      checkedOut: false,
    });
  }
  return events.sort((a, b) => a.start - b.start || a.end - b.end);
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
