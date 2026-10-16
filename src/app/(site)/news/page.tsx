import type { Metadata } from "next";
import { NewsView } from "@/components/views/news-view";
import { getGlobal, getNewsPage, getPosts, getServices } from "@/lib/directus";

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

  return (
    <NewsView page={page} posts={posts} global={global} services={services} />
  );
}
