import Link from "next/link";
import { ArrowRight, MapPin, Quote, Star } from "lucide-react";
import { formatVndShort } from "@/lib/format-price";
import type { HomeCategory, HomeProject, HomeTestimonial } from "@/server/queries/home";
import type { PostCardData } from "@/server/queries/posts";
import { ImageFrame } from "./image-frame";

const CARD =
  "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm";

/**
 * 4:3 image, name, one-line excerpt, "Giá từ …", "Xem mẫu →".
 * `showPrice={false}` hides the price line (e.g. material introduction pages).
 */
export function CategoryCard({
  category,
  showPrice = true,
  ctaLabel = "Xem mẫu",
}: {
  category: HomeCategory;
  showPrice?: boolean;
  ctaLabel?: string;
}) {
  const href = `/${category.slug}/`;
  return (
    <article className={CARD}>
      <ImageFrame
        image={category.image}
        ratio="aspect-[4/3]"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3>
          <Link href={href} className="after:absolute after:inset-0 hover:text-jade-700">
            {category.name}
          </Link>
        </h3>
        {category.excerpt ? (
          <p className="line-clamp-1 text-stone-700">{category.excerpt}</p>
        ) : null}
        {showPrice ? (
          <p className="mt-auto pt-2 font-semibold text-jade-700">
            {category.priceFrom ? `Giá từ ${formatVndShort(category.priceFrom)}` : "Giá: Liên hệ"}
          </p>
        ) : null}
        <span
          className={`inline-flex items-center gap-1 font-semibold text-stone-900 group-hover:text-jade-700 ${showPrice ? "" : "mt-auto pt-2"}`}
        >
          {ctaLabel} <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </article>
  );
}

/** 3:2 image, province badge, title, completion year. */
export function ProjectCard({ project }: { project: HomeProject }) {
  return (
    <article className={CARD}>
      <div className="relative">
        <ImageFrame
          image={project.image}
          ratio="aspect-[3/2]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-jade-700 px-2.5 py-1 text-small font-semibold text-white">
          <MapPin aria-hidden className="size-3.5" />
          {project.province}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="text-h3">
          <Link
            href={`/cong-trinh/${project.slug}/`}
            className="after:absolute after:inset-0 hover:text-jade-700"
          >
            {project.title}
          </Link>
        </h3>
        {project.year ? (
          <p className="text-small-responsive text-stone-700">Hoàn thành năm {project.year}</p>
        ) : null}
      </div>
    </article>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: HomeTestimonial }) {
  const { name, province, content, rating } = testimonial;
  return (
    <figure className="flex h-full flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm">
      <Quote aria-hidden className="size-8 text-gold-600" />
      {rating ? (
        <p className="flex gap-0.5" aria-label={`Đánh giá ${rating} trên 5 sao`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              aria-hidden
              className={
                i < rating ? "size-5 fill-gold-600 text-gold-600" : "size-5 text-stone-200"
              }
            />
          ))}
        </p>
      ) : null}
      <blockquote className="flex-1 text-stone-900">{content}</blockquote>
      <figcaption className="font-semibold text-jade-700">
        {name}
        {province ? <span className="font-normal text-stone-700"> — {province}</span> : null}
      </figcaption>
    </figure>
  );
}

export function formatViDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

/** 3:2 cover, date, title, excerpt. */
export function PostCard({ post }: { post: PostCardData }) {
  return (
    <article className={CARD}>
      <ImageFrame
        image={post.image}
        ratio="aspect-[3/2]"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <time dateTime={post.publishedAt} className="text-small-responsive text-stone-700">
          {formatViDate(post.publishedAt)}
        </time>
        <h3 className="text-h3">
          <Link
            href={`/tin-tuc/${post.slug}/`}
            className="after:absolute after:inset-0 hover:text-jade-700"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="line-clamp-2 text-stone-700">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}
