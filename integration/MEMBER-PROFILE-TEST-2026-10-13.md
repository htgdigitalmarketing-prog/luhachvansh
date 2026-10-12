# Member profile test — 13.10.2026

Owner setup uses a one-time bootstrap code and a password chosen directly by the user. The existing administrator role provides community administration; archival identity claims still require a separate reviewer.

Four new bilingual account introduction fields are private to the signed-in account. They remain absent from genealogy/search and other accounts, including reviewers. Closing the account deletes them; audit logs never duplicate biography text.

The exact temporary Hostinger staging hostname now has the same HTTPS, same-origin and absolute private SQLite requirements as test.luhachvansh.com. The live domain remains refused. Laravel and production MySQL were untouched.

Ajay and Dr. Shagun introductions are prepared in an ignored private draft, without credentials, identity documents, home addresses or personal contacts. Real account creation and persisted UI testing await the user's password entry. No archival identity or marriage link is inferred from names.

Production build passed. Member/guard tests passed 20/20 after correcting a test-only audit column typo. Account closure clears introductions.
