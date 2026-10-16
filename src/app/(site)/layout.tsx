import { SiteFooter } from "@/components/site/site-footer";
import { LocalBusinessJsonLd } from "@/components/site/local-business-json-ld";

/**
 * Public site pages. Each page opens with its own dark hero (which carries
 * the floating header) and the footer closes every page.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LocalBusinessJsonLd />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
