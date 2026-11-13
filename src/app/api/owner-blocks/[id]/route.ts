import { apiError, ApiError, assertSameOrigin, erpRequest } from "@/lib/erp";
import { sessionToken, siteProfile } from "@/lib/site-session";

/** Altera as datas ou exclui uma reserva de uso próprio (só as do próprio proprietário, no ERP). */
async function handle(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if ((await siteProfile()).role !== "owner") throw new ApiError("Acesso restrito ao proprietário.", 403);
    const { id } = await params;
    if (!/^\d{1,18}$/.test(id)) throw new ApiError("Reserva de uso próprio não encontrada.", 404);
    const body =
      request.method === "PATCH" ? ((await request.json().catch(() => null)) as Record<string, unknown> | null) : null;
    const data = await erpRequest(
      `/site/proprietario/bloqueios/${id}`,
      { method: request.method, ...(body ? { body: JSON.stringify({ inicio: body.inicio, ultimo: body.ultimo }) } : {}) },
      await sessionToken(),
    );
    return Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
export { handle as PATCH, handle as DELETE };
