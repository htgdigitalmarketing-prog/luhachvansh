# Availability recovery — 14.10.2026

**Controlling finding:** authenticated Hostinger Activity Log records removal of the original database u112235086_luhach on 13.10.2026, immediately after removal of the old test subdomain. Laravel files remain; the original live MySQL database was not preserved. This predates the 14 October recovery redirects. An original 12 October database backup is available. Do not characterize the redirect as repair of Laravel or say the live database remains intact.

## Authorization and scope

Ajay requested restoration of luhachvansh.com, authorized contacting Hostinger support, and subsequently authorized serving the existing Node 24 site while Laravel is repaired. Preserve Laravel/public_html, production MySQL, private SQLite/media/key files and recovery copies. No reseeding, unrelated database replacement, unilateral password reset or destructive domain removal. The later owner-authorized recreation and full-backup restoration of the already deleted original database, with private owner entry of a replacement password, are recorded below.

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

Next: follow the original-database recovery and provider response while keeping the working Node redirect. Direct-root attachment remains deferred under the owner's revised priority. Do not expose environment files, reset credentials automatically or change absolute private-storage paths.

## Original database recovery started — 14.10.2026

This section supersedes earlier pending-creation/selection-only status; the original removal finding remains unchanged.

- Louise confirmed at displayed 11:29 that the original DB was removed on 13 October and the 12 October 10:52 backup contains it. The restoration reply was sent and read back at displayed 11:32: recover the full original DB, check for any newer recoverable pre-deletion copy first, preserve Laravel and Node, and keep the public root-to-test redirect unchanged. The inspected log does not identify an actor.
- hPanel rejected the original retained password under its leaked-password check. The owner then privately entered a new unique database password and submitted creation. Fresh exact-name hPanel search verified both database and user `u112235086_luhach`, created 14.10.2026, assigned to `luhachvansh.com`, showing 1 MB. No password value was printed or transmitted in support/chat.
- The owner requested Chrome Password Manager and a laptop copy. Browser security policy blocked opening Chrome's internal password-manager page; no workaround was attempted. Ignored local Windows DPAPI save/copy helpers were prepared and their syntax/encryption availability checked. The completed Hostinger password field was empty, so no automatic credential save occurred. On the owner's subsequent completion reply, the expected encrypted local vault file was still absent. Chrome saving is owner-reported, not independently verified; local encrypted saving remains unverified.
- Louise's displayed 12:02 instructions specified creating the original DB/user with a strong password, restoring the 12 October 10:52 DB backup, updating only `DB_PASSWORD` in the Laravel `.env`, and preserving `APP_KEY`. She closed the chat at displayed 12:24 with a handoff summary. These are hPanel-displayed times, not independently converted timestamps.
- The backup tab temporarily displayed a different account's invalid website/no-backups state. Existing Active collaborator access to the hosting account was resumed through Account Sharing > Manage services, after which the original daily backup inventory returned. No new access was granted and no backup was deleted.
- Before restoration, phpMyAdmin independently showed **No tables found in database** for the newly recreated `u112235086_luhach`. This established that the replacement target contained no new tables/records to overwrite. Evidence: `.local-integration/screenshots/laravel-recreated-db-empty-20261014.jpg`.
- Selected Database backup, `2026-10-12 10:52`, `u112235086_luhach (Custom)`. The confirmation named that exact original DB. Started restoration into the verified empty target; hPanel's progress display reached 99%. A refreshed Restore History independently lists `databases-u112235086_luhach-20261012052209`, backup date 12.10.2026, restoration date 14.10.2026, status **In progress**. This is an accepted server recovery job, not verified success. No files restore, limited SQL import, reseeding, domain move, Node/private-storage change or public-redirect change occurred.
- The original `public_html/.env` editor was opened for the owner's private `DB_PASSWORD` update, without returning its contents or secrets to the model. The first editor's session expired and fresh saved-file readback still contained the old password. The owner repeated the update in the active editor. File metadata then showed 904 bytes / modified a few seconds ago, and a fresh same-session reopening independently verified a changed nonempty `DB_PASSWORD` and the exact original `APP_KEY`. No secret values were printed; no agent credential entry or `APP_KEY` change occurred.
- The requested laptop password copy is now saved in `.local-integration/hostinger-private/luhach-mysql-password.dpapi.json`, encrypted with Windows DPAPI for the current Windows account, with inherited permissions removed and access restricted to that account and SYSTEM. Local decryption/readback and permission protection were verified without outputting the password or encrypted blob. Ignored `Copy-LuhachDbPassword.cmd` retrieves it privately to the clipboard. Chrome Password Manager remains owner-reported; browser-policy restrictions on opening its internal page were respected.
- Independent file-list inspection of the default original Laravel `bootstrap/cache` found only `.gitignore`, `events.php`, `packages.php` and `services.php`; no `config.php` is present. No cache file was removed or changed, and no migration/seed command was run.
- During restoration, Chrome followed `https://luhachvansh.com/` to `https://test.luhachvansh.com/`. A provider browser-check page briefly appeared, then the Hindi Node homepage rendered. Public Node `/api/health` again reported storageReady/contentReady true, archivePeople 10061, village 56/about 2/history 1/news 5, accountsPresent/recoveryKey true; memberMediaFolder false persists. A separate unauthenticated command-line root request returned 403, so universal network/client reachability remains unverified. Screenshot: `.local-integration/screenshots/node-redirect-during-laravel-restore-20261014.jpg`.

Next: wait for restoration completion and verify Restore History/table metadata and source counts, then verify the original Laravel connection using the already saved configuration. The owner's password update and the absence of a default configuration cache are verified below; do not repeat them. Keep the working public redirect. Evidence: `.local-integration/screenshots/laravel-original-db-restore-progress-20261014.jpg`.

## Provider review of the continuing restore

The accepted job remained **In progress** after more than 30 minutes. A new support message, sent and read back at displayed 13:14, identified the exact original restore job and requested server-side worker/queue/log inspection. The automated Agent could not retrieve the restore record through its account-scoped lookup; its failure does not supersede the explicit hPanel history record.

Selected **Wait for a human review**. The UI named specialist **Ida** as reviewing the request. A concise technical note was submitted and read back at displayed 13:28. The resulting provider response was labelled **Response reviewed by Ida** and stated that the original 12 October backup restore was still running; it instructed leaving the job, DB/user/password, Laravel files and current Node redirect undisturbed. This is provider confirmation of an ongoing job, not completion or proof of restored contents. No second restore was started.

Following the reviewed guidance, a fresh hPanel **Enter phpMyAdmin** launch from the exact original DB row failed at `auth-db1110.hstgr.io` with **ERR_CONNECTION_TIMED_OUT**. The listing still showed 1 MB. This admin-host/network failure prevented table-list inspection; it does not establish database corruption or a completed import. The timeout and the requested eventual schema/count/Laravel connection checks were reported back to the same support conversation without credentials, opaque authentication URLs or private rows.

**Current result:** working public Node bridge verified; owner-selected new database password persisted in original Laravel configuration; original `APP_KEY` preserved; encrypted laptop credential copy verified. **Original database restoration, source/count reconciliation and Laravel connection verification remain pending the provider's running job.** Keep the redirect unchanged and do not claim Laravel is repaired.

### Fresh status check — 14.10.2026, 14:29 IST

The fresh authenticated Restore History still lists `databases-u112235086_luhach-20261012052209` as **In progress**. The Node public health endpoint again reports storageReady/contentReady true, accountsPresent true and archivePeople 10061. Hostinger's latest response, labelled **Response reviewed by Marijus** at displayed 13:48, confirms that the full restore is still running and gives no completion estimate. No second restore or configuration change was made. Current screenshot: `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/laravel-restore-status-check-20261014.jpg`. This health check verifies Node availability, not the original Laravel connection.

Evidence: `.local-integration/screenshots/hostinger-db-restore-job-escalation-20261014.jpg` and `.local-integration/screenshots/hostinger-ida-restore-review-20261014.jpg`. Report commit `ee03b90` previously recorded the accepted recovery and was pushed to origin and review; this section records the subsequent owner-save verification and provider review.

Screenshots (ignored local artifacts):

- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/hostinger-outage-report-20261014.jpg
- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/node-live-recovery-20261014.jpg
