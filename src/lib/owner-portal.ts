import "server-only";
import { cache } from "react";
import { erpRequest } from "./erp";
import { requireProfile, sessionToken } from "./site-session";
import type { Flat, OwnerDashboard, OwnerStatementData } from "@/domain/types";

/**
 * Dados da área do proprietário, lidos do ERP com o token da sessão. O cache vale por
 * requisição: layout e página que pedem a mesma coisa fazem uma chamada só.
 */

/** Monta a query só com os filtros preenchidos. */
export function ownerQuery(filters: Record<string, string | undefined>) {
  return new URLSearchParams(
    Object.entries(filters).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1] !== "",
    ),
  ).toString();
}

const withQuery = (path: string, query: string) => (query ? `${path}?${query}` : path);

/**
 * Layout e página renderizam em paralelo: sem sessão (ou sem perfil de proprietário), a busca
 * também redireciona para o login em vez de estourar erro antes do layout. O perfil é cacheado.
 */
const ownerToken = cache(async () => {
  await requireProfile("owner");
  return sessionToken();
});

export const ownerFlats = cache(async () => {
  const data = await erpRequest<{ items: Flat[] }>("/site/proprietario/imoveis", undefined, await ownerToken());
  return data.items ?? [];
});

export const ownerDashboard = cache(async (query = "") =>
  erpRequest<OwnerDashboard>(withQuery("/site/proprietario/dashboard", query), undefined, await ownerToken()),
);

export const ownerStatement = cache(async (query = "") =>
  erpRequest<OwnerStatementData>(withQuery("/site/proprietario/extratos", query), undefined, await ownerToken()),
);
