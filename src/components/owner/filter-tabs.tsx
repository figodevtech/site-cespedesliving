"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, useTransition, type MouseEvent, type ReactNode } from "react";

/**
 * Abas de filtro da área do proprietário (período, situação, tipo). Elas só mudam a
 * query da URL, e nesse caso o Next mantém a tela antiga até o servidor responder:
 * numa rede lenta o clique parecia ignorado. Aqui a aba é marcada na hora, a troca
 * roda numa transição e só a parte afetada (FilterPending) vira esqueleto.
 */

type FilterState = { pending: boolean; target: string | null; go: (href: string) => void };

const FilterContext = createContext<FilterState>({ pending: false, target: null, go: () => undefined });

export function FilterScope({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);
  const go = (href: string) => {
    setTarget(href);
    startTransition(() => router.push(href, { scroll: false }));
  };
  return <FilterContext.Provider value={{ pending, target: pending ? target : null, go }}>{children}</FilterContext.Provider>;
}

export type FilterTab = { href: string; label: ReactNode; active: boolean; count?: number };

export function FilterTabs({
  tabs,
  label,
  className,
  current = "page",
}: {
  tabs: FilterTab[];
  label: string;
  className: string;
  /** Valor de aria-current da aba ativa ("page" nas listas, "true" no período). */
  current?: "page" | "true";
}) {
  const { target, go } = useContext(FilterContext);
  const navRef = useRef<HTMLElement>(null);
  const activeHref = target ?? tabs.find((tab) => tab.active)?.href;

  // No celular as abas rolam de lado: a ativa fica sempre inteira na tela, inclusive
  // quando a página volta do servidor e a lista é recriada com a rolagem zerada.
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>("[aria-current]");
    if (!nav || !link || nav.scrollWidth <= nav.clientWidth) return;
    const left = link.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    const right = left + link.offsetWidth;
    if (left < nav.scrollLeft) nav.scrollLeft = left - 12;
    else if (right > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = right - nav.clientWidth + 12;
  }, [activeHref]);

  function onClick(event: MouseEvent<HTMLAnchorElement>, tab: FilterTab) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!tab.active || target) go(tab.href);
  }
  return (
    <nav ref={navRef} className={className} aria-label={label}>
      {tabs.map((tab) => {
        const active = target ? tab.href === target : tab.active;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            scroll={false}
            prefetch={false}
            aria-current={active ? current : undefined}
            className={target === tab.href ? "is-loading" : undefined}
            onClick={(event) => onClick(event, tab)}
          >
            {tab.label}
            {tab.count !== undefined ? <span className="op-tab-count">{tab.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Enquanto o filtro carrega, troca o conteúdo afetado pelo esqueleto dele. */
export function FilterPending({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const { pending } = useContext(FilterContext);
  if (!pending) return <>{children}</>;
  return (
    <div role="status" aria-busy="true">
      <span className="op-sr">Atualizando…</span>
      <div aria-hidden="true">{fallback}</div>
    </div>
  );
}
