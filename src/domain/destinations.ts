/** Cidade com imóvel publicado, como oferecida no filtro "Destino" da busca. */
export type Destination = { city: string; state: string; total: number };

/** Valor do filtro na URL: "João Pessoa - PB". */
export const destinationValue = (d: { city: string; state: string }) => `${d.city} - ${d.state}`;

/** "João Pessoa - PB" → { city, state }; qualquer outro formato não filtra. */
export function parseDestination(value?: string | null) {
  const match = String(value ?? "").trim().match(/^(.+?)\s+-\s+([A-Za-z]{2})$/);
  return match ? { city: match[1].trim(), state: match[2].toUpperCase() } : null;
}
