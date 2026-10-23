"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container section">
      <div className="empty-state">
        <h1>Vamos tentar de novo?</h1>
        <p>
          Não foi possível carregar esta página. Tente novamente em instantes.
        </p>
        <button className="button" onClick={reset}>
          Tentar novamente
        </button>
        <p>
          <Link href="/">Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}
