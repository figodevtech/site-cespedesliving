import { describe, expect, it } from "vitest";
import {
  addDays,
  nightsBetween,
  parseDate,
  validateStay,
} from "@/domain/dates";
import { calculateQuote } from "@/domain/pricing";
import { mockFlats } from "@/data/flats";
import { mockAdapter } from "@/services/adapters/mock";
const flat = mockFlats[0];
const current = "2028-01-01";
describe("calendar dates", () => {
  it("counts exclusive checkout across leap day and time-zone changes", () => {
    expect(nightsBetween("2028-02-28", "2028-03-01")).toBe(2);
    expect(nightsBetween("2028-03-11", "2028-03-13")).toBe(2);
    expect(addDays("2028-12-31", 1)).toBe("2029-01-01");
  });
  it.each([
    "2027-02-29",
    "2028-02-30",
    "2028-13-01",
    "01/01/2028",
    "",
    "2028-1-1",
  ])("rejects malformed date %s", (value) => {
    expect(() => parseDate(value)).toThrow();
  });
  it("rejects inverted, equal and past dates and stays above 60 nights", () => {
    for (const [checkin, checkout] of [
      ["2028-01-04", "2028-01-03"],
      ["2028-01-04", "2028-01-04"],
      ["2027-12-31", "2028-01-04"],
      ["2028-01-01", "2028-03-02"],
    ])
      expect(() => validateStay(checkin, checkout, 2, 2, current)).toThrow();
  });
  it.each([0, -1, 3, 1.5, NaN])("rejects invalid capacity %s", (guests) => {
    expect(() =>
      validateStay("2028-01-02", "2028-01-03", guests, 2, current),
    ).toThrow();
  });
});
describe("mock quote source of truth", () => {
  it("sums each night with weekend adjustments and one cleaning fee", () => {
    const quote = calculateQuote(
      flat,
      {
        flatId: flat.id,
        checkin: "2028-01-07",
        checkout: "2028-01-10",
        guests: 2,
      },
      current,
    );
    expect(quote.nightlyBreakdown).toEqual([
      { date: "2028-01-07", amount: 306.9 },
      { date: "2028-01-08", amount: 306.9 },
      { date: "2028-01-09", amount: 279 },
    ]);
    expect(quote.subtotal).toBe(892.8);
    expect(quote.fees).toBe(99);
    expect(quote.taxes).toBe(0);
    expect(quote.total).toBe(991.8);
    expect(quote.available).toBe(true);
  });
  it("blocks occupied nights while allowing checkout on first blocked night", () => {
    const q = {
      flatId: flat.id,
      checkin: "2028-01-14",
      checkout: "2028-01-15",
      guests: 1,
    };
    expect(calculateQuote(flat, q, current).available).toBe(true);
    expect(
      calculateQuote(flat, { ...q, checkout: "2028-01-16" }, current).available,
    ).toBe(false);
  });
  it("keeps hidden properties unavailable", () => {
    expect(
      calculateQuote(
        { ...flat, published: false },
        {
          flatId: flat.id,
          checkin: "2028-01-03",
          checkout: "2028-01-04",
          guests: 1,
        },
        current,
      ).available,
    ).toBe(false);
  });
  it("revalidates forged booking price, capacity and consent on the server adapter", async () => {
    const input = {
      flatId: flat.id,
      checkin: "2090-01-03",
      checkout: "2090-01-04",
      guests: 2,
      guest: {
        name: "Hóspede Demo",
        email: "demo@example.com",
        phone: "83999999999",
      },
      acceptedTerms: true,
      total: 1,
    };
    const booking = await mockAdapter.createBooking(input);
    expect(booking.total).toBeGreaterThan(1);
    expect(booking.status).toBe("PENDING");
    expect(booking.demo).toBe(true);
    await expect(
      mockAdapter.createBooking({ ...input, guests: 3 }),
    ).rejects.toThrow();
    await expect(
      mockAdapter.createBooking({ ...input, acceptedTerms: false }),
    ).rejects.toThrow();
    await expect(
      mockAdapter.createBooking({
        ...input,
        checkin: "2090-01-15",
        checkout: "2090-01-17",
      }),
    ).rejects.toThrow();
  });
  it("applies simultaneous catalog filters and sorts without mutating inventory", async () => {
    const result = await mockAdapter.listFlats({
      guests: 4,
      maxPrice: 350,
      amenities: ["Estacionamento"],
      sort: "price-asc",
    });
    expect(result.map((f) => f.slug)).toEqual([
      "flat-intermares-design",
      "flat-manaira-premium",
    ]);
    expect(mockFlats[0].slug).toBe("flat-tambau-master");
    expect(
      await mockAdapter.listFlats({
        checkin: "2090-01-15",
        checkout: "2090-01-17",
      }),
    ).toEqual([]);
  });
});
