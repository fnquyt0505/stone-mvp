import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";
import { requireStaff } from "@/server/auth-guard";

export const metadata: Metadata = { title: "Yêu cầu báo giá" };

export default async function Page() {
  await requireStaff();
  return <ComingSoon title="Yêu cầu báo giá" task="T20" />;
}
