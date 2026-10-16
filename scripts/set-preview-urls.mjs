// Sets the Live Preview URL on every Directus collection the site renders.
//
//   node --env-file=.env.local scripts/set-preview-urls.mjs [site-url]
//
// Needs DIRECTUS_PREVIEW_TOKEN (the Preview User's static token) and an admin
// token in DIRECTUS_ADMIN_TOKEN. Tokens are read from the environment and
// never printed. The site URL defaults to the production domain.

const directus = (process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "").replace(
  /\/+$/,
  ""
);
const site = (
  process.argv[2] ?? "https://www.powervacguttercleaning.co.uk"
).replace(/\/+$/, "");
const preview = process.env.DIRECTUS_PREVIEW_TOKEN;
const admin = process.env.DIRECTUS_ADMIN_TOKEN;

if (!directus || !preview || !admin) {
  console.error(
    "Set NEXT_PUBLIC_DIRECTUS_URL, DIRECTUS_PREVIEW_TOKEN and DIRECTUS_ADMIN_TOKEN first."
  );
  process.exit(1);
}

// Collection -> preview path. Item templates use Directus's {{field}} syntax.
const PATHS = {
  global: "/preview/home",
  home_page: "/preview/home",
  services_page: "/preview/services",
  services: "/preview/services/{{slug}}",
  before_after_page: "/preview/before-and-after",
  before_after: "/preview/before-and-after",
  areas_page: "/preview/areas",
  news_page: "/preview/news",
  posts: "/preview/news/{{slug}}",
  contact_page: "/preview/contact",
  legal_pages: "/preview/legal/{{slug}}",
};

for (const [collection, path] of Object.entries(PATHS)) {
  const url = `${site}${path}?token=${preview}`;
  const res = await fetch(`${directus}/collections/${collection}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${admin}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ meta: { preview_url: url } }),
  });
  console.log(
    `${collection.padEnd(18)} ${res.ok ? "set" : `failed (${res.status})`} ${site}${path}?token=…`
  );
}
