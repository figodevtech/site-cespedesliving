import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { getFlat } = vi.hoisted(() => ({ getFlat: vi.fn() }));
vi.mock("@/services/flats", () => ({ getFlat }));
import {
  bookingConfirmationEmail,
  sendBookingConfirmation,
} from "@/services/booking-confirmation";
import type { Booking } from "@/domain/types";

const booking: Booking = {
  id: "123",
  flatTitle: "Flat <Mar> & Sol",
  slug: "flat-mar",
  checkin: "2026-12-10",
  checkout: "2026-12-13",
  guests: 2,
  total: 1250.5,
  status: "CONFIRMED",
  paymentStatus: "PENDING",
  createdAt: "2026-11-17T10:00:00Z",
};
const guest = { name: "  Maria da Silva ", email: "maria@example.com" };
const sender = "Cespedes Living <reservas@cespedesliving.com.br>";

function configureResend() {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("EMAIL_FROM", sender);
}

// Como no ERP sem anúncio encontrado: getFlat resolve null.
beforeEach(() => getFlat.mockResolvedValue(null));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  getFlat.mockReset();
});

describe("conteúdo do e-mail de confirmação", () => {
  it("traz os dados da estadia e escapa o que vem do cadastro", () => {
    const email = bookingConfirmationEmail(booking, guest.name, {
      checkinTime: "14:00:00",
      checkoutTime: "11:00",
    });
    expect(email.subject).toBe("Reserva confirmada: Flat <Mar> & Sol");
    expect(email.html).toContain("Flat &lt;Mar&gt; &amp; Sol");
    expect(email.html).not.toContain("<Mar>");
    expect(email.text).toContain("Olá, Maria.");
    expect(email.text).toContain("a partir das 14:00");
    expect(email.text).toContain("até as 11:00");
    expect(email.text).toContain("3 noites · 2 hóspedes");
    expect(email.text).toMatch(/Total: R\$\s1\.250,50/);
    expect(email.text).toContain("/reserva-confirmada?id=123");
    expect(email.text).toContain("https://wa.me/");
  });

  it("sem os horários do anúncio, mostra só as datas", () => {
    const email = bookingConfirmationEmail(booking, "", null);
    expect(email.text).toContain("Olá!");
    expect(email.text).not.toContain("a partir das");
    expect(email.text).not.toContain("até as");
  });

  it("reserva ainda pendente não é anunciada como confirmada", () => {
    const email = bookingConfirmationEmail(
      { ...booking, status: "PENDING" },
      guest.name,
    );
    expect(email.subject).toBe("Recebemos sua reserva: Flat <Mar> & Sol");
    expect(email.text).not.toContain("confirmada.");
  });
});

describe("envio pelo Resend", () => {
  it("envia ao cliente com a reserva como chave de idempotência", async () => {
    configureResend();
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "contato@cespedesliving.com.br");
    getFlat.mockResolvedValue({ checkinTime: "14:00", checkoutTime: "11:00" });
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: "email-1" }));
    vi.stubGlobal("fetch", fetcher);

    expect(await sendBookingConfirmation(booking, guest)).toEqual({
      sent: true,
      id: "email-1",
    });
    expect(getFlat).toHaveBeenCalledWith("flat-mar");
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer re_test",
      "Idempotency-Key": "reserva-confirmada/123",
    });
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      from: sender,
      to: ["maria@example.com"],
      reply_to: "contato@cespedesliving.com.br",
      subject: "Reserva confirmada: Flat <Mar> & Sol",
    });
    expect(body.text).toContain("a partir das 14:00");
  });

  it("sem chave ou remetente configurado, não chama a API", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", sender);
    expect(await sendBookingConfirmation(booking, guest)).toEqual({
      sent: false,
      reason: "missing-api-key",
    });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "");
    expect(await sendBookingConfirmation(booking, guest)).toEqual({
      sent: false,
      reason: "missing-sender",
    });
    expect(fetcher).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("falha do ERP ou do Resend fica no log, sem lançar erro", async () => {
    configureResend();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    getFlat.mockRejectedValue(new Error("ERP fora do ar"));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ name: "application_error" }, { status: 500 }),
      ),
    );
    expect(await sendBookingConfirmation(booking, guest)).toEqual({
      sent: false,
      reason: "resend-error",
      status: 500,
    });

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await sendBookingConfirmation(booking, guest)).toEqual({
      sent: false,
      reason: "network-error",
    });
  });

  it("reenvio da mesma reserva (409 do Resend) não vira erro", async () => {
    configureResend();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ name: "invalid_idempotent_request" }, { status: 409 }),
        ),
    );
    expect(await sendBookingConfirmation(booking, guest)).toEqual({
      sent: false,
      reason: "duplicate",
      status: 409,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it("não envia para reserva cancelada, de demonstração ou e-mail inválido", async () => {
    configureResend();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(
      await sendBookingConfirmation({ ...booking, status: "CANCELLED" }, guest),
    ).toBeNull();
    expect(
      await sendBookingConfirmation({ ...booking, demo: true }, guest),
    ).toBeNull();
    expect(
      await sendBookingConfirmation(booking, { ...guest, email: "sem-arroba" }),
    ).toEqual({ sent: false, reason: "invalid-recipient" });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
