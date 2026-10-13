# Village reels delivered — 13.10.2026

Test-only deployment v20 is Completed / Current in Hostinger, started at 17:05:42 IST. Application source: 44ec69c. Source archive: 9,417,156 bytes, no private database, keys or environment files.

- 46 Hindi village reels are attached to all 56 matching source articles, including grouped secondary articles.
- Both existing reels have the corrected calm Hindi male voice, Hindi captions and matching posters. Old static video URLs also serve the corrected files; their downloaded bytes match the male-voice copies.
- Every one of the 48 video/poster/caption sets passes hosted availability, seeking and caption checks. All 56 article pages contain their correct reel and the restored community emblem. Five checks initially hit deployment warm-up timeouts and passed on a bounded retry.
- Actual hosted Gugaheri video playback reached 88.994 seconds with no media error. Its full file, and the two full-quality revoices, match the local validated renders by SHA-256.
- Saffron accents, ivory backgrounds and walnut text are deployed. A 390-pixel local viewport has no horizontal overflow. Switching the interface to English retains Hindi caption language and narration.
- Original articles and photos are unchanged. Public genealogy remains 10,062 entries. Member storage and the original live Laravel database were not modified.

Local preview: http://127.0.0.1:3033/heritage/villages/106

Hosted example: https://test.luhachvansh.com/heritage/villages/106

Verification evidence: .local-integration/reels-hosted-delivery-verification.json; .local-integration/reels-local-v20-verification.json; .local-integration/test-village-reels-saffron-v20.png. Public media archive remains on test storage and locally, separate from source deployments.

Separately, the original live website returned a Laravel database-access error during the logo check. No attempted repair or changes were made there; Atul should check its database connection settings.
