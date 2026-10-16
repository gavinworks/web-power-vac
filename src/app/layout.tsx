import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getGlobal } from "@/lib/directus";
import { GlobalProvider } from "@/context/GlobalContext";
import { VisualEditorWrapper } from "@/components/visual-editor-wrapper";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-pv-bricolage",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-pv-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
    images: ["/images/hero.jpg"],
  },
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const global = await getGlobal();

  return (
    <html lang="en-GB">
      <body
        className={`${bricolage.variable} ${caveat.variable} bg-pv-ink font-pv-display text-pv-navy antialiased`}
      >
        <GlobalProvider global={global}>
          <VisualEditorWrapper>{children}</VisualEditorWrapper>
        </GlobalProvider>
      </body>
    </html>
  );
}
