import { apiError, erpRequest, ApiError } from "@/lib/erp";
import { sessionToken, siteProfile } from "@/lib/site-session";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if ((await siteProfile()).role !== "owner")
      throw new ApiError("Acesso restrito ao proprietário.", 403);
    const { id } = await params;
    const data = await erpRequest<{ url: string }>(
      `/site/arquivos/${encodeURIComponent(id)}`,
      undefined,
      await sessionToken(),
    );
    const target = new URL(data.url);
    if (target.protocol !== "https:")
      throw new ApiError("Arquivo indisponível.", 503);
    return new Response(null, {
      status: 303,
      headers: { Location: target.href, "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
