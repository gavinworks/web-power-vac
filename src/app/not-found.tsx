import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { SiteFooter } from "@/components/site/site-footer";
import { focusRing, pill } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <>
      <main>
        <PageHero
          annotation="nothing in this gutter"
          heading={"Page not\n*found*"}
          description="The page you’re looking for has moved or doesn’t exist."
        >
          <div className="flex flex-wrap gap-3.5">
            <Link href="/" className={cn(pill.sky, focusRing)}>
              Go to the homepage
            </Link>
            <Link href="/contact" className={cn(pill.outline, focusRing)}>
              Get a quote
            </Link>
          </div>
        </PageHero>
      </main>
      <SiteFooter />
    </>
  );
}
