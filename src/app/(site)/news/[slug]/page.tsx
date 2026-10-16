import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDate, PostCard } from "@/components/news/post-card";
import { PageHero } from "@/components/site/page-hero";
import { QuoteSection } from "@/components/site/quote-section";
import { RichText } from "@/components/site/rich-text";
import { siteConfig } from "@/config/site";
import { getImageUrl, getPost, getPosts, getServices } from "@/lib/directus";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const image = getImageUrl(post.image);
  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: post.date_published,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, posts, services] = await Promise.all([
    getPost(slug),
    getPosts(),
    getServices(),
  ]);

  if (!post) notFound();

  const image = getImageUrl(post.image);
  const more = posts.filter((p) => p.id !== post.id).slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date_published,
    image: image ? new URL(image, siteConfig.url).toString() : undefined,
    url: `${siteConfig.url}/news/${post.slug}`,
    publisher: { "@id": `${siteConfig.url}/#business` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PageHero
        annotation={[post.topic, formatDate(post.date_published)]
          .filter(Boolean)
          .join(", ")}
        heading={post.title}
        description={post.excerpt}
      />

      <section className="bg-pv-mist relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30">
        <article className="mx-auto flex max-w-200 flex-col gap-12">
          {image && (
            <div className="relative aspect-16/9 overflow-hidden rounded-[2.5rem]">
              <Image
                src={image}
                alt={post.image_alt ?? ""}
                fill
                sizes="(min-width: 800px) 800px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          {post.body && <RichText html={post.body} />}
        </article>

        {more.length > 0 && (
          <div className="mx-auto mt-24 flex max-w-336 flex-col gap-8">
            <p className="font-pv-hand text-pv-link -rotate-2 self-start text-3xl lg:text-4xl">
              more gutter talk
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}
      </section>

      <QuoteSection services={services.map((s) => s.form_label)} />
    </>
  );
}
