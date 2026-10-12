# Milestone architecture and continuation notes

Updated 10.10.2026.

## Boundaries

Next.js/React interface → guarded server API → domain store → local SQLite.

The preview is a separate workbench using the recovered website's Next.js/React stack. This keeps the public site's static bundles, old chatbot and scripts away from the new member workflow while it is being reviewed. No production domain or deployment configuration is attached to this repository.

`lib/store.mjs` owns all mutations and invariants. `app/api/community/route.ts` reads opaque HttpOnly session cookies, enforces local/same-origin request guards and invokes domain operations. Client state never grants a role or decides acceptance. Tests exercise the same store used by the interface.

## Data

- `people`: immutable identity key, optional legacy ID, names/aliases, gender (unknown permitted), place, imported source/page, notes, record origin, revision, active flag and creating proposal.
- `relationships`: directed parent edge or spouse edge, optional parent role, source, proposal and active flag. Spouse edges are read symmetrically.
- `claims`: account-to-person stewardship request, review reason and decision. This is not proof of ancestry merely because an account exists.
- `proposals`: target person/version, proposed relative payload, author, dates, decision and applied person ID.
- `objections`: author and reason, retained after resolution.
- `notifications`: durable in-app review/decision notices.
- `audit`: append-only application log of import, claim and proposal events.
- `imports`: content hash, filename and row count. No overwrite-on-start seeding.
- `sessions`: only hashes of opaque session tokens, with expiry; demonstration accounts are explicit fixtures.

Historical and sample family records may not be linked. New people linked to sample people remain sample records. Real additions are tagged community. Source files are never modified by an app decision.

## Workflow

Claim: pending → approved / rejected. Reviewer cannot approve their own claim or take a profile away from an approved steward through a second claim.

Proposal: pending → auto_accepted after seven days, or accepted/rejected by admin. Objection → disputed; expired stale anchor version → conflict. A human revalidates against the current graph before accepting either. Author may withdraw. Accepted changes may be reverted without removing their audit history.

Acceptance validates the graph first, then writes the person, links, target versions, decision, audit and notice in one transaction. Duplicate links, duplicate names in the same village, self-links, ancestry cycles and replacement of a recorded parent role are refused. Duplicate-name detection is deliberately conservative for now; a human same-name identity-resolution flow is a later addition.

Revert deactivates only rows from that proposal. A newly created person with other active relationships or profile stewardship cannot be silently removed. Dependent proposed changes become explicit conflicts when processed.

The source of a statement and its acceptance status are distinct. No-objection acceptance never upgrades a fact to source-verified.

## Local preview versus production

Local SQLite was chosen to deliver a persistent, reviewable milestone without purchasing or configuring a cloud account. Keep the domain transactions and migrate storage/queries to PostgreSQL before multiuser hosting. Add migrations, database authorization and deployed worker scheduling as part of that move.

The role switch is intentionally a demonstration mechanism, never a production login route. Both the environment flag and loopback Host must pass; writes also require a same-origin Origin header. These guards reduce accidental exposure, but are not a substitute for real authentication, network controls or production security review.

Use a server-side identity provider, verified invitations/profile claims, staff permissions and field-level privacy before onboarding members. The app currently delivers notifications to local inboxes; production needs notification preferences, retry/escalation and delivery-failure states.

## Online continuity

Private GitHub stores code, synthetic examples, tests and these notes. It does not synchronize the local database or historical input. Anyone with repository access can clone and run the sample milestone elsewhere. Restore a separately protected database backup or privately supply the CSV to reproduce private records. No public preview, auto-deploy integration or production publishing is authorized by the code backup.

## Milestone 02 supersedes the original authentication boundary

The root page and `/api/members` now use `lib/members.mjs`, a separate member database and real password sessions. `/demo` and `/api/community` retain only synthetic family records. The original recovery database remains preserved, but is not served. See README and MILESTONE-02 for setup, privacy enforcement, limitations and continuation.
