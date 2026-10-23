"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";
import { Photo } from "./ui";
function caption(src: string) {
  if (src.includes("second-bedroom")) return "Segundo quarto";
  if (src.includes("bedroom")) return "Quarto";
  if (src.includes("kitchen")) return "Cozinha";
  if (src.includes("bathroom")) return "Banheiro";
  if (src.includes("balcony")) return "Varanda";
  return "Sala";
}
export function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const open = (i: number, button: HTMLButtonElement) => {
    setIndex(i);
    opener.current = button;
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
    opener.current?.focus();
  };
  useEffect(() => {
    const el = dialog.current;
    const lock = () => {
      document.body.style.overflow = el?.open ? "hidden" : "";
    };
    el?.addEventListener("close", lock);
    return () => {
      el?.removeEventListener("close", lock);
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <>
      <div className="gallery-grid">
        {images.map((src, i) => (
          <button
            type="button"
            className={`gallery-cell gallery-cell-${i}`}
            onClick={(e) => {
              open(i, e.currentTarget);
              document.body.style.overflow = "hidden";
            }}
            key={src}
            aria-label={`Ampliar foto ${i + 1} de ${title}`}
          >
            <Photo
              src={src}
              alt={`${caption(src)} de ${title} — imagem ilustrativa`}
              priority={i === 0}
              sizes={
                i === 0
                  ? "(max-width: 700px) 100vw, 60vw"
                  : "(max-width: 700px) 50vw, 25vw"
              }
            />
            {i === 0 && (
              <span className="gallery-badge">
                <Images size={16} />
                Ver fotos
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="image-disclosure">
        Imagens de ambientação geradas por IA. Solicite ao atendimento fotos
        atualizadas e informações do imóvel antes de reservar.
      </p>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`Galeria de ${title}`}
        onCancel={() => {
          document.body.style.overflow = "";
          opener.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setIndex((index + 1) % images.length);
          if (e.key === "ArrowLeft")
            setIndex((index + images.length - 1) % images.length);
        }}
      >
        <div className="lightbox-toolbar">
          <p>
            Imagem de ambientação · {index + 1} de {images.length}
          </p>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Fechar galeria"
          >
            <X />
          </button>
        </div>
        <div className="lightbox-photo">
          <Photo
            src={images[index]}
            alt={`${caption(images[index])} de ${title} — imagem ilustrativa`}
            sizes="90vw"
          />
        </div>
        <div className="lightbox-controls">
          <button
            className="button button-ghost"
            onClick={() =>
              setIndex((index + images.length - 1) % images.length)
            }
            aria-label="Foto anterior"
          >
            <ChevronLeft />
          </button>
          <span aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <button
            className="button button-ghost"
            onClick={() => setIndex((index + 1) % images.length)}
            aria-label="Próxima foto"
          >
            <ChevronRight />
          </button>
        </div>
      </dialog>
    </>
  );
}
