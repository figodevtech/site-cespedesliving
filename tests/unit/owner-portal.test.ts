import { describe, expect, it } from "vitest";
import type { Flat, OwnerMovement } from "@/domain/types";
import {
  monthlySeries,
  movementDay,
  movementEffect,
  movementTotals,
  normalizeReservations,
  occupancyRate,
  periodRange,
  stayPhase,
} from "@/domain/owner";

const flat = (id: string, title: string) => ({ id, title, coverImage: `https://x/${id}.jpg` }) as Flat;
const flats = [flat("7", "Flat Tambaú"), flat("9", "Flat Manaíra")];

describe("reservas do proprietário", () => {
  it("completa datas e imóvel a partir do formato antigo do ERP", () => {
    const [old] = normalizeReservations(
      [{ id: "1", flat: "Flat Manaíra", period: "2026-12-10 a 2026-12-14", amount: 900, status: "CONFIRMED" }],
      flats,
    );
    expect(old).toMatchObject({ checkin: "2026-12-10", checkout: "2026-12-14", nights: 4, flatId: "9", cover: "https://x/9.jpg" });
  });

  it("prefere os campos novos quando o ERP os envia", () => {
    const [row] = normalizeReservations(
      [{ id: "2", flat: "Outro nome", period: "x", amount: 1, status: "PENDING", flatId: "7", checkin: "2026-11-01", checkout: "2026-11-03" }],
      flats,
    );
    expect(row).toMatchObject({ flatId: "7", nights: 2 });
  });

  it("classifica hospedado agora, próxima, passada e cancelada", () => {
    const rows = normalizeReservations(
      [
        { id: "a", flat: "", period: "2026-11-08 a 2026-11-12", amount: 0, status: "CONFIRMED" },
        { id: "b", flat: "", period: "2026-11-20 a 2026-11-22", amount: 0, status: "CONFIRMED" },
        { id: "c", flat: "", period: "2026-10-01 a 2026-10-05", amount: 0, status: "CONFIRMED" },
        { id: "d", flat: "", period: "2026-11-20 a 2026-11-22", amount: 0, status: "CANCELLED" },
        { id: "e", flat: "", period: "2026-11-20 a 2026-11-22", amount: 0, status: "IN_PROGRESS" },
      ],
      flats,
    );
    expect(rows.map((row) => stayPhase(row, "2026-11-09"))).toEqual(["current", "upcoming", "past", "cancelled", "current"]);
  });
});

describe("extrato do proprietário", () => {
  const items: OwnerMovement[] = [
    { id: 1, tipo: "BRUTO_RECEBIDO", valor: 1000, data_movimento: "2026-11-02T15:00:00Z" },
    { id: 2, tipo: "TAXA_ADMIN", valor: 140, data_movimento: "2026-11-02T15:00:00Z" },
    { id: 3, tipo: "DESPESA_PROPRIETARIO", valor: 30, data_movimento: "2026-10-20T15:00:00Z" },
    { id: 4, tipo: "REPASSE", valor: "800.10", data_movimento: "2026-11-05T15:00:00Z" },
    // Estorno: o ERP grava o bruto negativo.
    { id: 5, tipo: "BRUTO_RECEBIDO", valor: -100, data_movimento: "2026-11-06T15:00:00Z" },
  ];

  it("usa o dia de João Pessoa, não o de UTC", () => {
    expect(movementDay({ id: 1, data_movimento: "2026-11-01T02:00:00Z" })).toBe("2026-10-31");
    expect(movementDay({ id: 1, data: "2026-11-01" })).toBe("2026-11-01");
  });

  it("soma por tipo no período, com estornos e valores em texto", () => {
    expect(movementTotals(items, "2026-11-01", "2026-11-30")).toEqual({ received: 900, fees: 140, expenses: 0, payouts: 800.1 });
    expect(movementTotals(items).expenses).toBe(30);
  });

  it("repasse pendente aparece no extrato, mas não conta como repassado", () => {
    const comPendente: OwnerMovement[] = [
      ...items,
      { id: -37, tipo: "REPASSE", valor: 478.4, data_movimento: "2026-11-12T15:00:00Z", repasse_pendente: true },
    ];
    expect(movementTotals(comPendente, "2026-11-01", "2026-11-30").payouts).toBe(800.1);
    expect(monthlySeries(comPendente, 3, "2026-11-12")[2]).toMatchObject({ payouts: 800.1 });
  });

  it("mostra o sinal para o proprietário: recebido e repasse entram, taxa e despesa saem", () => {
    expect(items.map(movementEffect)).toEqual([1000, -140, -30, 800.1, -100]);
  });

  it("monta os últimos meses do gráfico, inclusive os vazios", () => {
    const series = monthlySeries(items, 3, "2026-11-09");
    expect(series.map((row) => row.key)).toEqual(["2026-09", "2026-10", "2026-11"]);
    expect(series[2]).toMatchObject({ received: 900, payouts: 800.1 });
    expect(series[0]).toMatchObject({ received: 0, payouts: 0 });
  });
});

describe("ocupação e agenda", () => {
  const rows = normalizeReservations(
    [
      { id: "a", flat: "", flatId: "7", period: "2026-10-28 a 2026-11-03", amount: 0, status: "COMPLETED" },
      { id: "b", flat: "", flatId: "7", period: "2026-11-05 a 2026-11-07", amount: 0, status: "CANCELLED" },
    ],
    flats,
  );

  it("conta só as noites dentro do intervalo e ignora canceladas", () => {
    // 1 a 11 de novembro = 10 noites; a reserva "a" ocupa 2 delas (1 e 2).
    expect(occupancyRate(rows, "2026-11-01", "2026-11-11", 1)).toEqual({ rate: 20, nights: 2 });
    expect(occupancyRate(rows, "2026-11-01", "2026-11-11", 2).rate).toBe(10);
    expect(occupancyRate(rows, "2026-11-01", "2026-11-11", 0).rate).toBe(0);
  });


  it("calcula o início de cada período", () => {
    expect(periodRange("mes", "2026-11-09").start).toBe("2026-11-01");
    expect(periodRange("3m", "2026-11-09").start).toBe("2026-09-01");
    expect(periodRange("12m", "2026-01-15").start).toBe("2025-02-01");
    expect(periodRange("tudo", "2026-11-09").start).toBeUndefined();
  });
});
