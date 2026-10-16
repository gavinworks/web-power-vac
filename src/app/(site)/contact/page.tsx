import type { Metadata } from "next";
import { ContactView } from "@/components/views/contact-view";
import { getContactPage, getGlobal, getServices } from "@/lib/directus";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage();
  return {
    title: page?.meta_title ?? "Contact",
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const [page, global, services] = await Promise.all([
    getContactPage(),
    getGlobal(),
    getServices(),
  ]);

  if (!page) {
    throw new Error("Failed to fetch contact_page data from Directus");
  }

  return <ContactView page={page} global={global} services={services} />;
}
