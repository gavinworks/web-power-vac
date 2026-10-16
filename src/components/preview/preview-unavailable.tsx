/**
 * Shown inside Directus when a preview can't load, almost always because the
 * token in the collection's preview URL is wrong or can't read the collection.
 */
export function PreviewUnavailable({ collection }: { collection: string }) {
  return (
    <main className="bg-pv-mist text-pv-navy flex min-h-screen items-center px-5 py-24 lg:px-12">
      <div className="mx-auto flex max-w-150 flex-col gap-5">
        <p className="font-pv-hand text-pv-link -rotate-2 self-start text-3xl">
          preview unavailable
        </p>
        <h1 className="font-pv-display text-5xl leading-none font-extrabold font-stretch-75%">
          This preview couldn’t load {collection}
        </h1>
        <p className="text-lg leading-normal">
          Check that the preview URL for this collection in Directus (Settings,
          Data Model) ends with the Preview User’s token, and that the Preview
          User can read this collection.
        </p>
      </div>
    </main>
  );
}
