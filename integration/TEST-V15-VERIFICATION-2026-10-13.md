# Test-site validation — 13.10.2026

v14 deployed successfully to test.luhachvansh.com. The original owner account confirmed its existing Ajay node through the new owner-only UI; no duplicate person or second reviewer account was created. A sourced new spouse proposal was saved with an explicitly unknown birth place. Its seven-day objection period ends on 20.10.2026. It is pending, not an accepted or publicly published genealogy entry.

The public test site shows the microphone composer and separate Create account link. No real microphone recording was performed. The original introductions and archive remain in the existing isolated test database. Production was not changed.

Browser verification found that the signed-in tree included ancestors but omitted nearby siblings. The ancestor walk and the nearby-family walk incorrectly shared their visited set. A regression assertion first reproduced the omission, then passed after a separate traversal set was introduced. The existing privacy assertions still pass. A retry control was added for failed read requests; the initial generic tree loading error cleared on reopening, and its server-side cause was not established.

Validation: 90/90 automated tests pass; production build passes. A read-only backup of the local original archive, with a fictional diagnostic actor in the copy, shows 43 visible records instead of 38 for the affected branch. No real hosted database was downloaded or changed for this diagnostic. The corrected local UI was checked using fictional accounts and records before test-site deployment.

Pending relatives remain outside the accepted graph until their objection period completes or an eligible administrator resolves them. The test does not advance the real database clock. Public display remains subject to the adult's sharing setting; private entries and contacts are not sent to Mitra.
