import { createClient } from "@/lib/supabase/server";
/**
 * Estado de login para o cabeçalho, que não lê o cookie (httpOnly). Só valida o
 * token; a autorização de cada área continua nas próprias páginas, via ERP.
 */
export async function GET() {
  const noStore = { headers: { "Cache-Control": "private, no-store" } };
  try {
    const client = await createClient();
    const { data } = await client.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return Response.json({ signedIn: false }, noStore);
    const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
    const name = String(meta.nome ?? "").trim();
    return Response.json(
      {
        signedIn: true,
        firstName: name.split(/\s+/)[0] || null,
        // Proprietário só entra por convite do ERP; o resto é cliente.
        role: meta.origem === "CONVITE_ERP" ? "owner" : "guest",
      },
      noStore,
    );
  } catch {
    return Response.json({ signedIn: false }, noStore);
  }
}
