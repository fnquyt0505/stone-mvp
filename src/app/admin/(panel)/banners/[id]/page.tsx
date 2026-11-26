import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";
import { BannerForm } from "../banner-form";

export const metadata: Metadata = { title: "Sửa banner" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditBannerPage({ params, searchParams }: Props) {
  await requireStaff();
  const { id } = await params;
  const item = /^[a-z0-9]{20,40}$/.test(id)
    ? await db.banner.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          subtitle: true,
          ctaLabel: true,
          ctaHref: true,
          order: true,
          isActive: true,
        },
      })
    : null;
  if (!item) notFound();
  const saved = (await searchParams)["da-luu"] === "1";
  return (
    <main className="grid gap-6">
      <EditHeader
        backHref="/admin/banners/"
        backLabel="Danh sách banner"
        title={item.title}
        savedText={saved ? "Đã lưu banner." : null}
      />
      <BannerForm key={item.id} item={item} />
    </main>
  );
}
