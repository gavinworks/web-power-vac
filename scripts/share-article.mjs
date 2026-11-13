// Makes a link the client can use to read a draft article on the real site
// before it goes live.
//
//   node --env-file=.env.local scripts/share-article.mjs <slug> [days] [site-url]
//   node --env-file=.env.local scripts/share-article.mjs --list
//   node --env-file=.env.local scripts/share-article.mjs --delete <share-id>
//
// It creates a Directus share for the article (the same thing as the Share
// button on the item in Directus) and prints
// <site>/preview/news/<slug>?share=<share-id>. The share can read that one
// article, drafts included, and nothing else. It expires after [days]
// (default 14). Delete it in Directus, or with --delete, to switch the link
// off at once. Needs an admin token in DIRECTUS_ADMIN_TOKEN, read from the
// environment and never printed.

const directus = (process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "").replace(
  /\/+$/,
  ""
);
const admin = process.env.DIRECTUS_ADMIN_TOKEN;

// The share reads with this role's permissions, limited to the one item.
// Editors can read drafts; it never needs more than that.
const SHARE_ROLE_NAME = "Editors";

if (!directus || !admin) {
  console.error("Set NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN first.");
  process.exit(1);
}

async function api(path, init = {}) {
  const response = await fetch(`${directus}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${admin}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path}: ${response.status} ${await response.text()}`);
  }
  return response.status === 204 ? null : (await response.json()).data;
}

const [arg, second, third] = process.argv.slice(2);

if (!arg) {
  console.error("Usage: share-article.mjs <slug> [days] [site-url] | --list | --delete <share-id>");
  process.exit(1);
}

if (arg === "--list") {
  const shares = await api(
    "/shares?filter[collection][_eq]=posts&fields=id,name,item,date_end,times_used"
  );
  if (!shares.length) console.log("No article shares.");
  for (const s of shares) {
    console.log(`${s.id}  ${s.name}  expires ${s.date_end ?? "never"}  opened ${s.times_used ?? 0}x`);
  }
  process.exit(0);
}

if (arg === "--delete") {
  await api(`/shares/${second}`, { method: "DELETE" });
  console.log(`Deleted share ${second}. Its link no longer works.`);
  process.exit(0);
}

const slug = arg;
const days = Number(second ?? 14);
const site = (third ?? "https://www.powervacguttercleaning.co.uk").replace(/\/+$/, "");

const [post] = await api(
  `/items/posts?filter[slug][_eq]=${encodeURIComponent(slug)}&fields=id,title,status`
);
if (!post) {
  console.error(`No article with slug "${slug}".`);
  process.exit(1);
}

const [role] = await api(
  `/roles?filter[name][_eq]=${encodeURIComponent(SHARE_ROLE_NAME)}&fields=id`
);
if (!role) {
  console.error(`No "${SHARE_ROLE_NAME}" role in Directus.`);
  process.exit(1);
}

const dateEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const share = await api("/shares", {
  method: "POST",
  body: JSON.stringify({
    name: `Client review: ${post.title}`,
    collection: "posts",
    item: post.id,
    role: role.id,
    date_end: dateEnd.toISOString(),
  }),
});

console.log(`"${post.title}" (${post.status})`);
console.log(`${site}/preview/news/${slug}?share=${share.id}`);
console.log(`Expires ${dateEnd.toDateString()}. Switch it off early with --delete ${share.id}.`);
