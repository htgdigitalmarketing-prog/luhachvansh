# Availability recovery — 14.10.2026

**Controlling finding:** authenticated Hostinger Activity Log records removal of the original database u112235086_luhach on 13.10.2026, immediately after removal of the old test subdomain. Laravel files remain; the original live MySQL database was not preserved. This predates the 14 October recovery redirects. An original 12 October database backup is available. Do not characterize the redirect as repair of Laravel or say the live database remains intact.

## Authorization and scope

Ajay requested restoration of luhachvansh.com, authorized contacting Hostinger support, and subsequently authorized serving the existing Node 24 site while Laravel is repaired. Preserve Laravel/public_html, production MySQL, private SQLite/media/key files and recovery copies. No reseeding, database replacement, password reset or destructive domain removal.

## Fresh evidence

- Initial Chrome and direct HTTPS requests timed out for production and test; Ajay reported the same problem on his father's connection.
- Authenticated hPanel: Cloud Startup active through 15.07.2029; origin 82.25.124.40, server1110, India; SSL active. Root ALIAS and www CNAME point to Hostinger CDN. Test A points to the origin; test AAAA is 2a02:4780:11:1210:0:6b0:924e:10.
- Hostinger's automated agent reported an account-wide resource-usage verification challenge, normal server performance/no null route, and that it cleared the current connection's firewall block. These are provider statements, not proof of universal restoration.
- Chrome then reached production Laravel, which failed with MySQL authentication error SQLSTATE HY000/1045 for its existing user at 127.0.0.1. No credentials or debug request/session details were collected into this report.
- Test /api/health was independently read in Chrome: storageReady true, contentReady true, member DB exists, accounts present, archivePeople 10061, village 56, about 2, history 1, news 5. Member media folder false remains a reported health limitation; no private media was read.
- Node dashboard: Running; Next.js, Node 24.x; current completed deployment community-node-v20.zip, 13.10.2026 17:06. Do not mistake the stale temporary-domain dashboard for the current app.

## Immediate recovery performed

Created hPanel redirects for HTTP and HTTPS luhachvansh.com/ to https://test.luhachvansh.com. hPanel uses 301 redirects; both rules were read back. Chrome followed the main HTTPS address and rendered the Hindi Node homepage. The address bar currently changes to the test hostname; this is a bridge, not a completed direct-root Node attachment.

Intermittent navigation failures/offline fallback were still observed after successful rendering. Node health remained available in Chrome. Universal reachability, the father's connection, deep-link path preservation and stable www access must not be claimed as verified.

Ajay subsequently confirmed that the main address redirects to test.luhachvansh.com and then renders. This confirms recovery for his reported connection; it does not independently verify every network.

## Support and remaining work

Human specialist Dev responded through the existing Hostinger Agent chat: test.luhachvansh.com is accessible from their end, with a screenshot; their check did not reproduce the Laravel error because it checked the separate Node hostname. The distinction was corrected in a follow-up: Laravel error preceded the recovery redirect. The preservation-safe direct-root Node attachment question was restated explicitly. A note was submitted and read back requesting secure Laravel diagnosis separately and non-destructive root attachment to the existing Node app, preserving all files, databases and email/DNS. No ticket ID was provided. Avoid Delete Website/Subdomain; app slots are 10/10.

Dev later described Change domain and possible redeployment, but did not establish how to free the hostname already held by PHP while preserving its data. Their first response confused the build root directory with the domain root; that distinction was corrected. No domain move was attempted on that incomplete guidance.

## Direct-domain release prepared, not deployed

- Member API guards now support an explicit LUHACH_PRIMARY_HOST=luhachvansh.com opt-in, permitting exactly the root and www hostnames in the existing hosted deployment mode. Existing deployments stay restricted until that setting is added. Absolute preserved storage, HTTPS, exact same-origin writes and secure cookies remain required; arbitrary lookalike/configured hosts remain refused.
- All 103 tests passed, including the added main-domain origin/storage/HTTPS tests. An isolated production build using .next-cutover-check passed without replacing the running local preview build. Generated tsconfig changes were removed.
- Repeated rendered source coverage against the baseline on localhost:3031: 69 pages; all 141 article records and their paragraph counts retained; all 221 image/PDF media references retained; 23 team and 5 martyr entries. Full result: .local-integration/redesign-render-coverage.json.
- Source-only package: C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/community-node-v22-cutover.zip; 144 files, 9,438,910 bytes; SHA-256 0889bd5d1aca007c22acb83b753a77c721f843dbecd28a5abc6942a4f3dd8cca. package.json is at the ZIP root. Environment files, databases, build outputs and private runtime assets are excluded.
- Hostinger's working Upload button opened the file chooser and the package was selected. hPanel then reported Something went wrong, accepted no package and kept Save and redeploy disabled. No deployment began, no environment change was saved, and current v20 remains the release. The specific upload failure and unresolved preservation requirement were escalated to support.

Implementation commit 78f5476 was pushed to origin and review. Human specialist Louise subsequently joined the chat, acknowledged both exact blockers and said she was checking them at 10:21 IST. Keep the existing hosted deployment flag unchanged; the main-host opt-in supplements its current strict storage/HTTPS configuration. Do not change LUHACH_DEPLOYMENT to an unimplemented production value. Retain the test hostname during transition: clients may have cached hPanel's 301 root-to-test bridge, so an immediate test-to-root redirect could cause a redirect loop.

## Original Laravel verification and revised priority

Ajay subsequently said the redirect is acceptable for now and the underlying problem must be repaired. Main-domain cutover is therefore deferred; keep the working bridge, original domain, email and backups unchanged while repairing Laravel and the failed Node upload.

Fresh read-only verification:

- Authenticated File Manager lists the original public_html Laravel directories app, bootstrap, config, database, frontend, public, resources, routes, storage, test, tests and vendor, plus artisan, index.php, composer files and retained public_html.zip/luhachnew.zip archives. Environment-file contents were not opened.
- The local legacy-test-rollback.zip still has 401,301,484 bytes and SHA-256 0f752096efacab5253ab11fc0add3a3e68092c7192c865266c98edea0aad1411, matching the recorded 12 October capture. Public media archives and the limited legacy-content.sql capture also remain present.
- The original SQL export header names u112235086_luhach, matching the username in the observed Laravel 1045 error. Exact-name search in the current hPanel MySQL database list returns No results found. This is evidence of a missing listing, not yet a server-confirmed deletion; do not claim the live database is intact or lost until Hostinger verifies it.
- Database backup inventory at 13.10.2026 10:52 does not list that database. Selecting 12.10.2026 10:52 reveals u112235086_luhach (Custom). This original backup was selected only: Restore and Download were not clicked. Presence does not yet establish backup completeness or successful restoration.
- Louise has received the exact database/user identifier, package validation, the updated no-cutover instruction, and screenshots of original files and the missing current database listing. She was also given the exact older backup and asked to check actual existence, grants, registration, backup integrity and activity history before a safe original-database repair. No empty DB creation, limited-export import, password reset or overwrite was performed.

Additional evidence screenshots:

- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/laravel-files-preserved-20261014.jpg
- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/laravel-database-not-listed-20261014.jpg
- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/laravel-original-db-backup-20261012.jpg

Hostinger's current restoration guide says the database must first exist in the current MySQL list; if absent, it must be recreated with the same name before restoration: https://www.hostinger.com/support/4283700-how-to-restore-backups-at-hostinger/. Credential entry/reset requires the owner's secure involvement if Hostinger cannot restore the existing authentication internally; never expose a password or use content-only exports to stand in for the complete original DB.

## Confirmed deletion and credential handoff

Authenticated Activity Log, Date/Action/Status columns (timestamps exactly as displayed; their timezone has not been independently confirmed):

- 2026-10-13 11:26:52 — Subdomain test was removed — Success.
- 2026-10-13 11:26:58 — Database u112235086_luhach was removed — Success.
- 2026-10-13 11:33:31 — Website darkseagreen-newt-136595.hostingersite.com domain was changed to test.luhachvansh.com — Success.
- 2026-10-14 09:57:56 and 09:59:07 — Redirect on luhachvansh.com was created — Success.

The log does not identify the responsible person in the inspected columns. Do not infer an actor. Evidence captured as metadata only in .local-integration/laravel-deletion-evidence-20261014.json. The earlier unverified reassurance that MySQL remained intact was explicitly corrected to Ajay.

The missing original DB must be recovered from the original server backup, with original user/authentication and preservation checks. Before recovery, Hostinger was asked to inspect backup integrity and whether a later complete pre-deletion backup exists. No Restore/Download or database creation was performed.

Prepared the MySQL creation form for database suffix luhach and username suffix luhach (full original identity u112235086_luhach); password left untouched and Create remains disabled. Asked Ajay to either perform the existing DB_PASSWORD entry/submission privately under the browser-tool credential handoff rule, or leave credential recovery with Hostinger. Do not inspect that form while the owner is entering credentials; wait for completion confirmation. A statement that he will do it is not confirmation it has been completed. After successful creation/registration, verify target identity, restore only the original chosen DB backup into that empty target, and verify original Laravel without changing the public redirect or Node private state. If Hostinger finds an existing/orphaned DB, stop recreation and repair registration/grants instead of overwriting it.

Prepared-form screenshot: C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/laravel-db-recreation-prepared-20261014.jpg. Hostinger specialist Louise received the confirmed removal sequence and exact older backup; original files/missing-list screenshots were verified as loaded attachments in the conversation.

Next: reconcile the human response, resolve the resource/network challenge, attach the root to the existing Node app only via a preservation-safe operation, check any absolute SQLite path change, and independently verify root/www, health, public content and private-member privacy. Do not expose environment files to diagnose or reset credentials automatically.

Screenshots (ignored local artifacts):

- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/hostinger-outage-report-20261014.jpg
- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/node-live-recovery-20261014.jpg
