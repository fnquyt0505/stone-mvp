import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/server/actions/auth";
import { requireStaff } from "@/server/auth-guard";

/** Authenticated admin pages. Re-checks the session server-side (RULES §2). */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  return (
    <div className="min-h-dvh">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <p className="font-heading text-lg font-bold text-jade-700">Quản trị</p>
          <div className="flex items-center gap-3">
            <span className="hidden text-stone-700 sm:inline">
              {session.user.name ?? session.user.email}
            </span>
            <form action={logout}>
              <Button type="submit" variant="outline">
                <LogOut aria-hidden />
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</div>
    </div>
  );
}
