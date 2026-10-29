"use client";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Users,
  BedDouble,
  Wifi,
  ArrowRight,
} from "lucide-react";
import type { Flat } from "@/domain/types";
import { money } from "@/domain/dates";
import { writeDemo } from "@/lib/demo-storage";
import { useDemoValue } from "./demo-hook";
import { Photo } from "./ui";
export function FavoriteButton({ slug }: { slug: string }) {
  const favorites = useDemoValue<string[]>("favorites", []);
  const liked = favorites.includes(slug);
  return (
    <button
      type="button"
      className={`favorite-button ${liked ? "is-fav" : ""}`}
      aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={liked}
      onClick={() =>
        writeDemo(
          "favorites",
          liked ? favorites.filter((f) => f !== slug) : [...favorites, slug],
        )
      }
    >
      <Heart size={19} fill={liked ? "currentColor" : "none"} />
    </button>
  );
}
export function FlatCard({
  flat,
  stayQuery = "",
  showPrices = false,
}: {
  flat: Flat;
  stayQuery?: string;
  showPrices?: boolean;
}) {
  const href = `/flats/${flat.slug}${stayQuery ? `?${stayQuery}` : ""}`;
  return (
    <article className="flat-card">
      <div className="card-image">
        <Link href={href} aria-label={`Ver ${flat.title}`}>
          <Photo
            src={flat.coverImage}
            alt={
              flat.realPhotos
                ? `Foto do ${flat.title}`
                : `Sala ilustrativa do ${flat.title}`
            }
          />
        </Link>
        <span className="image-tag">{flat.tag}</span>
        {!flat.realPhotos && (
          <span className="illustrative-tag">Imagem de ambientação</span>
        )}
        <FavoriteButton slug={flat.slug} />
      </div>
      <div className="card-body">
        <p className="card-location">
          <MapPin size={14} />
          {flat.neighborhood} · {flat.city}
        </p>
        <h3>
          <Link href={href}>{flat.title}</Link>
        </h3>
        <div className="card-features">
          <span>
            <Users size={15} />
            {flat.maxGuests} hóspedes
          </span>
          <span>
            <BedDouble size={15} />
            {flat.bedrooms} quarto{flat.bedrooms > 1 ? "s" : ""}
          </span>
          <span>
            <Wifi size={15} />
            Wi-Fi
          </span>
        </div>
        <div className="card-footer">
          {showPrices ? (
            <div className="card-price">
              <small>A partir de</small>
              {money(flat.fromPrice)} <span>/ noite</span>
            </div>
          ) : (
            <div className="card-price">
              <small>Planeje sua estadia</small>
              <span className="inquiry-price">Tarifa sob consulta</span>
            </div>
          )}
          <Link
            href={href}
            className="button button-sm"
            aria-label={`Ver detalhes de ${flat.title}`}
          >
            Ver detalhes <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
