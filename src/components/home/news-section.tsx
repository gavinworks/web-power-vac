import Link from "next/link";
import { Headline } from "@/components/site/headline";
import { PostCard } from "@/components/news/post-card";
import { FacebookIcon } from "@/components/site/icons";
import { focusRing, heading, pill } from "@/components/site/styles";
import type { Post } from "@/lib/directus";
import { cn } from "@/lib/utils";

export function NewsSection({
  title,
  posts,
  facebookUrl,
}: {
  title: string | null;
  posts: Post[];
  facebookUrl: string | null;
}) {
  if (posts.length === 0 && !facebookUrl) return null;

  return (
    <section
      id="news"
      className="bg-pv-mist text-pv-navy relative -mt-14 scroll-mt-8 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30"
    >
      <div className="mx-auto flex max-w-336 flex-col gap-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {title && (
            <h2 className={heading.section}>
              <Headline text={title} accentClassName="text-pv-link" />
            </h2>
          )}
          <Link
            href="/news"
            className={cn(pill.navy, "self-start sm:self-auto", focusRing)}
          >
            All news
          </Link>
        </div>

        <div
          className={cn(
            "grid gap-5 sm:grid-cols-2",
            facebookUrl ? "lg:grid-cols-4" : "lg:grid-cols-3"
          )}
        >
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {facebookUrl && (
            <a
              href={facebookUrl}
              className={cn(
                "flex min-h-80 flex-col justify-between gap-10 rounded-4xl bg-[#1877f2] p-8 text-white transition-transform hover:-translate-y-1",
                focusRing
              )}
            >
              <FacebookIcon className="size-14" />
              <div className="flex flex-col gap-2">
                <span className="font-pv-hand text-[2.125rem] leading-none">
                  find us on
                </span>
                <span className="font-pv-display text-[2.75rem] leading-none font-extrabold tracking-[-0.02em] font-stretch-80%">
                  Facebook
                </span>
                <span className="text-[1.0625rem] leading-snug">
                  Latest jobs, before &amp; afters and quick questions answered.
                </span>
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
