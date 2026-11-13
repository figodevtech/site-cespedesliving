"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
const FADE_IN_MS = 420;
const STUCK_MS = 6000;
const OWNER_AREA = "/painel-proprietario";
/**
 * Dentro da área do proprietário a navegação é instantânea, com esqueletos
 * (loading.tsx): esmaecer a página inteira, abas incluídas, só atrasaria a resposta.
 */
const inOwnerArea = (path: string) =>
  path === OWNER_AREA || path.startsWith(`${OWNER_AREA}/`);
// Esmaece o <main> ao clicar num link interno e o revela quando a nova rota entra.
export function PageTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const previous = useRef(pathname);
  useEffect(() => {
    const root = document.documentElement;
    let stuck: number | undefined;
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element | null)?.closest("a");
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname)
        return;
      if (inOwnerArea(location.pathname) && inOwnerArea(url.pathname)) return;
      root.dataset.pageTransition = "out";
      window.clearTimeout(stuck);
      // Se a navegação for cancelada, não deixa a página apagada.
      stuck = window.setTimeout(() => {
        if (root.dataset.pageTransition === "out")
          delete root.dataset.pageTransition;
      }, STUCK_MS);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      window.clearTimeout(stuck);
    };
  }, []);
  useEffect(() => {
    const from = previous.current;
    previous.current = pathname;
    if (first.current) {
      first.current = false;
      return;
    }
    if (inOwnerArea(from) && inOwnerArea(pathname)) return;
    const root = document.documentElement;
    root.dataset.pageTransition = "in";
    const done = window.setTimeout(() => {
      delete root.dataset.pageTransition;
    }, FADE_IN_MS);
    return () => window.clearTimeout(done);
  }, [pathname]);
  return null;
}
