# Search Console data for powervacguttercleaning.co.uk

Everything Power Vac needs to read Search Console lives in this folder. The script was copied from the `build76-client-tools` skill on 2026-11-13. It is this client's own copy: changes made here don't reach other clients. To pick up fixes made to the skill's copy, run `node ~/.claude/skills/build76-client-tools/scripts/add-tools.mjs --repo . --gsc --update`, which keeps the property pinned.

```
gsc.mjs         the script, pinned to https://www.powervacguttercleaning.co.uk/
tracked.json    the URLs worth watching, grouped
snapshot.json   the baseline a sweep diffs against (run `sweep --save` once)
```

## Running it

Run it with node directly (`pnpm -s gsc` has failed in some repos):

```
node tools/gsc/gsc.mjs sites            confirm the service account can still see the property
node tools/gsc/gsc.mjs sweep --save     take a new baseline
node tools/gsc/gsc.mjs sweep            what changed since the baseline
node tools/gsc/gsc.mjs inspect <url>    one URL in detail
node tools/gsc/gsc.mjs pages 90 50      top pages, 90 days
node tools/gsc/gsc.mjs help             every command
```

## The key

The service-account key is shared, because it is a credential and must stay out of every repo. It is read from `~/.config/build76/gsc.json`, or from `GSC_KEY=/path/to/key.json`. Access is granted in Search Console under Settings > Users and permissions (add the service account's email), not in Google Cloud IAM.

## The www trap

If `https://www.powervacguttercleaning.co.uk/` is a **URL-prefix** property, it covers that exact prefix and nothing else. Inspecting the non-www or `http://` form returns "you do not own this site", which reads like a permissions problem and is not one. Keep every URL in `tracked.json` in the property's exact form, with no trailing slash. A domain property is written `sc-domain:example.com`.

## Pitfalls

- Paginate: a `rowLimit` that's too small silently reads the tail as zero. Ask for a large limit (for example `queries 90 25000`) when looking for rare terms.
- Merge trailing-slash variants of the same URL, or page totals read low.
