import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Bath, BedDouble, CalendarRange, Clock, Maximize2, Users, Wallet, Wrench } from "lucide-react";
import { ownerDashboard, ownerFlats, ownerQuery, ownerStatement } from "@/lib/owner-portal";
import { addDays, money, today } from "@/domain/dates";
import {
  dayMonth,
  dayStrip,
  movementDay,
  movementTotals,
  normalizeReservations,
  occupancyRate,
  periodRange,
  plural,
  propertyStatusOf,
  shortDate,
  stayPhase,
} from "@/domain/owner";
import { Empty, MovementTable, PageHeading, Panel, Pill, PropertyThumb, ReservationRow, StatCard } from "@/components/owner/owner-ui";

export const metadata = { title: "Imóvel" };

const modalityLabel: Record<string, string> = { TEMPORADA: "Temporada", LOCACAO: "Locação", VENDA: "Venda" };

export default async function OwnerProperty({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flats = await ownerFlats();
  const flat = flats.find((item) => item.id === id);
  if (!flat) notFound();

  const query = ownerQuery({ imovelId: flat.id });
  const [dashboard, statement] = await Promise.all([ownerDashboard(query), ownerStatement(query)]);
  const day = today();
  const reservations = normalizeReservations(dashboard.reservations, flats)
    .filter((reservation) => !reservation.flatId || reservation.flatId === flat.id)
    .sort((a, b) => b.checkin.localeCompare(a.checkin));
  const stays = reservations
    .filter((reservation) => ["current", "upcoming"].includes(stayPhase(reservation, day)))
    .sort((a, b) => a.checkin.localeCompare(b.checkin));
  const occupations = (dashboard.ocupacoes ?? []).filter((occupation) => String(occupation.imovel_id) === flat.id);
  const blocks = occupations.filter((occupation) => ["MANUTENCAO", "BLOQUEIO"].includes(occupation.tipo));
  const strip = dayStrip(reservations, occupations, 30, day);
  const received = movementTotals(statement.items, periodRange("12m", day).start, day).received;
  const occupancy = occupancyRate(reservations, addDays(day, -30), addDays(day, 1), 1);
  const status = propertyStatusOf(flat);
  const recent = [...statement.items].sort((a, b) => movementDay(b).localeCompare(movementDay(a))).slice(0, 8);
  const location = [flat.neighborhood, flat.city, flat.state].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeading title={flat.title} description={location || undefined} back={{ href: "/painel-proprietario/imoveis", label: "Meus imóveis" }}>
        {flat.published && flat.slug ? (
          <Link href={`/flats/${encodeURIComponent(flat.slug)}`} className="op-button op-button-ghost" target="_blank">
            Ver anúncio no site <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        ) : null}
      </PageHeading>

      <section className="op-property-hero" aria-label="Resumo do imóvel">
        <PropertyThumb src={flat.coverImage} alt={flat.title} className="op-thumb-hero" />
        <div className="op-property-facts">
          <span className="op-pill-row">
            <Pill tone={status.tone}>{status.label}</Pill>
            <Pill tone={flat.published ? "info" : "neutral"}>{flat.published ? "Publicado no site" : "Fora do site"}</Pill>
          </span>
          <ul className="op-specs op-specs-lg" aria-label="Características">
            <li><Users size={15} aria-hidden="true" /> {plural(flat.maxGuests, "hóspede", "hóspedes")}</li>
            <li><BedDouble size={15} aria-hidden="true" /> {plural(flat.bedrooms, "quarto", "quartos")}</li>
            <li><Bath size={15} aria-hidden="true" /> {plural(flat.bathrooms, "banheiro", "banheiros")}</li>
            {flat.areaSqm ? <li><Maximize2 size={15} aria-hidden="true" /> {flat.areaSqm} m²</li> : null}
          </ul>
          <dl className="op-facts">
            {flat.modalities?.length ? (
              <div>
                <dt>Modalidades</dt>
                <dd>{flat.modalities.map((item) => modalityLabel[item] ?? item).join(", ")}</dd>
              </div>
            ) : null}
            {flat.prices?.nightly ? (
              <div>
                <dt>Diária a partir de</dt>
                <dd>{money(flat.prices.nightly)}</dd>
              </div>
            ) : null}
            {flat.prices?.monthly ? (
              <div>
                <dt>Aluguel mensal</dt>
                <dd>{money(flat.prices.monthly)}</dd>
              </div>
            ) : null}
            {flat.checkinTime || flat.checkoutTime ? (
              <div>
                <dt>
                  <Clock size={13} aria-hidden="true" /> Entrada e saída
                </dt>
                <dd>
                  {flat.checkinTime ? `a partir das ${flat.checkinTime.slice(0, 5)}` : "—"} · {flat.checkoutTime ? `até ${flat.checkoutTime.slice(0, 5)}` : "—"}
                </dd>
              </div>
            ) : null}
            {flat.minNights ? (
              <div>
                <dt>Estadia mínima</dt>
                <dd>{plural(flat.minNights, "noite", "noites")}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      <div className="op-stats">
        <StatCard tone="hero" icon={Wallet} label="Saldo a repassar" value={money(statement.totais.saldo_repassar)} hint="Deste imóvel, já recebido dos hóspedes." />
        <StatCard icon={ArrowUpRight} label="Recebido (12 meses)" value={money(received)} hint="Pagamentos dos hóspedes" />
        <StatCard icon={BedDouble} label="Ocupação (30 dias)" value={`${occupancy.rate}%`} hint={plural(occupancy.nights, "noite reservada", "noites reservadas")}>
          <div className="op-meter" aria-hidden="true">
            <span style={{ width: `${occupancy.rate}%` }} />
          </div>
        </StatCard>
        <StatCard icon={CalendarRange} label="Próximas estadias" value={String(stays.filter((stay) => stayPhase(stay, day) === "upcoming").length)} hint={stays[0] ? `A próxima começa em ${dayMonth(stays[0].checkin)}` : "Nenhuma prevista"} />
      </div>

      <Panel title="Próximos 30 dias" eyebrow="Agenda do imóvel">
        <div className="op-strip" role="list" aria-label="Situação dos próximos 30 dias">
          {strip.map(({ day: date, state }) => (
            <span
              key={date}
              role="listitem"
              className={`op-strip-day op-strip-${state}`}
              title={`${shortDate(date)}: ${state === "booked" ? "reservado" : state === "blocked" ? "bloqueado" : "livre"}`}
              aria-label={`${shortDate(date)}: ${state === "booked" ? "reservado" : state === "blocked" ? "bloqueado" : "livre"}`}
            >
              <small>{date.slice(8)}</small>
            </span>
          ))}
        </div>
        <div className="op-legend">
          <span><i className="op-swatch op-swatch-out" /> Reservado</span>
          <span><i className="op-swatch op-swatch-block" /> Bloqueado ou manutenção</span>
          <span><i className="op-swatch op-swatch-free" /> Livre</span>
        </div>
      </Panel>

      <div className="op-grid-2">
        <Panel title="Hospedagens atuais e próximas" eyebrow="Agenda">
          {stays.length ? (
            <div className="op-list">
              {stays.map((reservation) => (
                <ReservationRow key={reservation.id} reservation={reservation} showFlat={false} />
              ))}
            </div>
          ) : (
            <Empty>Nenhuma hospedagem em andamento ou prevista.</Empty>
          )}
        </Panel>
        <Panel title="Bloqueios e manutenções" eyebrow="Disponibilidade">
          {blocks.length ? (
            <ul className="op-blocks">
              {blocks.map((block) => (
                <li key={block.id}>
                  <span className="op-block-icon">
                    <Wrench size={15} aria-hidden="true" />
                  </span>
                  <span>
                    <b>{block.motivo || (block.tipo === "MANUTENCAO" ? "Manutenção" : "Bloqueio")}</b>
                    <small>
                      {shortDate(block.inicio)} {block.fim ? `até ${shortDate(block.fim)}` : "· sem data para terminar"}
                    </small>
                  </span>
                  <Pill tone="warning">{block.tipo === "MANUTENCAO" ? "Manutenção" : "Bloqueio"}</Pill>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nenhum bloqueio ou manutenção ativa.</Empty>
          )}
        </Panel>
      </div>

      <Panel title="Histórico de reservas" eyebrow={plural(reservations.length, "reserva", "reservas")}>
        {reservations.length ? (
          <div className="op-list">
            {reservations.map((reservation) => (
              <ReservationRow key={reservation.id} reservation={reservation} showFlat={false} />
            ))}
          </div>
        ) : (
          <Empty>Este imóvel ainda não tem reservas.</Empty>
        )}
      </Panel>

      <Panel
        title="Movimentações do imóvel"
        eyebrow="Extrato"
        action={{ href: `/painel-proprietario/extrato?imovelId=${encodeURIComponent(flat.id)}`, label: "Extrato do imóvel" }}
      >
        {recent.length ? (
          <MovementTable items={recent} showProperty={false} caption={`Últimas movimentações de ${flat.title}`} />
        ) : (
          <Empty>Nenhuma movimentação registrada para este imóvel.</Empty>
        )}
      </Panel>
    </>
  );
}
