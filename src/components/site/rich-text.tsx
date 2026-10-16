import { cn } from "@/lib/utils";

/**
 * Rich text from a Directus WYSIWYG field. Content is written by the site's
 * own editors, so the HTML is trusted. Styles live in globals.css (.pv-prose).
 */
export function RichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("pv-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
