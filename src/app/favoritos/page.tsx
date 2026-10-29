import type { Metadata } from "next";
import { Favorites } from "@/components/account-pages";
import { PageHero } from "@/components/ui";
import { getFlats } from "@/services/flats";
// Lista de flats vem do ERP a cada visita, como na home; pré-renderizar no build
// travaria o deploy sempre que o ERP estivesse fora do ar ou sem endereço configurado.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Favoritos",
  description: "Reúna seus flats favoritos e planeje a próxima estadia.",
};
export default async function Page() {
  return (
    <>
      <PageHero
        eyebrow="Favoritos"
        title="Lugares para guardar."
        description="Suas escolhas, reunidas para quando chegar a hora da próxima viagem."
      />
      <Favorites flats={await getFlats()} />
    </>
  );
}
