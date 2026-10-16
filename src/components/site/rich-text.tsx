import { cn } from "@/lib/utils";

/**
 * Rich text from a Directus WYSIWYG field. Content is written by the site's
 * own editors, so the HTML is trusted. Styles live in globals.css (.pv-prose).
 */
export function RichText({
  html,
  className,
  editAttr,
}: {
  html: string;
  className?: string;
  /** data-directus value, so the text can be edited in the visual editor. */
  editAttr?: string;
}) {
  return (
    <div
      data-directus={editAttr}
      className={cn("pv-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
