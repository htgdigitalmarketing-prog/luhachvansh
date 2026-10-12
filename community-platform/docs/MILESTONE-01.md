# Milestone 01 — local preview, 10.10.2026

This checkpoint implements the first complete contribution journey: find a profile, request stewardship, administrator approval, propose a missing relative, allow a seven-day objection period, and display accepted connections in birth and married-family views.

Women have their own person records. A daughter and a daughter-in-law can be the same person, linked to both families without a duplicate record.

## Verification

- 14 automated tests passed: claims, roles, sessions, parent/spouse relationships, objections, deadline acceptance, conflicts, duplicates, cycles, reversals, notifications, import repeatability and local request guards.
- Next.js optimized build and TypeScript checking passed.
- Browser journey completed: contributor claim approved, fictional daughter Aditi proposed with existing spouse Rohan, review clock advanced eight days, automatic acceptance observed, mother and spouse visible through the same profile.
- Desktop (1440px) and phone (390px) responsive layouts inspected. At 390px the document width was 375px with no horizontal overflow.
- SQLite checkpoint integrity check: ok. 10,061 archival people, nine fictional sample people, zero saved sessions in the export.
- Source originals and the existing public website were not changed.

## Private online checkpoint

Code: https://github.com/ajay1694-max/luhach-community

Private release asset: luhach-milestone-01-private-checkpoint.zip. SHA-256:

`0C66BFFAC84F20D6E1C64756E6F4689038245E1026E2C68CE61EB3E9B3310D2E`

The ZIP includes a SQLite online backup, original master CSV, recovery brief, village inventory, audit and RESTORE.md. It is separate from Git source history. Local role switching is for demonstration only; real authentication, production privacy controls and hosted persistence must precede invited deployment. No AI provider or key is used in this milestone.

## Review next

Review the appearance and contribution flow locally. Then connect real sign-in and profile verification, consent/visibility controls, hosted persistence and an invited family pilot. Village/photo contributions, member discovery, messaging and grounded lineage AI follow in later milestones.
