import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireStaff } from "@/server/auth-guard";
import { getAdminCategory, listParentOptions } from "@/server/queries/admin-categories";
import { CategoryForm } from "../category-form";
import { toCategoryFormValues } from "../form-values";

export const metadata: Metadata = { title: "Sửa danh mục" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditCategoryPage({ params, searchParams }: Props) {
  await requireStaff();
  const { id } = await params;
  const [category, parents] = await Promise.all([getAdminCategory(id), listParentOptions(id)]);
  if (!category) notFound();
  const saved = (await searchParams)["da-luu"] === "1";

  return (
    <main className="grid gap-6">
      <Link
        href="/admin/categories/"
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-jade-700 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" /> Danh sách danh mục
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>{category.name}</h1>
        <a
          href={`/${category.slug}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 font-semibold text-jade-700 hover:underline"
        >
          Xem trên website <ExternalLink aria-hidden className="size-4" />
        </a>
      </div>
      {saved ? (
        <p role="status" className="rounded-md bg-success/10 p-3 font-semibold text-success">
          Đã lưu danh mục.
        </p>
      ) : null}
      <CategoryForm key={category.id} initial={toCategoryFormValues(category)} parents={parents} />
    </main>
  );
}
