const rawPhone = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "5583998033322";
const phone = rawPhone.replace(/\D/g, "");
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
/**
 * Número exibido, tirado do mesmo valor do link do WhatsApp para os dois nunca divergirem:
 * "5583998033322" → "(83) 9 9803-3322".
 */
export function formatPhone(digits: string): string {
  const local =
    digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  const mobile = /^(\d{2})(9)(\d{4})(\d{4})$/.exec(local);
  if (mobile) return `(${mobile[1]}) ${mobile[2]} ${mobile[3]}-${mobile[4]}`;
  const landline = /^(\d{2})(\d{4})(\d{4})$/.exec(local);
  if (landline) return `(${landline[1]}) ${landline[2]}-${landline[3]}`;
  return `+${digits}`;
}
export const contactPhoneLabel = formatPhone(phone);
export function contactLink(
  message: string,
): { href: string; label: string } | null {
  if (/^\d{10,15}$/.test(phone))
    return {
      href: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      label: "Continuar no WhatsApp",
    };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return {
      href: `mailto:${email}?subject=${encodeURIComponent("Contato — Cespedes Living")}&body=${encodeURIComponent(message)}`,
      label: "Continuar por e-mail",
    };
  return null;
}
