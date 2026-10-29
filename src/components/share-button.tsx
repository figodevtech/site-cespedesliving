"use client";
import { useState } from "react";
import { Check, Share2 } from "lucide-react";
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    // Sem query string: datas/hóspedes da busca não fazem sentido para quem recebe.
    const url = window.location.origin + window.location.pathname;
    const text = `Conheça o ${title} na Cespedes Living`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Usuário cancelou o compartilhamento.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${text}: ${url}`)}`,
        "_blank",
        "noopener",
      );
    }
  };
  return (
    <button type="button" className="share-button" onClick={share}>
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      <span aria-live="polite">{copied ? "Link copiado" : "Compartilhar"}</span>
    </button>
  );
}
