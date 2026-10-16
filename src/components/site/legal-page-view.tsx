import { formatDate } from "@/components/news/post-card";
import type { LegalPage } from "@/lib/directus";
import { editable } from "@/lib/editable";
import { PageHero } from "./page-hero";
import { RichText } from "./rich-text";

export function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <>
      <PageHero
        annotation={`last updated ${formatDate(page.last_updated)}`}
        heading={page.title}
        edit={{
          annotation: editable("legal_pages", page.id, "last_updated"),
          heading: editable("legal_pages", page.id, "title"),
        }}
      />
      <section className="bg-pv-mist relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-28 lg:px-12 lg:pt-27.5 lg:pb-36">
        {page.body && (
          <RichText
            html={page.body}
            className="mx-auto max-w-200"
            editAttr={editable("legal_pages", page.id, "body", "drawer")}
          />
        )}
      </section>
    </>
  );
}
