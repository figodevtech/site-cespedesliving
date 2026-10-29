import { AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/ui";
import { safeNext } from "@/lib/auth-validation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
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
