import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/server/auth-guard";
import { getAdminProject, listCategoryChoices } from "@/server/queries/admin-content";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Sửa công trình" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditProjectPage({ params, searchParams }: Props) {
  await requireStaff();
  const [project, categories] = await Promise.all([
    getAdminProject((await params).id),
    listCategoryChoices(),
  ]);
  if (!project) notFound();
  const saved = (await searchParams)["da-luu"] === "1";
  return (
    <main className="grid gap-6">
      <EditHeader
        backHref="/admin/projects/"
        backLabel="Danh sách công trình"
        title={project.title}
        viewHref={project.isPublished ? `/cong-trinh/${project.slug}/` : null}
        savedText={saved ? "Đã lưu công trình." : null}
      />
      <ProjectForm key={project.id} project={project} categories={categories} />
    </main>
  );
}
