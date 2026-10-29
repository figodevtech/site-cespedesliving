"use client";
import type { Flat, OwnerDashboard } from "@/domain/types";
import { money } from "@/domain/dates";
import { SignOut } from "./auth-form";
import { bookingLabels } from "./customer-account";
export type StatementMovement = {
  id: string;
  data?: string;
  data_movimento?: string;
  created_at?: string;
  descricao?: string;
  tipo?: string;
  natureza?: string;
  valor?: number;
  imovel_titulo?: string;
  imovel?: { titulo?: string };
  documento_id?: string;
};
export type StatementData = {
  items: StatementMovement[];
  totais: {
    recebido: number;
    receita_administradora: number;
    despesas: number;
    repassado: number;
    saldo_repassar: number;
  };
};
function cell(value: unknown) {
  const original = String(value ?? "");
  const text =
    typeof value === "string" && /^[=+\-@\t\r]/.test(original)
      ? `'${original}`
      : original;
  return `"${text.replaceAll('"', '""')}"`;
}
export function OwnerPortal({
  name,
  data,
  flats,
  statements,
  filters,
}: {
  name: string;
  data: OwnerDashboard;
  flats: Flat[];
  statements: StatementData;
  filters: { imovelId?: string; inicio?: string; fim?: string };
}) {
  const totals = statements.totais;
  return (
    <div className="container section-sm dashboard">
      <div className="account-toolbar">
        <p>Olá, {name}. Acompanhe seus imóveis e resultados.</p>
        <SignOut />
      </div>
      <form className="portal-filters" action="/painel-proprietario">
        <label className="field">
          Imóvel
          <select name="imovelId" defaultValue={filters.imovelId ?? ""}>
            <option value="">Todos os meus imóveis</option>
            {flats.map((flat) => (
              <option key={flat.id} value={flat.id}>
                {flat.title}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          De
          <input name="inicio" type="date" defaultValue={filters.inicio} />
        </label>
        <label className="field">
          Até
          <input name="fim" type="date" defaultValue={filters.fim} />
        </label>
        <button className="button">Aplicar filtros</button>
      </form>
      <div className="metric-grid">
        {[
          ["Ocupação", `${data.occupancy}%`],
          ["Recebido", money(totals.recebido)],
          [
            "Taxas e despesas",
            money(totals.receita_administradora + totals.despesas),
          ],
          ["Saldo a repassar", money(totals.saldo_repassar)],
        ].map(([label, value]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="dashboard-panel">
        <h2>Meus imóveis</h2>
        {flats.length ? (
          <div className="owner-property-grid">
            {flats.map((flat) => (
              <article key={flat.id}>
                <h3>{flat.title}</h3>
                <p>
                  {flat.neighborhood} · {flat.city}
                </p>
                <p>
                  {flat.occupancyStatus ?? (flat.active ? "Ativo" : "Inativo")}
                </p>
                <p>{flat.published ? "Publicado no site" : "Não publicado"}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>Nenhum imóvel vinculado à sua conta neste momento.</p>
        )}
      </section>
      <section className="dashboard-panel">
        <h2>Reservas</h2>
        <div className="table-scroll">
          <table>
            <caption>Histórico de reservas no período</caption>
            <thead>
              <tr>
                <th>Código</th>
                <th>Imóvel</th>
                <th>Período</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>{reservation.flat}</td>
                  <td>{reservation.period}</td>
                  <td>{money(reservation.amount)}</td>
                  <td>
                    {bookingLabels[reservation.status] ?? reservation.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.reservations.length && (
          <p>Nenhuma reserva no período selecionado.</p>
        )}
      </section>
      <section className="dashboard-panel">
        <div className="account-toolbar">
          <h2>Demonstrativo financeiro</h2>
          <button
            className="button button-outline button-sm"
            onClick={() => {
              const rows = [
                ["Data", "Imóvel", "Tipo", "Descrição", "Valor BRL"],
                ...statements.items.map((item) => [
                  item.data ?? item.data_movimento ?? item.created_at,
                  item.imovel_titulo ?? item.imovel?.titulo,
                  item.tipo ?? item.natureza,
                  item.descricao,
                  item.valor,
                ]),
                [],
                ["Recebido", totals.recebido],
                ["Taxa de administração", totals.receita_administradora],
                ["Despesas", totals.despesas],
                ["Repassado", totals.repassado],
                ["Saldo a repassar", totals.saldo_repassar],
              ];
              const url = URL.createObjectURL(
                new Blob(
                  [
                    "\uFEFF" +
                      rows.map((row) => row.map(cell).join(";")).join("\r\n"),
                  ],
                  { type: "text/csv;charset=utf-8;" },
                ),
              );
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "cespedes-demonstrativo.csv";
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Exportar CSV
          </button>
        </div>
        <dl className="financial-summary">
          {[
            ["Recebido", totals.recebido],
            ["Taxa de administração", totals.receita_administradora],
            ["Despesas", totals.despesas],
            ["Repasses realizados", totals.repassado],
            ["Saldo a repassar", totals.saldo_repassar],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dt>{label}</dt>
              <dd>{money(Number(value))}</dd>
            </div>
          ))}
        </dl>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Comprovante</th>
              </tr>
            </thead>
            <tbody>
              {statements.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {(
                      item.data ??
                      item.data_movimento ??
                      item.created_at ??
                      ""
                    ).slice(0, 10)}
                  </td>
                  <td>{item.descricao}</td>
                  <td>{item.tipo ?? item.natureza}</td>
                  <td>{money(Number(item.valor ?? 0))}</td>
                  <td>
                    {item.documento_id ? (
                      <a
                        href={`/api/owner-files/${encodeURIComponent(item.documento_id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir comprovante
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!statements.items.length && (
          <p>
            Nenhum lançamento no período. Os valores são atualizados pelos
            registros financeiros da equipe.
          </p>
        )}
      </section>
      {data.maintenance.length > 0 && (
        <section className="dashboard-panel">
          <h2>Manutenções e despesas</h2>
          {data.maintenance.map((item, index) => (
            <article className="maintenance-row" key={`${item.title}-${index}`}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.status}</p>
              </div>
              <strong>
                {item.amount == null
                  ? "Sem despesa vinculada"
                  : money(item.amount)}
              </strong>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
