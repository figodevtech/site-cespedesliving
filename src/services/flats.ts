import { getAdapter } from "./adapter";
import type { Filters } from "@/domain/types";
import type { Flat } from "@/domain/types";
import { isMock } from "./adapter";
import { publicFlat } from "./adapters/api";
import { erpRequest } from "@/lib/erp";
export async function getFlatsPage(
  filters: Filters,
  page: number,
  pageSize = 12,
) {
  if (isMock()) {
    const items = await getAdapter().listFlats(filters);
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
    };
  }
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined)
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });
  const result = await erpRequest<{ items: Flat[]; total: number }>(
    `/public/imoveis?${params}`,
  );
  return {
    ...result,
    items: result.items
      .filter((flat) => flat.active && flat.published)
      .map(publicFlat),
  };
}
// Em "Relevância", imóveis com fotos reais vêm primeiro (sort estável mantém o resto).
export const getFlats = async (filters?: Filters) => {
  const flats = await getAdapter().listFlats(filters);
  if (filters?.sort) return flats;
  return flats.sort((a, b) => Number(!!b.realPhotos) - Number(!!a.realPhotos));
};
export const getFlat = (slug: string) => getAdapter().getFlat(slug);
