import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPhone } from "@/lib/contact";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("contato oficial", () => {
  it("número exibido e link do WhatsApp são o mesmo (83) 9 9803-3322", async () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_WHATSAPP", "5583998033322");
    vi.resetModules();
    const { contactLink, contactPhoneLabel } = await import("@/lib/contact");
    expect(contactPhoneLabel).toBe("(83) 9 9803-3322");
    expect(contactLink("Olá")?.href).toBe("https://wa.me/5583998033322?text=Ol%C3%A1");
  });

  it("sem a variável, usa o número oficial", async () => {
    delete process.env.NEXT_PUBLIC_CONTACT_WHATSAPP;
    vi.resetModules();
    const { contactPhoneLabel } = await import("@/lib/contact");
    expect(contactPhoneLabel).toBe("(83) 9 9803-3322");
  });

  it("formata celular e fixo com ou sem o 55", () => {
    expect(formatPhone("83998033322")).toBe("(83) 9 9803-3322");
    expect(formatPhone("558332223344")).toBe("(83) 3222-3344");
    expect(formatPhone("1234")).toBe("+1234");
  });
});
