import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { CameraMonitor } from "@/components/site/camera-monitor";
import { Headline } from "@/components/site/headline";
import { PageHero } from "@/components/site/page-hero";
import { QuoteSection } from "@/components/site/quote-section";
import { focusRing, heading, pill } from "@/components/site/styles";
import {
  getImageUrl,
  type BeforeAfterItem,
  type BeforeAfterPage,
  type Service,
} from "@/lib/directus";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";

export interface BeforeAfterViewProps {
  page: BeforeAfterPage;
  items: BeforeAfterItem[];
  services: Service[];
}

/** The before and after page, shared by the live route and its Directus preview. */
export function BeforeAfterView({
  page,
  items,
  services,
}: BeforeAfterViewProps) {
  const edit = (fields: string | string[], mode?: "popover" | "drawer") =>
    editable("before_after_page", page.id, fields, mode);
  const camera = getImageUrl(page.camera_image);
  // The hero photo falls back to the first pair's after photo
  const heroImage =
    getImageUrl(page.hero_image) ?? getImageUrl(items[0]?.after_image ?? null);
  const heroAlt = page.hero_image
    ? page.hero_image_alt
    : items[0]?.after_image_alt;

  return (
    <>
      <PageHero
        annotation={page.hero_annotation}
        heading={page.hero_heading ?? "Before & after"}
        description={page.hero_description}
        image={heroImage}
        imageAlt={heroAlt}
        edit={{
          annotation: edit("hero_annotation"),
          heading: edit("hero_heading"),
          description: edit("hero_description"),
          image: edit(["hero_image", "hero_image_alt"], "drawer"),
        }}
      />

      <section className="bg-pv-navy relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 text-white lg:px-12 lg:pt-27.5 lg:pb-30">
        <div className="mx-auto flex max-w-336 flex-col gap-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {page.gallery_heading && (
              <h2
                data-directus={edit("gallery_heading")}
                className={heading.section}
              >
                <Headline text={page.gallery_heading} />
              </h2>
            )}
            {page.gallery_note && (
              <p
                data-directus={edit("gallery_note")}
                className="text-pv-haze max-w-100 text-lg leading-normal"
              >
                {page.gallery_note}
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-14">
            {items.map((item) => {
              const before = getImageUrl(item.before_image);
              const after = getImageUrl(item.after_image);
              if (!before || !after) return null;
              return (
                <li key={item.id} className="flex flex-col gap-5">
                  <BeforeAfterSlider
                    beforeSrc={before}
                    beforeAlt={item.before_image_alt ?? ""}
                    afterSrc={after}
                    afterAlt={item.after_image_alt ?? ""}
                    isExample={item.is_example}
                    label={item.title}
                    labels={page}
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
                  <div
                    data-directus={editable(
                      "before_after",
                      item.id,
                      ["title", "service", "location"],
                      "drawer"
                    )}
                    className="flex flex-col gap-1 px-2 sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <h3 className="font-pv-display text-3xl leading-tight font-extrabold tracking-[-0.02em] font-stretch-80%">
                      {item.title}
                    </h3>
                    {(item.service || item.location) && (
                      <p className="text-pv-sky font-semibold">
                        {[item.service, item.location]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {camera && (
        <section className="bg-pv-sky text-pv-navy relative -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-28 lg:px-12 lg:pt-27.5 lg:pb-36">
          <div className="mx-auto grid max-w-336 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col gap-7">
              {page.camera_heading && (
                <h2
                  data-directus={edit("camera_heading")}
                  className={heading.section}
                >
                  <Headline
                    text={page.camera_heading}
                    accentClassName="text-white"
                  />
                </h2>
              )}
              {page.camera_description && (
                <p
                  data-directus={edit("camera_description")}
                  className="max-w-130 text-xl leading-normal font-medium"
                >
                  {page.camera_description}
                </p>
              )}
              {page.camera_cta_text && (
                <Link
                  href={page.camera_cta_link ?? "/services"}
                  data-directus={edit(["camera_cta_text", "camera_cta_link"])}
                  className={cn(pill.navy, "gap-3 self-start", focusRing)}
                >
                  {page.camera_cta_text}
                  <ArrowRight
                    className="size-5"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
            <CameraMonitor
              src={camera}
              alt={page.camera_image_alt ?? ""}
              sizes="(min-width: 1024px) 640px, 100vw"
              className="-rotate-2"
              editAttr={edit(["camera_image", "camera_image_alt"], "drawer")}
            />
          </div>
        </section>
      )}

      <QuoteSection services={services.map((s) => s.form_label)} />
    </>
  );
}
