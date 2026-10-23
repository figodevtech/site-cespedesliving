import { NextResponse } from "next/server";
import { createReservation } from "@/services/reservations";
import { unavailableWithoutLiveService } from "@/lib/live-service";
export async function POST(request: Request) {
  const unavailable = unavailableWithoutLiveService();
  if (unavailable) return unavailable;
  try {
    const b = await request.json();
    if (
      typeof b.flatId !== "string" ||
      typeof b.checkin !== "string" ||
      typeof b.checkout !== "string" ||
      typeof b.guests !== "number" ||
      typeof b.guest?.name !== "string" ||
      typeof b.guest?.email !== "string" ||
      typeof b.guest?.phone !== "string" ||
      b.guest.name.length > 120 ||
      b.guest.email.length > 254 ||
      b.guest.phone.length > 30
    )
      throw new Error("Confira os dados da solicitação.");
    const input = {
      flatId: b.flatId,
      checkin: b.checkin,
      checkout: b.checkout,
      guests: b.guests,
      guest: {
        name: b.guest.name.trim(),
        email: b.guest.email.trim(),
        phone: b.guest.phone.trim(),
      },
      acceptedTerms: b.acceptedTerms === true,
    };
    return NextResponse.json(await createReservation(input), { status: 201 });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Não foi possível registrar a solicitação.",
      },
      { status: 400 },
    );
  }
}
