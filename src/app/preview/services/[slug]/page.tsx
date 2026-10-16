import { notFound, redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { ServiceView } from "@/components/views/service-view";
import {
  getGlobalPreview,
  getHomePagePreview,
  getServicePreview,
  getServicesPagePreview,
  getServicesPreview,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

/** Previews any service by slug, drafts included. */
export default async function ServicePreview({
  params,
  searchParams,
}: PreviewPageProps) {
  const [{ slug }, { token }] = await Promise.all([params, searchParams]);
  if (!token) redirect(`/services/${slug}`);

  const [service, services, global, servicesPage, home] = await Promise.all([
    getServicePreview(slug, token),
    getServicesPreview(token),
    getGlobalPreview(token),
    getServicesPagePreview(token),
    getHomePagePreview(token),
  ]);

  if (!service) notFound();

  return (
    <PreviewShell global={global}>
      <ServiceView
        service={service}
        services={services}
        global={global}
        servicesPage={servicesPage}
        home={home}
      />
    </PreviewShell>
  );
}
