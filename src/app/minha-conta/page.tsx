import type { Metadata } from "next";
import { AccessState } from "@/components/access-state";
import { PageHero } from "@/components/ui";
export const metadata: Metadata = {
  title: "Minha conta",
  description: "Informações sobre suas hospedagens na Cespedes Living.",
};
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Minha conta" title="Seu espaço para bons momentos." />
      <AccessState />
    </>
  );
}
