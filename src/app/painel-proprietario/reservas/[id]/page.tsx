import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ChevronRight, Info, LogIn, LogOut, Mail, MapPin, Moon, Phone, Users, XCircle } from "lucide-react";
import { ownerDashboard, ownerFlats, ownerStatement } from "@/lib/owner-portal";
import { money, today } from "@/domain/dates";
import {
  fullDate,
  movementDay,
  movementTotals,
  normalizeReservations,
  plural,
  propertyStatusOf,
  weekdayLong,
} from "@/domain/owner";
import { BookingPills, Empty, MovementTable, PageHeading, Panel, Pill, PropertyThumb } from "@/components/owner/owner-ui";

export const metadata = { title: "Reserva" };

/** "83999998888" → "(83) 99999-8888", com os dígitos para o link; sem DDD, mostra como veio. */
function phoneOf(value?: string | null) {
  const digits = String(value ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (!digits) return null;
  const label =
    digits.length === 11 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    : digits.length === 10 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    : String(value).trim();
  // Com DDD (10 ou 11 dígitos), o link leva o +55; fora disso, disca os dígitos como vieram.
  const href = `tel:${digits.length === 10 || digits.length === 11 ? `+55${digits}` : digits}`;
  return { href, label };
}

export default async function OwnerReservation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [flats, dashboard, statement] = await Promise.all([ownerFlats(), ownerDashboard(), ownerStatement()]);
  const reservation = normalizeReservations(dashboard.reservations, flats).find((item) => item.id === id);
  if (!reservation) notFound();

  const day = today();
  const flat = flats.find((item) => item.id === reservation.flatId);
  const movements = statement.items
    .filter((item) => String(item.reserva_id ?? "") === reservation.id)
    .sort((a, b) => movementDay(b).localeCompare(movementDay(a)));
  const totals = movementTotals(movements);
  const cents = (value: number) => Math.round(value * 100);
  // A parte do proprietário: o que o hóspede pagou menos a taxa e as despesas da reserva.
  const net = (cents(totals.received) - cents(totals.fees) - cents(totals.expenses)) / 100;
  // Os totais já deixam de fora o repasse pendente (ainda não pago): ele não conta como repassado.
  const paidPayouts = totals.payouts;
  const pending = (cents(net) - cents(paidPayouts)) / 100;
  const paid = reservation.amount > 0 ? Math.min(100, Math.max(0, Math.round((totals.received / reservation.amount) * 100))) : 0;
  const guest = reservation.guest;
  const guestPhone = phoneOf(guest?.phone);
  const guestPlace = [guest?.city, guest?.state].filter(Boolean).join(" - ");
  const cancelled = reservation.status === "CANCELLED";
  const done = (date: string) => !cancelled && (reservation.status === "COMPLETED" || (Boolean(date) && date <= day));
  const createdDay = reservation.createdAt ? movementDay({ id: "criacao", created_at: reservation.createdAt }) : "";
  const steps = [
    { icon: CalendarClock, label: "Reserva registrada", date: createdDay, state: "done" },
    {
      icon: LogIn,
      label: "Entrada do hóspede",
      date: reservation.checkin,
      state: done(reservation.checkin) || reservation.status === "IN_PROGRESS" ? "done" : "next",
    },
    {
      icon: LogOut,
      label: "Saída do hóspede",
      date: reservation.checkout,
      state: reservation.status === "COMPLETED" || done(reservation.checkout) ? "done" : reservation.status === "IN_PROGRESS" ? "current" : "next",
    },
  ];

  return (
    <>
      <PageHeading
        title={`Reserva #${reservation.id}`}
        description={reservation.flat}
        back={{ href: "/painel-proprietario/reservas", label: "Reservas" }}
      >
        <BookingPills reservation={reservation} />
      </PageHeading>

      {cancelled ? (
        <p className="op-alert">
          <XCircle size={17} aria-hidden="true" /> Esta reserva foi cancelada. Valores recebidos e estornos aparecem nas movimentações abaixo.
        </p>
      ) : null}

      <div className="op-res-detail">
        <div className="op-res-detail-main">
          <section className="op-panel op-stay" aria-label="Estadia">
            <div className="op-stay-dates">
              <div>
                <span className="op-eyebrow-dark">Entrada</span>
                <strong>{fullDate(reservation.checkin)}</strong>
                <small>{weekdayLong(reservation.checkin)}{flat?.checkinTime ? ` · a partir das ${flat.checkinTime.slice(0, 5)}` : ""}</small>
              </div>
              <span className="op-stay-nights">
                <Moon size={15} aria-hidden="true" />
                {plural(reservation.nights, "noite", "noites")}
              </span>
              <div>
                <span className="op-eyebrow-dark">Saída</span>
                <strong>{fullDate(reservation.checkout)}</strong>
                <small>{weekdayLong(reservation.checkout)}{flat?.checkoutTime ? ` · até ${flat.checkoutTime.slice(0, 5)}` : ""}</small>
              </div>
            </div>
            {reservation.guests ? (
              <p className="op-stay-guests">
                <Users size={15} aria-hidden="true" /> {plural(reservation.guests, "hóspede", "hóspedes")}
              </p>
            ) : null}
            {!cancelled ? (
              <ol className="op-timeline">
                {steps.map(({ icon: Icon, label, date, state }) => (
                  <li key={label} className={`op-step op-step-${state}`}>
                    <span className="op-step-dot">
                      <Icon size={14} aria-hidden="true" />
                    </span>
                    <span>
                      <b>{label}</b>
                      <small>{date ? fullDate(date) : "—"}</small>
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>

          {guest?.name ? (
            <Panel title={guest.name} eyebrow="Hóspede titular">
              {guestPhone || guest.email || guestPlace ? (
                <ul className="op-specs op-specs-lg" aria-label="Contato do hóspede">
                  {guestPhone ? (
                    <li>
                      <Phone size={15} aria-hidden="true" />
                      <a className="op-link" href={guestPhone.href}>{guestPhone.label}</a>
                    </li>
                  ) : null}
                  {guest.email ? (
                    <li>
                      <Mail size={15} aria-hidden="true" />
                      <a className="op-link" href={`mailto:${guest.email}`}>{guest.email}</a>
                    </li>
                  ) : null}
                  {guestPlace ? (
                    <li>
                      <MapPin size={15} aria-hidden="true" /> {guestPlace}
                    </li>
                  ) : null}
                </ul>
              ) : (
                <Empty>Sem contato cadastrado para este hóspede.</Empty>
              )}
            </Panel>
          ) : null}

          <Panel title="Movimentações desta reserva" eyebrow="Extrato">
            {movements.length ? (
              <MovementTable items={movements} showProperty={false} caption={`Movimentações da reserva ${reservation.id}`} />
            ) : (
              <Empty>Nenhuma movimentação registrada para esta reserva ainda.</Empty>
            )}
            <p className="op-note">
              <Info size={14} aria-hidden="true" /> Despesas e repasses lançados sem vínculo com uma reserva aparecem no{" "}
              <Link href={`/painel-proprietario/extrato${reservation.flatId ? `?imovelId=${encodeURIComponent(reservation.flatId)}` : ""}`} className="op-link">
                extrato
              </Link>
              .
            </p>
          </Panel>
        </div>

        <aside className="op-res-detail-side">
          <section className="op-panel" aria-labelledby="valores-title">
            <h2 id="valores-title" className="op-side-title">Valores</h2>
            <dl className="op-values">
              <div>
                <dt>Valor da estadia</dt>
                <dd>{money(reservation.amount)}</dd>
              </div>
              <div>
                <dt>Recebido do hóspede</dt>
                <dd className="op-guest">{money(totals.received)}</dd>
              </div>
              <div>
                <dt>Taxa de administração</dt>
                <dd>− {money(totals.fees)}</dd>
              </div>
              {totals.expenses ? (
                <div>
                  <dt>Despesas do imóvel</dt>
                  <dd>− {money(totals.expenses)}</dd>
                </div>
              ) : null}
              <div className="op-values-total">
                <dt>Líquido para você</dt>
                <dd>{money(net)}</dd>
              </div>
              <div>
                <dt>Repassado a você</dt>
                <dd className={paidPayouts ? "op-payout" : undefined}>{paidPayouts ? `+ ${money(paidPayouts)}` : money(0)}</dd>
              </div>
              <div>
                <dt>Falta repassar</dt>
                {/* Com tudo repassado, diz isso em vez de mostrar R$ 0,00. */}
                <dd className={pending <= 0 && net > 0 ? "op-payout" : undefined}>
                  {pending > 0 ? money(pending) : net > 0 ? "Repasse completo" : "—"}
                </dd>
              </div>
            </dl>
            {!cancelled ? (
              <>
                <div className="op-meter op-meter-lg" aria-hidden="true">
                  <span style={{ width: `${paid}%` }} />
                </div>
                <p className="op-meter-label">{paid}% do valor da estadia já foi pago pelo hóspede</p>
              </>
            ) : null}
          </section>

          {flat ? (
            <Link href={`/painel-proprietario/imoveis/${encodeURIComponent(flat.id)}`} className="op-panel op-side-flat">
              <PropertyThumb src={flat.coverImage} alt={flat.title} className="op-thumb-side" />
              <span className="op-side-flat-body">
                <span className="op-eyebrow-dark">Imóvel</span>
                <b>{flat.title}</b>
                <small>{[flat.neighborhood, flat.city].filter(Boolean).join(" · ")}</small>
                <Pill tone={propertyStatusOf(flat).tone}>{propertyStatusOf(flat).label}</Pill>
              </span>
              <ChevronRight size={17} aria-hidden="true" className="op-res-chevron" />
            </Link>
          ) : null}
        </aside>
      </div>
    </>
  );
}
