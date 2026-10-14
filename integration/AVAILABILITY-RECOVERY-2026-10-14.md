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

### Restore completed during investigation — 14.10.2026, approximately 14:36 IST

This supersedes the earlier running-job status. Fresh original Restore History changed to **Success** for `databases-u112235086_luhach-20261012052209`, backup 12.10.2026 / restoration 14.10.2026. MySQL Management independently showed the original database/user, assigned to luhachvansh.com, now **11 MB** instead of 1 MB. Fresh Enter phpMyAdmin succeeded. Its Structure view showed **18 tables**, including users, sessions, password_resets, personal_access_tokens and migrations. No private rows, passwords, tokens or session contents were opened/exported.

Displayed structure counts: about 2; district 21; failed_jobs 0; gallery 50; history 1; join_us 49; members 77; migrations 6; news 5; only_village 46; password_resets 0; personal_access_tokens 0; sessions 28; shaheed 5; team 23; users 6; village 56; village_gallery 467. InnoDB structure counts can be estimates, not exact COUNT(*) or complete integrity verification. The public archive baseline uses filtered/public projection counts; its gallery 49 is not directly equivalent to restored raw gallery 50. No records were changed to match.

Metadata-only evidence: `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/laravel-restored-table-metadata-20261014.json`. The older support tab retained a cached In progress row; Success comes from the fresh history/management tab, with independently recovered phpMyAdmin schema corroborating actual imported data.

At displayed 14:35, authorized follow-up requested human restore-worker evidence. The UI named **Dev** as reviewing. At displayed 14:38, a note updated the reviewer with Success/11 MB/18-table evidence and requested read-only Laravel connection verification (`php artisan migrate:status`, no migrations/seeds). Submitted note readback was verified. The provider said it was checking whether that command could be run; no successful Laravel command result has yet been received.

**Current result:** restore job completed; restored schema/data presence independently verified. Original Laravel connection and full backup integrity remain unverified. Public Node redirect, original APP_KEY, saved credentials, private files and archives remain unchanged; no repeat restore. Screenshot of submitted review request: `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/laravel-restore-completion-review-20261014.jpg` (cached background history is not current status). Attempted success screenshot captured a subsequent management-loading frame and is not valid Success proof.

Human specialist **Arie** joined at displayed 14:44, acknowledged the successful restore and offered to help verify the read-only Laravel state. A follow-up requesting the original application's boot/DB connection and migration-status check was sent and read back at displayed 14:47, preserving existing credentials, APP_KEY and Node redirect. No command result has arrived. Screenshot attempts also returned stale earlier chat frames; `hostinger-arie-restore-complete-review-20261014.jpg` is not valid proof of Arie's latest acknowledgement. The live DOM readbacks and saved table-metadata JSON are the usable evidence. Do not confuse acknowledgement with a successful Laravel test.

### Private Laravel check and Claude consultation — 14.10.2026

This supersedes the pending-command status. Arie said at displayed 14:50 that server-side command access was unavailable and later, at displayed 15:23, confirmed a private cron check was supported. A credential-free CLI verifier was uploaded into the new private sibling directory `.recovery-check-20261014`, outside original `public_html`. Existing app/config/APP_KEY, data, recovery copies and private Node files were unchanged. Two temporary guarded cron entries run this verifier, with sanitized JSON reports stored privately and mode 0600. No public diagnostic endpoint was created.

Authenticated PHP Configuration shows the original web runtime remains PHP **7.4**, unchanged. Generic `/usr/bin/php` cron ran PHP **8.2.34** and the old Laravel framework failed with a Return type fatal in Collection.php line 13. Explicit `/opt/alt/php74/usr/bin/php` ran PHP **7.4.33**, successfully booted original Laravel **8.43.0**, then failed PDO authentication with **1045**. It loaded the exact original database/user at 127.0.0.1:3306, with configuration cache false and parsed password equal to the literal saved value. A localhost/socket attempt using the same existing credential also failed 1045. This isolates login-stage authentication/account state; it does not establish that restoration reset a password. Exact source counts and public-route rendering remain blocked by failed authentication.

Nonsecret mirrored evidence: `.local-integration/laravel-cli-runtime-check-20261014.json` and `.local-integration/laravel-auth-check-php74.json`. Verifier source: `integration/verify-original-laravel.php`. The per-report guard requires a new result filename after any repair; do not rerun against a completed marker and mistake silence for success. Expiry: 15.10.2026 00:00 UTC / 05:30 IST.

At Ajay's explicit request, bridge.py forked the relevant Claude Luhach session for a read-only consultation. Reconciled result: `integration/LARAVEL-CONNECTION-RECONCILIATION-2026-10-14.md`; shared record under Virtual-IO/CROSSCHECK. Claude confirmed the available evidence and correctly distinguished login authentication failure from a database-grant error. Some live UI observations were not independently visible to Claude; these remain Codex's primary UI observations.

Claude's direct-password-login recommendation was tested once at the existing Hostinger phpMyAdmin host using the owner-authorized saved credential, decrypted only into local runtime memory. Direct login independently returned HY000/1045. No credential changed, no secret was printed/exported, and the password field was cleared before saving and independently viewing the evidence screenshot: `.local-integration/screenshots/laravel-direct-db-password-rejected-20261014.jpg`.

**Next:** owner reapply the existing saved strong password to the existing original MySQL user, using hPanel's Change password form; this private credential action requires owner entry/submission under browser-tool rules. Then rerun the private PHP 7.4 verifier with a new report marker. If 1045 remains, Hostinger must inspect user/host/plugin authentication state and restore the existing access. Keep Node redirect until original Laravel passes. No new DB or reseeding.

Both temporary verifier cron entries remain. Cleanup's irreversible-delete confirmation was cancelled; original three other account jobs are untouched. Completed reports are guarded against re-execution. Browser controls repeatedly timed out/reset while trying to open the original user form, so it is **not verified open**. No live Laravel publication/cut-back has occurred.

Evidence: `.local-integration/screenshots/hostinger-db-restore-job-escalation-20261014.jpg` and `.local-integration/screenshots/hostinger-ida-restore-review-20261014.jpg`. Report commit `ee03b90` previously recorded the accepted recovery and was pushed to origin and review; this section records the subsequent owner-save verification and provider review.

Screenshots (ignored local artifacts):

- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/hostinger-outage-report-20261014.jpg
- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/node-live-recovery-20261014.jpg

### Original Laravel PASSES — Claude fresh takeover, 14.10.2026 19:06 IST

This supersedes the 1045 status above. Claude (fresh session, VIO claim #811) took over at Ajay's request.

1. **Network cause of today's browser stalls.** On wired Ethernet with FortiClient running, the laptop could not open TCP 443 to any Hostinger origin (srv1110 File Browser and auth-db1110 phpMyAdmin at 82.25.121.103, luhachvansh.com at 91.108.106.185, test.luhachvansh.com at 88.222.243.2). hPanel (Cloudflare) still worked. On Wi-Fi without FortiClient every host connected. Do Hostinger work on Wi-Fi.
2. **First owner reapply did not take.** Ajay changed the password in hPanel at about 18:40 IST, but the copy helper had not actually run (`'Copy-LuhachDbPassword.cmd' is not recognized` — wrong working directory), so the hPanel value came from another source. The 18:45 IST verifier run still returned 1045, and Ajay's own direct phpMyAdmin login with the helper value also returned 1045.
3. **Single-source fresh password.** Claude generated a new 24-character alphanumeric password in local memory and wrote it straight into the DPAPI store (never printed; first attempt via stdin pipe stored a BOM+CRLF-polluted 27-char value and was immediately overwritten in-process; final stored length 24, alphanumeric). Previous store kept as `.local-integration/hostinger-private/luhach-mysql-password.dpapi.before-fresh-20261014.json`. A desktop launcher `Desktop\Copy-LuhachDbPassword.cmd` (no secret) now calls the helper by full path. Ajay pasted the same helper value into hPanel Change password for user `u112235086_luhach` and into `public_html/.env` `DB_PASSWORD` (saved 2026-10-14T13:29:44Z, file 904 → 913 bytes). APP_KEY and all other lines untouched (owner edit; Claude did not open .env).
4. **Verifier PASS** (existing PHP 7.4 cron, new marker after renaming prior reports): checkedAt 2026-10-14T13:36:04Z, PHP 7.4.33, Laravel 8.43.0, `ok: true`, laravelBoot/originalDatabase true, `migrate:status` exit 0, no host override needed. Exact counts: about 2, history 1, village 56, gallery 50, news 5, team 23, members 77, shaheed 5, village_gallery 467, only_village 46. Eight public routes rendered in-kernel, all 200: `/` 57,317 B; `/history` 1,769,926 B; `/present` 23,664 B; `/team` 27,833 B; `/memories` 43,972 B; `/shaheed` 25,563 B; `/achievers/all` 41,103 B; `/login` 2,601 B. Sanitized mirror: `.local-integration/laravel-auth-check-php74-PASS-20261014-1906IST.json`.
5. **Server report file names (do not misread):** `laravel-auth-check-php74-after-reapply-1845.json` is actually the FIRST failing run of 10:09Z/15:39 IST (owner renamed the wrong row); `laravel-auth-check-php74-1845.json` is the 13:15Z/18:45 IST failing run; `laravel-auth-check-php74.json` is the 13:36Z PASS.
6. **Root cause (as far as evidenced):** the MySQL user's stored password did not match `.env` DB_PASSWORD. Setting one fresh value in both places resolved 1045; no Hostinger account/host/plugin repair was needed.

**Still open:** (a) public routing still 301s luhachvansh.com → test.luhachvansh.com (Node); cut-back to Laravel awaits Ajay's decision, then remove both hPanel redirects, purge CDN, cache-busted check from a fresh client, keep test host live for cached 301s; (b) the two temporary guarded every-minute verifier cron entries (generic PHP and PHP 7.4) still need removing; nothing else was added; (c) in-kernel rendering is not a real browser render of the public URL — verify after cut-back.

### Public root returned to original Laravel — 14.10.2026 ~19:15 IST

On Ajay's explicit instruction ("yes switch it back now"), Claude deleted both hPanel redirects (rollback record: `http://luhachvansh.com/` → `https://test.luhachvansh.com` and `https://luhachvansh.com/` → `https://test.luhachvansh.com`, both 301; recreate in hPanel → Domains → Redirects to roll back). The redirect list is now empty.

Live verification at 13:45Z (cache-busted, fresh client): `https://luhachvansh.com/` 200, 58,797 B, title "लुहाच परिवार", `X-Powered-By: PHP/7.4.33`, Laravel `XSRF-TOKEN` and `laravel_session` cookies set, `x-hcdn-cache-status: DYNAMIC` (served live, not a CDN copy). `/history` 200 (1,771,406 B), `/team` 200, `/shaheed` 200; `www.` 200. `http://` 301 → `https://` (Force SSL, expected). Body size equals the 12.10 pre-cutover `production-before.html`. A fresh built-in browser rendered the original Hindi homepage (header, menu, slider, news ticker): `.local-integration/screenshots/laravel-live-root-restored-20261014-1915IST.jpg`. `test.luhachvansh.com` (Node) still 200 and stays up for clients holding the cached 301. No CDN purge was needed (responses DYNAMIC).

Both temporary verifier cron jobs were deleted by Ajay (Claude's delete clicks are blocked by the session classifier). Remaining account cron jobs: pizi.in schedule:run and two app.heltog.com jobs, unchanged. The private `.recovery-check-20261014` directory with sanitized reports remains outside `public_html` and is inert (no job runs it; script expires 15.10 00:00 UTC).

**Recovery complete.** Remaining optional items: delete `.recovery-check-20261014` once evidence is no longer wanted; browsers that cached the old 301 may keep landing on the test host until their cache clears.
