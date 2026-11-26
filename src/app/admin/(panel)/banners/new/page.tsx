import type { Metadata } from "next";
import { requireStaff } from "@/server/auth-guard";
import { BannerForm } from "../banner-form";

export const metadata: Metadata = { title: "Thêm banner" };

export default async function NewBannerPage() {
  await requireStaff();
  return (
    <main className="grid gap-6">
      <h1>Thêm banner</h1>
      <BannerForm item={null} />
    </main>
  );
}
