import { Bone, HeadingSkeleton, PanelSkeleton, SkeletonPage, StatsSkeleton, TableSkeleton } from "@/components/owner/owner-skeletons";

export default function Loading() {
  return (
    <SkeletonPage label="Carregando o extrato…">
      <HeadingSkeleton action />
      <section className="op-panel op-skel-filters">
        <Bone w="100%" h={44} r={10} />
        <Bone w="100%" h={44} r={10} />
        <Bone w={150} h={44} r={999} />
      </section>
      <StatsSkeleton count={5} />
      <PanelSkeleton>
        <div className="op-skel-split" style={{ justifyContent: "flex-start", gap: 8, marginBottom: 16 }}>
          {[70, 120, 110, 90].map((width, index) => (
            <Bone key={index} w={width} h={30} r={999} />
          ))}
        </div>
        <TableSkeleton rows={8} />
      </PanelSkeleton>
    </SkeletonPage>
  );
}
