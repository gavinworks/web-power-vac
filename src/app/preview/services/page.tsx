import { redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { PreviewUnavailable } from "@/components/preview/preview-unavailable";
import { ServicesView } from "@/components/views/services-view";
import {
  getGlobalPreview,
  getServicesPagePreview,
  getServicesPreview,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ServicesPreview({
  searchParams,
}: PreviewPageProps) {
  const { token } = await searchParams;
  if (!token) redirect("/services");

  const [page, services, global] = await Promise.all([
    getServicesPagePreview(token),
    getServicesPreview(token),
    getGlobalPreview(token),
  ]);

  if (!page) return <PreviewUnavailable collection="services_page" />;

  return (
    <PreviewShell global={global}>
      <ServicesView page={page} services={services} global={global} />
    </PreviewShell>
  );
}
