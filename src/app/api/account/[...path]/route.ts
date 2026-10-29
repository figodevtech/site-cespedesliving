import { apiError, ApiError, assertSameOrigin, erpRequest } from "@/lib/erp";
import { sessionToken } from "@/lib/site-session";
const routes: Record<string, string> = {
  profile: "/site/me",
  reservations: "/site/me/reservas",
  sync: "/site/me/sync",
};
async function handle(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    if (request.method !== "GET") assertSameOrigin(request);
    const path = (await params).path.join("/");
    const target = routes[path];
    if (
      !target ||
      (request.method === "PATCH" && path !== "profile") ||
      (request.method === "POST" && path !== "sync")
    )
      throw new ApiError("Operação não encontrada.", 404);
    const data = await erpRequest(
      target,
      {
        method: request.method,
        ...(request.method === "PATCH"
          ? { body: JSON.stringify(await request.json()) }
          : {}),
      },
      await sessionToken(),
    );
    return Response.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
export { handle as GET, handle as PATCH, handle as POST };
