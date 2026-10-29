import "server-only";
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
