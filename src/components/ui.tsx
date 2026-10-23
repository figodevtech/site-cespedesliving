import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
export function ButtonLink({
  href,
  children,
  variant = "",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`button ${variant ? `button-${variant}` : ""} ${className}`}
    >
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}
export function Photo({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`photo ${className}`}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNCI+PHBhdGggZmlsbD0iI2Q1Y2ViZiIgZD0iTTAgMGgyMHYxNEgweiIvPjwvc3ZnPg=="
    />
  );
}
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Trilha de navegação">
          <Link href="/">Início</Link>
          <ChevronRight size={13} />
          <span>{eyebrow}</span>
        </nav>
        <p className="eyebrow gold-text page-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
export function EmptyState({
  title,
  children,
  href = "/flats",
  action = "Explorar flats",
  heading = "h2",
}: {
  title: string;
  children: ReactNode;
  href?: string;
  action?: string;
  heading?: "h1" | "h2";
}) {
  const Heading = heading;
  return (
    <div className="empty-state">
      <Heading>{title}</Heading>
      <p className="muted">{children}</p>
      <ButtonLink href={href}>{action}</ButtonLink>
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return <p className="notice">{children}</p>;
}
