import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { GlobalProvider } from "@/context/GlobalContext";
import type { Global } from "@/lib/directus";

/**
 * Wraps a preview page the way the (site) layout wraps a live one, but with
 * the global record fetched with the preview token, so unsaved-to-live edits
 * to the header, footer and quote form show up too.
 */
export function PreviewShell({
  global,
  children,
}: {
  global: Global | null;
  children: ReactNode;
}) {
  return (
    <GlobalProvider global={global}>
      <main>{children}</main>
      <SiteFooter />
    </GlobalProvider>
  );
}
