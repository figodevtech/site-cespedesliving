import { describe, expect, it } from "vitest";
import {
  safeNext,
  validCpf,
  validateRegistration,
} from "@/lib/auth-validation";
describe("site identity boundaries", () => {
  it("validates CPF check digits instead of accepting repeated or malformed identifiers", () => {
    expect(validCpf("529.982.247-25")).toBe(true);
    expect(validCpf("111.111.111-11")).toBe(false);
    expect(validCpf("52998224724")).toBe(false);
  });
  it("normalizes required signup data and omits untrusted authorization fields", () => {
    const result = validateRegistration({
      name: " Cliente Teste ",
      email: " CLIENTE@EXAMPLE.COM ",
      phone: "(83) 99999-9999",
      cpf: "529.982.247-25",
      password: "SenhaSomenteTeste",
      acceptedTerms: true,
      role: "owner",
      perfilid: 1,
    });
    expect(result).toEqual({
      name: "Cliente Teste",
      email: "cliente@example.com",
      phone: "83999999999",
      cpf: "52998224725",
      password: "SenhaSomenteTeste",
    });
    expect(() =>
      validateRegistration({ ...result, acceptedTerms: false }),
    ).toThrow();
  });
  it("keeps authentication redirects on the local site", () => {
    for (const next of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/\r\nevil",
    ])
      expect(safeNext(next)).toBe("/minha-conta");
    expect(safeNext("/reservar/studio?checkin=2090-01-01")).toBe(
      "/reservar/studio?checkin=2090-01-01",
    );
  });
});
