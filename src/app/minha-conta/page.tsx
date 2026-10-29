import { CustomerAccount } from "@/components/customer-account";
import { PageHero } from "@/components/ui";
import { requireProfile, sessionToken } from "@/lib/site-session";
import { erpRequest } from "@/lib/erp";
import type { Booking } from "@/domain/types";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const profile = await requireProfile("guest");
  const rawPage = Number((await searchParams).page ?? 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const result = await erpRequest<{
    items: Booking[];
    total: number;
    page: number;
    pageSize: number;
  }>(
    `/site/me/reservas?page=${page}&pageSize=20`,
    undefined,
    await sessionToken(),
  );
  return (
    <>
      <PageHero eyebrow="Minha conta" title="Suas reservas, por perto." />
      <CustomerAccount
        profile={profile}
        bookings={result.items}
        pagination={result}
      />
    </>
  );
}
