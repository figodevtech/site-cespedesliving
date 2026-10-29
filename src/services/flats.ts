import { getAdapter } from "./adapter";
import type { Filters } from "@/domain/types";
// Em "Relevância", imóveis com fotos reais vêm primeiro (sort estável mantém o resto).
export const getFlats = async (filters?: Filters) => {
  const flats = await getAdapter().listFlats(filters);
  if (filters?.sort) return flats;
  return flats.sort((a, b) => Number(!!b.realPhotos) - Number(!!a.realPhotos));
};
export const getFlat = (slug: string) => getAdapter().getFlat(slug);
