import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    { error: "O acesso à conta ainda não está disponível." },
    { status: 503 },
  );
}
