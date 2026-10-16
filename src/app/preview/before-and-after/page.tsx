import { redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { PreviewUnavailable } from "@/components/preview/preview-unavailable";
import { BeforeAfterView } from "@/components/views/before-after-view";
import {
  getBeforeAfterItemsPreview,
  getBeforeAfterPagePreview,
  getGlobalPreview,
  getServicesPreview,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

/** Preview for before_after_page and the before_after photo pairs. */
export default async function BeforeAfterPreview({
  searchParams,
}: PreviewPageProps) {
  const { token } = await searchParams;
  if (!token) redirect("/before-and-after");

  const [page, items, services, global] = await Promise.all([
    getBeforeAfterPagePreview(token),
    getBeforeAfterItemsPreview(token),
    getServicesPreview(token),
    getGlobalPreview(token),
  ]);

  if (!page) return <PreviewUnavailable collection="before_after_page" />;

  return (
    <PreviewShell global={global}>
      <BeforeAfterView page={page} items={items} services={services} />
    </PreviewShell>
  );
}
