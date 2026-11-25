import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Đăng nhập" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  const raw = (await searchParams).next;
  const next = typeof raw === "string" ? raw : "";
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-h2 md:text-h2">Đăng nhập quản trị</h1>
        <p className="mt-2 mb-6 text-stone-700">Dành cho nhân viên của xưởng.</p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
