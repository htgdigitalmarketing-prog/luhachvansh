# English keyboards, independent villages and remembered devices — 13.10.2026

English input now ranks Hindi spelling candidates in the public explorer, member profile search, node claim matching and the consent-based member directory. Matching uses public names, existing aliases and village spellings; it never changes archive IDs or selects a person automatically. Same-name people remain separate options. Permission filtering precedes ranking.

The public explorer has independent village pickers for both people. The second search uses all permitted records in its own selected village, rather than the first person's village. Changing a village clears the corresponding selected person. Relationship tracing still follows recorded links only.

Ordinary text fields offer optional Hindi word/name choices from the public archive and a small common-word dictionary. This is local candidate matching, not a complete Hindi input method: unknown words remain accepted in English. Passwords, usernames, contact fields, URLs and codes are excluded. Typed text is not sent to a transliteration provider.

An optional seven-day remembered-device session is available during login or from account privacy settings. The token remains opaque, hashed server-side, HttpOnly, HTTPS-only on test, and SameSite Strict. The choice rotates only the current device session; logout, account revocation and password changes revoke sessions. Normal sessions retain their idle and absolute limits.

Validation: 93 automated checks passed before the final additional Hindi claim test; that additional test and affected privacy/directory tests passed. The production build passed. Browser checks verified English Gugaheri/Ajay candidates, explicit Hindi text replacement in a controlled React field, independent village selection and cross-village tracing, and remembered expiry on a fictional local account. Original live Laravel data is untouched; hosted member data must remain on its existing isolated test path.
