import { apiError, ApiError, assertSameOrigin, erpRequest } from "@/lib/erp";
import { sessionToken, siteProfile } from "@/lib/site-session";

/**
 * Reserva de uso próprio do proprietário: cria o bloqueio no ERP. O ERP confere de novo
 * dono do imóvel, datas e conflitos; aqui só repassa com a sessão de quem está logado.
 */
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if ((await siteProfile()).role !== "owner") throw new ApiError("Acesso restrito ao proprietário.", 403);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const data = await erpRequest(
      "/site/proprietario/bloqueios",
      { method: "POST", body: JSON.stringify({ imovelId: body?.imovelId, inicio: body?.inicio, ultimo: body?.ultimo }) },
      await sessionToken(),
    );
    return Response.json(data, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
