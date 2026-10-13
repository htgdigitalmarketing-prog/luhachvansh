# Claude result — voice input, node-linked signup, family explorer (13.10.2026)

Status (v14): **source complete, tested (90/90) and built. The source-only v14 package is ready. Not deployed.**

**Briefs**
- `integration/CLAUDE-VOICE-NODE-SIGNUP-2026-10-13.md`, including the appended final paragraphs.
- `integration/CLAUDE-FAMILY-FOLLOWUP-2026-10-13.md`.

**Where the work is:** branch `integration/test-community-20261012`, app `community-platform`.

**Who does what next:** hosting, real member actions and the browser UI checks stay with Codex and the user.

## 0. Why the test site showed "0 village articles"

**Cause.** Codex confirmed it in `TEST-DOMAIN-MOVE-2026-10-13.md`:
1. After the app was renamed to `test.luhachvansh.com`, `LUHACH_MEMBER_DB` still pointed at the old temporary-domain directory.
2. `readHeritage()` therefore found no database and returned nothing.
3. The home page then printed `0` articles and empty introduction and news sections.

**Fix.** Codex repointed the variable. No data was copied or replaced.

**Source hardening, so this cannot fail silently again.**

`lib/storage.mjs` → `memberDbPath()`
- In the hosted deployment (`LUHACH_DEPLOYMENT=test`), a missing, relative or moved member-database path now fails with a 503.
- Before, the v12 code would silently create a fresh empty `members.sqlite`. That empty database looks like a new site and splits member data across two files.
- `getMembers()` and `getHub()` use this check.
- Local preview behaviour is unchanged.

`/api/health` now returns `checks` alongside `storageReady`:
- booleans only: database configured, absolute, exists; archive tables; accounts present; legacy-media folder; translation and editorial caches; recovery key present (existence only)
- public content counts: villages, about, history, news, archive people
- no paths, environment values or account data

This lets Codex diagnose a moved database without shell access.

**Home page.** It now shows a bilingual "archive not connected" notice instead of quietly showing 0.

**Migration evidence for Codex to check.** If any v12 member route was requested while the path was stale, v12 may have created an empty `members.sqlite`, with `-wal` and `-shm` files, in the old temporary-domain directory.
- Do not use it, and do not copy it over the real snapshot.
- Note it and set it aside.
- The real snapshot (13.39 MiB, plus its WAL, legacy-media, caches and 32-byte recovery key) is the one now configured.

## 1. Mitra microphone input (Hindi and English)

**Files**
- `lib/voice.mjs`: the controller, which can be tested
- `components/VoiceInput.tsx`
- wired into `components/Mitra.tsx`

**API.** It uses the browser `SpeechRecognition` / `webkitSpeechRecognition` API, following MDN. Settings: `lang` is `hi-IN` or `en-IN`, chosen with a separate speech-language selector; `interimResults` is on; `continuous` is false.

**Controls and behaviour**
- **Start** works only on a click. **Stop** keeps the text. **Cancel** restores the text that was there before listening began.
- While listening, a status line shows "सुन रहा है…". The text box is read-only and the Ask button is disabled.
- After Stop, the transcript is fully editable.
- **The question is never submitted automatically.**

**Fallbacks**
- An unsupported browser shows a "please type" note.
- Errors each get their own message: permission denied (`not-allowed` / `service-not-allowed`), no microphone, no speech, network, unsupported language.
- Typing always works.

**Disclosure.** Always visible: the browser may send audio to an external speech service, for example Google. The website records and stores nothing. Nothing is sent automatically.

**Nothing listens in the background.** Closing the chat, unmounting the component or hiding the page aborts or stops recognition.

**Tests.** `tests/voice.test.mjs` has 6 tests using a fake recognizer. No real microphone was used at any point.

## 2. A separate "Create account / खाता बनाएँ" entry

- The site header now has separate links: "लॉगिन / Sign in" and "खाता बनाएँ / Create account" (`/members?mode=register`).
- The members panel has a large two-way switch between signing in and creating an account.
- **Invitations are unchanged:** creating an account still needs a one-time invitation code.
- An invitation can be shared as `/members#invite=CODE`. The fragment is never sent to the server or in referrers. The code is copied into the form and removed from the address bar.

## 3. Mandatory node-claim onboarding

**Store:** `lib/members.mjs`. **UI:** `components/NodeOnboarding.tsx`.

**When it appears.** Immediately after signup, and for every existing account without a pending or approved self claim. That includes the owner's account.
- Non-admin members see only "वंशावली से जुड़ें" and the privacy/security tab until they are linked.
- Admins keep the admin tab.

**Search: `claimCandidates`**
- Requires a name plus a village or a parent's name.
- Villages are matched through the source-backed alias table. Names are folded only for presentation differences.
- Each candidate is shown explicitly with: village, generation, original record number, parent and grandparent, and a warning if the entry is already linked to a member.
- **Nothing is pre-selected.**
- Private entries, children and entries on hold are never listed.
- The search is throttled.

**Claim: `requestNodeClaim`**
- The member must tick an explicit confirmation and give a reason.
- The chosen ID must be in the candidate list recomputed from the same search terms.
- An account can have only one self claim, and the same rule is enforced in `requestClaim`. The generic profile form no longer offers "this is me".
- The search terms and the number of candidates are kept for reviewers in `claim_context`.
- Admins see the chosen entry, its recorded parent, generation and the member's search. Similarity counts are shown to reviewers only, because they can include private people.

**Missing person: `requestNewProfile`** (also used by the `createProfile` route action)
- Requires a parent's name and confirmation that the member is not in the list.
- If a visible same-name person exists in the same village, the member must also confirm that they are a different person.
- The parent's name is review context only. **It creates no graph edge.**
- A declined self-submitted profile with no other links is retired, so it cannot linger as a duplicate.

**Unchanged rules for members:** identity is never approved by time and never by the claimant themselves. A separate reviewer is still required.

**Owner exception (v14), at Ajay's explicit instruction "i am super admin. i need no reviwer":** see section 3a.

## 3a. Original owner confirms his own entry (v14)

**Store:** `confirmOwnNode` in `lib/members.mjs`. **Route:** POST action `confirmOwnNode`.

**Who can use it.** Only the **original bootstrap owner account** (the account created with the one-time owner setup), and only for **its own pending self claim**.

**What it requires**
- an explicit confirmation tick
- a written statement of at least 15 characters
- no other approved steward on that entry

**Where it appears.** On the owner's Home page, in the "वंशावली में आपकी प्रविष्टि" card. The card shows the exact match before the owner confirms: name, village, original record number (such as `गुगाहेड़ी_ii_38_8`), recorded parent and generation.

**What it records**
- the claim becomes `approved`, with method `owner_self_confirmation`
- the owner is recorded as decider, with a timestamp
- an audit entry, `owner_self_node_confirmed`, stores the claim, code, name, village and statement
- any pending relative proposals of the owner get a fresh seven-day objection window

**Never automatic.** Being an administrator does not link anyone.

**Ordinary members and appointed reviewers** still cannot approve their own claims: `verifyClaim` is unchanged, and they get a 403 on this path.

**Ajay's existing pending claim.** It was submitted through the v12 UI and is **recognised as is**. It counts as his personal claim, so onboarding does not ask for a duplicate, and the confirmation panel appears directly.

**Admin page.** The second-reviewer section is now "Appoint an additional reviewer (optional)". It no longer says the owner needs a reviewer.

## 3b. Unknown birth place (v14)

The relative form has a "स्थान ज्ञात नहीं — खाली रखें" (place not known — leave blank) option, with a warning not to guess and that a husband's village is not her birth village.
- The server accepts a blank village only when it is explicitly marked unknown. A blank field without the mark is refused, so a place is not left out by accident.
- The place is stored **blank**, with `villageUnknown: true`. Nothing is ever filled in, for example from Gugaheri.
- For blank-place entries, the duplicate check compares names among other blank-place entries.
- Source, relationship and identity safeguards are unchanged.

**Family-shared code.** A relative added by someone else (for example a wife) cannot be found by name, because she is private. The proposer sees her permanent code, `LV-XXXX-XXXX`, on the Requests tab and passes it on privately. She enters it in onboarding to claim her own entry. Codes of children or entries on hold never open a claim, and a claimed code cannot be claimed again.

## 4. Structured spouse / mother / daughter proposals

**Store:** `proposeRelative`. **UI:** `components/RelativeForm.tsx` on the member home page, once a self claim exists.

**What the proposal contains**
- It is anchored on the member's own claimed node.
- Relationship: spouse, mother, daughter, son or father.
- An existing-person picker, so an entry already in the tree is linked instead of duplicated.
- For a new person: name, alias, gender, village and life stage.
- An explicit **birth link** (a spouse's parent in the archive) or **marriage link** (a mother's or daughter's husband).
- Free-text birth-family and marriage notes.
- A source type and a source of at least 15 characters.
- Same-village duplicate names, duplicate open proposals, cycles and second parents are refused.

**Acceptance policy** (corrected per the user's original direction, as relayed by Codex):
- **While the author's identity is unverified,** the proposal stays pending. It is not marked as a conflict, and an administrator cannot accept it either.
- **When the identity is approved,** a full seven-day objection window starts.
- **If valid and unopposed,** the proposal is accepted when the window ends (`auto_accepted`).
- **On an objection,** it becomes disputed and an administrator decides. Conflicts pause for an administrator.
- **A child's record** is never accepted by the clock; an administrator decides.
- **Authors** can never accept their own proposal.
- **Identity node claims still always need explicit verification by someone else.**

**Accepted people.** An accepted new person stays private, with the stated life stage, and gets a permanent code. **Text in a private introduction never creates people or links;** a test covers this.

**Moderation status in the UI**
- "प्रस्तावक की पहचान की पुष्टि की प्रतीक्षा" (waiting for the proposer's identity)
- "आपत्ति अवधि … तक" (objection window until …)
- "बच्चे की जानकारी — प्रशासक का निर्णय आवश्यक" (child's record — needs an administrator)
- Admins see the source type, life stage, links, and birth and marriage notes.

## 5. Visibility, the visual explorer, and publication by consent

**Family circle: `familyCircle`**
- A private relative added by an accepted proposal is visible to the members whose verified own or guardian node is directly linked to them.
- A child is visible only to the member whose node is the child's recorded parent.
- A privacy hold, or the relative verifying their own profile, ends this circle rule. After that their own setting applies.
- Other verified members cannot see them.

**Real visual explorer**
- A new "मेरा वंश-वृक्ष / My family tree" tab (`components/MemberTree.tsx`, `GET /api/members?action=tree`).
- It shows the canvas tree of all recorded ancestors of the member's verified node, plus family up to three links out: siblings, cousins, spouses with their birth families, children.
- The walk passes only through people the member may see, so it does not reveal the shape of private branches.
- Responses are `no-store` and `Vary: Cookie`. Data is refetched for every account.
- Clicking a node opens its relationship panel.
- A button on the home page leads to it.

**Public explorer**
- `/vanshavali` still works without signing in.
- Archive entries are public unless withdrawn or a child.
- A member-added adult appears **only after their own explicit consent:** the new audience option "सार्वजनिक वंशावली भी" plus a consent checkbox, and only the person managing their own adult profile can set it. A relative cannot publish someone else.
- Withdrawal or a privacy hold removes the person on the next request (the cache is keyed on `data_version`).
- Contact details are never public.
- Accepted links between two public people are shown.

**Mitra** reads only the public graph, so private, child and contact data cannot reach it.

## 6. Daughter and daughter-in-law roles, legend, and stable IDs

**Roles: `familyRole` in `lib/viewer.mjs`**
- Roles are contextual within the graph shown. A woman with a recorded parent is a **बेटी** (daughter). A woman with a recorded spouse is a **बहू** (daughter-in-law).
- One woman can be both: she stays **one node**, drawn with a split fill.
- The canvas shows the colours (rose for बेटी, amber for बहू) and also **prints the role on the node**, so colour is never the only signal.
- Member-added private people have a dashed border.
- `components/dynasty/RoleLegend.tsx` is an HTML legend, shown in both the public and signed-in explorers.

**IDs**
- Original archive IDs (`legacy_id`, such as `गुगाहेड़ी_ii_38_8`) are never changed.
- People added later keep their internal UUID and get `public_code` = `LV-XXXX-XXXX`. It is random Crockford base32, unique-indexed, never reused, and encodes no village, gender, generation or family.
- The column is added by an additive `ALTER TABLE`, and existing member-added people get a code on first start.
- The tree displays `legacy_id`, else `public_code`.
- No woman is duplicated per marriage: proposals link existing entries, and duplicates are refused.

## 7. Ajay and Shagun

The **draft only** is in `integration/OWNER-CLAIM-AND-SPOUSE-DRAFT-2026-10-13.md`. Nothing was executed, and no real or cloned database was changed.
- It covers the exact search terms for `गुगाहेड़ी_ii_38_8` (father `गुगाहेड़ी_ii_37_3`, brother `गुगाहेड़ी_ii_38_7`).
- It warns explicitly against `ज्ञानपुर_vii_38_10`.
- It has the spouse-form values, with Ajay's statement as the source.

A synthetic test with the same structure checks five things:
- The owner's node is the only candidate when searching by village and father.
- The new spouse proposal, with its place explicitly unknown and stored blank, does not link to the unrelated शगुन.
- It waits until the owner confirms his own entry.
- After his confirmation, it is accepted when the objection window ends.
- Afterwards it appears as his spouse in the signed-in explorer.

## Validation

**Tests and build**
- `npm test`: **90/90 pass** (v14). That is the 74 earlier tests, unchanged, plus 16 new: 10 in `tests/onboarding.test.mjs`, including the owner-confirmation and unknown-place cases, and 6 in `tests/voice.test.mjs`.
- `tsc --noEmit` is clean.
- Production `next build` passes for v14. It was built into `.next-v13`, a separate output folder, so the v12 preview on :3025 (`.next`) was not disturbed. `.next-*/` is gitignored.

**Earlier browser check (before the follow-up brief).** This was done before `CLAUDE-FAMILY-FOLLOWUP` arrived, which says not to drive browsers by shell or CDP. It used a headless Chrome DevTools script against a **synthetic** database on 127.0.0.1:3026, which has since been stopped. Results are in `.local-integration/v13-verification.json`, with screenshots in `.local-integration/screenshots/v13/`.

| Area | What it showed |
|---|---|
| Voice | Voice text filled the box; 0 automatic submissions; cancel restored the earlier text; the denied-permission message appeared; the unsupported-browser fallback appeared |
| Signup | Create account was separate from sign in; the invitation was prefilled from the fragment and the fragment was removed |
| Onboarding | Onboarding was mandatory; a name-only search was refused; one explicit candidate was shown and nothing was pre-selected |
| Review | The admin saw the claim context; the reviewer's approval worked |
| Relatives and explorer | The spouse proposal and acceptance worked; the family explorer listed the spouse; the anonymous `/api/viewer` did not contain the spouse |
| Layout | No overflow at 390 px |

**Not browser-checked.** After that note I did no further browser automation. These parts were added afterwards and are covered only by unit tests and the build, so Codex should verify them through CUA:
- the tree tab
- the role legend
- the code-based claim
- the public-consent option
- the objection-window labels
- the owner self-confirmation panel (v14)
- the "place not known" option (v14)

## Commits, remotes and package

**Commits**
- `785f0dc` (v13): "Voice input, node-linked signup, family explorer and consent-based publication".
- `e55d24a` (v14): "Owner-only self-node confirmation and explicit unknown birth place".
- This result document is committed separately; see `git log`.

**Remotes.** Both commits are pushed to both remotes, on branch `integration/test-community-20261012`:
- `origin` (htgdigitalmarketing-prog/luhachvansh)
- `review` (ajay1694-max/luhach-community)

**Not committed.** Codex's `TEST-DOMAIN-MOVE-2026-10-13.md` is left uncommitted because it contains a hosting account path.

**Package to deploy (v14).** `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/community-node-v14.zip`
- 9,083,117 bytes, under the 10 MB upload limit.
- Built with `git archive` from commit `e55d24a`, `HEAD:community-platform`, the same layout as v12, so it holds git-tracked source and public assets only.
- Checked to contain no `.env.local`, no `.sqlite`, no recovery key, no `node_modules` and no `.next`.
- The v13 zip is superseded.

**Not deployed. No real database was touched.**

**Deployment notes for Codex**
- Keep the existing environment variables. `LUHACH_DEPLOYMENT=test` and an absolute, existing `LUHACH_MEMBER_DB` are now strictly required.
- After deploying, check that `/api/health` reports `storageReady: true` and `contentReady: true`.
- On first start the app makes additive schema changes:
  - the `people.public_code` column and its unique index
  - the `claim_context` table
  - codes for any existing member-added people

  Nothing is dropped or rewritten.

## Human input still needed

**No longer needed (superseded by Ajay's 12:24 IST instruction):**
- a second reviewer for Ajay's own claim
- a mandatory birth place for Shagun

**Still needed:**
1. **Codex deploys v14** and checks it through CUA on `test.luhachvansh.com`.
2. **Ajay confirms his own entry.** As the signed-in owner, Ajay (or Codex at his direction) opens Home. His already-pending v12 claim shows a confirmation panel. Check that it shows `गुगाहेड़ी_ii_38_8` with parent कर्मबीर, then tick, write the statement and confirm.
3. **Ajay proposes Shagun as his spouse.** The form values are in the draft. Tick "स्थान ज्ञात नहीं" unless a real place is known. It is accepted after the 7-day objection window if nobody objects.
4. **Shagun decides about the public tree.** Whether she ever appears publicly is her own decision, made from her own account.
5. **The old database folder.** Codex should look for, and set aside, any empty `members.sqlite` that v12 may have created in the old temporary-domain directory.
