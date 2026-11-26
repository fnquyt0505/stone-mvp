import type { Metadata } from "next";
import { requireStaff } from "@/server/auth-guard";
import { PageForm } from "../page-form";

export const metadata: Metadata = { title: "Thêm trang" };

export default async function NewPagePage() {
  await requireStaff();
  return (
    <main className="grid gap-6">
      <h1>Thêm trang</h1>
      <PageForm page={null} />
    </main>
  );
}
