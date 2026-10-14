# Availability recovery — 14.10.2026

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
- Source-only package: C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/community-node-v22-cutover.zip; 144 files, 9,438,910 bytes; SHA-256 0889bd5d1aca007c22acb83b753a77c721f843dbecd28a5abc6942a4f3dd8cca. package.json is at the ZIP root. Environment files, databases, build outputs and private runtime assets are excluded.
- Hostinger's working Upload button opened the file chooser and the package was selected. hPanel then reported Something went wrong, accepted no package and kept Save and redeploy disabled. No deployment began, no environment change was saved, and current v20 remains the release. The specific upload failure and unresolved preservation requirement were escalated to support.

Next: reconcile the human response, resolve the resource/network challenge, attach the root to the existing Node app only via a preservation-safe operation, check any absolute SQLite path change, and independently verify root/www, health, public content and private-member privacy. Do not expose environment files to diagnose or reset credentials automatically.

Screenshots (ignored local artifacts):

- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/hostinger-outage-report-20261014.jpg
- C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/node-live-recovery-20261014.jpg
