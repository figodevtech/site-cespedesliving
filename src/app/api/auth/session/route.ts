import { createClient } from "@/lib/supabase/server";
/**
 * Estado de login para o cabeçalho, que não lê o cookie (httpOnly). Confere a
 * conta no Supabase, e não só a assinatura do token: um token de conta excluída
 * ou bloqueada continua assinado até expirar e faria o cabeçalho mentir.
 * A autorização de cada área continua nas próprias páginas, via ERP.
 */
export async function GET() {
  const noStore = { headers: { "Cache-Control": "private, no-store" } };
  try {
    const client = await createClient();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user?.email_confirmed_at) {
      // Sessão de conta que não existe mais: limpa os cookies para não reaparecer.
      if (error) await client.auth.signOut({ scope: "local" }).catch(() => undefined);
      return Response.json({ signedIn: false }, noStore);
    }
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
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
