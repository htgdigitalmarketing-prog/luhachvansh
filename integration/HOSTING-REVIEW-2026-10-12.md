# Hostinger migration review — 12.10.2026

Collaborator access is verified. No server files, database records, DNS or application configuration were changed during this inspection.

## Verified hosting

- Cloud Startup Hosting; plan details explicitly list Next.js and Node.js 24.x support.
- Production is in `public_html`; the existing Laravel test copy is in `public_html/test`.
- **Both copies currently use the same MySQL database.** Never run test mutations, migrations or imports against this shared database.
- SSH is active, but an authenticated SSH deployment connection has not been established.
- The Web Apps listing returned Unauthorized in the collaborator context. The domain dashboard and file/database administration remain accessible. Node application setup and durable SQLite storage across deployments still need validation before deployment.

## Private source capture

The SQL export and both image-folder ZIPs are stored only in ignored `.local-integration/hostinger-private/`. SHA-256 hashes are recorded in its private manifest. Do not add these files or the downloaded environment configuration to GitHub.

The export contains 12 content tables and excludes users, sessions, tokens and password-reset tables. SQL was parsed as literals without executing it. Counts: about 2; district 21; gallery 50; history 1; join_us 49; members 77; news 5; only_village 46; shaheed 5; team 23; village 56; village_gallery 467.

The two media archives passed ZIP integrity checks (110 and 491 entries, including directories). Their combined size is 179,806,096 bytes. Five PHP files occur in the first image directory: retain the originals privately, never execute or publish them as media. Import only validated image/PDF formats; other upload/storage locations still require a completeness check against database paths.

## Reconciliation findings

The 77 legacy member profiles have 76 missing-parent sentinel values (`9999`) and one missing father ID. There are no usable explicit father links in this table. They must not replace the separate genealogy archive.

The initial exact-name assessment against the existing archive found 75 unmatched profiles, one ambiguous match and one candidate requiring review. These are matching candidates, not proof of distinct identity: language/transliteration and village normalization need review. No profiles, relationships or accounts were merged or created.

## Remaining work

1. Confirm the Node application deployment route and durable private storage, using this plan's supported controls or an authorized SSH connection.
2. Reconcile the content, lineage documents and media paths; retain source IDs and provenance. Do not assume directory/contact consent for legacy profiles.
3. Prepare a separate staging database and media directory; preserve the current test site for rollback.
4. Deploy and verify only `test.luhachvansh.com`. Production remains unchanged.
