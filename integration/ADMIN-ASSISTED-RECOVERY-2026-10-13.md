# Accessible administrator-assisted recovery —13.10.2026

Members no longer receive a mandatory save-this-code dialog after registration, recovery or password changes. Recovery copies are automatically encrypted with AES-256-GCM in an isolated private vault. A dedicated32-byte key sits beside the private SQLite database, outside the uploaded app and public_html. An existing populated database is consistently snapshotted with VACUUM INTO before the vault migration.

The first bootstrap administrator is the owner recovery custodian. Ordinary members and subsequently appointed reviewers cannot export recovery codes. The owner can download a private recovery backup and import their own existing code only when it matches the current hash. Passwords remain salted hashes and are never revealed.

Forgotten-password assistance accepts a registered name or username and a short family/village context. It returns the same response for nonexistent/ambiguous names, throttles requests, and queues matched requests for the owner. The owner must record an identity check before issuing a replacement. That action invalidates existing sessions and the old code, without guessing or revealing the password. The owner cannot use this process to issue their own code.

Portable protected backups now include the encrypted vault and its key inside the encrypted bundle, and restore-checks reproduce the key beside the restored database. Active sessions and unused invitation/setup credentials remain excluded.

The live owner account and private Ajay/Shagun introductions are working; all four Hindi/English fields survived reload. Ajay supplied his recovery code and expressly asked for PC and Google Drive copies. It was saved in a private local secrets folder and a newly created restricted Drive folder. No credential values are included in this document or Git. The Drive file has shared=false and only an owner permission.

Validation: full suite passed66 tests and production build passed before the final name-based assistance/copy wording adjustments. Browser/hosted recovery-panel checks follow deployment. Existing codes whose plaintext was never retained cannot be reconstructed from hashes; they require a valid supplied copy or an identity-checked replacement.
