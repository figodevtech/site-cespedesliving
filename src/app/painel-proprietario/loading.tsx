import { HeadingSkeleton, OverviewSummarySkeleton, PanelSkeleton, RowsSkeleton, SkeletonPage, TableSkeleton } from "@/components/owner/owner-skeletons";

/** Visão geral: aparece na hora ao trocar de aba, enquanto os dados vêm do ERP. */
export default function Loading() {
  return (
    <SkeletonPage label="Carregando a visão geral…">
      <HeadingSkeleton action />
      <OverviewSummarySkeleton />
      <div className="op-grid-2">
        <PanelSkeleton action>
          <RowsSkeleton rows={3} />
        </PanelSkeleton>
        <PanelSkeleton action>
          <RowsSkeleton rows={3} />
        </PanelSkeleton>
      </div>
      <PanelSkeleton action>
        <TableSkeleton rows={5} />
      </PanelSkeleton>
    </SkeletonPage>
  );
}
