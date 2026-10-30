import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { ApiError, erpRequest } from "./erp";
import { safeNext } from "./auth-validation";
import type { SiteProfile } from "@/domain/types";
/**
 * Login e cadastro não servem a quem já entrou: segue para o destino pedido ou
 * para a própria área. Conta pendente ou sem sessão continua vendo o formulário.
 */
export async function redirectIfSignedIn(next?: string) {
  const profile = await siteProfile().catch(() => null);
  if (!profile) return;
  redirect(
    profile.role === "owner"
      ? "/painel-proprietario"
      : safeNext(next ?? null),
  );
}
export const sessionToken = cache(async () => {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user || !user.email_confirmed_at)
    throw new ApiError("Entre com uma conta com e-mail confirmado.", 401);
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
  return session.access_token;
});
export const siteProfile = cache(async () =>
  erpRequest<SiteProfile>("/site/me", undefined, await sessionToken()),
);
export async function requireProfile(role: SiteProfile["role"]) {
  let profile: SiteProfile;
  try {
    profile = await siteProfile();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      redirect(`/entrar?role=${role}`);
    if (error instanceof ApiError && [403, 409].includes(error.status))
      redirect("/cadastro-pendente");
    throw error;
  }
  if (profile.role !== role)
    redirect(
      profile.role === "owner" ? "/painel-proprietario" : "/minha-conta",
    );
  return profile;
}
