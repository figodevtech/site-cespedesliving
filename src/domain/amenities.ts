/**
 * Chave de comparação de comodidades: "Wi-Fi", "wi-fi " e "WI-FI" são a mesma.
 * Mesma regra do ERP (filtro da API pública e formulário do imóvel).
 */
export function amenityKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
    .replace(/\s+/g, " ");
}

/** "Wi-Fi", "Wifi", "Wi-Fi de alta velocidade"... */
export function hasWifi(amenities: string[]) {
  return amenities.some((a) => /^wi-?\s?fi\b/.test(amenityKey(a)));
}

export type AmenityOption = { name: string; count: number };
