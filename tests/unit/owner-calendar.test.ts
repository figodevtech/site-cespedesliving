import { describe, expect, it } from "vitest";
import type { OwnerDashboardReservation } from "@/domain/types";
import { normalizeReservations } from "@/domain/owner";
import {
  calendarEvents,
  conflictsIn,
  daysInclusive,
  localMoment,
  monthWeeks,
  ownUseProblem,
  position,
  shiftMonth,
  weekSegments,
} from "@/domain/owner-calendar";

const booking = (row: Partial<OwnerDashboardReservation> & { id: string; checkin: string; checkout: string }) =>
  normalizeReservations([{ flat: "Studio", period: "", amount: 0, status: "CONFIRMED", flatId: "7", ...row }], [])[0];

// Semana de domingo 2 a sábado 8 de agosto de 2026.
const week = monthWeeks("2026-08")[1];
const pct = (days: number) => (days / 7) * 100;

describe("calendário do imóvel", () => {
  it("monta as semanas de domingo a sábado cobrindo o mês", () => {
    const weeks = monthWeeks("2026-08");
    expect(weeks).toHaveLength(6);
    expect(weeks[0][0]).toBe("2026-07-26");
    expect(weeks.at(-1)?.[1]).toBe("2026-08-31");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });

  it("divide o dia de troca entre a saída e a entrada, na mesma linha", () => {
    const events = calendarEvents(
      [
        booking({ id: "a", checkin: "2026-08-02", checkout: "2026-08-05", checkinTime: "15:00", checkoutTime: "11:00", guest: { name: "Maria Souza", city: null, state: null } }),
        booking({ id: "b", checkin: "2026-08-05", checkout: "2026-08-09", checkinTime: "14:00", checkoutTime: "11:00" }),
      ],
      [],
    );
    const { segments, lanes } = weekSegments(events, week);
    expect(lanes).toBe(1);
    const [a, b] = segments;
    expect(a.event.label).toBe("#a - Confirmada");
    expect(a.event.guest).toBe("Maria Souza");
    expect(b.event.label).toBe("#b - Confirmada");
    expect(b.event.guest).toBeNull();
    expect(a.left).toBeCloseTo(pct(15 / 24));
    expect(a.left + a.width).toBeCloseTo(pct(3 + 11 / 24));
    expect(b.left).toBeCloseTo(pct(3 + 14 / 24));
    // Entre 11h e 14h do dia 5 o imóvel fica livre: as faixas não se tocam.
    expect(b.left).toBeGreaterThan(a.left + a.width);
    expect(a.continuesBefore || a.continuesAfter).toBe(false);
    expect(b.continuesAfter).toBe(true);
    expect(b.width).toBeCloseTo(100 - b.left);
  });

  it("continua a faixa na semana seguinte com o resto da estadia", () => {
    const events = calendarEvents([booking({ id: "b", checkin: "2026-08-05", checkout: "2026-08-09", checkinTime: "14:00", checkoutTime: "11:00" })], []);
    const next = weekSegments(events, monthWeeks("2026-08")[2]).segments[0];
    expect(next.continuesBefore).toBe(true);
    expect(next.left).toBe(0);
    expect(next.width).toBeCloseTo(pct(11 / 24));
  });

  it("usa o horário do imóvel quando a reserva não traz o seu, e o padrão na falta dos dois", () => {
    const [own] = calendarEvents([booking({ id: "x", checkin: "2026-08-02", checkout: "2026-08-03" })], [], { checkinTime: "15:30:00", checkoutTime: "10:00" });
    expect([own.startTime, own.endTime]).toEqual(["15:30", "10:00"]);
    const [fallback] = calendarEvents([booking({ id: "y", checkin: "2026-08-02", checkout: "2026-08-03" })], []);
    expect([fallback.startTime, fallback.endTime]).toEqual(["14:00", "12:00"]);
  });

  it("prefere a entrada e a saída registradas no ERP, no horário de João Pessoa", () => {
    const [event] = calendarEvents(
      [
        booking({
          id: "r",
          checkin: "2026-08-02",
          checkout: "2026-08-04",
          checkinTime: "14:00",
          checkoutTime: "11:00",
          checkedInAt: "2026-08-02T15:20:00Z", // 12:20 em João Pessoa (early check-in)
          checkedOutAt: "2026-08-04T16:45:00Z", // 13:45 (late checkout)
        }),
      ],
      [],
    );
    expect(event).toMatchObject({ startTime: "12:20", endTime: "13:45", checkedIn: true, checkedOut: true, label: "#r - Confirmada" });
    expect(event.start).toBeCloseTo(position("2026-08-02", "12:20"));
    expect(localMoment("2026-08-03T02:30:00Z")).toEqual({ day: "2026-08-02", time: "23:30" });
  });

  it("ignora canceladas e mostra bloqueios do dia inteiro, inclusive sem data de fim", () => {
    const events = calendarEvents(
      [booking({ id: "c", checkin: "2026-08-02", checkout: "2026-08-04", status: "CANCELLED" })],
      [
        { id: 1, imovel_id: 7, tipo: "MANUTENCAO", inicio: "2026-08-03", fim: "2026-08-05", motivo: "Pintura" },
        { id: 2, imovel_id: 7, tipo: "BLOQUEIO", inicio: "2026-08-07", fim: null },
        // Ocupação de uma reserva que está na lista (aqui, a cancelada): não vira "Ocupado".
        { id: 3, imovel_id: 7, tipo: "RESERVA", inicio: "2026-08-02", fim: "2026-08-04", reserva_id: "c" },
      ],
    );
    expect(events.map((event) => event.label)).toEqual(["Manutenção - Pintura", "Bloqueio"]);
    expect(events.every((event) => event.tone === "block")).toBe(true);
    expect(events[0].endDay).toBe("2026-08-04");
    const { segments } = weekSegments(events, week);
    expect(segments[0].left).toBeCloseTo(pct(1));
    expect(segments[0].width).toBeCloseTo(pct(2));
    expect(segments[1].continuesAfter).toBe(true);
    expect(Number.isFinite(events[1].end)).toBe(true);
  });

  it("abre uma nova linha só quando há sobreposição de fato", () => {
    const events = calendarEvents(
      [
        booking({ id: "a", checkin: "2026-08-02", checkout: "2026-08-05", checkinTime: "14:00", checkoutTime: "12:00" }),
        booking({ id: "b", checkin: "2026-08-04", checkout: "2026-08-06", checkinTime: "14:00", checkoutTime: "12:00" }),
        booking({ id: "c", checkin: "2026-08-06", checkout: "2026-08-07", checkinTime: "12:00", checkoutTime: "12:00" }),
      ],
      [],
    );
    const { segments, lanes } = weekSegments(events, week);
    expect(lanes).toBe(2);
    expect(segments.map((segment) => segment.lane)).toEqual([0, 1, 0]);
  });
  it("marca o uso próprio do proprietário (editável) e separa dos bloqueios da equipe", () => {
    const events = calendarEvents(
      [],
      [
        { id: 7, imovel_id: 7, tipo: "BLOQUEIO", inicio: "2026-08-10", fim: "2026-08-13", motivo: "Reserva de uso próprio do proprietário", uso_proprio: true },
        { id: 8, imovel_id: 7, tipo: "BLOQUEIO", inicio: "2026-08-20", fim: "2026-08-21", motivo: "Pintura", uso_proprio: false },
        { id: 9, imovel_id: 7, tipo: "MANUTENCAO", inicio: "2026-08-25", fim: "2026-08-26", uso_proprio: true },
      ],
    );
    expect(events.map((event) => [event.label, event.tone, event.ownUseId])).toEqual([
      ["Uso próprio", "own", "7"],
      ["Bloqueio - Pintura", "block", null],
      ["Manutenção", "block", null],
    ]);
    expect(events[0].days).toEqual({ from: "2026-08-10", to: "2026-08-13" });
    expect(daysInclusive("2026-08-10", "2026-08-12")).toBe(3);
  });

  it("confere conflitos do uso próprio como o banco: o dia de saída da reserva fica livre", () => {
    const events = calendarEvents(
      [booking({ id: "r", checkin: "2026-08-05", checkout: "2026-08-08" })],
      [{ id: 7, imovel_id: 7, tipo: "BLOQUEIO", inicio: "2026-08-12", fim: "2026-08-14", uso_proprio: true }],
    );
    const today = "2026-08-01";
    // Começar no dia da saída (8) e terminar na véspera do uso próprio (11): livre.
    expect(ownUseProblem(events, "2026-08-08", "2026-08-11", today)).toBeNull();
    expect(ownUseProblem(events, "2026-08-07", "2026-08-09", today)).toContain("reserva #r");
    expect(ownUseProblem(events, "2026-08-11", "2026-08-12", today)).toContain("uso próprio");
    // Ao alterar as datas de um uso próprio, ele mesmo não conta como conflito.
    expect(ownUseProblem(events, "2026-08-11", "2026-08-13", today, "7")).toBeNull();
    expect(conflictsIn(events, "2026-08-04", "2026-08-04")).toHaveLength(0);
    expect(ownUseProblem(events, "2026-07-31", "2026-08-02", today)).toBe("Escolha datas a partir de hoje.");
    expect(ownUseProblem(events, "2026-09-01", "2027-03-01", today)).toBe("Escolha no máximo 180 dias por vez.");
  });
  it("mostra como Ocupado o que o banco bloqueia mas não é reserva do proprietário (caso da #83)", () => {
    const events = calendarEvents(
      [booking({ id: "82", checkin: "2026-11-20", checkout: "2026-11-21" })],
      [
        { id: 49, imovel_id: 13, tipo: "RESERVA", inicio: "2026-11-20", fim: "2026-11-21", reserva_id: 82 },
        { id: 50, imovel_id: 13, tipo: "RESERVA", inicio: "2026-11-27", fim: "2026-11-29", reserva_id: 83 },
        { id: 51, imovel_id: 13, tipo: "LOCACAO", inicio: "2027-01-01", fim: null },
      ],
      { checkinTime: "14:00", checkoutTime: "11:00" },
    );
    // A #82 aparece uma vez só (como reserva); a #83 e a locação, sem detalhes.
    expect(events.map((event) => [event.kind, event.label])).toEqual([
      ["reservation", "#82 - Confirmada"],
      ["occupied", "Ocupado"],
      ["occupied", "Locação"],
    ]);
    expect(events[1]).toMatchObject({ startTime: "14:00", endTime: "11:00", days: { from: "2026-11-27", to: "2026-11-29" } });
    expect(ownUseProblem(events, "2026-11-27", "2026-11-30", "2026-11-13")).toBe(
      "O período escolhido já tem uma ocupação registrada pela equipe.",
    );
    expect(ownUseProblem(events, "2026-11-29", "2026-11-30", "2026-11-13")).toBeNull();
    expect(ownUseProblem(events, "2027-02-01", "2027-02-02", "2026-11-13")).toBe("O período escolhido já tem uma locação.");
  });
  it("mantém a faixa nos dias da reserva quando o check-in/out foi registrado em outro dia (caso da #83)", () => {
    const [event] = calendarEvents(
      [
        booking({
          id: "83",
          status: "COMPLETED",
          checkin: "2026-11-27",
          checkout: "2026-11-29",
          checkinTime: "14:00",
          checkoutTime: "11:00",
          checkedInAt: "2026-11-12T19:40:00Z", // registrados em 12/11, antes da data
          checkedOutAt: "2026-11-12T19:45:00Z",
        }),
      ],
      [],
    );
    expect(event).toMatchObject({ startDay: "2026-11-27", startTime: "14:00", endDay: "2026-11-29", endTime: "11:00", checkedIn: false, checkedOut: false });
    expect(event.start).toBeCloseTo(position("2026-11-27", "14:00"));
    expect(event.end).toBeCloseTo(position("2026-11-29", "11:00"));
  });
});
