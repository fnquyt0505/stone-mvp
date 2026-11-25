import type { Metadata } from "next";
import { requireStaff } from "@/server/auth-guard";

export const metadata: Metadata = { title: "Tổng quan" };

/** Dashboard placeholder; statistics and navigation arrive in T19. */
export default async function AdminHomePage() {
  const session = await requireStaff();
  return (
    <main>
      <h1>Xin chào, {session.user.name ?? "bạn"}</h1>
      <p className="mt-2 text-stone-700">
        Vai trò: {session.user.role === "ADMIN" ? "Quản trị viên" : "Biên tập viên"}
      </p>
    </main>
  );
}
