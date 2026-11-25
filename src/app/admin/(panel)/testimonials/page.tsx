import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";
import { requireStaff } from "@/server/auth-guard";

export const metadata: Metadata = { title: "Đánh giá" };

export default async function Page() {
  await requireStaff();
  return <ComingSoon title="Đánh giá" task="T25" />;
}
