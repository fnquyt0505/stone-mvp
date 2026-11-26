import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "Sửa đánh giá" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditTestimonialPage({ params, searchParams }: Props) {
  await requireStaff();
  const { id } = await params;
  const item = /^[a-z0-9]{20,40}$/.test(id)
    ? await db.testimonial.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          province: true,
          content: true,
          rating: true,
          order: true,
          isPublished: true,
        },
      })
    : null;
  if (!item) notFound();
  const saved = (await searchParams)["da-luu"] === "1";
  return (
    <main className="grid gap-6">
      <EditHeader
        backHref="/admin/testimonials/"
        backLabel="Danh sách đánh giá"
        title={item.name}
        savedText={saved ? "Đã lưu đánh giá." : null}
      />
      <TestimonialForm key={item.id} item={item} />
    </main>
  );
}
