"use client";
import { useState } from "react";
import {
  ArrowDownToLine,
  TrendingUp,
  CalendarDays,
  Wallet,
  ReceiptText,
} from "lucide-react";
import type { OwnerDashboard } from "@/domain/types";
import { money } from "@/domain/dates";
import { Notice } from "./ui";
export function OwnerDashboardView({ data }: { data: OwnerDashboard }) {
  const [period, setPeriod] = useState("atual");
  const factor = period === "anterior" ? 0.84 : 1;
  const revenue = Math.round(data.revenue * factor);
  const expenses = Math.round(data.expenses * factor);
  const payout = revenue - expenses;
  const bars = [44, 65, 58, 81, 74, 78].map((n) => Math.round(n * factor));
  return (
    <div className="container section-sm dashboard">
      <Notice>
        PORTAL DEMONSTRATIVO ABERTO · Todos os dados e relatórios são fictícios.
        Nenhuma informação de proprietários reais é exibida.
      </Notice>
      <div className="dashboard-toolbar">
        <nav aria-label="Seções do painel">
          <a href="#indicadores">Visão geral</a>
          <a href="#reservas">Reservas</a>
          <a href="#financeiro">Financeiro</a>
          <a href="#manutencoes">Manutenções</a>
        </nav>
        <div className="field">
          <label htmlFor="dashboard-period">Período ilustrativo</label>
          <select
            id="dashboard-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="atual">Cenário atual fictício</option>
            <option value="anterior">Cenário anterior fictício</option>
          </select>
        </div>
      </div>
      <section id="indicadores" aria-label="Indicadores fictícios">
        <div className="metric-grid">
          {[
            [
              CalendarDays,
              "Ocupação",
              `${Math.round(data.occupancy * factor)}%`,
            ],
            [TrendingUp, "Receitas", money(revenue)],
            [ReceiptText, "Despesas", money(expenses)],
            [Wallet, "Repasse previsto", money(payout)],
          ].map(([Icon, label, value], i) => {
            const Component = Icon as typeof Wallet;
            return (
              <article className="metric-card" key={i}>
                <div>
                  <span>{label as string}</span>
                  <Component size={19} />
                </div>
                <strong>{value as string}</strong>
                <small>Indicador ilustrativo</small>
              </article>
            );
          })}
        </div>
      </section>
      <div className="dashboard-charts">
        <section className="dashboard-panel">
          <p className="eyebrow gold-text">DESEMPENHO ILUSTRATIVO</p>
          <h2>Espaço para acompanhar.</h2>
          <p className="muted">
            Evolução de ocupação em seis períodos fictícios.
          </p>
          <div
            className="occupancy-chart"
            role="img"
            aria-label={`Ocupação ilustrativa por período: ${bars.map((n, i) => `P${i + 1}: ${n}%`).join(", ")}`}
          >
            {bars.map((n, i) => (
              <div className="chart-column" key={i}>
                <span>{n}%</span>
                <div className="chart-bar" style={{ height: `${n * 1.6}px` }} />
                <small>P{i + 1}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="dashboard-panel" id="financeiro">
          <p className="eyebrow gold-text">FINANCEIRO</p>
          <h2>Resumo do cenário.</h2>
          <dl className="financial-summary">
            <div>
              <dt>Receitas ilustrativas</dt>
              <dd>{money(revenue)}</dd>
            </div>
            <div>
              <dt>Despesas ilustrativas</dt>
              <dd>− {money(expenses)}</dd>
            </div>
            <div>
              <dt>Repasse ilustrativo</dt>
              <dd>{money(payout)}</dd>
            </div>
          </dl>
          <button
            className="button button-outline button-block"
            onClick={() => {
              const csv =
                "\uFEFFRelatório FICTÍCIO — Céspedes Living\nIndicador;Valor BRL\nReceitas;" +
                revenue +
                "\nDespesas;" +
                expenses +
                "\nRepasse;" +
                payout +
                "\n";
              const url = URL.createObjectURL(
                new Blob([csv], { type: "text/csv;charset=utf-8;" }),
              );
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "cespedes-relatorio-ficticio.csv";
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            <ArrowDownToLine size={17} />
            Baixar extrato fictício
          </button>
        </section>
      </div>
      <section className="dashboard-panel" id="reservas">
        <p className="eyebrow gold-text">RESERVAS</p>
        <h2>Uma operação com visibilidade.</h2>
        <div
          className="table-scroll"
          role="region"
          aria-label="Tabela de reservas fictícias, com rolagem horizontal"
          tabIndex={0}
        >
          <table>
            <caption>
              Reservas inteiramente fictícias · cenário{" "}
              {period === "atual" ? "atual" : "anterior"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Solicitação</th>
                <th scope="col">Imóvel</th>
                <th scope="col">Período</th>
                <th scope="col">Valor</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.reservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.flat}</td>
                  <td>{r.period}</td>
                  <td>{money(Math.round(r.amount * factor))}</td>
                  <td>
                    <span className="status-pill">{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="dashboard-panel" id="manutencoes">
        <p className="eyebrow gold-text">CUIDADO CONTÍNUO</p>
        <h2>Manutenções e despesas.</h2>
        {data.maintenance.map((m) => (
          <article className="maintenance-row" key={m.title}>
            <div>
              <h3>{m.title}</h3>
              <p>{m.status}</p>
            </div>
            <strong>{money(m.amount)}</strong>
          </article>
        ))}
        <p className="muted">
          Os valores detalhados representam apenas exemplos de despesas do
          cenário.
        </p>
      </section>
    </div>
  );
}
