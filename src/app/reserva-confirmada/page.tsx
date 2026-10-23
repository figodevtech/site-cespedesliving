import type { Metadata } from "next";
import { PageHero, EmptyState } from "@/components/ui";
export const metadata: Metadata = {
  title: "Sua solicitação",
  description:
    "Consulte com o atendimento o andamento de sua solicitação de hospedagem.",
};
export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Sua solicitação"
        title="Acompanhe sua próxima estadia."
      />
      <div className="container section-sm">
        <EmptyState
          title="Fale com nosso atendimento"
          href="/contato"
          action="Consultar solicitação"
        >
          A confirmação da hospedagem é fornecida pela equipe após validar o
          período e as condições da reserva.
        </EmptyState>
      </div>
    </>
  );
}
