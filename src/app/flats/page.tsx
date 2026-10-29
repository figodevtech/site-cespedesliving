import type { Metadata } from "next";
import Link from "next/link";
import { getFlatsPage } from "@/services/flats";
import { PageHero, EmptyState } from "@/components/ui";
import { FlatCard } from "@/components/flat-card";
import { SearchForm } from "@/components/search-form";
import { validateStay } from "@/domain/dates";
import type { Filters, Modality, Flat } from "@/domain/types";
import { isMock } from "@/services/adapter";
export const metadata: Metadata = {
  title: "Nossos imóveis",
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
  let flats: Flat[] = [];
  let total = 0;
  const rawPage = Number(params.page ?? 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = 12;
  try {
    const guests = params.guests ? Number(params.guests) : 1;
    const modality = params.modality ?? "TEMPORADA";
    if (!["TEMPORADA", "LOCACAO", "VENDA"].includes(modality))
      throw new Error("Selecione uma finalidade válida.");
    if (!Number.isInteger(guests) || guests < 1 || guests > 100)
      throw new Error("Informe uma quantidade válida de hóspedes.");
    if (modality === "TEMPORADA" && (params.checkin || params.checkout))
      validateStay(params.checkin, params.checkout, guests, 100, undefined, {
        minNights: 1,
        maxNights: 730,
      });
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
      modality: modality as Modality,
      neighborhood: params.neighborhood,
      guests: modality === "TEMPORADA" ? guests : undefined,
      checkin:
        isMock() || modality !== "TEMPORADA" ? undefined : params.checkin,
      checkout:
        isMock() || modality !== "TEMPORADA" ? undefined : params.checkout,
      minPrice: isMock() ? undefined : minPrice,
      maxPrice: isMock() ? undefined : maxPrice,
      amenities: params.amenity ? [params.amenity] : [],
      sort:
        isMock() && params.sort?.startsWith("price-") ? undefined : params.sort,
    };
    const result = await getFlatsPage(filters, page, pageSize);
    flats = result.items;
    total = result.total;
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Não foi possível carregar o catálogo.";
  }
  const labels: Record<string, string> = {
    modality: "Finalidade",
    neighborhood: "Bairro",
    guests: "Hóspedes",
    checkin: "Entrada",
    checkout: "Saída",
    minPrice: "Valor mínimo",
    maxPrice: "Valor máximo",
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
        eyebrow="Nossos imóveis"
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
                {total}{" "}
                {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
              </p>
              {flats.length ? (
                <div className="card-grid">
                  {flats.map((f) => (
                    <FlatCard
                      flat={f}
                      key={f.id}
                      stayQuery={stayQuery}
                      modality={params.modality as Modality | undefined}
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
                  Nenhum imóvel atende a esta combinação. Experimente outras
                  datas, região ou número de hóspedes.
                </EmptyState>
              )}
            </>
          )}
          {total > pageSize && (
            <nav className="account-toolbar" aria-label="Páginas de imóveis">
              {page > 1 ? (
                <Link
                  href={`/flats?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                >
                  Anteriores
                </Link>
              ) : (
                <span />
              )}
              <span>
                Página {page} de {Math.ceil(total / pageSize)}
              </span>
              {page * pageSize < total && (
                <Link
                  href={`/flats?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                >
                  Próximas
                </Link>
              )}
            </nav>
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
