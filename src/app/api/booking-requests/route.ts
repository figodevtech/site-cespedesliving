import { createReservation } from "@/services/reservations";
import { assertSameOrigin, apiError, ApiError } from "@/lib/erp";
import { siteProfile } from "@/lib/site-session";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const profile = await siteProfile();
    if (profile.role !== "guest")
      throw new ApiError("Entre com sua conta de cliente para reservar.", 403);
    const b = await request.json();
    if (
      typeof b.flatId !== "string" ||
      typeof b.checkin !== "string" ||
      typeof b.checkout !== "string" ||
      !Number.isInteger(b.guests) ||
      b.acceptedTerms !== true ||
      typeof b.quoteId !== "string" ||
      !Number.isFinite(b.expectedTotal) ||
      typeof b.idempotencyKey !== "string"
    )
      throw new ApiError("Confira os dados e atualize a cotação.", 400);
    return Response.json(
      await createReservation({
        flatId: b.flatId,
        checkin: b.checkin,
        checkout: b.checkout,
        guests: b.guests,
        acceptedTerms: true,
        quoteId: b.quoteId,
        expectedTotal: b.expectedTotal,
        idempotencyKey: b.idempotencyKey,
      }),
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
