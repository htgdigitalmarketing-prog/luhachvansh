# Milestone 02 — member login, verification and privacy

10.10.2026. Local review only; public website unchanged.

## Delivered

- Invitation-based real username/password accounts. No persona switching in member routes.
- One-time owner setup, single-use invitations with seven-day expiry and revocation.
- Salted scrypt password hashes (N=131072, r=8, p=1); 15–128 character passwords; bounded concurrent hashing and persistent attempt limits.
- Opaque HttpOnly, SameSite=Strict session cookies, server-side revocation, 30-minute idle / 24-hour absolute expiry. Password changes and recovery revoke prior sessions and rotate one-time recovery codes.
- Separate manual family-profile verification for self, guardian and relative stewardship. Decision reasons and methods are recorded atomically. No automatic verification and no self-approval.
- Password-confirmed appointment of a second verified reviewer, allowing independent review of the owner's family claim.
- Server-side privacy filtering of names, family edges, search, source notes, proposals, claims and notifications.
- Private-by-default new profiles; separately consented adult contact sharing; guardian profiles private as children; relatives cannot publish another person's contacts.
- Verification revocation closes sessions and stewardship. Privacy holds cannot be bypassed by the member's settings; resolving a hold leaves visibility private.
- Existing family contribution workflow continues with actual accounts and real deadlines. Demo personas and synthetic family are isolated in a different database.

## Validation

29 automated tests passed. The automated suite covers domain workflow, access boundaries, authentication, single-use recovery, password rotation, invitation expiry/reuse, guardian restrictions, privacy withdrawal, proposal isolation, admin appointment and session invalidation. HTTP integration checks exercise unauthenticated routes, Origin checks, persona bypass attempts, session cookies, denied role escalation and logout.

Browser checks use a separate database containing only fictional records/accounts: administrator signs in with a real password, approves a fictional member's profile with a method and reason, member signs in and saves private contact settings, settings persist across reload. Desktop and 390px mobile layout inspected; mobile document width 375px with no horizontal overflow. Screenshots contain fictional test names only.

The actual local member database has the 10,061 preserved archive records and no pre-created real account. Ajay chooses his own owner credentials using the local setup file. Test credentials do not work against that database.

## Boundaries and next work

This implements local member login, not email ownership, phone OTP, Google OAuth, or multi-factor authentication. Administrators verify family connections from the source they record; this is not an independently verified civil identity claim. Age is declared and guardian claims are reviewed; no automated age proof is claimed.

Historical records default to visibility for verified members, with limited claim lookup for invitees. They are not all established as deceased; an administrator can restrict any entry. New records default private. Current contact details are optional and member-supplied; exact addresses are discouraged. Administrators can read records for moderation. SQLite files are not encrypted at rest by this app.

Before internet deployment: hosted transactional database, HTTPS/Secure cookies, production rate limiting/scheduler, MFA and owner recovery policy, encrypted backup/restore drill, privacy/retention review and security assessment. Complete Hindi translation, child-to-adult stewardship transfer, account closure/export and admin offboarding remain follow-ups. No AI key, external messages or deployments were used.

## References used

Implementation baseline: [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), and [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html). These inform implementation; passing local tests is not a security certification.

Private checkpoint ZIP SHA-256: `C0FAFA936C9645C84A7B2E26677B3EB53367C37E32F1BE1BA724E3F8148573EB`. Export integrity check passed; 10,061 archival people, zero accounts and zero owner setup secrets.
