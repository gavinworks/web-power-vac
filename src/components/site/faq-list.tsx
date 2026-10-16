import { Plus } from "lucide-react";
import type { Faq } from "@/lib/directus";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";

/** Questions open and close with native details/summary, so no JS is needed. */
export function FaqList({
  faqs,
  className,
}: {
  faqs: Faq[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group text-pv-navy rounded-4xl bg-white"
        >
          <summary
            className={cn(
              "font-pv-display flex cursor-pointer list-none items-center justify-between gap-6 rounded-4xl p-6 text-2xl leading-tight font-extrabold tracking-[-0.01em] font-stretch-80% lg:p-8 lg:text-[1.75rem] [&::-webkit-details-marker]:hidden",
              focusRing
            )}
          >
            {faq.question}
            <span className="bg-pv-sky flex size-11 shrink-0 items-center justify-center rounded-full transition-transform group-open:rotate-45">
              <Plus className="size-5" strokeWidth={3} aria-hidden="true" />
            </span>
          </summary>
          <p className="max-w-170 px-6 pb-7 text-lg leading-normal lg:px-8 lg:pb-8">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
