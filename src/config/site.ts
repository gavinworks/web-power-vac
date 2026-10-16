export const siteConfig = {
  name: "Power-Vac Gutter Cleaning",
  url: "https://www.powervacguttercleaning.co.uk",
  description:
    "Gutter vacuum cleaning from the ground across Norwich and Norfolk.",
} as const;

/** Main navigation. Routes live in code; their content comes from Directus. */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Before & after", href: "/before-and-after" },
  { label: "Areas", href: "/areas" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

export const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
] as const;
