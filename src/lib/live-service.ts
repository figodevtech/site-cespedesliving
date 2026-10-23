import "server-only";
import { NextResponse } from "next/server";
import { isMock } from "@/services/adapter";
export function unavailableWithoutLiveService() {
  return isMock()
    ? NextResponse.json(
        {
          error:
            "O serviço online ainda não está disponível. Entre em contato com o atendimento.",
        },
        { status: 503 },
      )
    : null;
}
