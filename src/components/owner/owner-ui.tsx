import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { ArrowLeft, ChevronRight, FileText, Moon, Users } from "lucide-react";
import { Photo } from "../ui";
import { money } from "@/domain/dates";
import type { OwnerMovement } from "@/domain/types";
import {
  bookingStatusLabel,
  bookingStatusTone,
  dayMonth,
  movementDay,
  movementEffect,
  movementLabel,
  movementProperty,
  movementTone,
  movementType,
  paymentStatusLabel,
  paymentStatusTone,
  plural,
  shortDate,
  type OwnerReservation,
} from "@/domain/owner";

/** Peças visuais da área do proprietário (componentes de servidor, sem estado). */

export function Pill({ tone = "neutral", children }: { tone?: string; children: ReactNode }) {
  return <span className={`op-pill op-pill-${tone}`}>{children}</span>;
}

export function BookingPills({ reservation }: { reservation: OwnerReservation }) {
  return (
    <span className="op-pill-row">
      <Pill tone={bookingStatusTone[reservation.status]}>
        {bookingStatusLabel[reservation.status] ?? reservation.status}
      </Pill>
      {reservation.paymentStatus && reservation.status !== "CANCELLED" ? (
        <Pill tone={paymentStatusTone[reservation.paymentStatus]}>
          {paymentStatusLabel[reservation.paymentStatus] ?? reservation.paymentStatus}
        </Pill>
      ) : null}
    </span>
  );
}

export function PageHeading({
  title,
  description,
  back,
  children,
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="op-heading">
      <div>
        {back ? (
          <Link href={back.href} className="op-back">
            <ArrowLeft size={15} aria-hidden="true" /> {back.label}
          </Link>
        ) : null}
        <h1>{title}</h1>
        {description ? <p className="op-heading-description">{description}</p> : null}
      </div>
      {children ? <div className="op-heading-actions">{children}</div> : null}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  children,
}: {
  icon: ElementType;
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "default" | "hero";
  children?: ReactNode;
}) {
  return (
    <article className={`op-stat op-stat-${tone}`}>
      <div className="op-stat-top">
        <span>{label}</span>
        <span className="op-stat-icon">
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <strong>{value}</strong>
      {hint ? <p>{hint}</p> : null}
      {children}
    </article>
  );
}

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
  id,
}: {
  title: string;
  eyebrow?: string;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`op-panel ${className}`} id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <header className="op-panel-head">
        <div>
          {eyebrow ? <p className="op-eyebrow-dark">{eyebrow}</p> : null}
          <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
        </div>
        {action ? (
          <Link href={action.href} className="op-link">
            {action.label} <ChevronRight size={15} aria-hidden="true" />
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="op-empty">{children}</p>;
}

/** Linha de reserva clicável: datas, imóvel, noites, hóspedes, situação e valor. */
export function ReservationRow({ reservation, showFlat = true }: { reservation: OwnerReservation; showFlat?: boolean }) {
  return (
    <Link href={`/painel-proprietario/reservas/${encodeURIComponent(reservation.id)}`} className="op-res-row">
      <span className="op-date-chip" aria-hidden="true">
        <b>{dayMonth(reservation.checkin).split(" ")[0]}</b>
        <small>{dayMonth(reservation.checkin).split(" ")[1] ?? ""}</small>
      </span>
      <span className="op-res-main">
        <span className="op-res-title">
          {showFlat ? reservation.flat : `Reserva #${reservation.id}`}
        </span>
        <span className="op-res-meta">
          {dayMonth(reservation.checkin)} → {dayMonth(reservation.checkout)}
          <span className="op-dot" />
          <Moon size={12} aria-hidden="true" /> {plural(reservation.nights, "noite", "noites")}
          {reservation.guests ? (
            <>
              <span className="op-dot" />
              <Users size={12} aria-hidden="true" /> {plural(reservation.guests, "hóspede", "hóspedes")}
            </>
          ) : null}
          {showFlat ? (
            <>
              <span className="op-dot" />#{reservation.id}
            </>
          ) : null}
        </span>
      </span>
      <span className="op-res-status">
        <BookingPills reservation={reservation} />
      </span>
      <span className="op-res-amount">{money(reservation.amount)}</span>
      <ChevronRight className="op-res-chevron" size={17} aria-hidden="true" />
    </Link>
  );
}

/** Miniatura do imóvel com foto, para cartões e cabeçalhos. */
export function PropertyThumb({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`op-thumb ${className}`}>
      <Photo src={src} alt={alt} sizes="(max-width: 700px) 100vw, 420px" />
    </div>
  );
}

/** Tabela do extrato: data, imóvel, tipo, descrição, valor com efeito no saldo e comprovante. */
export function MovementTable({
  items,
  showProperty = true,
  caption,
}: {
  items: OwnerMovement[];
  showProperty?: boolean;
  caption: string;
}) {
  return (
    <div className="op-table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table className="op-table">
        <caption className="op-sr">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            {showProperty ? <th scope="col">Imóvel</th> : null}
            <th scope="col">Tipo</th>
            <th scope="col">Descrição</th>
            <th scope="col" className="op-num">Valor</th>
            <th scope="col">
              <span className="op-sr">Comprovante</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const type = movementType(item);
            const effect = movementEffect(item);
            return (
              <tr key={item.id}>
                <td className="op-nowrap">{shortDate(movementDay(item))}</td>
                {showProperty ? <td>{movementProperty(item) || "—"}</td> : null}
                <td>
                  <Pill tone={movementTone[type]}>{movementLabel[type] ?? (type || "Movimento")}</Pill>
                </td>
                <td className="op-desc">{item.descricao || "—"}</td>
                <td className={`op-num op-nowrap ${effect < 0 ? "op-out" : "op-in"}`}>
                  {effect < 0 ? "− " : "+ "}
                  {money(Math.abs(effect))}
                </td>
                <td className="op-nowrap">
                  {item.documento_id ? (
                    <a
                      className="op-link"
                      href={`/api/owner-files/${encodeURIComponent(item.documento_id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={14} aria-hidden="true" /> Comprovante
                    </a>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
