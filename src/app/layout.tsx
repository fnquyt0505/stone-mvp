import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "[MẪU] Xưởng đá mỹ nghệ",
  description: "[MẪU] Lăng mộ đá, nhà thờ họ, tượng đá, đồ thờ và kiến trúc đá.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
