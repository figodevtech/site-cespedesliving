import Link from "next/link";
import { ArrowDownLeft, Landmark, Percent, Receipt, Wallet } from "lucide-react";
import { ownerFlats, ownerQuery, ownerStatement } from "@/lib/owner-portal";
import { money } from "@/domain/dates";
import { movementDay, movementLabel, movementType, plural, shortDate } from "@/domain/owner";
import { Select } from "@/components/select";
import { DateRangePicker } from "@/components/date-picker";
import { StatementExport } from "@/components/owner/statement-export";
import { Empty, MovementTable, PageHeading, Panel, StatCard } from "@/components/owner/owner-ui";

export const metadata = { title: "Extrato" };

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = ["BRUTO_RECEBIDO", "TAXA_ADMIN", "DESPESA_PROPRIETARIO", "REPASSE"];

export default async function OwnerStatementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const raw = await searchParams;
  const flats = await ownerFlats();
  const filters = {
    imovelId: flats.some((flat) => flat.id === raw.imovelId) ? raw.imovelId : undefined,
    inicio: DAY_RE.test(raw.inicio ?? "") ? raw.inicio : undefined,
    fim: DAY_RE.test(raw.fim ?? "") ? raw.fim : undefined,
  };
  const type = TYPES.includes(raw.tipo ?? "") ? raw.tipo : undefined;
  const statement = await ownerStatement(ownerQuery(filters));
  const items = [...statement.items]
    .filter((item) => !type || movementType(item) === type)
    .sort((a, b) => movementDay(b).localeCompare(movementDay(a)));
  const totals = statement.totais;
  const flatName = flats.find((flat) => flat.id === filters.imovelId)?.title;
  const period =
    filters.inicio || filters.fim
      ? `${filters.inicio ? shortDate(filters.inicio) : "início"} a ${filters.fim ? shortDate(filters.fim) : "hoje"}`
      : "Todo o período";
  const hrefFor = (value?: string) => `/painel-proprietario/extrato?${ownerQuery({ ...filters, tipo: value })}`;

  return (
    <>
      <PageHeading
        title="Extrato"
        description={`${flatName ?? "Todos os imóveis"} · ${period}. Recebimentos, taxas, despesas e repasses lançados pela equipe.`}
      >
        <StatementExport items={items} totals={totals} />
      </PageHeading>

      <form className="op-filters" action="/painel-proprietario/extrato">
        <div className="field">
          <label htmlFor="extrato-imovel">Imóvel</label>
          <Select
            id="extrato-imovel"
            name="imovelId"
            defaultValue={filters.imovelId ?? ""}
            options={[{ value: "", label: "Todos os imóveis" }, ...flats.map((flat) => ({ value: flat.id, label: flat.title }))]}
          />
        </div>
        <div className="field">
          <label htmlFor="extrato-periodo">Período</label>
          <DateRangePicker
            id="extrato-periodo"
            startName="inicio"
            endName="fim"
            unit="dias"
            placeholder="Todo o período"
            defaultValue={{ start: filters.inicio ?? "", end: filters.fim ?? "" }}
          />
        </div>
        {type ? <input type="hidden" name="tipo" value={type} /> : null}
        <div className="op-filters-actions">
          <button className="op-button">Aplicar</button>
          {filters.imovelId || filters.inicio || filters.fim || type ? (
            <Link href="/painel-proprietario/extrato" className="op-button op-button-ghost">
              Limpar
            </Link>
          ) : null}
        </div>
      </form>

      <div className="op-stats op-stats-5">
        <StatCard tone="hero" icon={Wallet} label="Saldo a repassar" value={money(totals.saldo_repassar)} hint="Saldo atual, de todo o histórico" />
        <StatCard icon={ArrowDownLeft} label="Recebido" value={money(totals.recebido)} hint="Pagamentos dos hóspedes" />
        <StatCard icon={Percent} label="Taxa de administração" value={money(totals.receita_administradora)} hint="Sobre o recebido" />
        <StatCard icon={Receipt} label="Despesas" value={money(totals.despesas)} hint="Pagas por você" />
        <StatCard icon={Landmark} label="Repassado" value={money(totals.repassado)} hint="Transferido para você" />
      </div>

      <Panel title="Movimentações" eyebrow={plural(items.length, "lançamento", "lançamentos")}>
        <nav className="op-tabs op-tabs-sm" aria-label="Tipo de movimentação">
          <Link href={hrefFor()} aria-current={!type ? "page" : undefined} scroll={false}>
            Todos
          </Link>
          {TYPES.map((value) => (
            <Link key={value} href={hrefFor(value)} aria-current={type === value ? "page" : undefined} scroll={false}>
              {movementLabel[value]}
            </Link>
          ))}
        </nav>
        {items.length ? (
          <MovementTable items={items} showProperty={!filters.imovelId} caption="Movimentações do extrato" />
        ) : (
          <Empty>Nenhum lançamento com esses filtros. Os valores são atualizados pelos registros financeiros da equipe.</Empty>
        )}
      </Panel>
    </>
  );
}
