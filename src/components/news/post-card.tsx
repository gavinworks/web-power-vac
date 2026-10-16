import Link from "next/link";
import { focusRing } from "@/components/site/styles";
import type { Post } from "@/lib/directus";
import { cn } from "@/lib/utils";

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export function PostCard({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className={cn(
        "text-pv-navy flex min-h-80 flex-col justify-between gap-10 rounded-4xl bg-white p-8 transition-transform hover:-translate-y-1",
        focusRing,
        className
      )}
    >
      <span className="bg-pv-mist self-start rounded-full px-3.5 py-1.5 text-sm font-bold">
        {post.topic ? `${post.topic}, ` : ""}
        <time dateTime={post.date_published}>
          {formatDate(post.date_published)}
        </time>
      </span>
      <div className="flex flex-col gap-3">
        <h3 className="font-pv-display text-[2rem] leading-[1.02] font-extrabold tracking-[-0.02em] font-stretch-80%">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-base leading-normal">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
