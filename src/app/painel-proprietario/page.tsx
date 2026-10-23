import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { AccessState } from "@/components/access-state";
export const metadata: Metadata = {
  title: "Área do proprietário",
  description: "Acompanhe a gestão do seu imóvel com a Cespedes Living.",
};
export default async function Page() {
  return (
    <>
      <PageHero
        eyebrow="Área do proprietário"
        title="Seu patrimônio, de perto."
        description="Acompanhamento próximo e atenção ao seu patrimônio."
      />
      <AccessState owner />
    </>
  );
}
