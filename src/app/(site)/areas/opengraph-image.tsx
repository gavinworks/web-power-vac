import { getAreasPage } from "@/lib/directus";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt =
  "Areas covered by Power-Vac Gutter Cleaning across Norwich and Norfolk";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  const page = await getAreasPage();
  return renderOgImage({
    annotation: page?.hero_annotation,
    heading: page?.hero_heading ?? "Gutters cleared\nacross *Norfolk*",
  });
}
