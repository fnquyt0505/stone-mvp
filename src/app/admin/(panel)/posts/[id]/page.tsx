import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/server/auth-guard";
import { getAdminPost } from "@/server/queries/admin-content";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Sửa bài viết" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditPostPage({ params, searchParams }: Props) {
  await requireStaff();
  const post = await getAdminPost((await params).id);
  if (!post) notFound();
  const saved = (await searchParams)["da-luu"] === "1";
  const live = post.publishedAt !== null && post.publishedAt.getTime() <= Date.now();
  return (
    <main className="grid gap-6">
      <EditHeader
        backHref="/admin/posts/"
        backLabel="Danh sách bài viết"
        title={post.title}
        viewHref={live ? `/tin-tuc/${post.slug}/` : null}
        savedText={saved ? "Đã lưu bài viết." : null}
      />
      <PostForm key={post.id} post={post} />
    </main>
  );
}
