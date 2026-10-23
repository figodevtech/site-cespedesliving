import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Users,
  BedDouble,
  Bath,
  Ruler,
  Check,
  ArrowRight,
} from "lucide-react";
import { getFlat } from "@/services/flats";
import { isMock } from "@/services/adapter";
import { Gallery } from "@/components/gallery";
import { BookingForm } from "@/components/booking-form";
import { InquiryForm } from "@/components/inquiry-form";
import { FavoriteButton } from "@/components/flat-card";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const flat = await getFlat((await params).slug);
  return {
    title: flat?.title ?? "Flat não encontrado",
    description: flat?.description,
  };
}
export default async function FlatDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const flat = await getFlat((await params).slug);
  if (!flat) notFound();
  return (
    <div className="container detail-hero">
      <nav className="breadcrumbs" aria-label="Trilha de navegação">
        <Link href="/">Início</Link>
        <span>/</span>
        <Link href="/flats">Flats</Link>
        <span>/</span>
        <span>{flat.neighborhood}</span>
      </nav>
      <div className="detail-title">
        <div>
          <p className="eyebrow gold-text">SEU REFÚGIO NA CIDADE</p>
          <h1>{flat.title}</h1>
          <p className="card-location">
            <MapPin size={16} />
            {flat.neighborhood} · {flat.city} · PB
          </p>
        </div>
        <div className="detail-favorite">
          <FavoriteButton slug={flat.slug} />
        </div>
      </div>
      <Gallery images={flat.gallery} title={flat.title} />
      <div className="detail-layout">
        <div>
          <div className="detail-facts">
            <span>
              <Users size={19} />
              Até {flat.maxGuests} hóspedes
            </span>
            <span>
              <BedDouble size={19} />
              {flat.bedrooms} quarto{flat.bedrooms > 1 ? "s" : ""}
            </span>
            <span>
              <Bath size={19} />
              {flat.bathrooms} banheiro{flat.bathrooms > 1 ? "s" : ""}
            </span>
            <span>
              <Ruler size={19} />
              {flat.areaSqm} m²
            </span>
          </div>
          <section className="detail-section">
            <h2>Um espaço para se sentir bem.</h2>
            <p className="section-lead">{flat.description}</p>
            <p className="muted">
              Consulte o atendimento para confirmar as características do
              imóvel, o endereço e as condições disponíveis para sua estadia.
            </p>
          </section>
          <section className="detail-section">
            <h2>O conforto está nos detalhes.</h2>
            <ul className="amenity-grid">
              {flat.amenities.map((a) => (
                <li key={a}>
                  <Check size={18} />
                  {a}
                </li>
              ))}
            </ul>
          </section>
          <section className="detail-section">
            <h2>Seu entorno</h2>
            <p>
              Na região de {flat.neighborhood}, em {flat.city}, a proposta é
              estar perto da vida local: gastronomia, serviços e passeios pelo
              litoral. As distâncias e o endereço exato serão confirmados no
              catálogo oficial.
            </p>
            <Link
              className="text-link"
              href={`/flats?neighborhood=${encodeURIComponent(flat.neighborhood)}`}
            >
              Conheça outros flats na região <ArrowRight size={16} />
            </Link>
          </section>
          <section className="detail-section">
            <h2>Antes de chegar</h2>
            <div className="rules-grid">
              <div>
                <h3>Regras da estadia</h3>
                <ul>
                  <li>Confirme o horário de check-in com o atendimento.</li>
                  <li>O horário de check-out é informado na confirmação.</li>
                  <li>Não são permitidas festas ou eventos.</li>
                  <li>Respeite o limite de {flat.maxGuests} hóspedes.</li>
                </ul>
              </div>
              <div>
                <h3>Solicitação e confirmação</h3>
                <p>
                  Confirme com o atendimento a política de cancelamento e as
                  condições específicas do imóvel antes de concluir sua reserva.
                </p>
                <Link href="/perguntas-frequentes" className="text-link">
                  Tire suas dúvidas
                </Link>
              </div>
            </div>
          </section>
        </div>
        <aside aria-label="Planejar reserva">
          {isMock() ? (
            <InquiryForm flat={flat} initial={await searchParams} />
          ) : (
            <BookingForm flat={flat} initial={await searchParams} />
          )}
        </aside>
      </div>
    </div>
  );
}
