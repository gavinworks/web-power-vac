import { CircleCheck } from "lucide-react";
import { Headline } from "@/components/site/headline";
import { Stars } from "@/components/site/stars";
import { focusRing, heading } from "@/components/site/styles";
import type { Global } from "@/lib/directus";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";

/**
 * Customer reviews, just above the quote form, where people decide whether
 * to get in touch. Hidden until `reviews_enabled` is switched on in Directus.
 */
export function ReviewsSection({ global }: { global: Global | null }) {
  const reviews = global?.reviews ?? [];
  if (!global?.reviews_enabled || reviews.length === 0) return null;
  const edit = (fields: string | string[], mode?: "popover" | "drawer") =>
    editable("global", global.id, fields, mode);

  return (
    <section className="text-pv-navy bg-white px-5 py-20 lg:px-12 lg:py-28">
      <div className="mx-auto flex max-w-336 flex-col gap-10 lg:gap-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          {global.reviews_heading && (
            <h2
              data-directus={edit("reviews_heading")}
              className={heading.section}
            >
              <Headline
                text={global.reviews_heading}
                accentClassName="text-pv-link"
              />
            </h2>
          )}
          {global.reviews_rating && (
            <div
              data-directus={edit(
                [
                  "reviews_rating",
                  "reviews_count",
                  "reviews_source",
                  "reviews_url",
                  "reviews_proof",
                ],
                "drawer"
              )}
              className="flex flex-col gap-2 lg:items-end"
            >
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-bold">
                <Stars className="text-pv-leaf" />
                <span>
                  {global.reviews_rating} from {global.reviews_count} reviews on{" "}
                  {global.reviews_url ? (
                    <a
                      href={global.reviews_url}
                      target="_blank"
                      rel="noopener"
                      className={cn(
                        "text-pv-link hover:text-pv-navy rounded-sm underline underline-offset-4",
                        focusRing
                      )}
                    >
                      {global.reviews_source}
                    </a>
                  ) : (
                    global.reviews_source
                  )}
                </span>
              </p>
              {global.reviews_proof && (
                <p className="flex items-center gap-2.5 text-lg">
                  <CircleCheck
                    className="text-pv-link size-5 shrink-0"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {global.reviews_proof}
                </p>
              )}
            </div>
          )}
        </div>

        <ul
          data-directus={edit("reviews", "drawer")}
          className="grid gap-4 md:grid-cols-3 lg:gap-5"
        >
          {reviews.map((review) => (
            <li key={review.name + review.date}>
              <figure className="bg-pv-mist flex h-full flex-col gap-4 rounded-4xl p-7 lg:p-9">
                <Stars className="text-pv-leaf" />
                <blockquote className="flex-1 text-xl leading-normal font-medium lg:text-[1.375rem]">
                  “{review.quote}”
                </blockquote>
                <figcaption className="text-pv-navy-soft text-base">
                  {review.name}, {review.date}
                  {global.reviews_source && <>, on {global.reviews_source}</>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
