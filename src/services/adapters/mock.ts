import { mockFlats } from "@/data/flats";
import { calculateQuote } from "@/domain/pricing";
import type { DataAdapter } from "../contracts";
export const mockAdapter: DataAdapter = {
  async listFlats(filters = {}) {
    let result = mockFlats.filter((f) => f.active && f.published);
    if (filters.neighborhood)
      result = result.filter((f) => f.neighborhood === filters.neighborhood);
    if (filters.guests)
      result = result.filter((f) => f.maxGuests >= filters.guests!);
    if (filters.minPrice !== undefined)
      result = result.filter((f) => f.fromPrice >= filters.minPrice!);
    if (filters.maxPrice !== undefined)
      result = result.filter((f) => f.fromPrice <= filters.maxPrice!);
    if (filters.amenities?.length)
      result = result.filter((f) =>
        filters.amenities!.every((a) => f.amenities.includes(a)),
      );
    if (filters.checkin && filters.checkout) {
      result = result.filter(
        (f) =>
          calculateQuote(f, {
            flatId: f.id,
            checkin: filters.checkin!,
            checkout: filters.checkout!,
            guests: filters.guests ?? 1,
          }).available,
      );
    }
    return [...result].sort((a, b) =>
      filters.sort === "price-asc"
        ? a.fromPrice - b.fromPrice
        : filters.sort === "price-desc"
          ? b.fromPrice - a.fromPrice
          : filters.sort === "guests"
            ? b.maxGuests - a.maxGuests
            : 0,
    );
  },
  async getFlat(slug) {
    return (
      mockFlats.find((f) => f.slug === slug && f.active && f.published) ?? null
    );
  },
  async quote(query) {
    const flat = mockFlats.find(
      (f) => f.id === query.flatId && f.active && f.published,
    );
    if (!flat) throw new Error("Flat não encontrado.");
    return calculateQuote(flat, query);
  },
  async createBooking(input) {
    const flat = mockFlats.find(
      (f) => f.id === input.flatId && f.active && f.published,
    );
    if (!flat) throw new Error("Flat não encontrado.");
    if (!input.acceptedTerms)
      throw new Error("Aceite os termos para continuar.");
    if (
      !input.guest ||
      !input.guest.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.guest.email) ||
      input.guest.phone.replace(/\D/g, "").length < 10
    )
      throw new Error("Confira os dados do hóspede.");
    const quote = calculateQuote(flat, input);
    if (!quote.available)
      throw new Error(
        "Este período está bloqueado no calendário de demonstração. Escolha outras datas.",
      );
    return {
      ...input,
      id: `CL-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      flatTitle: flat.title,
      slug: flat.slug,
      total: quote.total,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      demo: true,
    };
  },
  async demoAccess(input) {
    return { ...input, demo: true };
  },
  async dashboard() {
    return {
      occupancy: 78,
      revenue: 18450,
      expenses: 3250,
      payout: 15200,
      reservations: [
        {
          id: "DEMO-101",
          flat: "Flat Tambaú Master",
          period: "03–07 · mês ilustrativo",
          amount: 1215,
          status: "Ilustrativa",
        },
        {
          id: "DEMO-102",
          flat: "Flat Manaíra Premium",
          period: "08–12 · mês ilustrativo",
          amount: 1564,
          status: "Ilustrativa",
        },
        {
          id: "DEMO-103",
          flat: "Flat Tambaú Master",
          period: "20–25 · mês ilustrativo",
          amount: 1605,
          status: "Ilustrativa",
        },
      ],
      maintenance: [
        {
          title: "Revisão preventiva do ar-condicionado",
          status: "Agendada · fictícia",
          amount: 180,
        },
        {
          title: "Reposição de enxoval",
          status: "Concluída · fictícia",
          amount: 320,
        },
      ],
    };
  },
};
