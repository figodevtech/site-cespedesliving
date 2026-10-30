import "server-only";
import type { DataAdapter } from "../contracts";
import type { Flat } from "@/domain/types";
import { ApiError, erpRequest as request } from "@/lib/erp";
import { sessionToken } from "@/lib/site-session";
export function publicFlat(f: Flat): Flat {
  // Allowlist: extra fields returned by the ERP never reach client components.
  return {
    id: f.id,
    slug: f.slug,
    title: f.title,
    neighborhood: f.neighborhood,
    city: f.city,
    state: f.state,
    description: f.description,
    coverImage: f.coverImage,
    gallery: f.gallery,
    realPhotos: f.realPhotos,
    maxGuests: f.maxGuests,
    minNights: f.minNights,
    maxNights: f.maxNights,
    rules: f.rules,
    checkinTime: f.checkinTime,
    checkoutTime: f.checkoutTime,
    bedrooms: f.bedrooms,
    bathrooms: f.bathrooms,
    areaSqm: f.areaSqm,
    amenities: f.amenities,
    active: f.active,
    published: f.published,
    fromPrice: f.fromPrice,
    tag: f.tag,
    modalities: f.modalities,
    prices: f.prices,
    occupancyStatus: f.occupancyStatus,
  };
}
export const apiAdapter: DataAdapter = {
  async listFlats(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined)
        params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    const result = await request<{ items: Flat[] }>(
      `/public/imoveis?${params}`,
    );
    return result.items.filter((f) => f.published && f.active).map(publicFlat);
  },
  async getFlat(slug) {
    try {
      const flat = await request<Flat>(
        `/public/imoveis/${encodeURIComponent(slug)}`,
      );
      return flat.active && flat.published ? publicFlat(flat) : null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  quote(q) {
    return request(
      `/public/imoveis/${encodeURIComponent(q.flatId)}/quote?${new URLSearchParams({ checkin: q.checkin, checkout: q.checkout, guests: String(q.guests) })}`,
    );
  },
  async createBooking(input) {
    return request(
      "/site/reservas",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      await sessionToken(),
    );
  },
  async demoAccess() {
    throw new Error(
      "O acesso real será disponibilizado após a integração segura de autenticação.",
    );
  },
  async dashboard() {
    throw new Error(
      "O portal real requer uma sessão segura e autorização por proprietário.",
    );
  },
};
