import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { syncProfile } from "@/lib/erp";
import { cookies } from "next/headers";
import { SIGNUP_NEXT_COOKIE, destinationFor } from "@/lib/auth-validation";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const client = await createClient();
  const hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  const result = code
    ? await client.auth.exchangeCodeForSession(code)
    : hash && ["email", "signup", "invite", "recovery"].includes(type ?? "")
      ? await client.auth.verifyOtp({
          token_hash: hash,
          type: type as EmailOtpType,
        })
      : null;
  let next = result ? "/entrar?error=link" : "/auth/complete";
  if (result && !result.error && result.data.session) {
    if (
      type === "invite" ||
      type === "recovery" ||
      url.searchParams.get("next") === "/definir-senha"
    )
      next = "/definir-senha";
    else {
      try {
        const profile = await syncProfile(result.data.session.access_token);
        next = destinationFor(
          profile.role,
          url.searchParams.get("next") ??
            (await cookies()).get(SIGNUP_NEXT_COOKIE)?.value ??
            null,
        );
      } catch {
        next = "/cadastro-pendente";
      }
    }
  }
  const response = NextResponse.redirect(new URL(next, url.origin));
  response.headers.set("Cache-Control", "private, no-store");
  if (result && !result.error) response.cookies.delete(SIGNUP_NEXT_COOKIE);
  return response;
}
