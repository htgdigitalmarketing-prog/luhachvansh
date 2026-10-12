# Luhach Parivar — local review report

10.10.2026. Version 0.3.0. The local feature milestones are complete for review. Nothing has been deployed to luhachvansh.com or its public repository.

## Completed milestones

| Milestone | Result |
|---|---|
| 01 Family contributions | Preserved 10,061 archival people. One identity across birth/married families; mothers, daughters and spouses; sourced proposals, seven-day objection window, conflicts and audit history. |
| 02 Member access | Invitation/password accounts, independent manual profile verification, recovery codes, revocation, separate profile/contact consent, private children and new profiles. |
| 03 Community archive | 46 recovered village histories, original-source links and three visually checked heritage photographs. Verified members submit village information, biographies and photos with source/consent. Objections pause automatic acceptance; independent administrators decide disputes. |
| 04 Member connections | Opt-in city/state/country directory for verified consenting adults. No phone/email in search. Connection acceptance before messages, close/block/unblock and selected-message reporting. |
| 05 Research | Privacy-filtered relationship paths and local family questions. History retrieval cites passages; optional Gemini explanation tested with the updated server-side key. Unknown relationships are not invented. |
| 06 Website/mobile | Unified heritage homepage/navigation, responsive member/community pages, Hindi entry points and installable web-app manifest. Offline shell excludes private data/media. |
| 07 Operations | Own-data export, reviewed stewardship transfer including guardian-to-adult transition, password-confirmed account closure, administrator offboarding, encrypted portable backup and isolated restore verification. |
| 08 Review package | 40 tests, HTTP access/media checks, browser journeys, mobile layout check, production build, private GitHub checkpoint and Hindi-narrated member/admin video. |

## Review locally

- Actual archive: http://127.0.0.1:3020/
- Synthetic walkthrough: http://127.0.0.1:3021/ while its separate launcher runs.
- Family/account: `/members`; archive, directory, messages, assistant and community review: `/community`.
- Original persona-based family sandbox remains isolated at `/demo`.

The actual database has **zero real accounts**. The owner chooses credentials using ignored local `data/OWNER-SETUP.txt`. Demonstration accounts and relationships have not been inserted into the actual archive. The browser password prompt for `qa.owner` came from the synthetic test account; saving that password is unnecessary.

Synthetic users are `qa.owner`, `qa.member`, `qa.friend` and `qa.newcomer`. Their test-only password is in `scripts/seed-walkthrough.mjs`. The video uses tested working screens, edited into a guided tour with synthetic Hindi narration and English chapter captions. It is not a live public deployment.

## Video

`Luhach-Parivar-member-admin-walkthrough.mp4` is approximately 3 minutes 40 seconds. Accompanying VTT captions and chapter timings are in the private release.

The member signs in, sees one woman in her birth and married families, submits a missing daughter, adjusts privacy, reads a village history, uploads an archive photo, searches a city, accepts a connection and sends a demonstration message. Relationship tracing and a cited archive answer follow. The administrator independently verifies another member, accepts the daughter with a reason and reviews the photo. Mobile pages and member data controls finish the tour.

The sample daughter remains private after acceptance. The sample photograph explicitly leaves its exact village/date unverified.

## Verification evidence

- **40/40 tests passed**: authentication/recovery, invitation/reviewer rules, privacy/guardian filtering, objections/deadlines/conflicts, lineage integrity, consent withdrawal, messaging/report isolation, transfer, private source protection, administrator demotion race and account export/closure.
- Production build compiled and type-checked successfully.
- Dependency audits reported **zero vulnerabilities** at review time.
- HTTP checks passed: anonymous denial, cross-origin denial, persona bypass/role escalation denial, cookies/logout, rejected SVG, authenticated/no-store photos, EXIF stripping and export boundaries.
- Browser journeys covered member sign-in, family tabs, daughter proposal, photo source/consent/upload, opt-in city search, connection/message, cited research, independent member verification and family/content approvals.
- Mobile viewport 390px: document width 375px, no horizontal overflow. This is a browser layout check, not actual Android/iOS installation certification.
- Actual portable backup: 10,061 people, zero accounts/media, AES-256-GCM encrypted. Isolated integrity check passed, including a separate run of the portable restore command.

Backup: `luhach-protected-2026-10-10T12-10-00.791Z.json`.

SHA-256: `d5408b91b1e74752ddd0f4cd2f89401eb23e362efee9f15cc36311584ec04d08`.

The key remains separately in ignored `data/BACKUP-KEY.txt`, absent from GitHub/video/release. Preserve a separate secure copy; recovery requires that key.

## Product distinctions

- Login is real; family verification is a human decision with evidence, not civil-identity certification. Verification never auto-approves. Invitations are shared manually; email/phone OTP, Google login and email recovery are not enabled.
- Eligible ordinary family/content contributions can be accepted after seven days without objections. Verification, disputed/conflicting proposals, transfers and administrator permissions require review. Deadline processing runs while the local server runs; production needs an operational scheduler.
- Original archive gaps/inconsistencies remain. Missing women and relationships have not been guessed. New profiles start private; historical names default to verified-member visibility, with administrator privacy holds available. Living-person review is necessary before wider access.
- Migration includes 46 village-history texts and three selected original photographs. It does not claim every legacy book, gallery label or achiever biography has been curated/migrated. The earlier site/project remains preserved for further content curation.
- Messages require mutual eligibility/consent. Administrators see the selected message when a report is filed, not a general private-chat inbox. Messaging is not end-to-end encrypted and uses manual refresh; push notifications and live delivery are not claimed.
- Personal/family answers run locally against visible records. Optional AI receives only the question and selected historical passages. Questions should not contain secrets. AI explanations are not newly verified genealogy.
- Hindi headings/navigation and Hindi content/questions are supported. Complete translation of all forms/validation remains launch polish.
- Closure removes credentials, revokes access, closes connections and hides profiles. Accepted heritage, required audit history and already-shared messages are retained as explained before closure; it is not complete historical erasure.

## Remaining after local review

1. Owner review and selection of initial independent reviewers.
2. Persistent hosted database/media, HTTPS/Secure cookies, production Host/Origin configuration, rate limits, scheduler and monitored encrypted backup/restore drills.
3. Production recovery/MFA decisions, privacy/retention wording and security review before internet access.
4. Real Android/iOS checks, full Hindi translation if required, remaining legacy-content curation and a small invited pilot.
5. Publish only after the owner authorizes the reviewed version. Private GitHub continuity is not public deployment.
