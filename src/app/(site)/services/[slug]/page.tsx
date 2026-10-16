import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceView } from "@/components/views/service-view";
import {
  getGlobal,
  getHomePage,
  getService,
  getServices,
  getServicesPage,
} from "@/lib/directus";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await getServices();
  return services.filter((s) => s.has_page).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: service.meta_title ?? service.title,
    description: service.meta_description ?? service.card_summary ?? undefined,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, services, global, servicesPage, home] = await Promise.all([
    getService(slug),
    getServices(),
    getGlobal(),
    getServicesPage(),
    getHomePage(),
  ]);

  if (!service) notFound();

  return (
    <ServiceView
      service={service}
      services={services}
      global={global}
      servicesPage={servicesPage}
      home={home}
    />
  );
}
