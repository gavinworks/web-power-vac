#!/usr/bin/env node
/**
 * Google Business Profile from the command line. Zero dependencies.
 *
 *   pnpm gbp info
 *   pnpm gbp reviews [limit]
 *   pnpm gbp unreplied
 *   pnpm gbp reply <review-id> <text | file | -> [--confirm]
 *   pnpm gbp unreply <review-id> [--confirm]
 *   pnpm gbp posts [limit]
 *   pnpm gbp post <post.json> [--confirm]
 *   pnpm gbp delete-post <post-id> [--confirm]
 *   pnpm gbp update <mask> <patch.json> [--confirm]
 *   pnpm gbp performance [days]
 *   pnpm gbp keywords [months]
 *   pnpm gbp locations
 *
 * POWER-VAC ONLY. Copied out of the shared ~/.config/build76/gbp.mjs on
 * 26 Oct 2026 so this repo can only ever act on POWER-VAC's profile. The
 * shared copy is the template for new clients; fixes are not ported between
 * copies automatically.
 *
 *   LOCATION   hardcoded below, with the account it sits under. GBP_LOCATION
 *              and GBP_ACCOUNT are not read, so a value exported for another
 *              client can never point this at the wrong profile.
 *
 * A PERSON APPROVES EVERY CHANGE. Anything that writes to a live profile
 * (reply, unreply, post, delete-post, update) prints a preview and stops.
 * It only sends with --confirm, and --confirm is added after the client or
 * Gavin has approved exactly what the preview shows. Everything else is read
 * only.
 *
 * Credentials live OUTSIDE every repo at ~/.config/build76/gbp.json
 * ({client_id, client_secret, refresh_token}, chmod 600). The refresh token
 * came from the OAuth Playground with the business.manage scope, signed in as
 * build76ltd@gmail.com. Override with GBP_CREDS=/path/to/creds.json. If every
 * call fails with invalid_grant, the token has been revoked: get a new one
 * from the Playground and replace refresh_token in the file.
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CREDS_PATH = process.env.GBP_CREDS || join(homedir(), '.config/build76/gbp.json');
const ARGS = process.argv.slice(2).filter((a) => a !== '--confirm');
const CONFIRM = process.argv.includes('--confirm');

const NAME = 'POWER-VAC Gutter Cleaning';
const ACCOUNT = 'accounts/115903855930220169863';
const LOCATION = 'locations/8667640692038315892';

const ACCOUNTS_API = 'https://mybusinessaccountmanagement.googleapis.com/v1';
const INFO_API = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const V4_API = 'https://mybusiness.googleapis.com/v4';
const PERF_API = 'https://businessprofileperformance.googleapis.com/v1';

/* --------------------------------------------------------------- auth --- */

function loadCreds() {
  try {
    const c = JSON.parse(readFileSync(CREDS_PATH, 'utf8'));
    for (const k of ['client_id', 'client_secret', 'refresh_token']) {
      if (!c[k]) die(`${CREDS_PATH} has no ${k}`);
    }
    return c;
  } catch (e) {
    die(`could not read the Business Profile credentials at ${CREDS_PATH}\n  ${e.message}`);
  }
}

/** Swap the long-lived refresh token for a one-hour access token. */
async function getToken() {
  const c = loadCreds();
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.client_id,
      client_secret: c.client_secret,
      refresh_token: c.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    if (body.error === 'invalid_grant') {
      die(
        `the refresh token was rejected (invalid_grant).\n` +
          `  It has been revoked or has expired. Get a new one from\n` +
          `  https://developers.google.com/oauthplayground (scope business.manage,\n` +
          `  your own OAuth credentials) and replace refresh_token in ${CREDS_PATH}.`,
      );
    }
    die(`token exchange failed (${res.status})\n  ${body.error}: ${body.error_description}`);
  }
  return body.access_token;
}

/** Google's Business Profile APIs throw the odd 503, so 5xx and network errors get three tries. */
async function api(url, { method = 'GET', body } = {}) {
  const token = (api._token ??= await getToken());
  let res;
  for (let attempt = 1; ; attempt++) {
    try {
      res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (res.status < 500 || attempt === 3) break;
    } catch (e) {
      if (attempt === 3) die(`network error calling ${url}\n  ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || JSON.stringify(json);
    if (res.status === 403) {
      die(
        `403 from Business Profile.\n  ${msg}\n\n` +
          `  Usually one of:\n` +
          `  - build76ltd@gmail.com is not a manager on this profile (the client adds it in\n` +
          `    Business Profile > Menu > Business Profile settings > Managers)\n` +
          `  - the API behind this command is not enabled in project build-76-seo:\n` +
          `    https://console.cloud.google.com/apis/dashboard?project=build-76-seo`,
      );
    }
    if (res.status === 429) die(`429: quota exceeded (300 requests a minute). Wait a minute and retry.\n  ${msg}`);
    die(`${res.status} from Business Profile\n  ${msg}`);
  }
  return json;
}

/** Follow nextPageToken until the list is complete or `max` items are in. */
async function pages(url, key, max = Infinity) {
  const out = [];
  let token = '';
  do {
    const sep = url.includes('?') ? '&' : '?';
    const json = await api(`${url}${token ? `${sep}pageToken=${encodeURIComponent(token)}` : ''}`);
    out.push(...(json[key] ?? []));
    token = json.nextPageToken;
  } while (token && out.length < max);
  return out.slice(0, max);
}

/* -------------------------------------------------------------- utils --- */

function die(msg) {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
}

/** A Date, n days before today. */
const ago = (n) => new Date(Date.now() - n * 864e5);
const ymd = (d) => d.toISOString().slice(0, 10);
const fmt = (n) => Number(n).toLocaleString('en-GB');

const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

/** Read text from a file, stdin (-) or the argument itself. */
function readText(arg) {
  if (!arg) die('no text given');
  if (arg === '-') return readFileSync(0, 'utf8').trim();
  try {
    return readFileSync(arg, 'utf8').trim();
  } catch {
    return arg.trim();
  }
}

function readJson(path) {
  if (!path) die('no JSON file given');
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    die(`could not read ${path}\n  ${e.message}`);
  }
}

/** Stop before a write unless --confirm was given. */
function confirmOrStop(what) {
  if (CONFIRM) return;
  console.log(`\n  PREVIEW ONLY. Nothing was sent.`);
  console.log(`  Once ${what} is approved, run the same command again with --confirm.\n`);
  process.exit(0);
}

/* ---------------------------------------------------- location lookup --- */

async function accounts() {
  return pages(`${ACCOUNTS_API}/accounts?pageSize=20`, 'accounts');
}

async function locationsOf(account, readMask = 'name,title,websiteUri,storefrontAddress') {
  return pages(`${INFO_API}/${account}/locations?readMask=${readMask}&pageSize=100`, 'locations');
}

/** Hardcoded to this client. Async so the commands match the shared copy. */
async function location() {
  return LOCATION;
}

/** accounts/x/locations/y, which the v4 reviews and posts endpoints need. */
async function v4Location() {
  return `${ACCOUNT}/${LOCATION}`;
}

/* ----------------------------------------------------------- commands --- */

async function cmdLocations() {
  for (const a of await accounts()) {
    console.log(`\n  ${a.accountName}  (${a.name}, ${a.type})`);
    const locs = await locationsOf(a.name);
    if (!locs.length) console.log('    (no profiles)');
    for (const l of locs) {
      const town = l.storefrontAddress?.locality;
      const mine = l.name === LOCATION ? '   <- this repo' : '';
      console.log(`    ${l.name.padEnd(32)} ${l.title}${town ? `, ${town}` : ''}${mine}`);
      console.log(`    ${''.padEnd(32)} ${l.websiteUri ?? 'no website'}`);
    }
  }
  console.log();
}

async function cmdInfo() {
  const loc = await location();
  const mask =
    'name,title,phoneNumbers,websiteUri,categories,profile,regularHours,specialHours,' +
    'storefrontAddress,serviceArea,openInfo,metadata';
  const l = await api(`${INFO_API}/${loc}?readMask=${mask}`);
  const a = l.storefrontAddress;
  const row = (k, v) => console.log(`  ${k.padEnd(18)} ${v ?? '—'}`);

  console.log();
  row('Name', l.title);
  row('Location', l.name);
  row('Status', l.openInfo?.status);
  row('Primary category', l.categories?.primaryCategory?.displayName);
  row('Other categories', l.categories?.additionalCategories?.map((c) => c.displayName).join(', ') || '—');
  row('Phone', [l.phoneNumbers?.primaryPhone, ...(l.phoneNumbers?.additionalPhones ?? [])].filter(Boolean).join(', '));
  row('Website', l.websiteUri);
  row('Address', a ? [...(a.addressLines ?? []), a.locality, a.postalCode].filter(Boolean).join(', ') : '—');
  row(
    'Service area',
    l.serviceArea?.places?.placeInfos?.map((p) => p.placeName).join(', ') || l.serviceArea?.businessType,
  );
  if (l.regularHours?.periods?.length) {
    console.log('  Hours');
    for (const p of l.regularHours.periods) {
      const t = (x) => `${String(x?.hours ?? 0).padStart(2, '0')}:${String(x?.minutes ?? 0).padStart(2, '0')}`;
      console.log(`    ${p.openDay.slice(0, 3)} ${t(p.openTime)}–${t(p.closeTime)}`);
    }
  } else row('Hours', 'not set');
  row('Special hours', l.specialHours?.specialHourPeriods?.length ? `${l.specialHours.specialHourPeriods.length} set` : 'none');
  row('Pending edits', l.metadata?.hasPendingEdits ? 'yes, Google is reviewing a change' : 'no');
  row('Maps', l.metadata?.mapsUri);
  row('Review link', l.metadata?.newReviewUri);
  if (l.profile?.description) {
    console.log(`\n  Description (${l.profile.description.length}/750)\n`);
    console.log(`  ${l.profile.description.replace(/\n/g, '\n  ')}`);
  }
  console.log();
}

async function fetchReviews(max) {
  const v4 = await v4Location();
  return pages(`${V4_API}/${v4}/reviews?pageSize=50&orderBy=updateTime%20desc`, 'reviews', max);
}

function printReview(r) {
  const stars = STARS[r.starRating] ?? '?';
  const when = r.createTime?.slice(0, 10);
  console.log(`\n  ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}  ${r.reviewer?.displayName ?? 'Anonymous'}  ${when}`);
  console.log(`  id ${r.reviewId}`);
  if (r.comment) console.log(`  “${r.comment.replace(/\s*\(Translated by Google\)[\s\S]*/, '').replace(/\n/g, '\n   ')}”`);
  else console.log('  (rating only, no text)');
  if (r.reviewReply) console.log(`  ↳ replied ${r.reviewReply.updateTime?.slice(0, 10)}: ${r.reviewReply.comment.replace(/\n/g, ' ')}`);
  else console.log('  ↳ NO REPLY');
}

async function cmdReviews(limit = 10) {
  const v4 = await v4Location();
  const first = await api(`${V4_API}/${v4}/reviews?pageSize=1`);
  console.log(
    `\n  ${fmt(first.totalReviewCount ?? 0)} reviews, average ${first.averageRating?.toFixed(2) ?? '—'}. Latest ${limit}:`,
  );
  for (const r of await fetchReviews(Number(limit))) printReview(r);
  console.log();
}

async function cmdUnreplied() {
  const open = (await fetchReviews(Infinity)).filter((r) => !r.reviewReply);
  console.log(`\n  ${open.length} review${open.length === 1 ? '' : 's'} with no reply.`);
  for (const r of open) printReview(r);
  console.log();
}

async function findReview(id) {
  if (!id) die('no review id given. `reviews` or `unreplied` shows them.');
  const v4 = await v4Location();
  return { v4, review: await api(`${V4_API}/${v4}/reviews/${id}`) };
}

async function cmdReply(id, textArg) {
  const comment = readText(textArg);
  if (comment.length > 4096) die(`reply is ${comment.length} characters; Google allows 4096.`);
  const { v4, review } = await findReview(id);

  printReview(review);
  console.log(`\n  ${review.reviewReply ? 'REPLACE the reply above with' : 'Reply'} (${comment.length} characters):\n`);
  console.log(`  ${comment.replace(/\n/g, '\n  ')}`);
  if ((STARS[review.starRating] ?? 5) < 4) {
    console.log(`\n  This review is under 4 stars: talk to the client before anyone replies.`);
  }
  confirmOrStop('this reply');

  await api(`${V4_API}/${v4}/reviews/${id}/reply`, { method: 'PUT', body: { comment } });
  console.log(`\n  Reply published.\n`);
}

async function cmdUnreply(id) {
  const { v4, review } = await findReview(id);
  if (!review.reviewReply) die('that review has no reply to remove.');
  printReview(review);
  console.log(`\n  This removes the reply shown above.`);
  confirmOrStop('removing this reply');

  await api(`${V4_API}/${v4}/reviews/${id}/reply`, { method: 'DELETE' });
  console.log(`\n  Reply removed.\n`);
}

async function cmdPosts(limit = 10) {
  const v4 = await v4Location();
  const posts = await pages(`${V4_API}/${v4}/localPosts?pageSize=100`, 'localPosts', Number(limit));
  console.log(`\n  Latest ${posts.length} post${posts.length === 1 ? '' : 's'}:`);
  for (const p of posts) {
    console.log(`\n  ${p.createTime?.slice(0, 10)}  ${p.topicType}  ${p.state}  id ${p.name.split('/').pop()}`);
    console.log(`  ${(p.summary ?? '').replace(/\n/g, '\n  ')}`);
    if (p.callToAction) console.log(`  [${p.callToAction.actionType}] ${p.callToAction.url ?? ''}`);
    if (p.media?.length) console.log(`  ${p.media.length} photo${p.media.length === 1 ? '' : 's'}`);
    if (p.searchUrl) console.log(`  ${p.searchUrl}`);
  }
  console.log();
}

/**
 * post.json is either a full v4 LocalPost (it has topicType) or the short form:
 *   { "summary": "...", "url": "https://...", "action": "LEARN_MORE", "photo": "https://..." }
 * `action` defaults to LEARN_MORE when there is a url. `photo` must be a public
 * image URL that Google can fetch; a list of URLs is fine too.
 */
function toLocalPost(src) {
  if (src.topicType) return src;
  const photos = [src.photo ?? []].flat();
  return {
    languageCode: 'en-GB',
    topicType: 'STANDARD',
    summary: src.summary,
    ...(src.url ? { callToAction: { actionType: src.action ?? 'LEARN_MORE', url: src.url } } : {}),
    ...(photos.length ? { media: photos.map((sourceUrl) => ({ mediaFormat: 'PHOTO', sourceUrl })) } : {}),
  };
}

async function cmdPost(file) {
  const post = toLocalPost(readJson(file));
  if (!post.summary) die('the post has no summary.');
  if (post.summary.length > 1500) die(`summary is ${post.summary.length} characters; Google allows 1500.`);
  const v4 = await v4Location();

  console.log(`\n  New ${post.topicType} post for ${v4.split('/').slice(2).join('/')}:\n`);
  console.log(`  ${post.summary.replace(/\n/g, '\n  ')}\n`);
  console.log(`  ${post.summary.length}/1500 characters`);
  const cta = post.callToAction;
  if (cta) console.log(`  Button: ${cta.actionType} → ${cta.url ?? '(phone)'}`);
  for (const m of post.media ?? []) console.log(`  Photo: ${m.sourceUrl}`);
  if (cta?.url && !cta.url.includes('utm_source=')) {
    console.log(`\n  The link has no UTM tags. Use utm_source=google&utm_medium=organic&utm_campaign=gbp-post&utm_content=<date>-<topic>.`);
  }
  if (!post.media?.length) console.log(`\n  No photo. Posts with the client's own job photos do better.`);
  confirmOrStop('this post');

  const made = await api(`${V4_API}/${v4}/localPosts`, { method: 'POST', body: post });
  console.log(`\n  Posted (${made.state}). id ${made.name.split('/').pop()}`);
  if (made.searchUrl) console.log(`  ${made.searchUrl}`);
  console.log();
}

async function cmdDeletePost(id) {
  if (!id) die('no post id given. `posts` shows them.');
  const v4 = await v4Location();
  const p = await api(`${V4_API}/${v4}/localPosts/${id}`);
  console.log(`\n  ${p.createTime?.slice(0, 10)}  ${p.topicType}\n  ${(p.summary ?? '').replace(/\n/g, '\n  ')}`);
  console.log(`\n  This deletes the post above.`);
  confirmOrStop('deleting this post');

  await api(`${V4_API}/${v4}/localPosts/${id}`, { method: 'DELETE' });
  console.log(`\n  Post deleted.\n`);
}

/** Fields where a change can send the profile back for re-verification or a suspension review. */
const RISKY = ['title', 'storefrontAddress', 'categories', 'serviceArea'];

async function cmdUpdate(mask, file) {
  if (!mask) die('no update mask given, e.g. websiteUri, profile.description, regularHours, phoneNumbers');
  const patch = readJson(file);
  const loc = await location();
  const top = [...new Set(mask.split(',').map((f) => f.split('.')[0]))];
  const current = await api(`${INFO_API}/${loc}?readMask=title,${top.join(',')}`);

  console.log(`\n  ${current.title}  (${loc})`);
  for (const f of top) {
    console.log(`\n  ${f}\n    now: ${JSON.stringify(current[f] ?? null)}\n    new: ${JSON.stringify(patch[f] ?? null)}`);
  }
  const risky = top.filter((f) => RISKY.includes(f));
  if (risky.length) {
    console.log(`\n  Changing ${risky.join(', ')} can make Google re-verify or review the profile. Check with the client first.`);
  }
  confirmOrStop('this change');

  const updated = await api(`${INFO_API}/${loc}?updateMask=${encodeURIComponent(mask)}`, { method: 'PATCH', body: patch });
  const after = await api(`${INFO_API}/${loc}?readMask=metadata`);
  console.log(`\n  Updated ${top.join(', ')} on ${updated.title ?? current.title}.`);
  if (after.metadata?.hasPendingEdits) console.log(`  Google is reviewing the change before it shows publicly.`);
  console.log();
}

const METRICS = {
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH: 'Views, mobile Search',
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: 'Views, desktop Search',
  BUSINESS_IMPRESSIONS_MOBILE_MAPS: 'Views, mobile Maps',
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS: 'Views, desktop Maps',
  CALL_CLICKS: 'Calls',
  WEBSITE_CLICKS: 'Website clicks',
  BUSINESS_DIRECTION_REQUESTS: 'Direction requests',
  BUSINESS_CONVERSATIONS: 'Messages',
};

async function metricTotals(loc, start, end) {
  const q = new URLSearchParams();
  for (const m of Object.keys(METRICS)) q.append('dailyMetrics', m);
  for (const [k, d] of [['startDate', start], ['endDate', end]]) {
    q.set(`dailyRange.${k}.year`, d.getUTCFullYear());
    q.set(`dailyRange.${k}.month`, d.getUTCMonth() + 1);
    q.set(`dailyRange.${k}.day`, d.getUTCDate());
  }
  const json = await api(`${PERF_API}/${loc}:fetchMultiDailyMetricsTimeSeries?${q}`);
  const totals = Object.fromEntries(Object.keys(METRICS).map((m) => [m, 0]));
  for (const group of json.multiDailyMetricTimeSeries ?? []) {
    for (const s of group.dailyMetricTimeSeries ?? []) {
      // Days with nothing come back with no value at all, not 0.
      for (const v of s.timeSeries?.datedValues ?? []) totals[s.dailyMetric] += Number(v.value ?? 0);
    }
  }
  return totals;
}

async function cmdPerformance(days = 28) {
  days = Number(days);
  const loc = await location();
  // The figures lag by a few days, so the period ends three days ago.
  const end = ago(3);
  const start = ago(3 + days - 1);
  const prevEnd = ago(3 + days);
  const prevStart = ago(3 + 2 * days - 1);
  const [now, before] = await Promise.all([metricTotals(loc, start, end), metricTotals(loc, prevStart, prevEnd)]);

  const views = (t) => Object.keys(t).filter((k) => k.startsWith('BUSINESS_IMPRESSIONS')).reduce((s, k) => s + t[k], 0);
  const change = (a, b) => (b ? `${a >= b ? '+' : ''}${Math.round(((a - b) / b) * 100)}%` : '');

  console.log(`\n  ${ymd(start)} to ${ymd(end)} (${days} days), against the ${days} days before\n`);
  const line = (label, a, b) => console.log(`  ${label.padEnd(24)} ${fmt(a).padStart(8)} ${fmt(b).padStart(8)}  ${change(a, b)}`);
  line('Profile views, total', views(now), views(before));
  for (const [m, label] of Object.entries(METRICS)) line(label, now[m], before[m]);
  console.log();
}

async function cmdKeywords(months = 3) {
  months = Number(months);
  const loc = await location();
  // The current month is incomplete and the last one can lag, so end on last month.
  const end = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (months - 1), 1));
  const q = new URLSearchParams({
    'monthlyRange.startMonth.year': start.getUTCFullYear(),
    'monthlyRange.startMonth.month': start.getUTCMonth() + 1,
    'monthlyRange.endMonth.year': end.getUTCFullYear(),
    'monthlyRange.endMonth.month': end.getUTCMonth() + 1,
    pageSize: 100,
  });
  const rows = await pages(`${PERF_API}/${loc}/searchkeywords/impressions/monthly?${q}`, 'searchKeywordsCounts');

  const month = (d) => d.toISOString().slice(0, 7);
  console.log(`\n  Searches that showed the profile, ${month(start)} to ${month(end)}: ${rows.length} terms\n`);
  for (const r of rows) {
    // Google hides small counts and gives a "fewer than" threshold instead.
    const v = r.insightsValue?.value != null ? fmt(r.insightsValue.value) : `<${r.insightsValue?.threshold}`;
    console.log(`  ${String(v).padStart(7)}  ${r.searchKeyword}`);
  }
  console.log();
}

function help() {
  console.log(`
  Google Business Profile for ${NAME} (${LOCATION}) only.

  Read only
    locations                         every profile build76ltd@gmail.com manages
    info                              name, category, phone, website, hours, description
    reviews [limit]                   latest reviews and their replies (default 10)
    unreplied                         every review with no reply
    posts [limit]                     latest posts (default 10)
    performance [days]                views, calls, clicks, directions against the previous period (default 28)
    keywords [months]                 searches that showed the profile (default 3)

  Writes: preview first, send with --confirm once approved
    reply <review-id> <text|file|->   reply to a review, or replace the reply
    unreply <review-id>               remove a reply
    post <post.json>                  publish a post: {"summary","url","action","photo"}
    delete-post <post-id>             delete a post
    update <mask> <patch.json>        edit profile fields, e.g. update websiteUri patch.json
`);
}

/* --------------------------------------------------------------- main --- */

const [cmd, ...rest] = ARGS;
const COMMANDS = {
  locations: cmdLocations,
  info: cmdInfo,
  reviews: cmdReviews,
  unreplied: cmdUnreplied,
  reply: cmdReply,
  unreply: cmdUnreply,
  posts: cmdPosts,
  post: cmdPost,
  'delete-post': cmdDeletePost,
  update: cmdUpdate,
  performance: cmdPerformance,
  keywords: cmdKeywords,
  help,
};

if (!cmd || !COMMANDS[cmd]) {
  help();
  process.exit(cmd ? 1 : 0);
}
await COMMANDS[cmd](...rest);
