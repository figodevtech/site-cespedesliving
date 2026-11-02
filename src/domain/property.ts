import type { Flat, Modality } from "./types";
export const modalityLabels: Record<Modality, string> = {
  TEMPORADA: "Temporada",
  LOCACAO: "Aluguel",
  VENDA: "Venda",
};
/**
 * Por enquanto o site só mostra a diária (temporada). Aluguel mensal e venda
 * aparecem "sob consulta", não entram em filtro/ordenação por preço e nem
 * chegam ao navegador. Volte para `false` para exibir todos os valores.
 */
export const ONLY_NIGHTLY_PRICE = true;
export function modalities(flat: Flat): Modality[] {
  return flat.modalities ?? ["TEMPORADA"];
}
/** Preço visível para a finalidade; sem finalidade, a diária quando o imóvel tem temporada. */
export function propertyPrice(
  flat: Flat,
  modality: Modality = ONLY_NIGHTLY_PRICE && modalities(flat).includes("TEMPORADA")
    ? "TEMPORADA"
    : modalities(flat)[0],
) {
  if (ONLY_NIGHTLY_PRICE && modality !== "TEMPORADA")
    return { value: null, suffix: "" };
  if (modality === "VENDA") return { value: flat.prices?.sale, suffix: "" };
  if (modality === "LOCACAO")
    return { value: flat.prices?.monthly, suffix: "/ mês" };
  return { value: flat.prices?.nightly ?? flat.fromPrice, suffix: "/ noite" };
}
/** Filtro e ordenação por preço só valem para valores que o site mostra. */
export function pricesVisibleFor(modality: Modality) {
  return !ONLY_NIGHTLY_PRICE || modality === "TEMPORADA";
}
