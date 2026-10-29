import { createClient } from "@/lib/supabase/server";
import { apiError, assertSameOrigin, ApiError, erpRequest } from "@/lib/erp";
import { cookies } from "next/headers";
import {
  SIGNUP_NEXT_COOKIE,
  safeNext,
  validateRegistration,
} from "@/lib/auth-validation";
import type { SiteProfile } from "@/domain/types";
const noStore = { headers: { "Cache-Control": "private, no-store" } };
/** O Supabase limita os envios de e-mail (1 por minuto por endereço e um teto por hora). */
function rateLimited(error: { status?: number; code?: string }) {
  return (
    error.status === 429 ||
    error.code === "over_email_send_rate_limit" ||
    error.code === "over_request_rate_limit"
  );
}
/**
 * Destino depois da confirmação (ex.: a reserva em andamento). Cookie em vez de
 * query no link: a lista de redirecionamentos do Supabase pode não aceitar query.
 */
async function rememberNext(value: unknown, origin: string) {
  const next = safeNext(typeof value === "string" ? value : null);
  if (next === "/minha-conta") return;
  (await cookies()).set(SIGNUP_NEXT_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    assertSameOrigin(request);
    const { action } = await params;
    const body = await request.json();
    const client = await createClient();
    const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url)
      .origin;
    if (action === "signup") {
      const input = validateRegistration(body);
      const { error, data } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            nome: input.name,
            telefone: input.phone,
            cpf: input.cpf,
            origem: "SITE",
          },
          emailRedirectTo: `${origin}/auth/confirm`,
        },
      });
      if (error) {
        if (rateLimited(error))
          throw new ApiError(
            "Muitos e-mails de confirmação enviados agora. Aguarde alguns minutos e tente novamente.",
            429,
          );
        console.warn("[auth] cadastro recusado:", error.status, error.code, error.message);
        throw new ApiError(
          "Não foi possível criar o cadastro. Confira os dados ou tente recuperar seu acesso.",
          400,
        );
      }
      // Confirmation is mandatory; never grant access from the signup response.
      if (data.session) await client.auth.signOut();
      await rememberNext(body.next, origin);
      return Response.json(
        {
          message:
            "Confira seu e-mail para confirmar o cadastro. Caso já tenha conta, entre ou recupere sua senha.",
          resend: true,
        },
        noStore,
      );
    }
    if (action === "resend") {
      const email = String(body.email ?? "")
        .trim()
        .toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
        throw new ApiError("Informe um e-mail válido.", 400);
      const { error } = await client.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${origin}/auth/confirm` },
      });
      if (error && rateLimited(error))
        throw new ApiError(
          "Aguarde um minuto antes de pedir outro e-mail de confirmação.",
          429,
        );
      // Mesma resposta com ou sem conta pendente: o site não confirma quem é cliente.
      // O log guarda a causa real (ex.: SMTP do Supabase mal configurado).
      if (error) console.warn("[auth] reenvio de confirmação:", error.status, error.code, error.message);
      await rememberNext(body.next, origin);
      return Response.json(
        {
          message:
            "Se houver um cadastro aguardando confirmação para esse e-mail, enviamos um novo link. Confira também a caixa de spam.",
          resend: true,
        },
        noStore,
      );
    }
    if (action === "signin") {
      const { data, error } = await client.auth.signInWithPassword({
        email: String(body.email ?? "")
          .trim()
          .toLowerCase(),
        password: String(body.password ?? ""),
      });
      // Só chega aqui com a senha certa: dizer que falta confirmar não expõe a conta.
      if (error?.code === "email_not_confirmed")
        throw new ApiError(
          "Seu e-mail ainda não foi confirmado. Abra o link que enviamos ou peça um novo abaixo.",
          403,
          "EMAIL_NAO_CONFIRMADO",
        );
      if (error || !data.user.email_confirmed_at)
        throw new ApiError(
          "E-mail ou senha inválidos, ou e-mail ainda não confirmado.",
          401,
        );
      try {
        if (body.role !== "owner")
          await erpRequest(
            "/site/me/sync",
            { method: "POST" },
            data.session.access_token,
          );
        const profile = await erpRequest<SiteProfile>(
          "/site/me",
          undefined,
          data.session.access_token,
        );
        const expectedRole = body.role === "owner" ? "owner" : "guest";
        if (profile.role !== expectedRole) {
          await client.auth.signOut();
          throw new ApiError(
            "Use o acesso correspondente à sua conta. Contas de cliente e proprietário são separadas.",
            403,
          );
        }
        return Response.json(
          {
            next:
              profile.role === "owner"
                ? "/painel-proprietario"
                : safeNext(body.next ?? null),
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 409)
          return Response.json({ next: "/cadastro-pendente" });
        throw error;
      }
    }
    if (action === "activate") {
      if (
        typeof body.accessToken !== "string" ||
        typeof body.refreshToken !== "string"
      )
        throw new ApiError("Link de ativação inválido.", 400);
      const { error } = await client.auth.setSession({
        access_token: body.accessToken,
        refresh_token: body.refreshToken,
      });
      const {
        data: { user },
      } = await client.auth.getUser();
      if (error || !user?.email_confirmed_at) {
        await client.auth.signOut();
        throw new ApiError("Link de ativação inválido ou expirado.", 401);
      }
      if (body.type === "invite" || body.type === "recovery")
        return Response.json(
          { next: "/definir-senha" },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      try {
        await erpRequest("/site/me/sync", { method: "POST" }, body.accessToken);
        const profile = await erpRequest<SiteProfile>(
          "/site/me",
          undefined,
          body.accessToken,
        );
        const store = await cookies();
        const pending = store.get(SIGNUP_NEXT_COOKIE)?.value ?? null;
        store.delete(SIGNUP_NEXT_COOKIE);
        return Response.json(
          {
            next:
              profile.role === "owner"
                ? "/painel-proprietario"
                : safeNext(pending),
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      } catch {
        return Response.json({ next: "/cadastro-pendente" });
      }
    }
    if (action === "recovery") {
      await client.auth.resetPasswordForEmail(
        String(body.email ?? "")
          .trim()
          .toLowerCase(),
        { redirectTo: `${origin}/auth/confirm?next=/definir-senha` },
      );
      return Response.json({
        message:
          "Se houver uma conta com esse e-mail, enviaremos as instruções para recuperar seu acesso.",
      });
    }
    if (action === "password") {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user?.email_confirmed_at)
        throw new ApiError(
          "Abra o link de ativação ou recuperação enviado ao seu e-mail.",
          401,
        );
      const password = String(body.password ?? "");
      if (password.length < 8 || password.length > 128)
        throw new ApiError("A senha deve ter entre 8 e 128 caracteres.", 400);
      const { error } = await client.auth.updateUser({ password });
      if (error)
        throw new ApiError(
          "Não foi possível definir a senha. Solicite um novo link.",
          400,
        );
      await client.auth.signOut();
      return Response.json({
        next: "/entrar",
        message: "Senha definida. Entre na área correspondente à sua conta.",
      });
    }
    if (action === "signout") {
      await client.auth.signOut();
      return Response.json({ next: "/entrar" });
    }
    throw new ApiError("Operação não encontrada.", 404);
  } catch (error) {
    return apiError(error);
  }
}
