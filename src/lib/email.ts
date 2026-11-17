import "server-only";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Mesma chave, mesmo e-mail: o Resend descarta a repetição por 24 horas. */
  idempotencyKey?: string;
  replyTo?: string;
};

export type EmailResult =
  | { sent: true; id?: string }
  | {
      sent: false;
      reason:
        | "missing-api-key"
        | "missing-sender"
        | "invalid-recipient"
        | "duplicate"
        | "resend-error"
        | "network-error";
      status?: number;
    };

export const isEmail = (value: string | undefined | null): value is string =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/**
 * Envio pelo Resend com RESEND_API_KEY e EMAIL_FROM ("Nome <endereco@dominio-verificado>"),
 * só no servidor. Sem configuração não envia; falha vira resultado e log, nunca exceção.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey) return { sent: false, reason: "missing-api-key" };
  if (!from) return { sent: false, reason: "missing-sender" };
  if (!isEmail(message.to)) return { sent: false, reason: "invalid-recipient" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(message.idempotencyKey
          ? { "Idempotency-Key": message.idempotencyKey }
          : {}),
      },
      body: JSON.stringify({
        from,
        to: [message.to.trim()],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.json().catch(() => ({}));
    if (response.ok) return { sent: true, id: body?.id };
    // Mesma chave de idempotência: este e-mail já saiu (ou está saindo) em outra requisição.
    if (response.status === 409)
      return { sent: false, reason: "duplicate", status: 409 };
    console.error(
      "[email] O Resend recusou o envio:",
      response.status,
      body?.name ?? "",
      body?.message ?? "",
    );
    return { sent: false, reason: "resend-error", status: response.status };
  } catch (error) {
    console.error(
      "[email] Não foi possível falar com o Resend:",
      error instanceof Error ? error.message : error,
    );
    return { sent: false, reason: "network-error" };
  }
}
