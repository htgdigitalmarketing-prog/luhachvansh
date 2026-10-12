# Developer backup reconciliation — 12.10.2026

The developer supplied a full Laravel public_html ZIP (452,225,020 bytes) and MySQL SQL export (7,040,315 bytes). Originals remain in Downloads. They were inspected locally; SQL was parsed as literal data and never executed. Environment files, credentials, users and sessions were excluded from migration output. The original ZIP was not extracted or deployed.

SQL SHA-256: `42c08fd80968d13bf6278b9a4308255be7bad6167b7f3cb626eb5ea7035cb911`

ZIP SHA-256: `70e065ecfd6e4d2d41eb9cddeebe2dcc3943cdee647b96157378b92e757801c5`

All twelve content tables exactly match the separate staging snapshot by source ID and complete parsed row contents: about 2; district 21; gallery 50; history 1; join_us 49; members 77; news 5; only_village 46; shaheed 5; team 23; village 56; village_gallery 467. No added, missing or changed rows were found. This comparison does not treat private submissions as public records or create accounts from them.

All 583 valid JPEG/PNG/PDF entries under frontend/img and public/frontend/img match the staging media by original path and SHA-256. Nine other entries fail the supported media extension/signature check and remain excluded. No unsafe ZIP paths were found. This backup does not supply the previously missing referenced photos.

The preserved tracked Laravel baseline has 1,135 matching files after newline normalization. Only .gitignore and README.md differ; no tracked file is absent. Application source, routes and views match the baseline.

Private literal-only content JSONL and detailed reconciliation evidence are stored under `.local-integration/developer-backup-review/`, excluded from Git. Raw ZIP/SQL and secrets are not uploaded to either repository. No data import or redeployment is needed from this backup because the imported content and valid media already match. The independent historical genealogy remains preserved separately; legacy member IDs are not automatically merged with it.

The separate bilingual Node staging deployment remains the candidate. The unresolved test-hostname mapping needs safe Hostinger/developer detachment, preserving the live Laravel database, files, emails and parent domain. Receipt of backup files does not resolve that hosting blocker and no live site change was made.
