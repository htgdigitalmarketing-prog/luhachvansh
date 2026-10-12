# Luhach Parivar — complete local review

10.10.2026 · version 0.3.0 · **Private development; public website unchanged.**

The local application combines family records, member accounts, independent profile verification, privacy controls, village histories, contributed photographs/biographies, an opt-in directory, consent-based messages and source-grounded research. Read [the current review report](docs/LOCAL-REVIEW-2026-10-10.md) for scope, evidence and deployment boundaries. Earlier milestone documents are historical snapshots.

## Run locally

Node.js 24+ is required. Open http://127.0.0.1:3020. The actual archive has 10,061 people and no pre-created real accounts. Choose **Family & account**, use the one-time code in ignored local `data/OWNER-SETUP.txt`, choose your own credentials and keep the recovery code privately.

```sh
npm ci
npm run build
npm start
```

For development use `npm run dev`. Both launchers bind to 127.0.0.1; Host/Origin guards deliberately prevent internet deployment.

## Continue from elsewhere

Clone this private repository. Code includes 46 recovered village histories and three selected original photographs. Family databases and accounts are not committed. The private `v0.3.0-local-review` release contains the walkthrough, review report and encrypted database/media backup. Obtain the encryption key separately from the owner; it is in ignored `data/BACKUP-KEY.txt`. **Never upload the key alongside the backup.**

```sh
node scripts/restore-protected.mjs <encrypted-backup.json> <key-file> <new-output-directory>
```

The command verifies integrity and prints the database path. Set `LUHACH_MEMBER_DB` to that path when starting. Keep the adjacent `.media` directory. Portable backups exclude sessions, invitations and owner setup codes. For an account-free restore, run `npm run setup:members` with the same database environment variable and use the newly generated setup file.

Alternatively import the privately held original CSV with `npm run import -- <absolute-csv-path>`, then `npm run setup:members`. Imports are idempotent and retain source references.

## Main journeys

- Invitation → account → independent profile verification → family views and sourced contributions.
- One person in birth and married families; daughters/mothers/spouses; existing-person lookup; seven-day objection window and reviewed conflicts.
- Village histories, photos/biographies, opt-in city/state/country discovery, accepted connections before messages, blocking and selected-message reports.
- Local relationship paths and family answers; optional Gemini history explanations with consent and source excerpts.
- Administrator verification, contribution decisions, privacy holds, safety reports, stewardship transfers and offboarding.
- Member data export, reviewed transfer and password-confirmed account closure with explicit retention notice.

## Data isolation

- `data/members.sqlite`: actual archive and future accounts.
- `data/community.sqlite`: preserved earlier import checkpoint.
- `data/demo.sqlite`: isolated fictional family sandbox at `/demo`.
- `data/walkthrough-v3.sqlite`: fictional video accounts/family, served separately on 3021.
- `data/media` or `<LUHACH_MEMBER_DB>.media`: authenticated uploads, not a public static folder.
- `walkthrough/`: ignored local recording/render files; finished deliverables are private release assets.

`node scripts/seed-walkthrough.mjs` creates the isolated walkthrough database and refuses to overwrite it. Set `LUHACH_MEMBER_DB` to that database and `PORT=3021` to run it. Synthetic credentials are in the seed script and never work against the actual member database. Never merge the synthetic sample into the archive.

## Checks and backup

```sh
npm test
npm run build
npm audit
npm run backup:protected
```

40 tests, the production build and HTTP/browser checks passed; dependency audit reported zero vulnerabilities. Protected backups use AES-256-GCM and verify an isolated restore. Plain SQLite snapshots from `npm run backup` must stay protected locally. No scheduled off-device backup service is claimed.

No AI key is needed for family queries/source retrieval. Optional history explanations use server-only `GEMINI_API_KEY` in ignored `.env.local`; see `.env.example`. Never commit keys.

Production activation remains a separate owner-reviewed milestone: persistent hosting, HTTPS/Secure cookies, production Host/Origin rules and rate limiting, recovery/MFA policy, monitored backups, privacy/content/security review and deployment approval. Full Hindi translation and real-device installation checks remain before a broad launch.
