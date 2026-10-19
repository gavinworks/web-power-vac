import { getBeforeAfterPage } from "@/lib/directus";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Before and after photos of gutters cleared by Power-Vac";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  const page = await getBeforeAfterPage();
  return renderOgImage({
    annotation: page?.hero_annotation,
    heading: page?.hero_heading ?? "Before\n& *after*",
  });
}
