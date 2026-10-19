import { getServicesPage } from "@/lib/directus";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Gutter cleaning services from Power-Vac Gutter Cleaning";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  const page = await getServicesPage();
  return renderOgImage({
    annotation: page?.hero_annotation,
    heading: page?.hero_heading ?? "Our *services*",
  });
}
