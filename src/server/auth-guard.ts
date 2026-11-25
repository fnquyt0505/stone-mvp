import "server-only";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import type { StaffRole } from "@/auth.config";

export type StaffSession = Session & { user: Session["user"] & { role: StaffRole } };

/**
 * Server-side gate for every admin page and admin Server Action
 * (docs/RULES.md §2 — never rely on middleware alone). Redirects to login when
 * there is no valid staff session.
 */
export async function requireStaff(
  roles: StaffRole[] = ["ADMIN", "EDITOR"],
): Promise<StaffSession> {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || !role || !roles.includes(role)) redirect("/admin/login/");
  return session as StaffSession;
}

/** Admin-only operations (site settings, user management). */
export function requireAdmin(): Promise<StaffSession> {
  return requireStaff(["ADMIN"]);
}
