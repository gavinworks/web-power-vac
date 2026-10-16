import { Fragment } from "react";

/**
 * Renders a CMS headline: each new line is a line break, and *words in
 * asterisks* turn sky blue (or the colour passed as `accentClassName`).
 */
export function Headline({
  text,
  accentClassName = "text-pv-sky",
}: {
  text: string;
  accentClassName?: string;
}) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*[^*]+\*)/).map((part, j) =>
            part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
              <span key={j} className={accentClassName}>
                {part.slice(1, -1)}
              </span>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            )
          )}
        </Fragment>
      ))}
    </>
  );
}

/** A headline as plain text, for alt text and metadata. */
export function plainHeadline(text: string): string {
  return text.replace(/\*/g, "").replace(/\n/g, " ");
}
