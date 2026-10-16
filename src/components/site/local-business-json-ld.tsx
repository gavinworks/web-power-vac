import { siteConfig } from "@/config/site";
import {
  getAreasPage,
  getGlobal,
  getImageUrl,
  getServices,
} from "@/lib/directus";

const DAYS: Record<string, string[]> = {
  "monday to friday": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "monday to saturday": [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  monday: ["Monday"],
  tuesday: ["Tuesday"],
  wednesday: ["Wednesday"],
  thursday: ["Thursday"],
  friday: ["Friday"],
  saturday: ["Saturday"],
  sunday: ["Sunday"],
};

/** "8am to 7pm" → ["08:00", "19:00"]; anything else (e.g. "Closed") → null. */
function parseTimes(times: string): [string, string] | null {
  const match = times
    .toLowerCase()
    .match(
      /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*to\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/
    );
  if (!match) return null;
  const to24 = (h: string, m: string | undefined, ap: string) => {
    let hour = Number(h) % 12;
    if (ap === "pm") hour += 12;
    return `${String(hour).padStart(2, "0")}:${m ?? "00"}`;
  };
  return [
    to24(match[1], match[2], match[3]),
    to24(match[4], match[5], match[6]),
  ];
}

/**
 * schema.org data for Google and AI search: a service-area business in
 * Norwich (no street address, matching the Google Business Profile).
 */
export async function LocalBusinessJsonLd() {
  const [global, areas, services] = await Promise.all([
    getGlobal(),
    getAreasPage(),
    getServices(),
  ]);
  if (!global) return null;

  const places = [
    areas?.city,
    ...(areas?.towns ?? []),
    ...(areas?.villages ?? []),
  ].filter(Boolean);
  const logo = getImageUrl(global.logo);

  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: global.site_name,
    description: global.site_description,
    url: siteConfig.url,
    logo: logo ? new URL(logo, siteConfig.url).toString() : undefined,
    image: new URL("/images/hero.jpg", siteConfig.url).toString(),
    telephone: global.phone,
    email: global.email_address,
    priceRange: global.price_from ? `From ${global.price_from}` : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Norwich",
      addressRegion: "Norfolk",
      addressCountry: "GB",
    },
    areaServed: [
      ...places.map((name) => ({ "@type": "Place", name: `${name}, Norfolk` })),
      { "@type": "AdministrativeArea", name: "Norfolk" },
    ],
    openingHoursSpecification: (global.opening_hours ?? []).flatMap((row) => {
      const days = DAYS[row.days.toLowerCase()];
      const times = parseTimes(row.times);
      return days && times
        ? [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: days,
              opens: times[0],
              closes: times[1],
            },
          ]
        : [];
    }),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Gutter cleaning services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          url: service.has_page
            ? `${siteConfig.url}/services/${service.slug}`
            : undefined,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
