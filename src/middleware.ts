import { NextResponse, type NextRequest } from "next/server";

/**
 * Canonical lowercase URLs: /Mo-Da-Doi/ -> 308 /mo-da-doi/. Keeps behaviour
 * identical on case-insensitive (Windows) and case-sensitive (Vercel) hosts and
 * avoids duplicate URLs for SEO. Admin protection is added here in T18.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Ignore percent-escapes ("%C3") when looking for uppercase letters.
  if (/[A-Z]/.test(pathname.replace(/%[0-9A-F]{2}/gi, ""))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/[A-Z]+/g, (m) => m.toLowerCase());
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes and files with an extension (images, fonts...).
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
