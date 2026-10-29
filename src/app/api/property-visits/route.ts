import { assertSameOrigin, apiError, erpRequest } from "@/lib/erp";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const data = await erpRequest("/public/visitas", {
      method: "POST",
      body: JSON.stringify(await request.json()),
    });
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
