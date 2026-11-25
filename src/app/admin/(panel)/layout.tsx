import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { navForRole } from "@/components/admin/admin-nav";
import { AdminMobileNav, AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { logout } from "@/server/actions/auth";
import { requireStaff } from "@/server/auth-guard";

/** Authenticated admin shell. Re-checks the session server-side (RULES §2). */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const items = navForRole(session.user.role);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <AdminMobileNav items={items} />
            <Link href="/admin/" className="font-heading text-lg font-bold text-jade-700">
              Quản trị
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden />
                Xem website
              </a>
            </Button>
            <span className="hidden text-stone-700 md:inline">
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
      <div className="flex flex-1">
        <AdminSidebar items={items} />
        <div className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
