import Link from "next/link";
import { BedDouble, Bath, ChevronRight, Globe, Maximize2, Users } from "lucide-react";
import { ownerDashboard, ownerFlats, ownerStatement } from "@/lib/owner-portal";
import { addDays, money, today } from "@/domain/dates";
import {
  dayMonth,
  movementTotals,
  normalizeReservations,
  occupancyRate,
  periodRange,
  plural,
  propertyStatusOf,
  stayPhase,
} from "@/domain/owner";
import { Empty, PageHeading, Pill, PropertyThumb } from "@/components/owner/owner-ui";

export const metadata = { title: "Meus imóveis" };

export default async function OwnerProperties() {
  const [flats, dashboard, statement] = await Promise.all([ownerFlats(), ownerDashboard(), ownerStatement()]);
  const day = today();
  const reservations = normalizeReservations(dashboard.reservations, flats);
  const yearStart = periodRange("12m", day).start!;
  const monthAgo = addDays(day, -30);

  return (
    <>
      <PageHeading
        title="Meus imóveis"
        description={`${plural(flats.length, "imóvel administrado", "imóveis administrados")} pela Cespedes Living.`}
      />
      {flats.length ? (
        <div className="op-flat-grid">
          {flats.map((flat) => {
            const status = propertyStatusOf(flat);
            const own = reservations.filter((reservation) => reservation.flatId === flat.id);
            const upcoming = own
              .filter((reservation) => stayPhase(reservation, day) === "upcoming")
              .sort((a, b) => a.checkin.localeCompare(b.checkin));
            const hosting = own.some((reservation) => stayPhase(reservation, day) === "current");
            const received = movementTotals(
              statement.items.filter((item) => String(item.imovel_id ?? item.imovel?.id ?? "") === flat.id),
              yearStart,
              day,
            ).received;
            const occupancy = occupancyRate(own, monthAgo, addDays(day, 1), 1).rate;
            return (
              <Link key={flat.id} href={`/painel-proprietario/imoveis/${encodeURIComponent(flat.id)}`} className="op-flat-card">
                <div className="op-flat-media">
                  <PropertyThumb src={flat.coverImage} alt={flat.title} />
                  <span className="op-flat-badges">
                    <Pill tone={status.tone}>{hosting && status.tone === "success" ? "Hospedado agora" : status.label}</Pill>
                    {flat.published ? (
                      <Pill tone="glass">
                        <Globe size={11} aria-hidden="true" /> No site
                      </Pill>
                    ) : null}
                  </span>
                </div>
                <div className="op-flat-body">
                  <h2>{flat.title}</h2>
                  <p className="op-res-meta">
                    {[flat.neighborhood, flat.city, flat.state].filter(Boolean).join(" · ") || "Localização não informada"}
                  </p>
                  <ul className="op-specs" aria-label="Características">
                    <li><Users size={13} aria-hidden="true" /> {flat.maxGuests}</li>
                    <li><BedDouble size={13} aria-hidden="true" /> {flat.bedrooms}</li>
                    <li><Bath size={13} aria-hidden="true" /> {flat.bathrooms}</li>
                    {flat.areaSqm ? <li><Maximize2 size={13} aria-hidden="true" /> {flat.areaSqm} m²</li> : null}
                  </ul>
                  <dl className="op-flat-stats">
                    <div>
                      <dt>Ocupação (30 dias)</dt>
                      <dd>{occupancy}%</dd>
                    </div>
                    <div>
                      <dt>Recebido (12 meses)</dt>
                      <dd>{money(received)}</dd>
                    </div>
                    <div>
                      <dt>Próxima chegada</dt>
                      <dd>{upcoming[0] ? dayMonth(upcoming[0].checkin) : "—"}</dd>
                    </div>
                  </dl>
                  <span className="op-flat-cta">
                    Ver detalhes <ChevronRight size={15} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <Empty>Nenhum imóvel vinculado à sua conta neste momento. Fale com a equipe da Cespedes se algo estiver faltando.</Empty>
      )}
    </>
  );
}
