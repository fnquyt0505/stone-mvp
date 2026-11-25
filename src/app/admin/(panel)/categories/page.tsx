import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";
import { requireStaff } from "@/server/auth-guard";

export const metadata: Metadata = { title: "Danh mục" };

export default async function Page() {
  await requireStaff();
  return <ComingSoon title="Danh mục" task="T23" />;
}
