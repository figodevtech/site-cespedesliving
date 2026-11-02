import { getAdapter } from "./adapter";
import type { Filters } from "@/domain/types";
import type { Flat, FlatAgenda } from "@/domain/types";
import { isMock } from "./adapter";
import { publicFlat } from "./adapters/api";
import { erpRequest } from "@/lib/erp";
import { mockFlats } from "@/data/flats";
import { amenityKey, type AmenityOption } from "@/domain/amenities";
import type { Destination } from "@/domain/destinations";
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
    if (value === undefined) return;
    // Uma comodidade por parâmetro: o nome pode ter vírgula.
    if (key === "amenities" && Array.isArray(value))
      value.forEach((amenity) => params.append("amenity", amenity));
    else
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
/**
 * Cidades com imóvel publicado, para o filtro "Destino". Sem resposta do ERP, a lista
 * fica vazia e a busca segue sem filtro de destino.
 */
export async function getDestinations(): Promise<Destination[]> {
  if (isMock()) {
    const groups = new Map<string, Destination>();
    for (const flat of mockFlats.filter((f) => f.active && f.published)) {
      const key = `${amenityKey(flat.city)}|${flat.state}`;
      const item = groups.get(key) ?? { city: flat.city, state: flat.state, total: 0 };
      item.total++;
      groups.set(key, item);
    }
    return [...groups.values()].sort((a, b) => a.city.localeCompare(b.city, "pt-BR"));
  }
  try {
    const result = await erpRequest<{ items: { cidade: string; estado: string; total: number }[] }>(
      "/public/destinos",
    );
    return result.items.map((d) => ({ city: d.cidade, state: d.estado, total: d.total }));
  } catch {
    return [];
  }
}
/** Períodos sem vaga e pacotes fechados do imóvel; falha na busca só esconde o aviso. */
export async function getFlatAgenda(flatId: string): Promise<FlatAgenda | null> {
  if (isMock()) return { unavailable: [], packages: [] };
  try {
    const agenda = await erpRequest<{
      indisponivel: { inicio: string; fim: string }[];
      pacotes: { nome: string; inicio: string; fim: string; min_noites: number }[];
    }>(`/public/imoveis/${encodeURIComponent(flatId)}/agenda`);
    return {
      unavailable: agenda.indisponivel.map((p) => ({ start: p.inicio, end: p.fim })),
      packages: agenda.pacotes.map((p) => ({ name: p.nome, start: p.inicio, end: p.fim, minNights: p.min_noites })),
    };
  } catch {
    return null;
  }
}
/**
 * Opções do filtro "Facilidade": as comodidades dos imóveis publicados, como
 * cadastradas no ERP. Falha na busca não derruba o catálogo, só esconde as opções.
 */
export async function getAmenityOptions(): Promise<AmenityOption[]> {
  if (isMock()) {
    const groups = new Map<string, AmenityOption>();
    for (const flat of mockFlats.filter((f) => f.active && f.published))
      for (const name of new Set(flat.amenities)) {
        const option = groups.get(amenityKey(name)) ?? { name, count: 0 };
        option.count++;
        groups.set(amenityKey(name), option);
      }
    return [...groups.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );
  }
  try {
    return (await erpRequest<{ items: AmenityOption[] }>("/public/comodidades"))
      .items;
  } catch {
    return [];
  }
}
