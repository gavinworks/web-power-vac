import { getPost } from "@/lib/directus";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Article from Power-Vac Gutter Cleaning";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return renderOgImage({
    annotation: post?.topic,
    heading: post?.title ?? "Gutter *talk*",
    strapline: "Gutter advice from Power-Vac · Norwich & Norfolk",
  });
}
