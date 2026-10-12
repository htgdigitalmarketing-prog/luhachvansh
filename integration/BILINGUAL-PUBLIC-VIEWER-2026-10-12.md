# Bilingual public viewer and Luhach Mitra — 12.10.2026

This update supersedes the Hindi-only language choice and verified-login requirement for the historical viewer described in the earlier review. Ajay explicitly requested both languages, public genealogy access and a humanoid chat companion.

- A site-wide Hindi/English switch persists the chosen language. Hindi is the first-visit default. Reader pages, member forms, viewer controls and assistant support the selected language.
- The public historical tree exposes 10,061 names and 10,060 explicit relationship edges without signing in. Name search supports Hindi and English transliterations. The initial tree focuses on a readable family branch. Anonymous family lookup and relationship tracing use the same filtered graph.
- New community profiles, explicitly private archive entries, known child profiles, contact details, source notes and verification records remain excluded. Privacy restrictions in a separate configured member database are also applied to the public snapshot. Member contribution, directory and messaging APIs retain their authentication checks.
- Luhach Mitra / लुहाच मित्र is a waving, blinking humanoid companion fixed at the bottom-right of every page. It opens a bilingual chat panel and follows the selected person in the viewer. Family answers use recorded public relationships; location/contact questions direct visitors to the consent-based member area. History questions return original sources and optionally a Gemini summary after the visitor chooses the AI consent option. Motion respects reduced-motion preferences.
- Original Hindi text is retained. English article translations and name/village transliterations are stored in the private adjacent `heritage-en.json` file, keyed by source-text hashes. They do not merge identities or change archive records. Interface translations are source code; the bulk content/name cache stays outside public Git.

## Validation

Production build passed. Existing 44 tests passed; the new public privacy/graph test passed after correcting its fixture, with targeted heritage/viewer/privacy checks rerun successfully. Anonymous HTTP tests confirmed all archive records, family lookup and rejection of foreign-origin chat requests. English Gemini history response returned three cited sources. Browser review confirmed that selecting Loonga Ram and asking his father returns Lal Singh from the recorded graph. Both language controls, original village articles and the assistant are available locally.

The development browser received incomplete hot-reload script chunks during iterative compilation. Local review now uses the completed production build at `http://localhost:3024/` and `/vanshavali`; this avoids those development scripts. The existing 3023 development process is retained. No production hosting or database changes occurred.

## Deployment preparation

Use the separate staging SQLite snapshot and keep `legacy-media/` and `heritage-en.json` beside it. Set `LUHACH_MEMBER_DB` to the private persistent SQLite path; `LUHACH_HERITAGE_DB` is optional if the public snapshot is separate. Regenerate English cache with `node --env-file=.env.local ../integration/translate-public-archive.mjs` from `community-platform`; it reads only the public projection and public graph, never form submissions, credentials or contact details. Do not commit environment files or bulk source/cache data.

The custom test-domain cutover remains blocked by Hostinger's destructive subdomain-removal warning. Code is prepared for local review; the live Laravel site is unchanged.

The English cache was uploaded to the existing Node app's private `luhach-staging-private/snapshot/` directory, beside its SQLite snapshot and outside `public_html`. File-manager confirmation showed `heritage-en.json`, 493.09 KiB. The deployed source remains the earlier v2 until local review is accepted. The temporary app's health endpoint still returns storageReady true; hPanel still reports “Your domain can't have active subdomains” for the intended test hostname.
