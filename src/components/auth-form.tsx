"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export function AuthForm({
  mode,
  role = "guest",
  next = "/minha-conta",
  linkError = false,
}: {
  mode: "signin" | "signup" | "recovery" | "password";
  role?: "guest" | "owner";
  next?: string;
  linkError?: boolean;
}) {
  const router = useRouter();
  // Quem veio de uma reserva volta para ela depois do login ou da confirmação do cadastro.
  const nextQuery =
    next !== "/minha-conta" ? `next=${encodeURIComponent(next)}` : "";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    linkError
      ? "O link expirou ou não é válido. Solicite um novo acesso ou recuperação de senha."
      : "",
  );
  // E-mail aguardando confirmação: habilita o reenvio do link.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function resendConfirmation() {
    if (!pendingEmail || cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, next }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(result.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível reenviar.",
      );
    } finally {
      // O Supabase só aceita um novo envio por minuto para o mesmo endereço.
      setCooldown(60);
      setResending(false);
    }
  }
  return (
    <div className="container section-sm auth-container">
      <form
        className="stack-form dashboard-panel"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          setMessage("");
          const fields = new FormData(event.currentTarget);
          const email = String(fields.get("email") ?? "")
            .trim()
            .toLowerCase();
          try {
            const response = await fetch(`/api/auth/${mode}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...Object.fromEntries(fields),
                acceptedTerms: fields.get("acceptedTerms") === "on",
                role,
                next,
              }),
            });
            const result = await response.json();
            if (!response.ok) {
              if (result.code === "EMAIL_NAO_CONFIRMADO") setPendingEmail(email);
              throw new Error(result.error);
            }
            if (result.next) {
              router.push(result.next);
              router.refresh();
            } else {
              setMessage(result.message);
              if (result.resend) {
                setPendingEmail(email);
                setCooldown(60);
              }
            }
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Não foi possível continuar.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>
          {mode === "signup"
            ? "Crie sua conta de cliente"
            : mode === "recovery"
              ? "Recupere seu acesso"
              : mode === "password"
                ? "Defina sua senha"
                : role === "owner"
                  ? "Acesso do proprietário"
                  : "Acesso do cliente"}
        </h2>
        {mode === "signin" && (
          <p className="muted">
            {role === "owner"
              ? "A conta de proprietário é criada pela equipe e usa um e-mail diferente da conta de cliente."
              : "Acompanhe suas reservas e mantenha seus dados atualizados."}
          </p>
        )}
        {mode === "signup" && (
          <>
            <label className="field">
              Nome completo
              <input
                name="name"
                autoComplete="name"
                minLength={3}
                maxLength={120}
                required
              />
            </label>
            <label className="field">
              CPF
              <input
                name="cpf"
                autoComplete="off"
                inputMode="numeric"
                maxLength={14}
                required
              />
            </label>
            <label className="field">
              Telefone com DDD
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                required
              />
            </label>
          </>
        )}
        {mode !== "password" && (
          <label className="field">
            E-mail
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
        )}
        {mode !== "recovery" && (
          <label className="field">
            {mode === "password" ? "Nova senha" : "Senha"}
            <input
              name="password"
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              minLength={mode === "signin" ? 1 : 8}
              maxLength={128}
              required
            />
          </label>
        )}
        {mode === "signup" && (
          <label className="checkbox-label">
            <input name="acceptedTerms" type="checkbox" required />
            <span>
              Li os <Link href="/termos-de-uso">termos de uso</Link> e a{" "}
              <Link href="/politica-de-privacidade">
                política de privacidade
              </Link>
              .
            </span>
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        {pendingEmail && (mode === "signup" || mode === "signin") && (
          <div className="resend-confirmation">
            <p className="muted">
              Não recebeu o e-mail em <strong>{pendingEmail}</strong>? Confira a
              caixa de spam ou peça um novo link.
            </p>
            <button
              type="button"
              className="button button-outline button-sm"
              disabled={cooldown > 0 || resending}
              onClick={() => void resendConfirmation()}
            >
              {resending
                ? "Enviando…"
                : cooldown > 0
                  ? `Reenviar em ${cooldown}s`
                  : "Reenviar e-mail de confirmação"}
            </button>
          </div>
        )}
        <button className="button" disabled={busy}>
          {busy
            ? "Aguarde…"
            : mode === "signin"
              ? "Entrar"
              : mode === "signup"
                ? "Cadastrar e confirmar e-mail"
                : mode === "recovery"
                  ? "Enviar instruções"
                  : "Salvar senha"}
        </button>
        {mode === "signin" && (
          <>
            <Link href={`/recuperar-senha?role=${role}`}>
              Esqueci minha senha
            </Link>
            {role === "guest" ? (
              <>
                <Link href={`/cadastro${nextQuery ? `?${nextQuery}` : ""}`}>
                  Criar conta de cliente
                </Link>
                <Link href="/entrar?role=owner">Sou proprietário</Link>
              </>
            ) : (
              <Link href="/entrar?role=guest">Entrar como cliente</Link>
            )}
          </>
        )}
        {mode !== "signin" && (
          <Link href={`/entrar${nextQuery ? `?${nextQuery}` : ""}`}>
            Voltar para o acesso
          </Link>
        )}
      </form>
    </div>
  );
}
export function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="button button-outline button-sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const response = await fetch("/api/auth/signout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
          if (response.ok) {
            router.push("/entrar");
            router.refresh();
          }
        } finally {
          setBusy(false);
        }
      }}
    >
      Sair da conta
    </button>
  );
}
