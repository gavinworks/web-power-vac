import { notFound, redirect } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { LegalPageView } from "@/components/site/legal-page-view";
import { getGlobalPreview, getLegalPagePreview } from "@/lib/directus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

/** Previews the privacy or cookies page, drafts included. */
export default async function LegalPreview({
  params,
  searchParams,
}: PreviewPageProps) {
  const [{ slug }, { token }] = await Promise.all([params, searchParams]);
  if (!token) redirect(`/${slug}`);

  const [page, global] = await Promise.all([
    getLegalPagePreview(slug, token),
    getGlobalPreview(token),
  ]);

  if (!page) notFound();

  return (
    <PreviewShell global={global}>
      <LegalPageView page={page} />
    </PreviewShell>
  );
}
