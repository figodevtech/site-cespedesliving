import { OwnerPortal, type StatementData } from "@/components/owner-portal";
import { PageHero } from "@/components/ui";
import { requireProfile, sessionToken } from "@/lib/site-session";
import { erpRequest } from "@/lib/erp";
import type { Flat, OwnerDashboard } from "@/domain/types";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireProfile("owner");
  const raw = await searchParams;
  const filters = { imovelId: raw.imovelId, inicio: raw.inicio, fim: raw.fim };
  const query = new URLSearchParams(
    Object.entries(filters).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1] !== "",
    ),
  ).toString();
  const token = await sessionToken();
  const [data, flats, statements] = await Promise.all([
    erpRequest<OwnerDashboard>(
      "/site/proprietario/dashboard?" + query,
      undefined,
      token,
    ),
    erpRequest<{ items: Flat[] }>(
      "/site/proprietario/imoveis",
      undefined,
      token,
    ),
    erpRequest<StatementData>(
      "/site/proprietario/extratos?" + query,
      undefined,
      token,
    ),
  ]);
  return (
    <>
      <PageHero
        eyebrow="Área do proprietário"
        title="Seu patrimônio, de perto."
      />
      <OwnerPortal
        name={profile.name}
        data={data}
        flats={flats.items}
        statements={statements}
        filters={filters}
      />
    </>
  );
}
