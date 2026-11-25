import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-lora",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "[MẪU] Xưởng đá mỹ nghệ",
  description: "[MẪU] Lăng mộ đá, nhà thờ họ, tượng đá, đồ thờ và kiến trúc đá.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${lora.variable} ${beVietnamPro.variable}`}>
      <body>{children}</body>
    </html>
  );
}
