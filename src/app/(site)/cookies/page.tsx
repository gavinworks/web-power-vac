import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageView } from "@/components/site/legal-page-view";
import { getLegalPage } from "@/lib/directus";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("cookies");
  return {
    title: page?.title ?? "Cookies",
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/cookies" },
  };
}

export default async function CookiesPage() {
  const page = await getLegalPage("cookies");
  if (!page) notFound();
  return <LegalPageView page={page} />;
}
