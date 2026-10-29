import Link from "next/link";
import { PageHero } from "@/components/ui";
import { requireProfile, sessionToken } from "@/lib/site-session";
import { erpRequest } from "@/lib/erp";
import type { Booking } from "@/domain/types";
import { formatDate, money } from "@/domain/dates";
import { notFound } from "next/navigation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireProfile("guest");
  const { id } = await searchParams;
  if (!id) notFound();
  const result = await erpRequest<{ items: Booking[] }>(
    `/site/me/reservas?id=${encodeURIComponent(id)}`,
    undefined,
    await sessionToken(),
  );
  const booking = result.items.find((item) => item.id === id);
  if (!booking) notFound();
  return (
    <>
      <PageHero
        eyebrow="Sua reserva"
        title={
          booking.status === "CANCELLED"
            ? "Reserva cancelada."
            : "Reserva registrada."
        }
      />
      <div className="container section-sm">
        <article className="dashboard-panel">
          <h2>{booking.flatTitle}</h2>
          <p>Código: {booking.id}</p>
          <p>
            {formatDate(booking.checkin)} a {formatDate(booking.checkout)} ·{" "}
            {booking.guests} hóspedes
          </p>
          <p>
            Total: <strong>{money(booking.total)}</strong>
          </p>
          <p>
            O pagamento será combinado com o atendimento. Consulte sua conta
            para acompanhar a reserva. Para alterações ou cancelamento, fale com
            a equipe.
          </p>
          <Link href="/minha-conta" className="button">
            Ver minhas reservas
          </Link>
        </article>
      </div>
    </>
  );
}
