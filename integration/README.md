# Test-site integration — 12.10.2026

Target: **https://test.luhachvansh.com/** only. Production remains unchanged.

## Source baseline

- Developer repository: `htgdigitalmarketing-prog/luhachvansh`, Laravel 8/PHP, main `47c1aefc51a93cbbb246be07182bed2b8ebdc349`.
- Existing test domain returned HTTP 200 and PHP/7.4.33 on 12.10.2026. Hosting control/Node support and deployment route are not yet established.
- Community baseline: private `ajay1694-max/luhach-community`, commit `44bc595b5fc8c51f8b712e015a5d2597e979e7ee`.
- Original canvas source: recovered `luhach-dynasty/vanshavali-visualiser/components/CanvasTreeVisualizer.tsx`. The static prebuilt visualiser embeds the full CSV and is deliberately not copied into public assets.

`community-platform/` is the isolated replacement application. Existing Laravel routes, views and assets are preserved. This branch adds no automatic deployment workflow and does not change the developer site's entry point.

## Integration changes

All community features are carried forward. `/vanshavali` restores the earlier canvas interaction with search, village filtering, zoom/pan and two-person relationship tracing. The server supplies only currently visible records. Mother and spouse connections are explicit; name-based parent guesses and bundled CSV data are removed. Jarvis beside the graph answers about the selected profile locally and can explain village-history sources through server-side Gemini with consent.

The API guard can enable **only the exact test hostname**, with HTTPS, same-origin mutations, an explicit test deployment flag and absolute database path. Test session cookies are Secure. The production hostname remains denied. This is prepared configuration, not evidence of a deployment.

## Local validation on 12.10.2026

The candidate passes 42 automated tests and a production build. Browser checks used an isolated fictional family, verified mother/spouse tracing and local family answers, and received a live Gemini answer in Hindi with village archive citations. The viewer was also checked at a 390-pixel mobile viewport. No real login accounts or private database are included in this branch.

The legacy export tool has not run against the hosting database; PHP is unavailable on the local machine. Its runtime validation and the real-data reconciliation remain pending host access. The Python reconciler passed a synthetic check for ambiguous matches, missing fathers and the 9999 sentinel.

## Developer access

At initial inspection the signed-in GitHub account `ajay1694-max` had READ permission and no pending invitation. Developer should grant Write access and identify the hosting/deployment account and test branch. Only `main` existed; no GitHub deployments were listed.

Update 12.10.2026: GitHub WRITE permission is now verified. The prepared code is pushed to `integration/test-community-20261012` in the developer repository. Hosting/deployment access and the private database/media export remain outstanding; this push is not a website deployment.

The repository has no export of business tables and no migrations defining them. The controller reads `members`, `village`, `village_gallery`, `news`, `gallery`, `history`, `about`, `team`, `shaheed`, `district`, `only_village`, `join_us`. Therefore code access alone is not the live dataset.

## Preserve and reconcile data

1. Back up the current test/production databases and media on their host before any change. Retain the developer Git baseline and existing runtime configuration privately.
2. Run `php integration/export-legacy.php /absolute/private/new-export-directory` on the Laravel host. It performs read-only table export, excludes credentials, copies media and writes hashes. It refuses an output inside the website root. It must never be exposed as an HTTP route. Transfer the output through private storage, never this public repository.
3. Reconcile stable legacy IDs, names, villages and explicit `father_id` against the preserved CSV. The controller uses **9999 as a missing-parent sentinel**; never create an ancestry link from that value automatically. Preserve duplicate names and conflicts for review.
4. Stage records privately before import. Do not convert old `members` or `join_us` entries into verified login accounts or assume consent for directory/contact sharing. Retain provenance and a crosswalk; do not overwrite modern community changes.
5. Preserve every existing public route in a migration map (history, evolution, villages/cities, achievers, shaheed, memories, about, kuldevi, team, privacy/terms and news details). Final route/content mapping depends on the actual export. Do not silently replace these with the homepage.

## Test runtime requirements

The new platform requires **Node.js 24+ and persistent SQLite/media storage**. PHP-only shared hosting cannot execute this application. Confirm Node/container/VPS support, or route only the test subdomain to a separate suitable Node host. Do not change production DNS.

From `community-platform`: `npm ci`, `npm test`, `npm run build`, then `npm start`. For the isolated HTTPS test host configure:

```text
LUHACH_DEPLOYMENT=test
LUHACH_MEMBER_DB=/absolute/persistent/private/members.sqlite
PORT=3020
GEMINI_API_KEY=<server secret supplied separately>
```

The reverse proxy must accept only `test.luhachvansh.com`, terminate valid HTTPS, overwrite `Host` and `X-Forwarded-Proto`, and forward to the loopback Node listener. Keep SQLite and `<database>.media` outside the web root. Do not use an ephemeral/serverless filesystem. Do not copy `.env.local`, owner/recovery codes, private exports or synthetic test accounts into Git.

Initialize the actual archive from the existing encrypted private checkpoint or reconciled export. Bootstrap owner credentials privately. Use a separate database for test users. Record the deployment commit, dataset hashes, isolated test checks and rollback target. Verify login, privacy, viewer, mother/spouse paths, uploads, moderation, directory/chat and Jarvis at the test URL before reporting it deployed.

Rollback: restore the test host's previous document root/proxy and its separate pre-deploy snapshot. Production remains untouched throughout this test deployment.
