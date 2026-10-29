import type { Flat, Modality } from "./types";
export const modalityLabels: Record<Modality, string> = {
  TEMPORADA: "Temporada",
  LOCACAO: "Aluguel",
  VENDA: "Venda",
};
export function modalities(flat: Flat): Modality[] {
  return flat.modalities ?? ["TEMPORADA"];
}
export function propertyPrice(
  flat: Flat,
  modality: Modality = modalities(flat)[0],
) {
  if (modality === "VENDA") return { value: flat.prices?.sale, suffix: "" };
  if (modality === "LOCACAO")
    return { value: flat.prices?.monthly, suffix: "/ mês" };
  return { value: flat.prices?.nightly ?? flat.fromPrice, suffix: "/ noite" };
}
