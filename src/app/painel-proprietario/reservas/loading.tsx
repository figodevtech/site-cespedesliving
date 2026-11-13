import { Bone, HeadingSkeleton, ReservationListSkeleton, SkeletonPage } from "@/components/owner/owner-skeletons";

export default function Loading() {
  return (
    <SkeletonPage label="Carregando suas reservas…">
      <HeadingSkeleton action />
      <div className="op-skel-split" style={{ justifyContent: "flex-start", gap: 8, marginBottom: 22 }}>
        {[96, 110, 90, 80].map((width, index) => (
          <Bone key={index} w={width} h={36} r={999} />
        ))}
      </div>
      <ReservationListSkeleton />
    </SkeletonPage>
  );
}
