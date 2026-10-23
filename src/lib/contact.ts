const rawPhone = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "5583999123337";
const phone = rawPhone.replace(/\D/g, "");
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
export const contactPhoneLabel = "+55 (83) 99912-3337";
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
      href: `mailto:${email}?subject=${encodeURIComponent("Contato — Céspedes Living")}&body=${encodeURIComponent(message)}`,
      label: "Continuar por e-mail",
    };
  return null;
}
