# Hostinger migration review — 12.10.2026

Collaborator access is verified. The isolated Node staging application and its private SQLite snapshot are deployed. The custom test hostname is not yet switched. Production files, MySQL data and DNS have not been changed.

## Verified hosting

- Cloud Startup Hosting; plan details explicitly list Next.js and Node.js 24.x support.
- Production is in `public_html`; the existing Laravel test copy is in `public_html/test`.
- **Both copies currently use the same MySQL database.** Never run test mutations, migrations or imports against this shared database.
- SSH is active, but an authenticated SSH deployment connection has not been established.
- The initial Web Apps Unauthorized route was resolved through Websites > Create Website > Web App. File-upload deployment works; GitHub connection is unavailable in this collaborator UI. Next.js on Node 24 built successfully. Private SQLite storage outside public_html and hbuilds survived a full redeployment, confirmed by the application health endpoint.

## Private source capture

The SQL export and both image-folder ZIPs are stored only in ignored `.local-integration/hostinger-private/`. SHA-256 hashes are recorded in its private manifest. Do not add these files or the downloaded environment configuration to GitHub.

The export contains 12 content tables and excludes users, sessions, tokens and password-reset tables. SQL was parsed as literals without executing it. Counts: about 2; district 21; gallery 50; history 1; join_us 49; members 77; news 5; only_village 46; shaheed 5; team 23; village 56; village_gallery 467.

The two media archives passed ZIP integrity checks (110 and 491 entries, including directories). Their combined size is 179,806,096 bytes. Five PHP files occur in the first image directory: retain the originals privately, never execute or publish them as media. Import only validated image/PDF formats; other upload/storage locations still require a completeness check against database paths.

## Reconciliation findings

The 77 legacy member profiles have 76 missing-parent sentinel values (`9999`) and one missing father ID. There are no usable explicit father links in this table. They must not replace the separate genealogy archive.

The initial exact-name assessment against the existing archive found 75 unmatched profiles, one ambiguous match and one candidate requiring review. These are matching candidates, not proof of distinct identity: language/transliteration and village normalization need review. No profiles, relationships or accounts were merged or created.

## Staging deployment and cutover blocker

- The Node app is running on `darkseagreen-newt-136595.hostingersite.com`, with a separate private SQLite database: 10,061 archive people, 10,060 relationships, the 12 preserved legacy content tables, review candidates and validated media. No legacy contact consent or family links were inferred. Owner account activation remains pending.
- Media preparation accepted 583 image/PDF source paths, deduplicated into hashed files; nine unsupported or mismatched entries were excluded. Executable source uploads remain only in private rollback archives.
- Application `/api/health` returns storageReady true. Member APIs reject the temporary hostname intentionally. The hosted demo sandbox API is disabled. Tests: 42 passed; production build passed including health and admin-only legacy review routes.
- The legacy test directory was downloaded and its 10,256-entry ZIP passed integrity checking. The private rollback archive is 401,301,484 bytes, SHA-256 `0f752096efacab5253ab11fc0add3a3e68092c7192c865266c98edea0aad1411`.
- Hostinger refuses the custom hostname while the legacy subdomain mapping exists. Its Delete Subdomain dialog explicitly warns that associated databases, email accounts and DNS records will be permanently deleted. **Cancelled without deleting anything**, because the legacy test app shares production MySQL.

## Remaining work

1. Hostinger support/developer must detach only the old test hostname while preserving all databases, email accounts, files and the parent production site. Do not use the destructive deletion flow without resolving its scope.
2. Connect the existing Node app to exactly `test.luhachvansh.com`; recheck the absolute private database path after any domain-directory move, then HTTPS and authenticated/privacy routes.
3. Let the owner choose their login using the private one-time setup file; keep it out of Git and public hosting.
4. Review the 77 legacy profile candidates and media references, including transliteration and village matching. Preserving source rows is not a completed identity merge or publication of all legacy content.
