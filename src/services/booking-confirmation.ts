import "server-only";
import type { Booking, Flat, SiteProfile } from "@/domain/types";
import { formatDate, money, nightsBetween } from "@/domain/dates";
import { contactLink, contactPhoneLabel } from "@/lib/contact";
import { isEmail, sendEmail, type EmailResult } from "@/lib/email";
import { siteUrl } from "@/lib/site-url";
import { getFlat } from "./flats";

type StayTimes = Pick<Flat, "checkinTime" | "checkoutTime">;

const NAVY = "#0f2d3d";
const GOLD = "#c9a96a";
const GOLD_DARK = "#a98245";
const INK = "#1a2830";
const MUTED = "#58636b";
const LINE = "#e4e7e6";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
/** "14:00:00" do ERP vira "14:00"; valor fora do formato não aparece. */
const hour = (value?: string) =>
  value && /^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : null;
const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/** Assunto, HTML e texto do e-mail que o cliente recebe ao reservar pelo site. */
export function bookingConfirmationEmail(
  booking: Booking,
  guestName: string,
  times?: StayTimes | null,
) {
  const confirmed = booking.status === "CONFIRMED";
  const firstName = guestName.trim().split(/\s+/)[0] ?? "";
  const checkinTime = hour(times?.checkinTime);
  const checkoutTime = hour(times?.checkoutTime);
  const link = `${siteUrl.replace(/\/$/, "")}/reserva-confirmada?id=${encodeURIComponent(booking.id)}`;
  const contact = contactLink(
    `Olá! Tenho uma dúvida sobre a reserva ${booking.id} (${booking.flatTitle}).`,
  );
  const whatsapp = contact?.href.startsWith("https://wa.me/")
    ? contact.href
    : null;

  const subject = `${confirmed ? "Reserva confirmada" : "Recebemos sua reserva"}: ${booking.flatTitle}`;
  const title = confirmed
    ? "Sua reserva está confirmada"
    : "Recebemos sua reserva";
  const greeting = firstName ? `Olá, ${firstName}.` : "Olá!";
  const intro = confirmed
    ? "As datas abaixo já estão reservadas para você."
    : "A equipe vai confirmar a disponibilidade e retorna em breve.";
  const payment =
    "O pagamento é combinado com o atendimento. Para alterar ou cancelar, fale com a equipe.";
  const rows: [string, string][] = [
    ["Imóvel", booking.flatTitle],
    ["Código da reserva", booking.id],
    [
      "Entrada",
      `${formatDate(booking.checkin)}${checkinTime ? `, a partir das ${checkinTime}` : ""}`,
    ],
    [
      "Saída",
      `${formatDate(booking.checkout)}${checkoutTime ? `, até as ${checkoutTime}` : ""}`,
    ],
    [
      "Estadia",
      `${plural(nightsBetween(booking.checkin, booking.checkout), "noite", "noites")} · ${plural(booking.guests, "hóspede", "hóspedes")}`,
    ],
    ["Total", money(booking.total)],
  ];

  const text = [
    `${greeting} ${title}.`,
    intro,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    payment,
    `Ver minha reserva: ${link}`,
    ...(whatsapp
      ? [`Dúvidas? WhatsApp ${contactPhoneLabel}: ${whatsapp}`]
      : []),
    "",
    "Cespedes Living Hospedagens · João Pessoa/PB",
  ].join("\n");

  const cell = `padding:10px 0;border-bottom:1px solid ${LINE};`;
  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:${INK};">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(`${booking.flatTitle} · ${formatDate(booking.checkin)} a ${formatDate(booking.checkout)}`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:${NAVY};padding:22px 28px;color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:2px;">CESPEDES LIVING<div style="margin-top:4px;font-size:11px;font-weight:normal;letter-spacing:3px;color:${GOLD};">HOSPEDAGENS</div></td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 6px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${GOLD_DARK};">Reserva ${escapeHtml(booking.id)}</p>
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${NAVY};">${escapeHtml(title)}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${escapeHtml(greeting)} ${escapeHtml(intro)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};">
${rows.map(([label, value]) => `<tr><td style="${cell}font-size:13px;color:${MUTED};">${escapeHtml(label)}</td><td style="${cell}font-size:14px;font-weight:bold;text-align:right;">${escapeHtml(value)}</td></tr>`).join("\n")}
</table>
<p style="margin:20px 0;font-size:14px;line-height:1.6;color:${MUTED};">${escapeHtml(payment)}</p>
<a href="${escapeHtml(link)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:${NAVY};color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Ver minha reserva</a>
${whatsapp ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.6;">Dúvidas? Fale com a equipe pelo WhatsApp <a href="${escapeHtml(whatsapp)}" style="color:${GOLD_DARK};font-weight:bold;">${escapeHtml(contactPhoneLabel)}</a>.</p>` : ""}
</td></tr>
<tr><td style="padding:18px 28px;background:#f8f6f1;font-size:12px;line-height:1.5;color:${MUTED};">Cespedes Living Hospedagens · João Pessoa/PB<br>Você recebeu este e-mail porque fez uma reserva com a sua conta no site.</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}

/**
 * Confirmação por e-mail ao cliente, depois que o ERP registrou a reserva. Chamada com after():
 * falha aqui não desfaz nem atrasa a reserva, só fica no log. Repetir o envio da mesma reserva
 * (o cliente reenviou o formulário) não duplica o e-mail: a chave de idempotência é a reserva.
 */
export async function sendBookingConfirmation(
  booking: Booking,
  guest: Pick<SiteProfile, "name" | "email">,
): Promise<EmailResult | null> {
  if (booking.demo || !["CONFIRMED", "PENDING"].includes(booking.status))
    return null;
  try {
    // Horários de entrada e saída vêm do anúncio; sem ele, o e-mail sai sem os horários.
    const flat = booking.slug
      ? await getFlat(booking.slug).catch(() => null)
      : null;
    const replyTo = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
    const result = await sendEmail({
      to: guest.email,
      ...bookingConfirmationEmail(booking, guest.name, flat),
      idempotencyKey: `reserva-confirmada/${booking.id}`,
      ...(isEmail(replyTo) ? { replyTo } : {}),
    });
    if (!result.sent && result.reason !== "duplicate")
      console.warn(
        `[reserva] Confirmação da reserva ${booking.id} não enviada por e-mail:`,
        result.reason,
      );
    return result;
  } catch (error) {
    console.error(
      `[reserva] Falha ao preparar o e-mail da reserva ${booking.id}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
