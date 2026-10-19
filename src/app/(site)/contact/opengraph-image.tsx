import { getContactPage } from "@/lib/directus";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Get a free gutter cleaning quote from Power-Vac";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  const page = await getContactPage();
  return renderOgImage({
    annotation: page?.hero_annotation,
    heading: page?.hero_heading ?? "Get a\n*quote*",
  });
}
