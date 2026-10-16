import { redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { PreviewUnavailable } from "@/components/preview/preview-unavailable";
import { NewsView } from "@/components/views/news-view";
import {
  getGlobalPreview,
  getNewsPagePreview,
  getPostsPreview,
  getServicesPreview,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NewsPreview({ searchParams }: PreviewPageProps) {
  const { token } = await searchParams;
  if (!token) redirect("/news");

  const [page, posts, global, services] = await Promise.all([
    getNewsPagePreview(token),
    getPostsPreview(token),
    getGlobalPreview(token),
    getServicesPreview(token),
  ]);

  if (!page) return <PreviewUnavailable collection="news_page" />;

  return (
    <PreviewShell global={global}>
      <NewsView page={page} posts={posts} global={global} services={services} />
    </PreviewShell>
  );
}
