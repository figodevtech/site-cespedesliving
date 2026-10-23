import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFlat } from "@/services/flats";
import { isMock } from "@/services/adapter";
import { PageHero, Photo } from "@/components/ui";
import { BookingForm } from "@/components/booking-form";
import { InquiryForm } from "@/components/inquiry-form";
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
  if (!flat) notFound();
  return (
    <>
      <PageHero
        eyebrow="Sua estadia"
        title="Falta pouco para o próximo momento."
        description="Escolha seu período e continue no WhatsApp para consultar a disponibilidade com nossa equipe."
      />
      <div className="container section-sm checkout-layout">
        <div>
          <ol className="booking-steps" aria-label="Etapas da solicitação">
            <li className="active">01 · Datas e hóspedes</li>
            <li>02 · Consulta pelo WhatsApp</li>
            <li>03 · Confirmação pela equipe</li>
          </ol>
          <div className="checkout-flat">
            <div className="photo-frame">
              <Photo
                src={flat.coverImage}
                alt={`Sala ilustrativa de ${flat.title}`}
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
          <BookingForm flat={flat} checkout initial={await searchParams} />
        )}
      </div>
    </>
  );
}
