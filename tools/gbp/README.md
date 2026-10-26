# Google Business Profile for POWER-VAC

`gbp.mjs` reads and manages POWER-VAC Gutter Cleaning's Google Business Profile (`locations/8667640692038315892`, Norwich). It was copied out of the shared `~/.config/build76/gbp.mjs` on 26 Oct 2026 and the profile is hardcoded, so this repo can never act on another client's profile. `GBP_LOCATION` and `GBP_ACCOUNT` are ignored. The shared copy is the template for new clients, and fixes are not ported between copies automatically.

## Running it

```
pnpm gbp info                     name, category, phone, website, hours, description
pnpm gbp reviews [limit]          latest reviews and their replies
pnpm gbp unreplied                every review with no reply
pnpm gbp posts [limit]            latest posts
pnpm gbp performance [days]       views, calls, website clicks, directions against the previous period
pnpm gbp keywords [months]        searches that showed the profile
pnpm gbp locations                every profile Build 76 manages, with this one marked
pnpm gbp help                     every command
```

## Changing the live profile

`reply`, `unreply`, `post`, `delete-post`, `update`, `attributes` and `photo` print a preview and send nothing. Run the same command again with `--confirm` only once Gavin or the client has approved exactly what the preview shows.

```
pnpm gbp reply <review-id> reply.txt        preview a reply
pnpm gbp reply <review-id> reply.txt --confirm
pnpm gbp post post.json                     preview a post
pnpm gbp update websiteUri patch.json       preview a profile edit
pnpm gbp attributes attributes.json         preview links (Facebook, TikTok) and attributes
pnpm gbp photo job.jpg AT_WORK              preview adding a photo (LOGO, COVER, AT_WORK, ADDITIONAL...)
```

The patch files for each round of changes are kept in `.docs/gbp/<date>/`, so there's a record of exactly what was sent.

A post file is `{"summary": "...", "url": "...", "action": "LEARN_MORE", "photo": "https://..."}`. Tag the link with `utm_source=google&utm_medium=organic&utm_campaign=gbp-post&utm_content=<date>-<topic>`, and use the client's own job photos. Changing the name, address, categories or service area can make Google re-verify the profile, so check with the client first.

## Credentials

The OAuth client and refresh token are shared by every client, because one Google sign-in (build76ltd@gmail.com, a manager on each profile) covers them all. They live outside every repo at `~/.config/build76/gbp.json` (chmod 600), or `GBP_CREDS=/path/to/creds.json`. If calls fail with `invalid_grant`, the refresh token has been revoked: get a new one from the OAuth Playground with the `business.manage` scope and replace `refresh_token` in that file.
