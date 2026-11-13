import { ownerDashboard, ownerFlats, ownerQuery } from "@/lib/owner-portal";
import { money, today } from "@/domain/dates";
import { monthLong, normalizeReservations, plural, stayPhase, type OwnerReservation, type StayPhase } from "@/domain/owner";
import { Select } from "@/components/select";
import { Empty, PageHeading, ReservationRow } from "@/components/owner/owner-ui";
import { FilterPending, FilterScope, FilterTabs } from "@/components/owner/filter-tabs";
import { ReservationListSkeleton } from "@/components/owner/owner-skeletons";

export const metadata = { title: "Reservas" };

const TABS: { key: string; label: string; phase?: StayPhase }[] = [
  { key: "todas", label: "Todas" },
  { key: "proximas", label: "Próximas", phase: "upcoming" },
  { key: "hospedados", label: "Hospedados agora", phase: "current" },
  { key: "concluidas", label: "Concluídas", phase: "past" },
  { key: "canceladas", label: "Canceladas", phase: "cancelled" },
];

export default async function OwnerReservations({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const raw = await searchParams;
  const tab = TABS.find((item) => item.key === raw.status) ?? TABS[0];
  const flats = await ownerFlats();
  const flatId = flats.some((flat) => flat.id === raw.imovelId) ? raw.imovelId : undefined;
  const dashboard = await ownerDashboard(ownerQuery({ imovelId: flatId }));
  const day = today();
  const all = normalizeReservations(dashboard.reservations, flats);
  const count = (phase?: StayPhase) => (phase ? all.filter((reservation) => stayPhase(reservation, day) === phase).length : all.length);
  const ascending = tab.phase === "upcoming" || tab.phase === "current";
  const list = all
    .filter((reservation) => !tab.phase || stayPhase(reservation, day) === tab.phase)
    .sort((a, b) => (ascending ? a.checkin.localeCompare(b.checkin) : b.checkin.localeCompare(a.checkin)));

  // Agrupa por mês de entrada, na ordem da lista.
  const groups: { key: string; items: OwnerReservation[] }[] = [];
  for (const reservation of list) {
    const key = reservation.checkin.slice(0, 7);
    const group = groups.find((item) => item.key === key);
    if (group) group.items.push(reservation);
    else groups.push({ key, items: [reservation] });
  }
  const hrefFor = (key: string) => `/painel-proprietario/reservas?${ownerQuery({ status: key === "todas" ? undefined : key, imovelId: flatId })}`;
  const active = list.filter((reservation) => reservation.status !== "CANCELLED");

  return (
    <FilterScope>
      <PageHeading
        title="Reservas"
        description={`${plural(list.length, "reserva", "reservas")} · ${money(active.reduce((sum, reservation) => sum + reservation.amount, 0))} em estadias (sem as canceladas).`}
      >
        {flats.length > 1 ? (
          <form className="op-inline-filter" action="/painel-proprietario/reservas">
            {tab.key !== "todas" ? <input type="hidden" name="status" value={tab.key} /> : null}
            <div className="field">
              <label htmlFor="reservas-imovel" className="op-sr">
                Imóvel
              </label>
              <Select
                id="reservas-imovel"
                name="imovelId"
                defaultValue={flatId ?? ""}
                options={[{ value: "", label: "Todos os imóveis" }, ...flats.map((flat) => ({ value: flat.id, label: flat.title }))]}
              />
            </div>
            <button className="op-button">Filtrar</button>
          </form>
        ) : null}
      </PageHeading>

      <FilterTabs
        className="op-tabs"
        label="Situação das reservas"
        tabs={TABS.map((item) => ({ href: hrefFor(item.key), label: item.label, active: item.key === tab.key, count: count(item.phase) }))}
      />

      <FilterPending fallback={<ReservationListSkeleton />}>
      {groups.length ? (
        <div className="op-month-groups">
          {groups.map((group) => (
            <section key={group.key} className="op-month" aria-labelledby={`mes-${group.key}`}>
              <h2 id={`mes-${group.key}`} className="op-month-title">
                {group.key ? monthLong(group.key) : "Sem data"}
                <span>{plural(group.items.length, "reserva", "reservas")}</span>
              </h2>
              <div className="op-list op-list-card">
                {group.items.map((reservation) => (
                  <ReservationRow key={reservation.id} reservation={reservation} showFlat={!flatId} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Empty>Nenhuma reserva nesta situação{flatId ? " para o imóvel escolhido" : ""}.</Empty>
      )}
      </FilterPending>
    </FilterScope>
  );
}
