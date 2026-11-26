import type { Metadata } from "next";
import { requireStaff } from "@/server/auth-guard";
import { listCategoryChoices } from "@/server/queries/admin-content";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Thêm công trình" };

export default async function NewProjectPage() {
  await requireStaff();
  return (
    <main className="grid gap-6">
      <h1>Thêm công trình</h1>
      <ProjectForm project={null} categories={await listCategoryChoices()} />
    </main>
  );
}
