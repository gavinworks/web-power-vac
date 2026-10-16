import Image from "next/image";
import { cn } from "@/lib/utils";

/** The pole camera's screen: what the customer watches while the gutter is vacuumed. */
export function CameraMonitor({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "bg-pv-navy rounded-4xl p-2.5 shadow-[0_30px_60px_-15px_rgb(0_0_0/0.75)] ring-1 ring-white/20",
        className
      )}
    >
      <div className="relative aspect-3/2 overflow-hidden rounded-3xl">
        <Image
          src={src}
          alt={alt}
          fill
          loading={priority ? "eager" : undefined}
          sizes={sizes}
          className="object-cover"
        />
        <span className="bg-pv-ink/75 absolute top-3 left-3 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-extrabold text-white backdrop-blur-sm">
          <span
            className="size-2.5 rounded-full bg-red-500 motion-safe:animate-pulse"
            aria-hidden="true"
          />
          Live
        </span>
      </div>
    </figure>
  );
}
