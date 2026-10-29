const DAY = 86_400_000;
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function parseDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Informe uma data válida.");
  const date = Date.parse(`${value}T00:00:00Z`);
  if (
    !Number.isFinite(date) ||
    new Date(date).toISOString().slice(0, 10) !== value
  )
    throw new Error("Informe uma data válida.");
  return date;
}
export function addDays(value: string, days: number): string {
  return new Date(parseDate(value) + days * DAY).toISOString().slice(0, 10);
}
export function nightsBetween(checkin: string, checkout: string): number {
  return (parseDate(checkout) - parseDate(checkin)) / DAY;
}
export function validateStay(
  checkin: string,
  checkout: string,
  guests: number,
  capacity: number,
  currentDay = today(),
  bounds = { minNights: 1, maxNights: 60 },
): number {
  const nights = nightsBetween(checkin, checkout);
  if (checkin < currentDay)
    throw new Error("A entrada não pode ser no passado.");
  if (nights < 1) throw new Error("A saída precisa ser posterior à entrada.");
  if (nights < bounds.minNights || nights > bounds.maxNights)
    throw new Error(
      `Escolha de ${bounds.minNights} a ${bounds.maxNights} noites para este imóvel.`,
    );
  if (!Number.isInteger(guests) || guests < 1 || guests > capacity)
    throw new Error(`Este flat acomoda de 1 a ${capacity} hóspedes.`);
  return nights;
}
export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(parseDate(value));
}
export function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
