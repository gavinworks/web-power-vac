import { Bricolage_Grotesque, Caveat } from "next/font/google";
import { cn } from "@/lib/utils";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Services } from "./services";
import { BeforeAfter } from "./before-after";
import { Areas } from "./areas";
import { News } from "./news";
import { QuoteForm } from "./quote-form";
import { SiteFooter } from "./site-footer";

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

/**
 * Power-Vac Gutter Cleaning homepage prototype.
 * Design D, "Clear Skies After Dark": the bright Clear Skies system with a dark,
 * photographic hero. Business package: six pages, simple lead form, news.
 */
export function PowerVacHome() {
  return (
    <main
      className={cn(
        bricolage.variable,
        caveat.variable,
        "bg-pv-ink font-pv-display text-pv-navy antialiased"
      )}
    >
      <Hero />
      <HowItWorks />
      <Services />
      <BeforeAfter />
      <Areas />
      <News />
      <QuoteForm />
      <SiteFooter />
    </main>
  );
}
