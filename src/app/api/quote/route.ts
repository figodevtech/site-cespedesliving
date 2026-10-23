import { NextResponse } from "next/server";
import { getQuote } from "@/services/availability";
import { unavailableWithoutLiveService } from "@/lib/live-service";
export async function POST(request: Request) {
  const unavailable = unavailableWithoutLiveService();
  if (unavailable) return unavailable;
  try {
    const body = await request.json();
    if (
      typeof body.flatId !== "string" ||
      typeof body.checkin !== "string" ||
      typeof body.checkout !== "string" ||
      typeof body.guests !== "number"
    )
      throw new Error("Informe datas e hóspedes válidos.");
    return NextResponse.json(
      await getQuote({
        flatId: body.flatId,
        checkin: body.checkin,
        checkout: body.checkout,
        guests: body.guests,
      }),
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Não foi possível consultar o período.",
      },
      { status: 400 },
    );
  }
}
