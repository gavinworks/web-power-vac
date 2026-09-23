import { redirect } from "next/navigation";
import { getHomePagePreview, getGlobalPreview } from "@/lib/directus";
import { GlobalProvider } from "@/context/GlobalContext";

// Force dynamic rendering — never cache preview pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

/**
 * Preview route for the home page.
 * Used by Directus visual editor to show live content changes.
 *
 * Directus visual editor config:
 *   Preview URL: https://yoursite.com/preview/home?token=__TOKEN__
 */
export default async function HomePreview({ searchParams }: PreviewPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/");
  }

  const [homePage, global] = await Promise.all([
    getHomePagePreview(token),
    getGlobalPreview(token),
  ]);

  return (
    <GlobalProvider global={global}>
      <main className="mx-auto max-w-4xl px-4 py-16">
        <section className="text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {homePage?.hero_heading ?? "Welcome"}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {homePage?.hero_description ?? "Your site is ready."}
          </p>
        </section>
      </main>
    </GlobalProvider>
  );
}
