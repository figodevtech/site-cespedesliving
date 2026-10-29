"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { addDays, today, validateStay } from "@/domain/dates";
import type { Modality } from "@/domain/types";
import { DateInput } from "./date-input";
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
}: {
  compact?: boolean;
  initial?: Record<string, string>;
  showPrices?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [modality, setModality] = useState<Modality>(
    (initial.modality as Modality) ?? "TEMPORADA",
  );
  return (
    <form
      className={compact ? "catalog-filter" : "search-shell"}
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
        <select
          id="search-modality"
          name="modality"
          value={modality}
          onChange={(event) => setModality(event.target.value as Modality)}
        >
          <option value="TEMPORADA">Temporada</option>
          <option value="LOCACAO">Aluguel</option>
          <option value="VENDA">Venda</option>
        </select>
      </div>
      <div className={compact ? "field" : "search-field"}>
        <label htmlFor="search-neighborhood">Destino</label>
        <select
          id="search-neighborhood"
          name="neighborhood"
          defaultValue={initial.neighborhood ?? ""}
        >
          <option value="">João Pessoa e região</option>
          {neighborhoods.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      {modality === "TEMPORADA" && (
        <div className={`${compact ? "field" : "search-field"} date-field`}>
          <label htmlFor="search-checkin">Entrada</label>
          <DateInput
            id="search-checkin"
            name="checkin"
            min={today()}
            defaultValue={
              initial.checkin ?? (compact ? "" : addDays(today(), 3))
            }
          />
        </div>
      )}
      {modality === "TEMPORADA" && (
        <div className={`${compact ? "field" : "search-field"} date-field`}>
          <label htmlFor="search-checkout">Saída</label>
          <DateInput
            id="search-checkout"
            name="checkout"
            min={addDays(today(), 1)}
            defaultValue={
              initial.checkout ?? (compact ? "" : addDays(today(), 6))
            }
          />
        </div>
      )}
      {modality === "TEMPORADA" && (
        <div className={compact ? "field" : "search-field"}>
          <label htmlFor="search-guests">Hóspedes</label>
          <select
            id="search-guests"
            name="guests"
            defaultValue={initial.guests ?? "2"}
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option value={n} key={n}>
                {n} hóspede{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      {compact && (
        <>
          {showPrices && (
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
          <div className="field">
            <label htmlFor="amenity">Facilidade</label>
            <select
              id="amenity"
              name="amenity"
              defaultValue={initial.amenity ?? ""}
            >
              <option value="">Todas as facilidades</option>
              {[
                "Estacionamento",
                "Piscina compartilhada",
                "Espaço de trabalho",
                "Varanda",
              ].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort">Ordenar por</label>
            <select id="sort" name="sort" defaultValue={initial.sort ?? ""}>
              <option value="">Relevância</option>
              {showPrices && (
                <>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </>
              )}
              <option value="guests">Mais hóspedes</option>
            </select>
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
