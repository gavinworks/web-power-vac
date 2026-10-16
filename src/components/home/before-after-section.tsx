import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { Headline } from "@/components/site/headline";
import { heading } from "@/components/site/styles";
import {
  getImageUrl,
  type BeforeAfterItem,
  type BeforeAfterPage,
} from "@/lib/directus";
import { editable } from "@/lib/editable";

export function BeforeAfterSection({
  pageId,
  title,
  annotation,
  item,
  labels,
}: {
  pageId: number;
  title: string | null;
  annotation: string | null;
  item: BeforeAfterItem | undefined;
  labels: BeforeAfterPage | null;
}) {
  const before = getImageUrl(item?.before_image ?? null);
  const after = getImageUrl(item?.after_image ?? null);
  if (!item || !before || !after) return null;

  return (
    <section
      id="before-after"
      className="bg-pv-navy scroll-mt-8 px-5 pt-8 pb-24 text-white lg:px-12 lg:pb-30"
    >
      <div className="mx-auto flex max-w-336 flex-col gap-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {title && (
            <h2
              data-directus={editable(
                "home_page",
                pageId,
                "before_after_heading"
              )}
              className={heading.section}
            >
              <Headline text={title} />
            </h2>
          )}
          {annotation && (
            <p
              data-directus={editable(
                "home_page",
                pageId,
                "before_after_annotation"
              )}
              className="font-pv-hand text-pv-sky -rotate-3 self-start text-3xl sm:self-auto lg:text-4xl"
            >
              {annotation}
            </p>
          )}
        </div>
        <BeforeAfterSlider
          beforeSrc={before}
          beforeAlt={item.before_image_alt ?? ""}
          afterSrc={after}
          afterAlt={item.after_image_alt ?? ""}
          isExample={item.is_example}
          label={item.title}
          labels={labels}
          editAttr={editable(
            "before_after",
            item.id,
            [
              "before_image",
              "before_image_alt",
              "after_image",
              "after_image_alt",
              "is_example",
            ],
            "drawer"
          )}
        />
      </div>
    </section>
  );
}
