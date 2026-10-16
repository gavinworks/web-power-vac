"use client";

import { focusRing, pill } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bg-pv-ink flex min-h-svh flex-col items-start justify-center gap-7 px-5 text-white lg:px-12">
      <h1 className="font-pv-display text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.86] font-extrabold font-stretch-75%">
        This page didn’t load
      </h1>
      <p className="text-pv-haze max-w-150 text-xl">
        Try again, or ring us if you need us now.
      </p>
      <button type="button" onClick={reset} className={cn(pill.sky, focusRing)}>
        Try again
      </button>
    </main>
  );
}
