import { SignOut } from "@/components/auth-form";
import Link from "next/link";
import { PageHero } from "@/components/ui";
export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Cadastro"
        title="Seu cadastro precisa de uma conferência."
      />
      <div className="container section-sm">
        <div className="dashboard-panel">
          <p>
            Entre em contato com a equipe para concluir a vinculação do seu
            cadastro. Seus dados serão conferidos no ERP antes da liberação de
            acesso.
          </p>
          <p>
            <Link href="/contato">Falar com a equipe</Link>
          </p>
          <SignOut />
        </div>
      </div>
    </>
  );
}
