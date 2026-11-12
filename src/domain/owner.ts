import type {
  Flat,
  OwnerDashboardReservation,
  OwnerMovement,
  OwnerOccupation,
} from "./types";
import { addDays, nightsBetween, today } from "./dates";

/**
 * Regras da área do proprietário que não dependem de tela: datas, situação das reservas,
 * totais do extrato, ocupação e séries do gráfico. Tudo em dias civis de João Pessoa.
 */

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TZ = "America/Fortaleza";

export type OwnerReservation = OwnerDashboardReservation & {
  checkin: string;
  checkout: string;
  nights: number;
  flatId: string;
  cover: string;
};

/** Junta a reserva ao imóvel e completa as datas a partir do "period" do ERP antigo. */
export function normalizeReservations(
  rows: OwnerDashboardReservation[],
  flats: Flat[],
): OwnerReservation[] {
  return rows.map((row) => {
    const [fromPeriod, toPeriod] = row.period?.split(" a ") ?? [];
    const checkin = DAY_RE.test(row.checkin ?? "") ? row.checkin! : (fromPeriod ?? "");
    const checkout = DAY_RE.test(row.checkout ?? "") ? row.checkout! : (toPeriod ?? "");
    const flat =
      flats.find((item) => item.id === row.flatId) ??
      flats.find((item) => item.title === row.flat);
    let nights = 0;
    try {
      nights = Math.max(nightsBetween(checkin, checkout), 0);
    } catch {
      nights = 0;
    }
    return {
      ...row,
      checkin,
      checkout,
      nights,
      flatId: row.flatId ?? flat?.id ?? "",
      cover: flat?.coverImage ?? "",
    };
  });
}

export type StayPhase = "current" | "upcoming" | "past" | "cancelled";

/** Hospedado agora, próxima chegada, já passou ou cancelada. */
export function stayPhase(reservation: OwnerReservation, day = today()): StayPhase {
  if (reservation.status === "CANCELLED") return "cancelled";
  if (reservation.status === "COMPLETED") return "past";
  if (reservation.status === "IN_PROGRESS") return "current";
  if (reservation.checkout && reservation.checkout <= day) return "past";
  if (reservation.checkin && reservation.checkin <= day) return "current";
  return "upcoming";
}

export const bookingStatusLabel: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Hospedado",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export const paymentStatusLabel: Record<string, string> = {
  PENDING: "Pagamento pendente",
  PARTIAL: "Pagamento parcial",
  PAID: "Pago",
  REFUNDED: "Estornado",
};

/** Tom visual de cada situação: success, info, warning, danger ou neutral. */
export const bookingStatusTone: Record<string, string> = {
  PENDING: "warning",
  CONFIRMED: "info",
  IN_PROGRESS: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
};

export const paymentStatusTone: Record<string, string> = {
  PENDING: "warning",
  PARTIAL: "info",
  PAID: "success",
  REFUNDED: "neutral",
};

/** Situação operacional do imóvel (imovel_resumo no ERP). */
export const propertyStatus: Record<string, { label: string; tone: string }> = {
  DISPONIVEL: { label: "Disponível", tone: "success" },
  OCUPADO: { label: "Hospedado agora", tone: "info" },
  RESERVADO: { label: "Reservado", tone: "info" },
  ALUGADO: { label: "Alugado", tone: "info" },
  MANUTENCAO: { label: "Em manutenção", tone: "warning" },
  INATIVO: { label: "Inativo", tone: "neutral" },
  VENDIDO: { label: "Vendido", tone: "neutral" },
};

export function propertyStatusOf(flat: Flat) {
  const key = flat.occupancyStatus ?? (flat.active ? "DISPONIVEL" : "INATIVO");
  return propertyStatus[key] ?? { label: key, tone: "neutral" };
}

/* ------------------------------------------------------------------ extrato */

export const movementLabel: Record<string, string> = {
  BRUTO_RECEBIDO: "Recebido do hóspede",
  TAXA_ADMIN: "Taxa de administração",
  DESPESA_PROPRIETARIO: "Despesa",
  REPASSE: "Repasse para você",
};

export const movementTone: Record<string, string> = {
  BRUTO_RECEBIDO: "success",
  TAXA_ADMIN: "neutral",
  DESPESA_PROPRIETARIO: "warning",
  REPASSE: "info",
};

export const movementType = (item: OwnerMovement) => item.tipo ?? item.natureza ?? "";
export const movementValue = (item: OwnerMovement) => Number(item.valor ?? 0) || 0;

/**
 * Sinal do valor do ponto de vista do proprietário: o recebido do hóspede e o repasse (dinheiro
 * que chega à conta dele) entram; taxa e despesa saem. No saldo a repassar o repasse abate, mas
 * para quem lê o extrato ele é entrada, não despesa. Estornos já chegam com o sinal trocado.
 */
export function movementEffect(item: OwnerMovement) {
  const value = movementValue(item);
  return ["BRUTO_RECEBIDO", "REPASSE"].includes(movementType(item)) ? value : -value;
}

/** Dia civil do movimento em João Pessoa (o ERP grava data e hora em UTC). */
export function movementDay(item: OwnerMovement): string {
  const raw = item.data ?? item.data_movimento ?? item.created_at ?? "";
  if (DAY_RE.test(raw)) return raw;
  const time = Date.parse(raw);
  if (!Number.isFinite(time)) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(time);
}

export const movementProperty = (item: OwnerMovement) =>
  item.imovel_titulo ?? item.imovel?.titulo ?? "";

export type MovementTotals = {
  received: number;
  fees: number;
  expenses: number;
  payouts: number;
};

const cents = (value: number) => Math.round(value * 100);

/** Totais por tipo entre duas datas (inclusive); sem datas, todo o histórico. */
export function movementTotals(
  items: OwnerMovement[],
  start?: string,
  end?: string,
): MovementTotals {
  const totals = { received: 0, fees: 0, expenses: 0, payouts: 0 };
  for (const item of items) {
    const day = movementDay(item);
    if ((start && day < start) || (end && day > end)) continue;
    // Repasse ainda não pago: aparece no extrato como pendente, mas não foi repassado.
    if (item.repasse_pendente) continue;
    const value = cents(movementValue(item));
    const type = movementType(item);
    if (type === "BRUTO_RECEBIDO") totals.received += value;
    else if (type === "TAXA_ADMIN") totals.fees += value;
    else if (type === "DESPESA_PROPRIETARIO") totals.expenses += value;
    else if (type === "REPASSE") totals.payouts += value;
  }
  return {
    received: totals.received / 100,
    fees: totals.fees / 100,
    expenses: totals.expenses / 100,
    payouts: totals.payouts / 100,
  };
}

/** Recebido e repassado por mês, dos últimos N meses até o atual. */
export function monthlySeries(items: OwnerMovement[], months = 6, day = today()) {
  const [year, month] = day.split("-").map(Number);
  const keys = Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 - (months - 1 - index), 1));
    return date.toISOString().slice(0, 7);
  });
  const series = keys.map((key) => ({ key, label: monthShort(key), received: 0, payouts: 0 }));
  for (const item of items) {
    const entry = series.find((row) => row.key === movementDay(item).slice(0, 7));
    if (!entry || item.repasse_pendente) continue;
    const type = movementType(item);
    if (type === "BRUTO_RECEBIDO") entry.received += movementValue(item);
    if (type === "REPASSE") entry.payouts += movementValue(item);
  }
  return series.map((row) => ({
    ...row,
    received: Math.round(row.received * 100) / 100,
    payouts: Math.round(row.payouts * 100) / 100,
  }));
}

/* ----------------------------------------------------------------- ocupação */

/** Noites reservadas (não canceladas) dentro de [start, end), contadas por noite. */
export function bookedNights(reservations: OwnerReservation[], start: string, end: string) {
  let nights = 0;
  for (const reservation of reservations) {
    if (reservation.status === "CANCELLED" || !reservation.checkin || !reservation.checkout) continue;
    const from = reservation.checkin > start ? reservation.checkin : start;
    const to = reservation.checkout < end ? reservation.checkout : end;
    if (to > from) nights += nightsBetween(from, to);
  }
  return nights;
}

/** Ocupação no intervalo: noites reservadas sobre as noites disponíveis de todos os imóveis. */
export function occupancyRate(
  reservations: OwnerReservation[],
  start: string,
  end: string,
  propertyCount: number,
) {
  const capacity = Math.max(nightsBetween(start, end), 0) * Math.max(propertyCount, 0);
  if (!capacity) return { rate: 0, nights: 0 };
  const nights = bookedNights(reservations, start, end);
  return { rate: Math.min(100, Math.round((nights / capacity) * 100)), nights };
}

export type DayState = "free" | "booked" | "blocked";

/** Situação de cada dia de um imóvel, a partir de hoje, para a faixa de calendário. */
export function dayStrip(
  reservations: OwnerReservation[],
  occupations: OwnerOccupation[],
  days = 30,
  start = today(),
) {
  return Array.from({ length: days }, (_, index) => {
    const day = addDays(start, index);
    const booked = reservations.some(
      (reservation) =>
        reservation.status !== "CANCELLED" &&
        reservation.checkin <= day &&
        day < reservation.checkout,
    );
    const blocked = occupations.some(
      (occupation) =>
        ["MANUTENCAO", "BLOQUEIO"].includes(occupation.tipo) &&
        occupation.inicio <= day &&
        (!occupation.fim || day < occupation.fim),
    );
    const state: DayState = booked ? "booked" : blocked ? "blocked" : "free";
    return { day, state };
  });
}

/* ------------------------------------------------------------------ períodos */

export const periodPresets = {
  mes: "Este mês",
  "3m": "Últimos 3 meses",
  "12m": "Últimos 12 meses",
  tudo: "Todo o período",
} as const;

export type PeriodPreset = keyof typeof periodPresets;

export function isPeriodPreset(value: unknown): value is PeriodPreset {
  return typeof value === "string" && value in periodPresets;
}

/** Datas do período (inclusive). "tudo" não tem início. */
export function periodRange(preset: PeriodPreset, day = today()) {
  const [year, month] = day.split("-").map(Number);
  const firstOf = (offset: number) =>
    new Date(Date.UTC(year, month - 1 - offset, 1)).toISOString().slice(0, 10);
  const start =
    preset === "mes" ? firstOf(0) : preset === "3m" ? firstOf(2) : preset === "12m" ? firstOf(11) : undefined;
  return { start, end: day };
}

/* --------------------------------------------------------------- formatação */

const utc = (value: string) => Date.parse(`${value}T12:00:00Z`);

export function dayMonth(value: string) {
  if (!DAY_RE.test(value)) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" })
    .format(utc(value))
    .replace(".", "");
}

export function weekdayLong(value: string) {
  if (!DAY_RE.test(value)) return "";
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(utc(value));
}

export function fullDate(value: string) {
  if (!DAY_RE.test(value)) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(utc(value));
}

export function shortDate(value: string) {
  if (!DAY_RE.test(value)) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(utc(value));
}

export function monthShort(key: string) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(Date.parse(`${key}-15T12:00:00Z`))
    .replace(".", "");
}

export function monthLong(key: string) {
  const text = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    Date.parse(`${key}-15T12:00:00Z`),
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
