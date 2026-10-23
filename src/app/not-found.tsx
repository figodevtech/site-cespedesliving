import { PageHero, EmptyState } from "@/components/ui";
export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="404" title="Este caminho não leva ao mar." />
      <div className="container section-sm">
        <EmptyState
          title="Página não encontrada"
          href="/"
          action="Voltar ao início"
        >
          O endereço pode ter mudado. Explore nossos flats ou retorne à página
          inicial.
        </EmptyState>
      </div>
    </>
  );
}
