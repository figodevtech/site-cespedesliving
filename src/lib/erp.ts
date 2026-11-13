import "server-only";
import { headers } from "next/headers";
import type { SiteProfile } from "@/domain/types";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
export async function erpRequest<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const base = process.env.ERP_API_BASE_URL;
  if (!base)
    throw new ApiError(
      "A integração está indisponível. Tente novamente mais tarde.",
      503,
    );
  const response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(await visitorHeaders()),
      ...init?.headers,
    },
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      typeof body.error === "string"
        ? body.error
        : (body.error?.message ?? "Não foi possível concluir a operação."),
      response.status,
      body.code,
    );
  return body as T;
}
/**
 * Sincroniza e devolve o perfil da conta (cliente ou proprietário). O papel vem
 * do cadastro no ERP (site_usuario), nunca de algo que o visitante informe.
 */
export function syncProfile(token: string) {
  return erpRequest<SiteProfile>("/site/me/sync", { method: "POST" }, token);
}
/**
 * Quem chama o ERP é este servidor, então para o ERP todo visitante teria o mesmo IP e o limite de
 * consultas valeria para o site inteiro. Repassa o IP do visitante com o segredo compartilhado
 * (ERP_API_SECRET aqui = SITE_API_SECRET no ERP); sem segredo, não envia nada.
 */
async function visitorHeaders(): Promise<Record<string, string>> {
  const secret = process.env.ERP_API_SECRET;
  if (!secret) return {};
  try {
    const incoming = await headers();
    const ip =
      incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      incoming.get("x-real-ip")?.trim();
    return ip ? { "x-site-secret": secret, "x-site-client-ip": ip } : {};
  } catch {
    // Fora de uma requisição (build, tarefa agendada): sem visitante a repassar.
    return {};
  }
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url)
    .origin;
  if (origin && origin !== expected && origin !== new URL(request.url).origin)
    throw new ApiError("Origem não permitida.", 403);
}
export function apiError(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação.",
      ...(error instanceof ApiError && error.code ? { code: error.code } : {}),
    },
    {
      status: error instanceof ApiError ? error.status : 400,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
