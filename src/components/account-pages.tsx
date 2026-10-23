"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Flat } from "@/domain/types";
import { clearDemo } from "@/lib/demo-storage";
import { useDemoValue } from "./demo-hook";
import { FlatCard } from "./flat-card";
import { EmptyState } from "./ui";
export function Favorites({ flats }: { flats: Flat[] }) {
  const favorites = useDemoValue<string[]>("favorites", []);
  const selected = flats.filter((f) => favorites.includes(f.slug));
  const [message, setMessage] = useState("");
  return (
    <div className="container section-sm">
      <div className="account-toolbar">
        <p className="muted">Suas escolhas ficam salvas neste navegador.</p>
        <button
          className="text-link"
          onClick={() => {
            clearDemo();
            setMessage("Os dados salvos neste navegador foram apagados.");
          }}
        >
          <Trash2 size={16} />
          Apagar dados deste navegador
        </button>
      </div>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {selected.length ? (
        <div className="card-grid">
          {selected.map((flat) => (
            <FlatCard flat={flat} key={flat.id} />
          ))}
        </div>
      ) : (
        <EmptyState title="Guarde seus próximos momentos.">
          Toque no coração de um flat para encontrá-lo aqui depois.
        </EmptyState>
      )}
    </div>
  );
}
