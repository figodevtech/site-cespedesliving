import { NextResponse } from "next/server";
import { createOwnerLead } from "@/services/owners";
import { unavailableWithoutLiveService } from "@/lib/live-service";
export async function POST(request: Request) {
  const unavailable = unavailableWithoutLiveService();
  if (unavailable) return unavailable;
  try {
    const b = await request.json();
    for (const key of ["name", "email", "phone", "neighborhood", "message"])
      if (typeof b[key] !== "string" || b[key].length > 2000)
        throw new Error("Confira os campos do formulário.");
    return NextResponse.json(
      await createOwnerLead({
        name: b.name,
        email: b.email,
        phone: b.phone,
        neighborhood: b.neighborhood,
        message: b.message,
        website: String(b.website ?? ""),
      }),
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Não foi possível registrar o formulário.",
      },
      { status: 400 },
    );
  }
}
