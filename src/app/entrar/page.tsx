import type { Metadata } from "next";
import { AccessState } from "@/components/access-state";
import { PageHero } from "@/components/ui";
export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta na Cespedes Living.",
};
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Minha conta" title="Que bom ter você aqui." />
      <AccessState />
    </>
  );
}
