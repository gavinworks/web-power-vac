import Image from "next/image";
import { formatDate, PostCard } from "@/components/news/post-card";
import { PageHero } from "@/components/site/page-hero";
import { QuoteSection } from "@/components/site/quote-section";
import { RichText } from "@/components/site/rich-text";
import { siteConfig } from "@/config/site";
import {
  getImageUrl,
  type NewsPage,
  type Post,
  type Service,
} from "@/lib/directus";
import { editable } from "@/lib/editable";

export interface PostViewProps {
  post: Post;
  posts: Post[];
  newsPage: NewsPage | null;
  services: Service[];
}

/** A news article, shared by the live route and its Directus preview. */
export function PostView({ post, posts, newsPage, services }: PostViewProps) {
  const edit = (fields: string | string[], mode?: "popover" | "drawer") =>
    editable("posts", post.id, fields, mode);
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
        edit={{
          annotation: edit(["topic", "date_published"]),
          heading: edit("title"),
          description: edit("excerpt"),
        }}
      />

      <section className="bg-pv-mist relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30">
        <article className="mx-auto flex max-w-200 flex-col gap-12">
          {image && (
            <div
              data-directus={edit(["image", "image_alt"], "drawer")}
              className="relative aspect-16/9 overflow-hidden rounded-[2.5rem]"
            >
              <Image
                src={image}
                alt={post.image_alt ?? ""}
                fill
                sizes="(min-width: 800px) 800px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          {post.body && (
            <RichText html={post.body} editAttr={edit("body", "drawer")} />
          )}
        </article>

        {more.length > 0 && (
          <div className="mx-auto mt-24 flex max-w-336 flex-col gap-8">
            {newsPage?.more_posts_annotation && (
              <p
                data-directus={editable(
                  "news_page",
                  newsPage.id,
                  "more_posts_annotation"
                )}
                className="font-pv-hand text-pv-link -rotate-2 self-start text-3xl lg:text-4xl"
              >
                {newsPage.more_posts_annotation}
              </p>
            )}
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
