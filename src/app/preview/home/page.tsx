import { redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { PreviewUnavailable } from "@/components/preview/preview-unavailable";
import { HomeView } from "@/components/views/home-view";
import {
  getBeforeAfterItemsPreview,
  getBeforeAfterPagePreview,
  getGlobalPreview,
  getHomePagePreview,
  getPostsPreview,
  getServicesPagePreview,
  getServicesPreview,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

/** Preview for home_page, and for global (whose edits show on every page). */
export default async function HomePreview({ searchParams }: PreviewPageProps) {
  const { token } = await searchParams;
  if (!token) redirect("/");

  const [
    page,
    global,
    services,
    servicesPage,
    beforeAfter,
    beforeAfterPage,
    posts,
  ] = await Promise.all([
    getHomePagePreview(token),
    getGlobalPreview(token),
    getServicesPreview(token),
    getServicesPagePreview(token),
    getBeforeAfterItemsPreview(token),
    getBeforeAfterPagePreview(token),
    getPostsPreview(token),
  ]);

  if (!page) return <PreviewUnavailable collection="home_page" />;

  return (
    <PreviewShell global={global}>
      <HomeView
        page={page}
        global={global}
        services={services}
        servicesPage={servicesPage}
        beforeAfter={beforeAfter}
        beforeAfterPage={beforeAfterPage}
        posts={posts}
      />
    </PreviewShell>
  );
}
