import { notFound } from "next/navigation";
import { PowerVacHome } from "./_components/power-vac/power-vac-home";

interface PrototypePageProps {
  params: Promise<{ project: string }>;
}

/**
 * Dynamic prototype route.
 *
 * Each prototype gets its own folder with co-located components:
 *   src/app/(prototypes)/prototypes/[project]/_components/
 *
 * And its own assets:
 *   public/prototypes/[project-name]/
 *
 * Usage:
 *   1. Create a branch: git checkout -b prototype/acme-homepage
 *   2. Add your prototype component below
 *   3. Push — Netlify creates a preview URL automatically
 *   4. Share the URL with the client
 *
 * Example URL: https://prototype-acme-homepage--yoursite.netlify.app/prototypes/acme-homepage
 */

// Register your prototypes here
const PROTOTYPES: Record<string, () => React.ReactNode> = {
  // "acme-homepage": () => <AcmeHomepage />,
  "power-vac-homepage": () => <PowerVacHome />,
};

export default async function PrototypePage({ params }: PrototypePageProps) {
  const { project } = await params;
  const renderPrototype = PROTOTYPES[project];

  if (!renderPrototype) {
    notFound();
  }

  return renderPrototype();
}

// Generate static params for registered prototypes
export function generateStaticParams() {
  return Object.keys(PROTOTYPES).map((project) => ({ project }));
}
