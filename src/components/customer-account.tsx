"use client";
import Link from "next/link";
import { useState } from "react";
import type { Booking, SiteProfile } from "@/domain/types";
import { money, formatDate } from "@/domain/dates";
import { SignOut } from "./auth-form";
export const bookingLabels: Record<string, string> = {
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  PENDING: "Pendente",
};
export const paymentLabels: Record<string, string> = {
  PENDING: "Pagamento pendente",
  PARTIAL: "Pagamento parcial",
  PAID: "Pago",
  REFUNDED: "Estornado",
};
export function CustomerAccount({
  profile,
  bookings,
  pagination,
}: {
  profile: SiteProfile;
  bookings: Booking[];
  pagination?: { page: number; pageSize: number; total: number };
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="container section-sm">
      <div className="account-toolbar">
        <p>Olá, {profile.name}.</p>
        <SignOut />
      </div>
      <div className="account-grid">
        <form
          className="dashboard-panel stack-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            setMessage("");
            const fields = new FormData(event.currentTarget);
            try {
              const response = await fetch("/api/account/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(fields)),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error);
              setMessage("Dados atualizados.");
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Não foi possível salvar.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Meus dados</h2>
          <label className="field">
            Nome completo
            <input
              name="name"
              defaultValue={profile.name}
              minLength={3}
              maxLength={120}
              required
            />
          </label>
          <label className="field">
            Telefone
            <input
              name="phone"
              type="tel"
              defaultValue={profile.phone}
              required
            />
          </label>
          <p>E-mail: {profile.email}</p>
          <p>CPF: {profile.cpf}</p>
          <p className="muted">
            Para corrigir CPF ou e-mail, fale com o atendimento.
          </p>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          <button className="button" disabled={busy}>
            Salvar dados
          </button>
        </form>
        <section className="dashboard-panel">
          <h2>Minhas reservas</h2>
          {bookings.length ? (
            <div className="stack-form">
              {bookings.map((booking) => (
                <article className="reservation-card" key={booking.id}>
                  <h3>
                    <Link href={`/flats/${booking.slug}`}>
                      {booking.flatTitle}
                    </Link>
                  </h3>
                  <p>
                    {formatDate(booking.checkin)} a{" "}
                    {formatDate(booking.checkout)} · {booking.guests} hóspedes
                  </p>
                  <p>
                    <span className="status-pill">
                      {bookingLabels[booking.status] ?? booking.status}
                    </span>{" "}
                    · {paymentLabels[booking.paymentStatus ?? "PENDING"]}
                  </p>
                  <strong>{money(booking.total)}</strong>
                  <p className="muted">Código: {booking.id}</p>
                  <p>Pagamento e cancelamento são tratados com a equipe.</p>
                </article>
              ))}
            </div>
          ) : (
            <p>
              Você ainda não tem reservas.{" "}
              <Link href="/flats?modality=TEMPORADA">
                Encontre sua próxima estadia.
              </Link>
            </p>
          )}
          {pagination && pagination.total > pagination.pageSize && (
            <nav className="account-toolbar" aria-label="Páginas de reservas">
              {pagination.page > 1 ? (
                <Link href={`/minha-conta?page=${pagination.page - 1}`}>
                  Anteriores
                </Link>
              ) : (
                <span />
              )}
              <span>
                Página {pagination.page} de{" "}
                {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              {pagination.page * pagination.pageSize < pagination.total && (
                <Link href={`/minha-conta?page=${pagination.page + 1}`}>
                  Próximas
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
