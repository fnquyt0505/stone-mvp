import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/server/auth-guard";
import { getAdminPage } from "@/server/queries/admin-content";
import { PageForm } from "../page-form";

export const metadata: Metadata = { title: "Sửa trang" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditPagePage({ params, searchParams }: Props) {
  await requireStaff();
  const page = await getAdminPage((await params).id);
  if (!page) notFound();
  const saved = (await searchParams)["da-luu"] === "1";
  return (
    <main className="grid gap-6">
      <EditHeader
        backHref="/admin/pages/"
        backLabel="Danh sách trang"
        title={page.title}
        viewHref={`/${page.slug}/`}
        savedText={saved ? "Đã lưu trang." : null}
      />
      <PageForm key={page.id} page={page} />
    </main>
  );
}
