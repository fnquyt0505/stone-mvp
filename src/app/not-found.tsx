import Link from "next/link";

/** Fallback 404 for URLs outside the site layout (e.g. deep unknown paths). */
export default function RootNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="font-heading text-h2 font-bold text-gold-600">404</p>
      <h1 className="mt-2">Không tìm thấy trang</h1>
      <p className="mt-4 text-stone-700">
        Trang Quý khách tìm không tồn tại hoặc đã được đổi địa chỉ.
      </p>
      <p className="mt-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md bg-jade-700 px-6 font-semibold text-white"
        >
          Về trang chủ
        </Link>
      </p>
    </main>
  );
}
