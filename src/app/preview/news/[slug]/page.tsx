import { notFound, redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { PostView } from "@/components/views/post-view";
import {
  getGlobal,
  getGlobalPreview,
  getNewsPage,
  getNewsPagePreview,
  getPostPreview,
  getPosts,
  getPostsPreview,
  getServices,
  getServicesPreview,
  getShareToken,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string; share?: string }>;
}

/**
 * Previews any article by slug, drafts included.
 *
 * `?token=` is the Preview User's token, used by the preview pane in Directus.
 * `?share=` is a Directus share id, for sending a draft to the client: the
 * share can only read this one article, so everything else on the page comes
 * from the public, published content.
 */
export default async function PostPreview({
  params,
  searchParams,
}: PreviewPageProps) {
  const [{ slug }, { token, share }] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!token && share) {
    const shareToken = await getShareToken(share);
    if (!shareToken) notFound();

    const [post, posts, newsPage, services, global] = await Promise.all([
      getPostPreview(slug, shareToken),
      getPosts(),
      getNewsPage(),
      getServices(),
      getGlobal(),
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
