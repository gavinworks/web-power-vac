import { redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { PreviewUnavailable } from "@/components/preview/preview-unavailable";
import { ContactView } from "@/components/views/contact-view";
import {
  getContactPagePreview,
  getGlobalPreview,
  getServicesPreview,
} from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ContactPreview({
  searchParams,
}: PreviewPageProps) {
  const { token } = await searchParams;
  if (!token) redirect("/contact");

  const [page, global, services] = await Promise.all([
    getContactPagePreview(token),
    getGlobalPreview(token),
    getServicesPreview(token),
  ]);

  if (!page) return <PreviewUnavailable collection="contact_page" />;

  return (
    <PreviewShell global={global}>
      <ContactView page={page} global={global} services={services} />
    </PreviewShell>
  );
}
