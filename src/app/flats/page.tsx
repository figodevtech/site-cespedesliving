import type { Metadata } from "next";
import Link from "next/link";
import { getFlats } from "@/services/flats";
import { PageHero, EmptyState } from "@/components/ui";
import { FlatCard } from "@/components/flat-card";
import { SearchForm } from "@/components/search-form";
import { validateStay } from "@/domain/dates";
import type { Filters } from "@/domain/types";
import { isMock } from "@/services/adapter";
export const metadata: Metadata = {
  title: "Nossos flats",
  description:
    "Explore flats em Tambaú, Manaíra, Cabo Branco e região. Encontre o espaço para sua próxima estadia.",
};
export default async function FlatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params: Record<string, string> = {};
  Object.entries(raw).forEach(([k, v]) => {
    if (typeof v === "string") params[k] = v;
  });
  let error = "";
  let flats: Awaited<ReturnType<typeof getFlats>> = [];
  try {
    const guests = params.guests ? Number(params.guests) : 1;
    if (!Number.isInteger(guests) || guests < 1 || guests > 4)
      throw new Error("Selecione de 1 a 4 hóspedes.");
    if (params.checkin || params.checkout)
      validateStay(params.checkin, params.checkout, guests, 4);
    const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
    const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
    if (
      (minPrice !== undefined &&
        (!Number.isFinite(minPrice) || minPrice < 0)) ||
      (maxPrice !== undefined &&
        (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
      (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
    )
      throw new Error(
        "Confira a faixa de preço. O mínimo deve ser menor que o máximo.",
      );
    const filters: Filters = {
      neighborhood: params.neighborhood,
      guests,
      checkin: isMock() ? undefined : params.checkin,
      checkout: isMock() ? undefined : params.checkout,
      minPrice: isMock() ? undefined : minPrice,
      maxPrice: isMock() ? undefined : maxPrice,
      amenities: params.amenity ? [params.amenity] : [],
      sort:
        isMock() && params.sort?.startsWith("price-") ? undefined : params.sort,
    };
    flats = await getFlats(filters);
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Não foi possível carregar o catálogo.";
  }
  const labels: Record<string, string> = {
    neighborhood: "Bairro",
    guests: "Hóspedes",
    checkin: "Entrada",
    checkout: "Saída",
    minPrice: "Diária mínima",
    maxPrice: "Diária máxima",
    amenity: "Facilidade",
  };
  const stayQuery = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([key]) =>
        ["checkin", "checkout", "guests"].includes(key),
      ),
    ),
  ).toString();
  return (
    <>
      <PageHero
        eyebrow="Nossos flats"
        title="Seu próximo lugar favorito."
        description="Conforto para ficar. Liberdade para viver João Pessoa e região."
      />
      <section className="section-sm">
        <div className="container">
          <SearchForm
            key={JSON.stringify(params)}
            compact
            initial={params}
            showPrices={!isMock()}
          />
          <div className="catalog-bar">
            <div className="chips">
              {Object.entries(params)
                .filter(([k, v]) => labels[k] && v)
                .map(([k, v]) => {
                  const next = new URLSearchParams(params);
                  next.delete(k);
                  return (
                    <Link
                      className="chip active"
                      key={k}
                      href={`/flats?${next}`}
                      aria-label={`Remover filtro ${labels[k]}: ${v}`}
                    >
                      {labels[k]}: {v} ×
                    </Link>
                  );
                })}
            </div>
            {Object.keys(params).length > 0 && (
              <Link href="/flats" className="text-link">
                Limpar filtros
              </Link>
            )}
          </div>
          {error ? (
            <div className="notice form-error" role="alert">
              {error} <Link href="/flats">Recomeçar busca</Link>
            </div>
          ) : (
            <>
              <p className="results-count" aria-live="polite">
                {flats.length} flat{flats.length !== 1 ? "s" : ""} encontrado
                {flats.length !== 1 ? "s" : ""}
              </p>
              {flats.length ? (
                <div className="card-grid">
                  {flats.map((f) => (
                    <FlatCard
                      flat={f}
                      key={f.id}
                      stayQuery={stayQuery}
                      showPrices={!isMock()}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Vamos encontrar outro momento?"
                  href="/flats"
                  action="Limpar filtros"
                >
                  Nenhum flat atende a esta combinação. Experimente outras
                  datas, região ou número de hóspedes.
                </EmptyState>
              )}
            </>
          )}
          <p className="image-disclosure">
            Confirme disponibilidade, características e tarifas com o
            atendimento.
          </p>
        </div>
      </section>
    </>
  );
}
