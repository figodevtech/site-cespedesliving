"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    window.history.replaceState(null, "", window.location.pathname);
    if (
      !accessToken ||
      !refreshToken ||
      !["invite", "recovery", "signup", "email"].includes(type ?? "")
    ) {
      queueMicrotask(() =>
        setError(
          "O link expirou ou não é válido. Solicite um novo convite ou recuperação de senha.",
        ),
      );
      return;
    }
    void fetch("/api/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken, type }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        router.replace(result.next);
        router.refresh();
      })
      .catch((error) =>
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível ativar o acesso.",
        ),
      );
  }, [router]);
  return (
    <div className="container section">
      <div className="dashboard-panel">
        <h1>Ativação do acesso</h1>
        {error ? (
          <>
            <p className="form-error" role="alert">
              {error}
            </p>
            <Link href="/recuperar-senha">Solicitar um novo link</Link>
          </>
        ) : (
          <p role="status">Validando seu acesso…</p>
        )}
      </div>
    </div>
  );
}
