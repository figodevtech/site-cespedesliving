import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/site-session", () => ({
  sessionToken: vi.fn().mockResolvedValue("verified-user-token"),
}));
import { apiAdapter } from "@/services/adapters/api";
const property = {
  id: "1",
  slug: "studio",
  title: "Studio",
  neighborhood: "Centro",
  city: "João Pessoa",
  state: "PB",
  description: "",
  coverImage: "",
  gallery: [],
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  areaSqm: 30,
  amenities: [],
  active: true,
  published: true,
  fromPrice: 100,
  tag: "",
  modalities: ["VENDA", "TEMPORADA"],
  prices: { nightly: 100, sale: 300000 },
  ownerId: "private-id",
  cpf: "private-cpf",
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("ERP site contracts", () => {
  it("keeps private owner fields out of public records and sends modality filters", async () => {
    vi.stubEnv("ERP_API_BASE_URL", "https://erp.example/api");
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        Response.json({ items: [property, { ...property, published: false }] }),
      );
    vi.stubGlobal("fetch", fetcher);
    const records = await apiAdapter.listFlats({
      modality: "VENDA",
      minPrice: 200000,
    });
    expect(records).toHaveLength(1);
    expect(records[0]).not.toHaveProperty("ownerId");
    expect(records[0]).not.toHaveProperty("cpf");
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://erp.example/api/public/imoveis?modality=VENDA&minPrice=200000",
    );
    expect(fetcher.mock.calls[0][1].headers).not.toHaveProperty(
      "Authorization",
    );
  });
  it("uses the verified visitor token for reservations without a fixed administrator token", async () => {
    vi.stubEnv("ERP_API_BASE_URL", "https://erp.example/api");
    vi.stubEnv("ERP_API_TOKEN", "must-not-be-forwarded");
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        Response.json({ id: "reservation-id", status: "CONFIRMED" }),
      );
    vi.stubGlobal("fetch", fetcher);
    await apiAdapter.createBooking({
      flatId: "1",
      checkin: "2090-01-01",
      checkout: "2090-01-03",
      guests: 2,
      acceptedTerms: true,
      quoteId: "quote-id",
      expectedTotal: 200,
      idempotencyKey: "request-key",
    });
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://erp.example/api/site/reservas",
    );
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer verified-user-token",
    );
  });
  it("maps a missing property to the 404 flow", async () => {
    vi.stubEnv("ERP_API_BASE_URL", "https://erp.example/api");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: "Não encontrado" }, { status: 404 }),
        ),
    );
    expect(await apiAdapter.getFlat("missing")).toBeNull();
  });
});
