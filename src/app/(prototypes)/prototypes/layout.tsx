import { notFound } from "next/navigation";

/**
 * Prototype layout guard.
 *
 * Prototypes are only accessible when ENABLE_PROTOTYPES=true.
 * This is controlled by Netlify deploy contexts in netlify.toml:
 *   - Production (main branch): ENABLE_PROTOTYPES=false → returns 404
 *   - Branch deploys: ENABLE_PROTOTYPES=true → prototypes accessible
 *   - Deploy previews (PRs): ENABLE_PROTOTYPES=true → prototypes accessible
 *
 * For local dev, set ENABLE_PROTOTYPES=true in .env.local.
 */
export default function PrototypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.ENABLE_PROTOTYPES !== "true") {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Prototype banner — visible on deployed previews */}
      <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-black">
        Prototype Preview — This is not the live site
      </div>
      {children}
    </div>
  );
}
