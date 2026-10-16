import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageView } from "@/components/site/legal-page-view";
import { getLegalPage } from "@/lib/directus";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("privacy");
  return {
    title: page?.title ?? "Privacy",
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const page = await getLegalPage("privacy");
  if (!page) notFound();
  return <LegalPageView page={page} />;
}
