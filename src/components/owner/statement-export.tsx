"use client";
import { Download } from "lucide-react";
import type { OwnerMovement, OwnerStatementData } from "@/domain/types";
import { movementDay, movementLabel, movementProperty, movementType, movementValue } from "@/domain/owner";

/** Célula de CSV protegida contra fórmulas ao abrir no Excel. */
function cell(value: unknown) {
  const original = String(value ?? "");
  const text = typeof value === "string" && /^[=+\-@\t\r]/.test(original) ? `'${original}` : original;
  return `"${text.replaceAll('"', '""')}"`;
}

const number = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Baixa o extrato filtrado em CSV (separador ";", como o Excel em português espera). */
export function StatementExport({
  items,
  totals,
}: {
  items: OwnerMovement[];
  totals: OwnerStatementData["totais"];
}) {
  return (
    <button
      type="button"
      className="op-button op-button-ghost"
      disabled={!items.length}
      onClick={() => {
        const rows = [
          ["Data", "Imóvel", "Tipo", "Descrição", "Valor (R$)"],
          ...items.map((item) => [
            movementDay(item),
            movementProperty(item),
            movementLabel[movementType(item)] ?? movementType(item),
            item.descricao ?? "",
            number(movementValue(item)),
          ]),
          [],
          ["Recebido", number(totals.recebido)],
          ["Taxa de administração", number(totals.receita_administradora)],
          ["Despesas", number(totals.despesas)],
          ["Repassado", number(totals.repassado)],
          ["Saldo a repassar", number(totals.saldo_repassar)],
        ];
        const url = URL.createObjectURL(
          new Blob(["﻿" + rows.map((row) => row.map(cell).join(";")).join("\r\n")], {
            type: "text/csv;charset=utf-8;",
          }),
        );
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "cespedes-extrato.csv";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}
    >
      <Download size={16} aria-hidden="true" /> Exportar CSV
    </button>
  );
}
