import type { Metadata } from "next";
import { Favorites } from "@/components/account-pages";
import { PageHero } from "@/components/ui";
import { getFlats } from "@/services/flats";
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
