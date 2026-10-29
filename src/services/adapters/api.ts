import "server-only";
import type { DataAdapter } from "../contracts";
import type { Flat } from "@/domain/types";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.ERP_API_BASE_URL;
  if (!base)
    throw new Error("A integração com o ERP ainda não está configurada.");
  const response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ERP_API_TOKEN
        ? { Authorization: `Bearer ${process.env.ERP_API_TOKEN}` }
        : {}),
      ...init?.headers,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error("O serviço está indisponível. Tente novamente mais tarde.");
  return response.json() as Promise<T>;
}
function publicFlat(f: Flat): Flat {
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
    bedrooms: f.bedrooms,
    bathrooms: f.bathrooms,
    areaSqm: f.areaSqm,
    amenities: f.amenities,
    active: f.active,
    published: f.published,
    fromPrice: f.fromPrice,
    tag: f.tag,
  };
}
export const apiAdapter: DataAdapter = {
  async listFlats(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined)
        params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    const result = await request<{ items: Flat[] }>(`/public/flats?${params}`);
    return result.items.filter((f) => f.published && f.active).map(publicFlat);
  },
  async getFlat(slug) {
    const flat = await request<Flat>(
      `/public/flats/${encodeURIComponent(slug)}`,
    );
    return flat.active && flat.published ? publicFlat(flat) : null;
  },
  quote(q) {
    return request(
      `/public/flats/${encodeURIComponent(q.flatId)}/quote?${new URLSearchParams({ checkin: q.checkin, checkout: q.checkout, guests: String(q.guests) })}`,
    );
  },
  createBooking(input) {
    return request("/public/booking-requests", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  createLead(input) {
    return request("/public/owner-leads", {
      method: "POST",
      body: JSON.stringify(input),
    });
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
