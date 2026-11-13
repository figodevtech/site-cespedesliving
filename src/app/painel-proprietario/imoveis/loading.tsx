import { FlatCardsSkeleton, HeadingSkeleton, SkeletonPage } from "@/components/owner/owner-skeletons";

export default function Loading() {
  return (
    <SkeletonPage label="Carregando seus imóveis…">
      <HeadingSkeleton />
      <FlatCardsSkeleton count={3} />
    </SkeletonPage>
  );
}
