import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Five filled stars beside a rating. Decorative: the rating itself is the text. */
export function Stars({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-5 fill-current" strokeWidth={0} />
      ))}
    </span>
  );
}
