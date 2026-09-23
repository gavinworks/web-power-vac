import { cn } from "@/lib/utils";
import { FacebookIcon, focusRing } from "./shared";
import { PrototypeLink } from "./prototype-link";

// Sample articles for the prototype; real posts come from the News page.
const POSTS = [
  { topic: "Seasonal", title: "How often should Norfolk homes clear their gutters?" },
  { topic: "Advice", title: "Five signs your downpipe is blocked" },
  { topic: "Behind the scenes", title: "Why we vacuum from the ground, not a ladder" },
];

export function News() {
  return (
    <section
      id="news"
      className="relative -mt-14 scroll-mt-8 rounded-t-[3.5rem] bg-pv-mist px-5 pt-20 pb-24 text-pv-navy lg:px-12 lg:pt-27.5 lg:pb-30"
    >
      <div className="mx-auto flex max-w-336 flex-col gap-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-pv-display text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] font-extrabold font-stretch-75% tracking-[-0.01em]">
            Gutter talk
          </h2>
          <PrototypeLink
            href="/news"
            page="News"
            className={cn(
              "flex h-15 items-center self-start rounded-full bg-pv-navy px-7 text-lg font-bold text-white transition-colors hover:bg-pv-link sm:self-auto",
              focusRing
            )}
          >
            All news
          </PrototypeLink>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {POSTS.map((post) => (
            <PrototypeLink
              key={post.title}
              href="/news"
              page="News"
              className={cn(
                "flex min-h-80 flex-col justify-between gap-10 rounded-4xl bg-white p-8 transition-transform hover:-translate-y-1",
                focusRing
              )}
            >
              <span className="self-start rounded-full bg-pv-mist px-3.5 py-1.5 text-sm font-bold">
                {post.topic}, [DATE]
              </span>
              <h3 className="font-pv-display text-[2rem] leading-[1.02] font-extrabold font-stretch-80% tracking-[-0.02em]">
                {post.title}
              </h3>
            </PrototypeLink>
          ))}
          <a
            href="https://www.facebook.com"
            className={cn(
              "flex min-h-80 flex-col justify-between gap-10 rounded-4xl bg-[#1877f2] p-8 text-white transition-transform hover:-translate-y-1",
              focusRing
            )}
          >
            <FacebookIcon className="size-14" />
            <div className="flex flex-col gap-2">
              <span className="font-pv-hand text-[2.125rem] leading-none">find us on</span>
              <span className="font-pv-display text-[2.75rem] leading-none font-extrabold font-stretch-80% tracking-[-0.02em]">
                Facebook
              </span>
              <span className="text-[1.0625rem] leading-snug">
                Latest jobs, before &amp; afters and quick questions answered.
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
