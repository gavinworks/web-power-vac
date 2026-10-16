import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/views/post-view";
import {
  getImageUrl,
  getNewsPage,
  getPost,
  getPosts,
  getServices,
} from "@/lib/directus";

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
  const [post, posts, newsPage, services] = await Promise.all([
    getPost(slug),
    getPosts(),
    getNewsPage(),
    getServices(),
  ]);

  if (!post) notFound();

  return (
    <PostView
      post={post}
      posts={posts}
      newsPage={newsPage}
      services={services}
    />
  );
}
