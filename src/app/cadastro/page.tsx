import { AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/ui";
import { safeNext } from "@/lib/auth-validation";
import { redirectIfSignedIn } from "@/lib/site-session";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  await redirectIfSignedIn(p.next);
  return (
    <>
      <PageHero
        eyebrow="Cadastro"
        title="Seu próximo momento começa aqui."
        description="Crie sua conta de cliente e confirme o e-mail para reservar."
      />
      <AuthForm mode="signup" next={safeNext(p.next ?? null)} />
    </>
  );
}
