import type { Metadata } from "next";
import { requireStaff } from "@/server/auth-guard";
import { TestimonialForm } from "../testimonial-form";

export const metadata: Metadata = { title: "Thêm đánh giá" };

export default async function NewTestimonialPage() {
  await requireStaff();
  return (
    <main className="grid gap-6">
      <h1>Thêm đánh giá</h1>
      <TestimonialForm item={null} />
    </main>
  );
}
