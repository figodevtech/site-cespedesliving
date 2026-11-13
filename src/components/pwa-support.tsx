"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
const LAUNCH_KEY = "cl-pwa-launched";
const NO_ZOOM_VIEWPORT =
  "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no";
/**
 * Rotas que o app abre no meio de um fluxo (links de e-mail, cadastro) ou que já
 * exigem login por conta própria. As demais levam ao login ao abrir o app.
 */
const KEEP_ON_LAUNCH = [
  "/entrar",
  "/auth/",
  "/definir-senha",
  "/recuperar-senha",
  "/cadastro",
  "/minha-conta",
  "/painel-proprietario",
];
function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
/** Viewport sem zoom. Reaplicado a cada página, caso o Next recrie a meta tag. */
function lockViewport() {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  if (meta.content !== NO_ZOOM_VIEWPORT) meta.content = NO_ZOOM_VIEWPORT;
}
/**
 * Registra o service worker e garante que o app instalado sempre comece no
 * login. O Android respeita o start_url do manifesto; o iPhone usa a página em
 * que a pessoa estava ao "Adicionar à Tela de Início", por isso a correção aqui.
 * No app instalado o zoom fica bloqueado; no navegador o site continua com zoom
 * (acessibilidade).
 */
export function PwaSupport() {
  const path = usePathname();
  useEffect(() => {
    if (isStandalone()) {
      let firstView = false;
      try {
        // sessionStorage zera a cada nova abertura do app.
        firstView = !sessionStorage.getItem(LAUNCH_KEY);
        sessionStorage.setItem(LAUNCH_KEY, "1");
      } catch {
        // Sem armazenamento: não arrisca um redirecionamento em loop.
      }
      const current = window.location.pathname;
      if (firstView && !KEEP_ON_LAUNCH.some((p) => current.startsWith(p))) {
        window.location.replace("/entrar");
        return;
      }
      document.documentElement.classList.add("pwa-standalone");
      // O Safari do iPhone ignora user-scalable=no; o gesto de pinça é barrado aqui.
      const block = (event: Event) => event.preventDefault();
      const multiTouch = (event: TouchEvent) => {
        if (event.touches.length > 1) event.preventDefault();
      };
      document.addEventListener("gesturestart", block);
      document.addEventListener("gesturechange", block);
      document.addEventListener("touchmove", multiTouch, { passive: false });
      return () => {
        document.removeEventListener("gesturestart", block);
        document.removeEventListener("gesturechange", block);
        document.removeEventListener("touchmove", multiTouch);
      };
    }
  }, []);
  useEffect(() => {
    if (isStandalone()) lockViewport();
  }, [path]);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator))
      return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => undefined);
  }, []);
  return null;
}
