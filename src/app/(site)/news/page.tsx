import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FacebookIcon } from "@/components/site/icons";
import { PageHero } from "@/components/site/page-hero";
import { formatDate, PostCard } from "@/components/news/post-card";
import { QuoteSection } from "@/components/site/quote-section";
import { focusRing } from "@/components/site/styles";
import {
  getGlobal,
  getImageUrl,
  getNewsPage,
  getPosts,
  getServices,
} from "@/lib/directus";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getNewsPage();
  return {
    title: page?.meta_title ?? "News",
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/news" },
  };
}

export default async function NewsPage() {
  const [page, posts, global, services] = await Promise.all([
    getNewsPage(),
    getPosts(),
    getGlobal(),
    getServices(),
  ]);

  if (!page) {
    throw new Error("Failed to fetch news_page data from Directus");
  }

  const [latest, ...rest] = posts;
  const latestImage = getImageUrl(latest?.image ?? null);
  const facebook = global?.social_media_accounts?.find(
    (s) => s.name === "Facebook"
  );

  return (
    <>
      <PageHero
        annotation={page.hero_annotation}
        heading={page.hero_heading ?? "News"}
        description={page.hero_description}
      />

      <section className="bg-pv-mist relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30">
        <div className="mx-auto flex max-w-336 flex-col gap-5">
          {latest ? (
            <>
              <Link
                href={`/news/${latest.slug}`}
                className={cn(
                  "bg-pv-navy grid overflow-hidden rounded-[2.5rem] text-white lg:grid-cols-2",
                  focusRing
                )}
              >
                {latestImage && (
                  <div className="relative aspect-16/10 lg:aspect-auto lg:min-h-120">
                    <Image
                      src={latestImage}
                      alt={latest.image_alt ?? ""}
                      fill
                      sizes="(min-width: 1024px) 672px, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-between gap-10 p-8 lg:p-12">
                  <span className="bg-pv-sky text-pv-navy self-start rounded-full px-3.5 py-1.5 text-sm font-bold">
                    {latest.topic ? `${latest.topic}, ` : ""}
                    <time dateTime={latest.date_published}>
                      {formatDate(latest.date_published)}
                    </time>
                  </span>
                  <div className="flex flex-col gap-4">
                    <h2 className="font-pv-display text-[clamp(2.5rem,4.5vw,4rem)] leading-[0.95] font-extrabold tracking-[-0.015em] font-stretch-75%">
                      {latest.title}
                    </h2>
                    {latest.excerpt && (
                      <p className="text-pv-haze max-w-120 text-lg leading-normal">
                        {latest.excerpt}
                      </p>
                    )}
                    <span className="text-pv-sky font-bold underline underline-offset-4">
                      Read the article
                    </span>
                  </div>
                </div>
              </Link>

              <div
                className={cn(
                  "grid gap-5 sm:grid-cols-2",
                  rest.length + (facebook ? 1 : 0) >= 3 && "lg:grid-cols-3"
                )}
              >
                {rest.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {facebook && (
                  <a
                    href={facebook.link}
                    className={cn(
                      "flex min-h-80 flex-col justify-between gap-10 rounded-4xl bg-[#1877f2] p-8 text-white transition-transform hover:-translate-y-1",
                      focusRing
                    )}
                  >
                    <FacebookIcon className="size-14" />
                    <span className="flex flex-col gap-2">
                      <span className="font-pv-hand text-[2.125rem] leading-none">
                        find us on
                      </span>
                      <span className="font-pv-display text-[2.75rem] leading-none font-extrabold tracking-[-0.02em] font-stretch-80%">
                        Facebook
                      </span>
                    </span>
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="max-w-130 text-xl leading-normal">
              No articles yet. Check back soon, or ask us anything about your
              gutters.
            </p>
          )}
        </div>
      </section>

      <QuoteSection services={services.map((s) => s.form_label)} />
    </>
  );
}
