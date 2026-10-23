import type { Metadata } from "next";
import { AccessState } from "@/components/access-state";
import { PageHero } from "@/components/ui";
export const metadata: Metadata = {
  title: "Cadastro",
  description: "Seu próximo momento começa na Cespedes Living.",
};
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Cadastro" title="Seu próximo momento começa aqui." />
      <AccessState />
    </>
  );
}
