import type { CSSProperties, ReactNode } from "react";

/**
 * Esqueletos da área do proprietário. Cada aba tem um loading.tsx que monta a página
 * com estas peças, no mesmo formato do conteúdo real: a troca de aba aparece na hora
 * e os dados entram no lugar quando o ERP responde.
 */

export function Bone({
  w = "100%",
  h = 12,
  r,
  className = "",
  style,
}: {
  w?: number | string;
  h?: number | string;
  r?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return <span className={`op-skel ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/** Envolve a página: anuncia o carregamento uma vez e esconde os blocos do leitor de tela. */
export function SkeletonPage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="op-skel-page" role="status" aria-busy="true" aria-live="polite">
      <span className="op-sr">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function HeadingSkeleton({ back = false, action = false, description = true }: { back?: boolean; action?: boolean; description?: boolean }) {
  return (
    <div className="op-heading">
      <div className="op-skel-stack">
        {back ? <Bone w={110} h={12} /> : null}
        <Bone w="min(320px, 70vw)" h={30} r={8} />
        {description ? <Bone w="min(420px, 80vw)" h={13} /> : null}
      </div>
      {action ? <Bone w={150} h={40} r={999} /> : null}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: 4 | 5 }) {
  return (
    <div className={`op-stats ${count === 5 ? "op-stats-5" : ""}`}>
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className={`op-stat ${index === 0 ? "op-stat-hero op-skel-hero" : "op-stat-default"}`}>
          <div className="op-stat-top">
            <Bone w="55%" h={11} />
            <Bone w={34} h={34} r={10} />
          </div>
          <Bone w="70%" h={26} r={8} style={{ margin: "14px 0 10px" }} />
          <Bone w="85%" h={10} />
        </article>
      ))}
    </div>
  );
}

export function PanelSkeleton({ children, action = false, className = "" }: { children: ReactNode; action?: boolean; className?: string }) {
  return (
    <section className={`op-panel ${className}`}>
      <header className="op-panel-head">
        <div className="op-skel-stack">
          <Bone w={90} h={10} />
          <Bone w={200} h={20} r={6} />
        </div>
        {action ? <Bone w={110} h={14} /> : null}
      </header>
      {children}
    </section>
  );
}

/** Linhas no formato das reservas: data, título e detalhes, situação e valor. */
export function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="op-list">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="op-skel-row">
          <Bone w={48} h={52} r={10} />
          <span className="op-skel-stack op-skel-grow">
            <Bone w="45%" h={14} />
            <Bone w="75%" h={11} />
          </span>
          <Bone w={86} h={22} r={999} className="op-skel-hide-sm" />
          <Bone w={72} h={14} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="op-skel-table">
      <div className="op-skel-table-head">
        <Bone w="14%" h={10} />
        <Bone w="22%" h={10} />
        <Bone w="30%" h={10} />
        <Bone w="12%" h={10} />
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="op-skel-table-row">
          <Bone w="14%" h={12} />
          <Bone w="22%" h={22} r={999} />
          <Bone w="30%" h={12} />
          <Bone w="12%" h={12} />
        </div>
      ))}
    </div>
  );
}

export function FlatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="op-flat-grid">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="op-flat-card op-skel-card">
          <Bone w="100%" h="auto" r={0} className="op-skel-media" />
          <div className="op-flat-body">
            <Bone w="65%" h={18} r={6} />
            <Bone w="45%" h={11} />
            <Bone w="80%" h={11} />
            <div className="op-skel-split">
              <Bone w="40%" h={30} r={8} />
              <Bone w="40%" h={30} r={8} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Grade do calendário: cabeçalho, semanas e algumas faixas. */
export function CalendarSkeleton() {
  return (
    <div className="op-skel-cal">
      <div className="op-skel-split">
        <Bone w={170} h={20} r={6} />
        <Bone w={150} h={36} r={10} />
      </div>
      <div className="op-skel-cal-grid">
        {Array.from({ length: 5 }, (_, week) => (
          <div key={week} className="op-skel-cal-week">
            <Bone w={`${[38, 62, 45, 70, 30][week]}%`} h={18} r={999} style={{ marginLeft: `${[10, 0, 40, 5, 20][week]}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Cartões de totais e os dois gráficos da visão geral (o que muda com o período). */
export function OverviewSummarySkeleton() {
  return (
    <>
      <StatsSkeleton count={4} />
      <div className="op-grid-2">
        <PanelSkeleton>
          <div className="op-skel-chart">
            {[55, 80, 40, 95, 65, 75].map((height, index) => (
              <Bone key={index} w="100%" h={`${height}%`} r={6} />
            ))}
          </div>
        </PanelSkeleton>
        <PanelSkeleton>
          <div className="op-skel-donut">
            <Bone w={150} h={150} r="50%" />
            <span className="op-skel-stack op-skel-grow">
              <Bone w="80%" h={12} />
              <Bone w="65%" h={12} />
              <Bone w="72%" h={12} />
            </span>
          </div>
        </PanelSkeleton>
      </div>
    </>
  );
}

/** Lista de reservas agrupada por mês. */
export function ReservationListSkeleton() {
  return (
    <div className="op-skel-stack" style={{ gap: 12 }}>
      <Bone w={160} h={16} r={6} />
      <RowsSkeleton rows={5} />
    </div>
  );
}
