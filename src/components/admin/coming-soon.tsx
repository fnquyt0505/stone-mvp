/** Placeholder for admin sections scheduled in later tasks (keeps the sidebar free of 404s). */
export function ComingSoon({ title, task }: { title: string; task: string }) {
  return (
    <main>
      <h1>{title}</h1>
      <p className="mt-4 rounded-lg border bg-white p-5 text-stone-700">
        Mục này đang được xây dựng ({task}).
      </p>
    </main>
  );
}
