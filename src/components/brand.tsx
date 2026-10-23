import Image from "next/image";
import Link from "next/link";
import assets from "@/data/brand.json";

export function Brand({
  variant = "header",
}: {
  variant?: "header" | "footer";
}) {
  const asset =
    assets[variant === "footer" ? "logo-stacked" : "logo-horizontal"];
  return (
    <Link
      href="/"
      className={`brand brand-${variant}`}
      aria-label="Céspedes Living Hospedagens — início"
    >
      <Image
        src={asset.src}
        alt="Céspedes Living Hospedagens"
        width={asset.width}
        height={asset.height}
        className="brand-image"
        priority={variant === "header"}
        unoptimized
      />
    </Link>
  );
}
