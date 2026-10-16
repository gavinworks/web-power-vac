import { redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { PreviewUnavailable } from "@/components/preview/preview-unavailable";
import { AreasView } from "@/components/views/areas-view";
import {
  getAreasPagePreview,
  getGlobalPreview,
  getServicesPreview,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AreasPreview({ searchParams }: PreviewPageProps) {
  const { token } = await searchParams;
  if (!token) redirect("/areas");

  const [page, global, services] = await Promise.all([
    getAreasPagePreview(token),
    getGlobalPreview(token),
    getServicesPreview(token),
  ]);

  if (!page) return <PreviewUnavailable collection="areas_page" />;

  return (
    <PreviewShell global={global}>
      <AreasView page={page} global={global} services={services} />
    </PreviewShell>
  );
}
