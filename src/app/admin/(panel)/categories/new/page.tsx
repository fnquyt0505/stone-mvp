import type { Metadata } from "next";
import { requireStaff } from "@/server/auth-guard";
import { listParentOptions } from "@/server/queries/admin-categories";
import { CategoryForm } from "../category-form";
import { EMPTY_CATEGORY } from "../form-values";

export const metadata: Metadata = { title: "Thêm danh mục" };

export default async function NewCategoryPage() {
  await requireStaff();
  const parents = await listParentOptions();
  return (
    <main className="grid gap-6">
      <h1>Thêm danh mục</h1>
      <CategoryForm initial={EMPTY_CATEGORY} parents={parents} />
    </main>
  );
}
