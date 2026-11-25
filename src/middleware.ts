import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const LOGIN_PATH = "/admin/login/";

/**
 * 1. Canonical lowercase URLs: /Mo-Da-Doi/ -> 308 /mo-da-doi/ (same behaviour on
 *    case-insensitive Windows and case-sensitive Vercel; no duplicate URLs).
 * 2. /admin/* requires a staff session (pages re-check with requireStaff()).
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;

  // Ignore percent-escapes ("%C3") when looking for uppercase letters.
  if (/[A-Z]/.test(pathname.replace(/%[0-9A-F]{2}/gi, ""))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/[A-Z]+/g, (m) => m.toLowerCase());
    return NextResponse.redirect(url, 308);
  }

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname.startsWith("/admin/login");
  const role = request.auth?.user?.role;
  const isStaff = role === "ADMIN" || role === "EDITOR";

  if (isAdmin && !isLogin && !isStaff) {
    const url = new URL(LOGIN_PATH, request.nextUrl);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (isLogin && isStaff) return NextResponse.redirect(new URL("/admin/", request.nextUrl));

  // Admin responses must never be cached or indexed.
  if (isAdmin) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }
  return NextResponse.next();
});

export const config = {
  // Skip Next internals, API routes and files with an extension (images, fonts...).
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
