import { notFound, redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { PostView } from "@/components/views/post-view";
import {
  getGlobalPreview,
  getNewsPagePreview,
  getPostPreview,
  getPostsPreview,
  getServicesPreview,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

/** Previews any article by slug, drafts included. */
export default async function PostPreview({
  params,
  searchParams,
}: PreviewPageProps) {
  const [{ slug }, { token }] = await Promise.all([params, searchParams]);
  if (!token) redirect(`/news/${slug}`);

  const [post, posts, newsPage, services, global] = await Promise.all([
    getPostPreview(slug, token),
    getPostsPreview(token),
    getNewsPagePreview(token),
    getServicesPreview(token),
    getGlobalPreview(token),
  ]);

  if (!post) notFound();

  return (
    <PreviewShell global={global}>
      <PostView
        post={post}
        posts={posts}
        newsPage={newsPage}
        services={services}
      />
    </PreviewShell>
  );
}
