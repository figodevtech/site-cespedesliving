import { AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/ui";
import { sessionToken } from "@/lib/site-session";
import { redirect } from "next/navigation";
export default async function Page() {
  try {
    await sessionToken();
  } catch {
    redirect("/entrar?error=link");
  }
  return (
    <>
      <PageHero eyebrow="Ativação" title="Defina sua senha de acesso." />
      <AuthForm mode="password" />
    </>
  );
}
