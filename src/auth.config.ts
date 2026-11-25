import type { NextAuthConfig } from "next-auth";

export type StaffRole = "ADMIN" | "EDITOR";

/**
 * Edge-safe Auth.js config shared by middleware and the full setup in
 * src/auth.ts. No Prisma/bcrypt here: middleware runs on the edge runtime.
 */
export const authConfig = {
  pages: { signIn: "/admin/login/" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 }, // 12 hours
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = (user as { role?: StaffRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.uid === "string" ? token.uid : "";
        session.user.role =
          token.role === "ADMIN" || token.role === "EDITOR" ? token.role : undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

declare module "next-auth" {
  interface Session {
    user: { id: string; role?: StaffRole; name?: string | null; email?: string | null };
  }
}
