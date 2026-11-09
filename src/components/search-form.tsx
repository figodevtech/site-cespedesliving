"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { today, validateStay } from "@/domain/dates";
import type { Modality } from "@/domain/types";
import { amenityKey, type AmenityOption } from "@/domain/amenities";
import { pricesVisibleFor } from "@/domain/property";
import { destinationValue, type Destination } from "@/domain/destinations";
import { DateRangePicker } from "./date-picker";
import { Select } from "./select";
export const neighborhoods = [
  "Tambaú",
  "Manaíra",
  "Cabo Branco",
  "Bessa",
  "Intermares",
  "Altiplano",
];
export function SearchForm({
  compact = false,
  initial = {},
  showPrices = false,
  amenities = [],
  destinations = [],
}: {
  compact?: boolean;
  initial?: Record<string, string>;
  showPrices?: boolean;
  /** Comodidades dos imóveis publicados, como cadastradas no ERP. */
  amenities?: AmenityOption[];
  /** Cidades com imóvel publicado (ERP): as únicas oferecidas em "Destino". */
  destinations?: Destination[];
}) {
  const router = useRouter();
  // Link antigo ou digitado ("wi-fi") marca a opção equivalente; sem equivalente, a opção é mantida.
  const wanted = initial.amenity ?? "";
  const matched = wanted
    ? amenities.find((a) => amenityKey(a.name) === amenityKey(wanted))
    : undefined;
  const selectedAmenity = matched?.name ?? wanted;
  const amenityChoices = [
    ...amenities.map((a) => a.name),
    ...(selectedAmenity && !matched ? [selectedAmenity] : []),
  ];
  const [error, setError] = useState("");
  const [stay, setStay] = useState(() => ({
    checkin: initial.checkin ?? "",
    checkout: initial.checkout ?? "",
  }));
  const [modality, setModality] = useState<Modality>(
    (initial.modality as Modality) ?? "TEMPORADA",
  );
  // Só a diária aparece no site por enquanto: sem filtro/ordenação por valores ocultos.
  const pricesVisible = showPrices && pricesVisibleFor(modality);
  return (
    <form
      // is-stay: temporada mostra período e hóspedes; o layout da busca muda com isso.
      className={`${compact ? "catalog-filter" : "search-shell"} ${modality === "TEMPORADA" ? "is-stay" : ""}`}
      aria-label="Buscar imóveis"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        fd.forEach((value, key) => {
          if (String(value)) params.set(key, String(value));
        });
        try {
          const checkin = String(fd.get("checkin") ?? "");
          const checkout = String(fd.get("checkout") ?? "");
          if (modality === "TEMPORADA" && (checkin || checkout))
            validateStay(
              checkin,
              checkout,
              Number(fd.get("guests") ?? 1),
              100,
              undefined,
              { minNights: 1, maxNights: 730 },
            );
          setError("");
          router.push(`/flats?${params}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Confira as datas.");
        }
      }}
    >
      <div className={compact ? "field" : "search-field"}>
        <label htmlFor="search-modality">Finalidade</label>
        <Select
          id="search-modality"
          name="modality"
          value={modality}
          onChange={(value) => setModality(value as Modality)}
          options={[
            { value: "TEMPORADA", label: "Temporada" },
            { value: "LOCACAO", label: "Aluguel" },
            { value: "VENDA", label: "Venda" },
          ]}
        />
      </div>
      <div className={compact ? "field" : "search-field"}>
        <label htmlFor="search-destination">Destino</label>
        <Select
          id="search-destination"
          name="destination"
          defaultValue={initial.destination ?? ""}
          options={[
            { value: "", label: "Todos os destinos" },
            ...destinations.map((d) => ({ value: destinationValue(d), label: destinationValue(d) })),
          ]}
        />
      </div>
      {modality === "TEMPORADA" && (
        <div
          className={`${compact ? "field" : "search-field"} date-field date-range-field`}
        >
          <label htmlFor="search-dates">Entrada e saída</label>
          <DateRangePicker
            id="search-dates"
            startName="checkin"
            endName="checkout"
            min={today()}
            placeholder="Quando chega e quando sai?"
            value={{ start: stay.checkin, end: stay.checkout }}
            onChange={({ start, end }) => setStay({ checkin: start, checkout: end })}
          />
        </div>
      )}
      {modality === "TEMPORADA" && (
        <div className={compact ? "field" : "search-field"}>
          <label htmlFor="search-guests">Hóspedes</label>
          <Select
            id="search-guests"
            name="guests"
            defaultValue={initial.guests ?? "2"}
            options={Array.from({ length: 20 }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1} hóspede${i > 0 ? "s" : ""}`,
            }))}
          />
        </div>
      )}
      {compact && (
        <>
          {pricesVisible && (
            <>
              <div className="field">
                <label htmlFor="min-price">Valor mínimo (R$)</label>
                <input
                  id="min-price"
                  type="number"
                  name="minPrice"
                  min="0"
                  step="1"
                  defaultValue={initial.minPrice ?? ""}
                  placeholder="Sem mínimo"
                />
              </div>
              <div className="field">
                <label htmlFor="max-price">Valor máximo (R$)</label>
                <input
                  id="max-price"
                  type="number"
                  name="maxPrice"
                  min="0"
                  step="1"
                  defaultValue={initial.maxPrice ?? ""}
                  placeholder="Sem máximo"
                />
              </div>
            </>
          )}
          {amenityChoices.length ? (
            <div className="field">
              <label htmlFor="amenity">Facilidade</label>
              <Select
                id="amenity"
                name="amenity"
                defaultValue={selectedAmenity}
                options={[
                  { value: "", label: "Todas as facilidades" },
                  ...amenityChoices.map((a) => ({ value: a, label: a })),
                ]}
              />
            </div>
          ) : null}
          <div className="field">
            <label htmlFor="sort">Ordenar por</label>
            <Select
              id="sort"
              name="sort"
              defaultValue={initial.sort ?? ""}
              options={[
                { value: "", label: "Relevância" },
                ...(pricesVisible
                  ? [
                      { value: "price-asc", label: "Menor preço" },
                      { value: "price-desc", label: "Maior preço" },
                    ]
                  : []),
                { value: "guests", label: "Mais hóspedes" },
              ]}
            />
          </div>
        </>
      )}
      <button className="button" type="submit">
        <Search size={17} />
        Buscar imóveis
      </button>
      {error && (
        <p className="form-error search-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
