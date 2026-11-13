#!/usr/bin/env node
/**
 * Google Search Console from the command line. Zero dependencies.
 *
 * Node's built-in crypto can sign the service-account JWT, so there is no
 * npm install, nothing added to the site's package.json and no supply chain
 * to worry about for a tool that holds a private key.
 *
 *   node tools/gsc/gsc.mjs sites
 *   node tools/gsc/gsc.mjs queries [days] [limit]
 *   node tools/gsc/gsc.mjs pages [days] [limit]
 *   node tools/gsc/gsc.mjs page <url-substring> [days]
 *   node tools/gsc/gsc.mjs compare <days> [limit]
 *   node tools/gsc/gsc.mjs inspect <url>
 *   node tools/gsc/gsc.mjs sweep [--save]
 *   node tools/gsc/gsc.mjs sitemaps
 *
 * Power Vac ONLY. Copied from the build76-client-tools skill on 2026-11-13.
 * Each client repo has its own copy so a change made for one client can never
 * break, or report the numbers of, another. Refresh it from the skill with
 * add-tools.mjs --update, which keeps the property pinned below.
 *
 *   SITE        hardcoded below. A stray GSC_SITE exported in the shell for
 *               another project is ignored, so this can never report another
 *               client's numbers under this client's name.
 *   DATA_DIR    the folder this script sits in, so tracked.json and
 *               snapshot.json are found whatever directory it is run from.
 *
 * The key lives OUTSIDE the repo at ~/.config/build76/gsc.json so it cannot be
 * committed by accident. Override with GSC_KEY=/path/to/key.json.
 *
 * Access is granted in Search Console, not in Google Cloud IAM: the service
 * account email has to be added under Settings > Users and permissions.
 */

import { createSign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY_PATH = process.env.GSC_KEY || join(homedir(), '.config/build76/gsc.json');
const DATA_DIR = dirname(fileURLToPath(import.meta.url));
// URL-prefix property: covers https://www.powervacguttercleaning.co.uk/... only. Inspecting a
// non-www or http:// URL returns "you do not own this site", which is not a
// permissions problem.
const SITE = 'https://www.powervacguttercleaning.co.uk/';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

/* --------------------------------------------------------------- auth --- */

function loadKey() {
  try {
    return JSON.parse(readFileSync(KEY_PATH, 'utf8'));
  } catch (e) {
    die(`could not read the service account key at ${KEY_PATH}\n  ${e.message}`);
  }
}

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

/** Sign a JWT with the service account key and swap it for an access token. */
async function getToken() {
  const key = loadKey();
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(key.private_key))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    die(`token exchange failed (${res.status})\n  ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function api(url, { method = 'GET', body } = {}) {
  const token = (api._token ??= await getToken());
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || JSON.stringify(json);
    if (res.status === 403) {
      die(
        `403 from Search Console.\n  ${msg}\n\n` +
          `  Almost always means the service account has not been added to the property.\n` +
          `  Search Console > Settings > Users and permissions > Add user:\n` +
          `    ${loadKey().client_email}`,
      );
    }
    die(`${res.status} from Search Console\n  ${msg}`);
  }
  return json;
}

/* -------------------------------------------------------------- utils --- */

function die(msg) {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
}

/** yyyy-mm-dd, n days before today. */
const ago = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

/** GSC data lags ~2 days, so "yesterday" is usually empty. */
const END = ago(2);

/** Properties this service account can actually query. */
async function properties() {
  const { siteEntry = [] } = await api('https://www.googleapis.com/webmasters/v3/sites');
  return siteEntry.filter((s) => s.permissionLevel !== 'siteUnverifiedUser');
}

/**
 * Which property to query. Always this client's: the shared script refused to guess
 * because the service account sees several properties, and pinning the site in
 * code is the self-contained answer to the same problem.
 */
async function siteUrl() {
  return SITE;
}

/**
 * Strip the origin off a result URL so tables stay readable.
 *
 * Was a hardcoded build76 replace in three places, which quietly did nothing
 * once the tool started serving other sites.
 *
 * How much to strip depends on the property type, and getting this wrong hides
 * the exact thing you need to see. A URL-prefix property pins one scheme and
 * one host, so the path alone is unambiguous. A DOMAIN property spans every
 * subdomain and both schemes, so http/https and www/bare are four different
 * rows for the same page. Collapsing those to a bare path prints the home page
 * three times with three different click counts and no way to tell why, which
 * is what this did on its first run against clarksglass.org.uk.
 */
function shortPath(u, site = '') {
  let parsed;
  try {
    parsed = new URL(u);
  } catch {
    return u;
  }
  const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, '') || '/';
  if (!site.startsWith('sc-domain:')) return path;
  const scheme = parsed.protocol === 'https:' ? '' : 'http://';
  return `${scheme}${parsed.hostname}${path === '/' ? '/' : path}`;
}

const pad = (s, n) => String(s).padEnd(n).slice(0, n);
const num = (v, n = 6) => String(v).padStart(n);
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const pos = (v) => v.toFixed(1);

async function search(site, { dimension, days, limit = 25, filters }) {
  const body = {
    startDate: ago(days + 2),
    endDate: END,
    dimensions: [dimension],
    rowLimit: limit,
    ...(filters ? { dimensionFilterGroups: [{ filters }] } : {}),
  };
  const { rows = [] } = await api(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    { method: 'POST', body },
  );
  return rows;
}

function table(rows, label, width = 52, site = '') {
  if (!rows.length) return console.log('  (no data in this window)');
  console.log(`  ${pad(label, width)} ${num('clicks')} ${num('impr', 8)} ${num('ctr', 7)} ${num('pos', 6)}`);
  console.log(`  ${'-'.repeat(width)} ${'-'.repeat(6)} ${'-'.repeat(8)} ${'-'.repeat(7)} ${'-'.repeat(6)}`);
  for (const r of rows) {
    // Query rows are not URLs, so shortPath hands them back untouched.
    const key = shortPath(String(r.keys[0]), site);
    console.log(
      `  ${pad(key || '/', width)} ${num(r.clicks)} ${num(r.impressions, 8)} ${num(pct(r.ctr), 7)} ${num(pos(r.position), 6)}`,
    );
  }
  const t = rows.reduce((a, r) => ({ c: a.c + r.clicks, i: a.i + r.impressions }), { c: 0, i: 0 });
  console.log(`  ${pad('TOTAL (rows shown)', width)} ${num(t.c)} ${num(t.i, 8)}`);
}

/* ----------------------------------------------------------- commands --- */

const [cmd = 'help', ...args] = process.argv.slice(2);

const commands = {
  async sites() {
    const { siteEntry = [] } = await api('https://www.googleapis.com/webmasters/v3/sites');
    if (!siteEntry.length) {
      die(
        `the API works but this service account can see no properties.\n` +
          `  Add ${loadKey().client_email} under Settings > Users and permissions.`,
      );
    }
    console.log('\n  properties visible to this service account:\n');
    for (const s of siteEntry) console.log(`   ${pad(s.permissionLevel, 22)} ${s.siteUrl}`);
    // Deliberately does not call siteUrl(): this is the command you run to
    // find out what is available, so it must never be the one that refuses.
    console.log(
      `\n  this script is pinned to: ${SITE}\n`,
    );
  },

  async queries() {
    const days = Number(args[0]) || 28;
    const site = await siteUrl();
    console.log(`\n  top queries, last ${days} days to ${END}   [${site}]\n`);
    table(await search(site, { dimension: 'query', days, limit: Number(args[1]) || 25 }), 'query', 52, site);
    console.log();
  },

  async pages() {
    const days = Number(args[0]) || 28;
    const site = await siteUrl();
    console.log(`\n  top pages, last ${days} days to ${END}   [${site}]\n`);
    table(await search(site, { dimension: 'page', days, limit: Number(args[1]) || 25 }), 'page', 52, site);
    console.log();
  },

  /** Queries driving one page. Handy for "is /for/engineering doing anything". */
  async page() {
    const needle = args[0] || die('usage: page <url-substring> [days]');
    const days = Number(args[1]) || 28;
    const site = await siteUrl();
    console.log(`\n  queries for pages containing "${needle}", last ${days} days\n`);
    table(
      await search(site, {
        dimension: 'query',
        days,
        limit: 25,
        filters: [{ dimension: 'page', operator: 'contains', expression: needle }],
      }),
      'query',
      52,
      site,
    );
    console.log();
  },

  /** Two equal windows back to back, so a change is visible rather than inferred. */
  async compare() {
    const days = Number(args[0]) || 28;
    const site = await siteUrl();
    const limit = Number(args[1]) || 20;
    const q = async (start, end) => {
      const { rows = [] } = await api(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
        { method: 'POST', body: { startDate: start, endDate: end, dimensions: ['page'], rowLimit: 500 } },
      );
      return new Map(rows.map((r) => [r.keys[0], r]));
    };
    const recent = await q(ago(days + 2), END);
    const prior = await q(ago(days * 2 + 2), ago(days + 3));
    const keys = new Set([...recent.keys(), ...prior.keys()]);
    const rows = [...keys]
      .map((k) => {
        const a = prior.get(k) || { clicks: 0, impressions: 0 };
        const b = recent.get(k) || { clicks: 0, impressions: 0 };
        return { k, dc: b.clicks - a.clicks, di: b.impressions - a.impressions, b, a };
      })
      .sort((x, y) => Math.abs(y.di) - Math.abs(x.di))
      .slice(0, limit);
    console.log(`\n  last ${days}d vs the ${days}d before, by impression change   [${site}]\n`);
    console.log(`  ${pad('page', 50)} ${num('clicks', 12)} ${num('impressions', 16)}`);
    console.log(`  ${'-'.repeat(50)} ${'-'.repeat(12)} ${'-'.repeat(16)}`);
    for (const r of rows) {
      const sign = (n) => (n > 0 ? `+${n}` : String(n));
      console.log(
        `  ${pad(shortPath(r.k, site), 50)} ` +
          `${num(`${r.a.clicks}>${r.b.clicks} ${sign(r.dc)}`, 12)} ` +
          `${num(`${r.a.impressions}>${r.b.impressions} ${sign(r.di)}`, 16)}`,
      );
    }
    console.log();
  },

  /**
   * Inspect every tracked URL and diff against the last snapshot.
   *
   *   sweep --save    inspect and write the snapshot (do this once to baseline)
   *   sweep           inspect and show what changed since the snapshot
   *
   * Tracks the URLs affected by the 5 Aug work: the retired /solutions cluster
   * and old slugs, the articles left with a canonical mismatch, the retired
   * directory (expecting 410s to land), and the new sector pages as a control
   * that should simply stay healthy.
   *
   * Plus the pages published 4-5 Aug, which are the ones actually chasing
   * commercial terms. For those the question is not "did a mismatch clear" but
   * the blunter "has Google crawled and indexed it yet", so they are worth
   * watching even though they have no baseline to diff against.
   */
  async sweep() {
    const site = await siteUrl();
    // Per project, not next to the script. The script is shared across sites;
    // the URL list and its baseline are the one thing that must not be.
    const listPath = join(DATA_DIR, 'tracked.json');
    const snapPath = join(DATA_DIR, 'snapshot.json');
    let tracked;
    try {
      tracked = JSON.parse(readFileSync(listPath, 'utf8'));
    } catch (e) {
      die(
        `could not read the tracked URL list at ${listPath}\n  ${e.message}\n\n` +
          `  tracked.json sits next to this script. It is a JSON object of\n` +
          `  "group name": [urls].`,
      );
    }
    const save = args.includes('--save');

    let prev = null;
    if (!save) {
      try {
        prev = JSON.parse(readFileSync(snapPath, 'utf8'));
      } catch {
        die(`no snapshot yet at ${snapPath}. Run the same command with --save.`);
      }
    }

    const now = {};
    for (const [group, urls] of Object.entries(tracked)) {
      console.log(`\n  ${group}`);
      for (const url of urls) {
        let r;
        try {
          const { inspectionResult } = await api(
            'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
            { method: 'POST', body: { inspectionUrl: url, siteUrl: site, languageCode: 'en-GB' } },
          );
          r = inspectionResult?.indexStatusResult || {};
        } catch {
          console.log(`   ERR      ${url}`);
          continue;
        }
        const state = {
          verdict: r.verdict || '?',
          coverage: r.coverageState || '',
          crawled: r.lastCrawlTime ? r.lastCrawlTime.slice(0, 10) : 'NEVER',
          mismatch: Boolean(r.googleCanonical && r.userCanonical && r.googleCanonical !== r.userCanonical),
          googleCanonical: r.googleCanonical || '',
          // Whether the canonical Google picked is this page. See the note in
          // inspect(): a mismatch where Google still chose the page itself is
          // cosmetic and self-clearing, one where it chose another page is not.
          // Printing both as bare "MISMATCH" is what led to three Linear issues
          // being written around a problem that was not costing us anything.
          //
          // Compare EXACTLY, slash included. This used to strip the trailing
          // slash off both sides, which quietly folded the one case that is not
          // cosmetic into the one that is: Google clustering the page onto the
          // legacy with-a-slash address left over from a WordPress site. On
          // 21 Aug /doors/doors-romsey was called "cosmetic, do not spend quota
          // on this" while Google's pick was /doors/doors-romsey/, last crawled
          // 15 Apr and itself unindexed, so the page was invisible under either
          // address and the Validate Fix run failed on it. tracked.json holds
          // no-slash URLs only, so an exact compare adds no false positives:
          // Build 76's 17 stale-tag pages all have googleCanonical identical to
          // the URL and stay classified as cosmetic.
          selfCanonical: Boolean(r.googleCanonical && r.googleCanonical === url),
        };
        now[url] = state;

        const p = prev?.urls?.[url];
        let delta = '';
        if (prev && !p) {
          // Added to tracked.json after the baseline was taken. Without this it
          // prints exactly like an unchanged URL, so a page we have never had a
          // reading for reads as "nothing moved", which is the opposite of what
          // it means. Deliberately not auto-baselined: re-saving to pick these
          // up would throw away the 5 Aug snapshot the whole sweep exists to
          // measure against.
          delta = '   <-- NEW to the list, no baseline';
        } else if (p) {
          const bits = [];
          if (p.crawled !== state.crawled) bits.push(`recrawled ${p.crawled} > ${state.crawled}`);
          if (p.mismatch && !state.mismatch) bits.push('CANONICAL RESOLVED');
          if (!p.mismatch && state.mismatch) bits.push('canonical regressed');
          if (p.coverage !== state.coverage) bits.push(`${p.coverage} > ${state.coverage}`);
          delta = bits.length ? `   <-- ${bits.join('; ')}` : '';
        }
        const flag = state.mismatch ? (state.selfCanonical ? ' stale-tag' : ' CANONICAL LOST') : '';
        const path = shortPath(url, site);
        console.log(`   ${pad(state.verdict, 8)} ${pad(state.crawled, 11)} ${pad(path, 46)} ${state.coverage}${flag}${delta}`);
      }
    }

    if (save) {
      const stamp = new Date().toISOString().slice(0, 10);
      writeFileSync(snapPath, JSON.stringify({ takenOn: stamp, urls: now }, null, 1));
      console.log(`\n  snapshot saved (${Object.keys(now).length} URLs, ${stamp}).`);
      console.log('  run `sweep` later to see what changed.\n');
    } else {
      const cleared = Object.entries(now).filter(([u, s]) => prev.urls[u]?.mismatch && !s.mismatch).length;
      const recrawled = Object.entries(now).filter(([u, s]) => prev.urls[u] && prev.urls[u].crawled !== s.crawled).length;
      const stale = Object.values(now).filter((s) => s.mismatch && s.selfCanonical).length;
      const lost = Object.values(now).filter((s) => s.mismatch && !s.selfCanonical).length;
      console.log(
        `\n  since ${prev.takenOn}: ${recrawled} recrawled, ${cleared} canonical mismatches resolved.` +
          `\n  ${stale} carrying a stale tag (cosmetic, self-clearing), ${lost} with the canonical actually lost to another page.\n`,
      );
    }
  },

  /** Index status for one URL: last crawl, coverage, and the canonical Google chose. */
  async inspect() {
    const url = args[0] || die('usage: inspect <full-url>');
    const site = await siteUrl();
    const { inspectionResult } = await api(
      'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
      { method: 'POST', body: { inspectionUrl: url, siteUrl: site, languageCode: 'en-GB' } },
    );
    const r = inspectionResult?.indexStatusResult || {};
    console.log(`\n  ${url}\n`);
    const row = (k, v) => console.log(`   ${pad(k, 22)} ${v ?? '(none)'}`);
    row('verdict', inspectionResult?.indexStatusResult?.verdict);
    row('coverage', r.coverageState);
    row('last crawled', r.lastCrawlTime);
    row('crawled as', r.crawledAs);
    row('google canonical', r.googleCanonical);
    row('declared canonical', r.userCanonical);
    row('indexing allowed', r.indexingState);
    row('fetch', r.pageFetchState);
    row('robots.txt', r.robotsTxtState);
    // A mismatch on its own says nothing about severity, and the first version
    // of this warning treated every one as the canonical bug biting. Checking
    // all 17 on 6 Aug showed Google picked the page itself every single time:
    // it read the wrong declaration, weighed it against the evidence and
    // overruled us. Nothing was suppressed. The two cases need saying apart,
    // because only one of them is worth spending Request Indexing quota on.
    if (r.googleCanonical && r.userCanonical && r.googleCanonical !== r.userCanonical) {
      // Exact compare, slash included: see the note on selfCanonical in sweep().
      // A pick that differs only by a trailing slash is a different URL to
      // Google, and is the shape that hides a real problem rather than a stale
      // tag, so it has to fall through to the loud branch.
      const selfCanonical = r.googleCanonical === url;
      const slashOnly =
        !selfCanonical && r.googleCanonical.replace(/\/$/, '') === url.replace(/\/$/, '');
      console.log(
        selfCanonical
          ? `\n   . Declared canonical is wrong, but Google overruled it and chose this\n` +
              `     page. Cosmetic: it clears itself at the next crawl, since the tag is\n` +
              `     already fixed at source (7c52dc8). Do not spend quota on this.`
          : slashOnly
            ? `\n   ! Google chose the LEGACY trailing-slash address, not this one.\n` +
                `     Check whether that address is indexed. If it is not, this page is\n` +
                `     invisible under either address and a Validate Fix run will fail on\n` +
                `     it. Fix: Request Indexing on the with-a-slash URL so Google recrawls\n` +
                `     it, sees the redirect and collapses the pair.`
            : `\n   ! Google chose a DIFFERENT PAGE as the canonical, not this one.\n` +
                `     This URL's signals are being consolidated elsewhere. Real, worth a look.`,
      );
    }
    console.log();
  },

  async sitemaps() {
    const site = await siteUrl();
    const { sitemap = [] } = await api(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps`,
    );
    console.log(`\n  sitemaps for ${site}\n`);
    for (const s of sitemap) {
      console.log(`   ${s.path}`);
      console.log(
        `     submitted ${s.lastSubmitted?.slice(0, 10)}  downloaded ${s.lastDownloaded?.slice(0, 10) || 'never'}  ` +
          `warnings ${s.warnings || 0}  errors ${s.errors || 0}`,
      );
    }
    console.log();
  },

  help() {
    console.log(`
  gsc.mjs  Search Console from the command line

    sites                       properties this service account can see
    queries [days] [limit]      top queries        (default 28 days, 25 rows)
    pages [days] [limit]        top pages
    page <substring> [days]     queries driving pages matching a substring
    compare [days] [limit]      last N days vs the N before, by impression change
    inspect <url>               last crawl, coverage, canonical Google chose
    sweep [--save]              inspect every tracked URL; --save writes the
                                baseline, without it shows what changed since
    sitemaps                    submitted sitemaps and when they were read

  Power Vac only. Everything is pinned in this script:

    SITE       ${SITE}
    DATA_DIR   ${DATA_DIR}
    GSC_KEY    ${KEY_PATH}

  A URL-prefix property covers only that exact prefix, so inspecting a non-www
  URL returns "you do not own this site" rather than anything more helpful.

  Search Console data lags about 2 days, so windows end ${END}.
`);
  },
};

await (commands[cmd] || commands.help)();
