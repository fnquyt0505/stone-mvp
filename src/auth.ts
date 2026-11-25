import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/schemas/auth";
import { authConfig } from "./auth.config";
import { db } from "./server/db";

// Compared against when the email is unknown so response time does not reveal
// which accounts exist. (bcrypt hash of a random string, cost 12.)
const DUMMY_HASH = "$2b$12$RLpgB1B5xhzAtP11Uz9kpuMGxo/RujFgDd3qXPxqrQk5qf4s2mgqG";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true, passwordHash: true },
        });
        const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
