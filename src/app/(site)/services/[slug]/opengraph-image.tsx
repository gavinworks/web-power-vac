import { getService } from "@/lib/directus";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Power-Vac Gutter Cleaning service";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  return renderOgImage({
    annotation: service?.hero_annotation,
    heading: service?.hero_heading ?? service?.title ?? "Our *services*",
  });
}
