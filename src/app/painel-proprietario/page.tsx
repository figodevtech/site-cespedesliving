import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, BedDouble, Building2, CalendarCheck2, Landmark, Wallet } from "lucide-react";
import { ownerDashboard, ownerFlats, ownerStatement } from "@/lib/owner-portal";
import { addDays, money, today } from "@/domain/dates";
import {
  dayMonth,
  isPeriodPreset,
  monthlySeries,
  movementDay,
  movementTotals,
  normalizeReservations,
  occupancyRate,
  periodPresets,
  periodRange,
  plural,
  propertyStatusOf,
  stayPhase,
  type PeriodPreset,
} from "@/domain/owner";
import { Empty, MovementTable, PageHeading, Panel, Pill, PropertyThumb, ReservationRow, StatCard } from "@/components/owner/owner-ui";
import { FilterPending, FilterScope, FilterTabs } from "@/components/owner/filter-tabs";
import { OverviewSummarySkeleton } from "@/components/owner/owner-skeletons";

export default async function OwnerOverview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const raw = await searchParams;
  const preset: PeriodPreset = isPeriodPreset(raw.periodo) ? raw.periodo : "12m";
  const [flats, dashboard, statement] = await Promise.all([ownerFlats(), ownerDashboard(), ownerStatement()]);

  const day = today();
  const { start, end } = periodRange(preset, day);
  const totals = movementTotals(statement.items, start, end);
  const reservations = normalizeReservations(dashboard.reservations, flats);
  // Sem início ("todo o período"), a ocupação olha os últimos 12 meses.
  const occupancyStart = start ?? periodRange("12m", day).start!;
  const occupancy = occupancyRate(reservations, occupancyStart, addDays(day, 1), flats.length);
  const current = reservations.filter((reservation) => stayPhase(reservation, day) === "current");
  const upcoming = reservations
    .filter((reservation) => stayPhase(reservation, day) === "upcoming")
    .sort((a, b) => a.checkin.localeCompare(b.checkin));
  const series = monthlySeries(statement.items, 6, day);
  const peak = Math.max(...series.flatMap((row) => [row.received, row.payouts]), 1);
  const recent = [...statement.items].sort((a, b) => movementDay(b).localeCompare(movementDay(a))).slice(0, 5);

  // Para onde foi o valor recebido no período.
  const kept = Math.max(totals.received - totals.fees - totals.expenses - totals.payouts, 0);
  const slices = [
    { label: "Repassado a você", value: totals.payouts, color: "var(--op-navy)" },
    { label: "Ainda a repassar", value: kept, color: "var(--op-gold)" },
    { label: "Taxa de administração", value: totals.fees, color: "var(--op-sage)" },
    { label: "Despesas do imóvel", value: totals.expenses, color: "var(--op-clay)" },
  ];
  const sliceTotal = slices.reduce((sum, slice) => sum + Math.max(slice.value, 0), 0);
  let cursor = 0;
  const gradient = sliceTotal
    ? `conic-gradient(${slices
        .map((slice) => {
          const from = cursor;
          cursor += (Math.max(slice.value, 0) / sliceTotal) * 360;
          return `${slice.color} ${from}deg ${cursor}deg`;
        })
        .join(", ")})`
    : undefined;

  return (
    <FilterScope>
      <PageHeading
        title="Visão geral"
        description="O desempenho dos seus imóveis e o que a Cespedes tem a repassar para você."
      >
        <FilterTabs
          className="op-segment"
          label="Período"
          current="true"
          tabs={(Object.keys(periodPresets) as PeriodPreset[]).map((key) => ({
            href: key === "12m" ? "/painel-proprietario" : `/painel-proprietario?periodo=${key}`,
            label: periodPresets[key],
            active: key === preset,
          }))}
        />
      </PageHeading>

      <FilterPending fallback={<OverviewSummarySkeleton />}>
      <div className="op-stats">
        <StatCard
          tone="hero"
          icon={Wallet}
          label="Saldo a repassar"
          value={money(statement.totais.saldo_repassar)}
          hint="Já recebido dos hóspedes e ainda não transferido para você."
        >
          <Link href="/painel-proprietario/extrato" className="op-stat-link">
            Ver extrato <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </StatCard>
        <StatCard icon={ArrowDownLeft} label="Recebido dos hóspedes" value={money(totals.received)} hint={periodPresets[preset]} />
        <StatCard icon={Landmark} label="Repassado a você" value={money(totals.payouts)} hint={periodPresets[preset]} />
        <StatCard
          icon={BedDouble}
          label="Ocupação"
          value={`${occupancy.rate}%`}
          hint={`${plural(occupancy.nights, "noite reservada", "noites reservadas")}${start ? "" : " nos últimos 12 meses"}`}
        >
          <div className="op-meter" aria-hidden="true">
            <span style={{ width: `${occupancy.rate}%` }} />
          </div>
        </StatCard>
      </div>

      <div className="op-grid-2">
        <Panel title="Recebido e repassado" eyebrow="Últimos 6 meses">
          <div
            className="op-chart"
            role="img"
            aria-label={series
              .map((row) => `${row.label}: recebido ${money(row.received)}, repassado ${money(row.payouts)}`)
              .join("; ")}
          >
            {series.map((row) => (
              <div className="op-chart-col" key={row.key}>
                <div className="op-chart-bars">
                  <span className="op-bar op-bar-in" style={{ height: `${(row.received / peak) * 100}%` }} title={`Recebido: ${money(row.received)}`} />
                  <span className="op-bar op-bar-out" style={{ height: `${(row.payouts / peak) * 100}%` }} title={`Repassado: ${money(row.payouts)}`} />
                </div>
                <small>{row.label}</small>
              </div>
            ))}
          </div>
          <div className="op-legend">
            <span><i className="op-swatch op-swatch-in" /> Recebido dos hóspedes</span>
            <span><i className="op-swatch op-swatch-out" /> Repassado a você</span>
          </div>
        </Panel>

        <Panel title="Para onde foi o valor recebido" eyebrow={periodPresets[preset]}>
          {sliceTotal ? (
            <div className="op-donut-wrap">
              <div className="op-donut" style={{ background: gradient }} aria-hidden="true">
                <div>
                  <small>Recebido</small>
                  <strong>{money(totals.received)}</strong>
                </div>
              </div>
              <dl className="op-donut-legend">
                {slices.map((slice) => (
                  <div key={slice.label}>
                    <dt>
                      <i style={{ background: slice.color }} /> {slice.label}
                    </dt>
                    <dd>{money(slice.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <Empty>Nenhum valor recebido neste período.</Empty>
          )}
        </Panel>
      </div>
      </FilterPending>

      <div className="op-grid-2">
        <Panel title="Agenda" eyebrow="Hóspedes e chegadas" action={{ href: "/painel-proprietario/reservas", label: "Todas as reservas" }}>
          {current.length ? (
            <div className="op-group">
              <p className="op-group-title">
                <CalendarCheck2 size={15} aria-hidden="true" /> Hospedados agora
              </p>
              <div className="op-list">
                {current.map((reservation) => (
                  <ReservationRow key={reservation.id} reservation={reservation} />
                ))}
              </div>
            </div>
          ) : null}
          <div className="op-group">
            <p className="op-group-title">Próximas chegadas</p>
            {upcoming.length ? (
              <div className="op-list">
                {upcoming.slice(0, 4).map((reservation) => (
                  <ReservationRow key={reservation.id} reservation={reservation} />
                ))}
              </div>
            ) : (
              <Empty>Nenhuma chegada prevista por enquanto.</Empty>
            )}
          </div>
        </Panel>

        <Panel
          title="Seus imóveis"
          eyebrow={plural(flats.length, "imóvel", "imóveis")}
          action={{ href: "/painel-proprietario/imoveis", label: "Ver imóveis" }}
        >
          {flats.length ? (
            <div className="op-list">
              {flats.slice(0, 4).map((flat) => {
                const status = propertyStatusOf(flat);
                const next = upcoming.find((reservation) => reservation.flatId === flat.id);
                return (
                  <Link key={flat.id} href={`/painel-proprietario/imoveis/${encodeURIComponent(flat.id)}`} className="op-mini-flat">
                    <PropertyThumb src={flat.coverImage} alt={flat.title} className="op-thumb-sm" />
                    <span className="op-mini-flat-main">
                      <span className="op-res-title">{flat.title}</span>
                      <span className="op-res-meta">
                        {[flat.neighborhood, flat.city].filter(Boolean).join(" · ") || "Localização não informada"}
                      </span>
                      <span className="op-res-meta">
                        {next ? `Próxima chegada: ${dayMonth(next.checkin)}` : "Sem chegadas previstas"}
                      </span>
                    </span>
                    <Pill tone={status.tone}>{status.label}</Pill>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Empty>
              <Building2 size={16} aria-hidden="true" /> Nenhum imóvel vinculado à sua conta neste momento.
            </Empty>
          )}
        </Panel>
      </div>

      <Panel title="Últimas movimentações" eyebrow="Extrato" action={{ href: "/painel-proprietario/extrato", label: "Extrato completo" }}>
        {recent.length ? (
          <MovementTable items={recent} caption="Últimas movimentações do extrato" />
        ) : (
          <Empty>Nenhuma movimentação ainda. Os valores aparecem aqui assim que a equipe registra recebimentos e repasses.</Empty>
        )}
      </Panel>
    </FilterScope>
  );
}
