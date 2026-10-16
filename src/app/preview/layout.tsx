import type { Metadata } from "next";

// Previews are for editors inside Directus; keep them out of search results
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
