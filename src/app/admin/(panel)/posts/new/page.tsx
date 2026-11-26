import type { Metadata } from "next";
import { requireStaff } from "@/server/auth-guard";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Viết bài mới" };

export default async function NewPostPage() {
  await requireStaff();
  return (
    <main className="grid gap-6">
      <h1>Viết bài mới</h1>
      <PostForm post={null} />
    </main>
  );
}
