import { describe, expect, it } from "vitest";
import { amenityKey, hasWifi } from "@/domain/amenities";

describe("comodidades", () => {
  it("compara sem diferenciar maiúsculas, acentos e espaços", () => {
    expect(amenityKey("  Espaço   de Trabalho ")).toBe(amenityKey("espaco de trabalho"));
    expect(amenityKey("Água quente")).toBe("agua quente");
    expect(amenityKey("Wi-Fi")).not.toBe(amenityKey("Wi-Fi de alta velocidade"));
  });

  it("reconhece as variações de Wi-Fi cadastradas no ERP", () => {
    expect(hasWifi(["Wi-Fi"])).toBe(true);
    expect(hasWifi(["Wi-Fi de alta velocidade"])).toBe(true);
    expect(hasWifi(["wifi"])).toBe(true);
    expect(hasWifi(["WI FI"])).toBe(true);
    expect(hasWifi(["Piscina", "Varanda"])).toBe(false);
  });
});
