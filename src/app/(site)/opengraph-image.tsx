import { getHomePage } from "@/lib/directus";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt =
  "Power-Vac Gutter Cleaning, gutter vacuum cleaning in Norwich and Norfolk";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  const page = await getHomePage();
  return renderOgImage({
    annotation: page?.hero_annotation,
    heading: page?.hero_heading ?? "Gutters cleared\nfrom the *ground*",
  });
}
