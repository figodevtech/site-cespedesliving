import type { AvailabilityQuery, Flat, ReservationQuote } from "./types";
import { addDays, parseDate, validateStay } from "./dates";
export function calculateQuote(
  flat: Flat,
  query: AvailabilityQuery,
  currentDay?: string,
): ReservationQuote {
  const nights = validateStay(
    query.checkin,
    query.checkout,
    query.guests,
    flat.maxGuests,
    currentDay,
  );
  const nightlyBreakdown = Array.from({ length: nights }, (_, i) => {
    const date = addDays(query.checkin, i);
    const weekend = [5, 6].includes(new Date(parseDate(date)).getUTCDay());
    return {
      date,
      amount: Math.round(flat.fromPrice * (weekend ? 1.1 : 1) * 100) / 100,
    };
  });
  // A predictable mock calendar: days 15 and 16 of every month are blocked.
  const available =
    flat.active &&
    flat.published &&
    !nightlyBreakdown.some((n) => ["15", "16"].includes(n.date.slice(-2)));
  const subtotal =
    Math.round(nightlyBreakdown.reduce((sum, n) => sum + n.amount, 0) * 100) /
    100;
  const fees = 99;
  return {
    available,
    nightlyBreakdown,
    subtotal,
    fees,
    taxes: 0,
    total: Math.round((subtotal + fees) * 100) / 100,
    currency: "BRL",
  };
}
