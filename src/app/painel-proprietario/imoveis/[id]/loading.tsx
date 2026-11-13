import { Bone, CalendarSkeleton, HeadingSkeleton, PanelSkeleton, RowsSkeleton, SkeletonPage, StatsSkeleton } from "@/components/owner/owner-skeletons";

export default function Loading() {
  return (
    <SkeletonPage label="Carregando o imóvel…">
      <HeadingSkeleton back action />
      <section className="op-property-hero">
        <Bone w="100%" h="auto" r={14} className="op-skel-media" />
        <div className="op-skel-stack" style={{ gap: 14, padding: "6px 4px" }}>
          <div className="op-skel-split" style={{ justifyContent: "flex-start", gap: 8 }}>
            <Bone w={90} h={22} r={999} />
            <Bone w={120} h={22} r={999} />
          </div>
          <Bone w="80%" h={14} />
          <Bone w="60%" h={12} />
          <Bone w="70%" h={12} />
          <Bone w="50%" h={12} />
        </div>
      </section>
      <StatsSkeleton count={5} />
      <PanelSkeleton>
        <CalendarSkeleton />
      </PanelSkeleton>
      <div className="op-grid-2">
        <PanelSkeleton>
          <RowsSkeleton rows={2} />
        </PanelSkeleton>
        <PanelSkeleton>
          <RowsSkeleton rows={2} />
        </PanelSkeleton>
      </div>
    </SkeletonPage>
  );
}
