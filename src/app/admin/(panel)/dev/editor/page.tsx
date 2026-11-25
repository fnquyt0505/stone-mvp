import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/server/auth-guard";
import { EditorPlayground } from "./playground";

export const metadata: Metadata = { title: "Thử trình soạn thảo" };

/** Editor test bench; only enabled for automated tests (ENABLE_EDITOR_PLAYGROUND=1). */
export default async function EditorPlaygroundPage() {
  await requireStaff();
  if (process.env.ENABLE_EDITOR_PLAYGROUND !== "1") notFound();
  return (
    <main className="grid gap-6">
      <h1>Thử trình soạn thảo</h1>
      <EditorPlayground />
    </main>
  );
}
