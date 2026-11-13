import { Bone, HeadingSkeleton, PanelSkeleton, SkeletonPage, TableSkeleton } from "@/components/owner/owner-skeletons";

export default function Loading() {
  return (
    <SkeletonPage label="Carregando a reserva…">
      <HeadingSkeleton back action />
      <div className="op-res-detail">
        <div className="op-skel-stack" style={{ gap: 0 }}>
          <section className="op-panel">
            <div className="op-skel-split">
              <Bone w="40%" h={56} r={10} />
              <Bone w="40%" h={56} r={10} />
            </div>
          </section>
          <PanelSkeleton>
            <div className="op-skel-stack">
              <Bone w="60%" h={12} />
              <Bone w="45%" h={12} />
            </div>
          </PanelSkeleton>
          <PanelSkeleton>
            <TableSkeleton rows={3} />
          </PanelSkeleton>
        </div>
        <div className="op-skel-stack" style={{ gap: 0 }}>
          <PanelSkeleton>
            <div className="op-skel-stack" style={{ gap: 12 }}>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="op-skel-split">
                  <Bone w="45%" h={12} />
                  <Bone w="25%" h={12} />
                </div>
              ))}
              <Bone w="100%" h={10} r={999} />
            </div>
          </PanelSkeleton>
          <section className="op-panel">
            <Bone w="100%" h="auto" r={12} className="op-skel-media" />
          </section>
        </div>
      </div>
    </SkeletonPage>
  );
}
