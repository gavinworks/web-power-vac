import { setAttr } from "./visual-editor";

type Mode = "popover" | "drawer" | "modal";

/**
 * The `data-directus` value that makes an element editable in the Directus
 * visual editor. Singletons pass their id (always 1). Returns undefined when
 * there is no item, so the attribute is simply left off.
 */
export function editable(
  collection: string,
  item: string | number | null | undefined,
  fields: string | string[],
  mode: Mode = "popover"
): string | undefined {
  if (item === null || item === undefined) return undefined;
  return setAttr({ collection, item: String(item), fields, mode });
}
