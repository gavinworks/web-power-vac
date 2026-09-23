import { Metadata } from "next";
import Link from "next/link";
import { getHomePage, getPages } from "@/lib/directus";

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getHomePage();

  return {
    title: homePage?.meta_title ?? "Home",
    description: homePage?.meta_description ?? "",
  };
}

export default async function Home() {
  const [homePage, pages] = await Promise.all([getHomePage(), getPages()]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {homePage?.hero_heading ?? "Welcome"}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          {homePage?.hero_description ?? "Your site is ready."}
        </p>
        {homePage?.hero_cta_text && (
          <Link
            href={homePage.hero_cta_link ?? "#"}
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {homePage.hero_cta_text}
          </Link>
        )}
      </section>

      {/* Pages List */}
      {pages.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold">Pages</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="rounded-lg border p-6 transition-colors hover:bg-accent"
              >
                <h3 className="mb-2 font-semibold">{page.title}</h3>
                {page.description && (
                  <p className="text-sm text-muted-foreground">
                    {page.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
