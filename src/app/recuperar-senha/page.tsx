import { AuthForm } from "@/components/auth-form";
import { PageHero } from "@/components/ui";
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Recuperação" title="Recupere seu acesso." />
      <AuthForm mode="recovery" />
    </>
  );
}
