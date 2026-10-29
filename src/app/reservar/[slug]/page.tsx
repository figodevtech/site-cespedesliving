import type { Metadata } from "next";
import { modalities } from "@/domain/property";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFlat } from "@/services/flats";
import { isMock } from "@/services/adapter";
import { PageHero, Photo } from "@/components/ui";
import { BookingForm } from "@/components/booking-form";
import { InquiryForm } from "@/components/inquiry-form";
import { siteProfile } from "@/lib/site-session";
export const metadata: Metadata = {
  title: "Solicitar estadia",
  description:
    "Escolha seu período e consulte a disponibilidade de hospedagem com a Cespedes Living.",
};
export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const flat = await getFlat((await params).slug);
  if (!flat || !modalities(flat).includes("TEMPORADA")) notFound();
  // Sem sessão (ou conta pendente) o formulário leva ao login guardando a estadia.
  const profile = isMock() ? null : await siteProfile().catch(() => null);
  const customer =
    profile?.role === "guest"
      ? { name: profile.name, email: profile.email }
      : null;
  return (
    <>
      <PageHero
        eyebrow="Sua estadia"
        title="Falta pouco para o próximo momento."
        description="Confira a cotação e confirme a reserva com sua conta de cliente. O pagamento será combinado com o atendimento."
      />
      <div className="container section-sm checkout-layout">
        <div>
          <ol className="booking-steps" aria-label="Etapas da solicitação">
            <li className="active">01 · Datas e hóspedes</li>
            <li>02 · Identificação do cliente</li>
            <li>03 · Reserva confirmada</li>
          </ol>
          <div className="checkout-flat">
            <div className="photo-frame">
              <Photo
                src={flat.coverImage}
                alt={
                  flat.realPhotos
                    ? `Foto de ${flat.title}`
                    : `Sala ilustrativa de ${flat.title}`
                }
                sizes="(max-width: 700px) 100vw, 45vw"
              />
            </div>
            <p className="eyebrow gold-text">
              {flat.neighborhood} · {flat.city}
            </p>
            <h2>{flat.title}</h2>
            <p>{flat.description}</p>
            <Link className="text-link" href={`/flats/${flat.slug}`}>
              Rever detalhes do flat
            </Link>
          </div>
        </div>
        {isMock() ? (
          <InquiryForm flat={flat} initial={await searchParams} />
        ) : (
          <BookingForm
            flat={flat}
            checkout
            customer={customer}
            initial={await searchParams}
          />
        )}
      </div>
    </>
  );
}
