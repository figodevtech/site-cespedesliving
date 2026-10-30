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
      <PageHero eyebrow="Minha conta" title="Que bom ter você aqui." />
      <AuthForm
        mode="signin"
        role={p.role === "owner" ? "owner" : "guest"}
        next={safeNext(p.next ?? null)}
        linkError={Boolean(p.error)}
      />
    </>
  );
}
