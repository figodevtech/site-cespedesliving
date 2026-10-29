import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const siteCookieOptions = {
  name: "sb-cespedes-site-auth",
  path: "/",
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: siteCookieOptions,
      cookies: {
        getAll: () => store.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              store.set(name, value, { ...options, httpOnly: true }),
            );
          } catch {
            /* Server Components rely on proxy refresh to persist cookies. */
          }
        },
      },
    },
  );
}
