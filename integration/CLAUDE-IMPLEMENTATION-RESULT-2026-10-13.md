# Claude implementation result — 13.10.2026

Assignment: `integration/CLAUDE-COMPLETE-IMPLEMENTATION-2026-10-13.md` (complete the fresh-review items, Hindi reels, maps and flowcharts). Repository `C:/Users/Admin/Projects/luhachvansh-integration`, branch `integration/test-community-20261012`, app `community-platform`.

## 1. Village covers (highest priority)

- **Photos inspected:** I viewed all 93 public village photographs as contact sheets, in `.local-integration/cover-review/village-*.jpg`.
  - Gugaheri's first photo, which used to be the default header, is an individual portrait.
  - Communal scenes exist: the Luhach Parivar Milan Samaroh gatherings, the Giravad temple and tree-planting, landscapes, and the Bhinwpura memorial site.
- **Curated covers:** `content/village-covers.json` lists the covers for 11 villages. Each entry carries its photo IDs and a scene type: gathering, temple, landscape or memorial.
  - `lib/village-covers.mjs` only uses curated IDs that are also among that village's own public photos.
  - The old "first photo" fallback is gone.
- **Slideshow:** `components/VillageCover.tsx` provides:
  - previous and next buttons
  - pause and play
  - position dots
  - left and right arrow keys
  - touch swipe, with `touch-action: pan-y`
  - pausing while hovered or focused
  - honouring `prefers-reduced-motion`
  - carousel ARIA roles and labels in Hindi and English
- **Controls placement:** the controls sit on a bar below the photo, so they don't cover faces.
- **Place card:** villages with no communal photo get a neutral village graphic with the village name, district and state. No portrait is used.
- **Village index:** the cards use the same rule.
- **Nothing deleted:** every original photograph stays in the village Photos tab and in the gallery. Gugaheri still lists all 26, reached through "सभी 26 मूल तस्वीरें देखें".

## 2. Hindi-only reels (rendered, not drafts)

| Reel | File | Length |
|---|---|---|
| हमारी जड़ों की कहानी (history introduction) | `C:/Users/Admin/Projects/luhachvansh-integration/community-platform/public/media/reels/luhach-history-hi.mp4` | 48.88 s |
| अपना गाँव, अपना परिवार (public viewer walkthrough) | `C:/Users/Admin/Projects/luhachvansh-integration/community-platform/public/media/reels/luhach-viewer-hi.mp4` | 48.35 s |

**Format.** Both files are H.264 High, 1080×1920, 30 fps, with AAC narration.
- Narration levels are about −22 dB mean and −4.4 dB peak.
- Captions are burned in, in Hindi only. A Hindi WebVTT caption track and a poster image sit next to each file (`.vtt`, `.jpg`).
- The history reel was re-encoded at CRF 28 (5.25 MB) so the deployment package fits under the 10 MB upload limit. The CRF 23 master is kept privately as `.local-integration/reels/luhach-history-hi.mp4`.

**Narration.** The text is the recorded reconciled script from `integration/CLAUDE-FRESH-PASS-2026-10-13.md`, word for word.
- The voice is edge-tts `hi-IN-SwaraNeural`. Only the public narration text was sent to the speech service.
- I measured timing per sentence from the rendered audio, and caption cues use word-boundary timings.
- The end cards disclose that the voice is computer-generated.

**Reel 1 visuals.** Only real public archive assets are used:
- the Nandha gallery gathering and the gathering entrance gate
- a graphic of the founding family of 8 from book P5: the four men named, the four women marked "नाम दर्ज नहीं" (name not recorded)
- the community's own migration banner chart
- the original genealogy chart, labelled as the traditional lineage
- real Hindi UI screenshots of the site
- the Giravad temple

No disputed dates and no invented footage appear.

**Reel 2 visuals.** This is a timed Chrome screencast of the real public `/vanshavali` page. It shows these steps:
1. Choose the village नाँधा.
2. Search for गूगन.
3. Show his recorded family, including the new "mother not recorded" and "spouse not recorded" notes.
4. Add भैराज (मोहला) and trace the link: पिता → महाराज → भैराज.
5. Zoom the canvas onto the path.
6. Show the contribution flowchart.

Only public historical names from the 1500 CE departures (P113–P116) appear. No account, contact or member data is shown.

**Inspection.** Contact sheets and frame checks are in `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/reels/`:
- `contact-history.jpg` and `contact-viewer.jpg`
- `frame-history-17s.png` and `frame-viewer-24s.png`

**Scripts.** All reproducible, in the same folder:
- `tts.py`
- `reelkit.py`
- `reel_history.py`
- `reel_viewer.py`
- `timing.json` (the measured timings)

**On the site.**
- `/watch` holds both reels. Each sits beside its full Hindi transcript, its sources and links to further reading.
- The history page embeds Reel 1, and `/vanshavali` embeds Reel 2.
- The interface text stays bilingual. The video speech and captions stay Hindi only.

## 3. Maps and flowcharts (`/journey`)

**Three lanes of information.** The page separates three kinds of claim:
- tradition (P3, P17)
- the author's chronology (P5, P105, P114–P130)
- the recorded lineage: 10,061 names and 10,060 father links

**Schematic migration diagram.** This is the book's 16-row table with a paragraph citation on every node.
- It also shows the later moves from Giravad: to Gugaheri (P153–P155) and to Kadrabad (P157–P159).
- It is labelled as schematic: columns are the recorded years, and distance and direction are not geographic.
- An accessible text list carries the same information.
- Village nodes link to their articles.

**Recorded variants, shown without correction:**
- the founder date: 865 CE (VS 922) versus 860 CE
- the Farmana stop dated about 1525 versus the table's 1500
- the shared Ujhana/Dhundhwa passage, read as a shared origin
- the rule that no one is dated from a generation number

**Geographic map.** Only 16 villages could be confirmed with a coordinate from Wikidata, OpenStreetMap or Wikipedia that matched the village in the stated district.
- Meham and Farmana appear as route waypoints from P113.
- New Delhi, Rohtak and Jaipur appear as reference points.
- Every point links to its source.
- **31 villages are listed as unverified or ambiguous, with no point.** That includes the origin village, Nandha, which no public map source has, and the page says so.

**Attribution and data.**
- Coordinates are credited to Wikidata (CC0) and OpenStreetMap (ODbL).
- The data is in `content/village-geo.json`. The full evidence trail is in `.local-integration/geo/`.

**Other sections.**
- The community's own migration chart, from the Bhandoli gallery.
- The village count explanation (see section 8).

**Accessible contribution and verification flowchart** (`components/ContributionFlow.tsx`). It is an ordered list with six steps, and each step reflects the actual code:
1. Member account. Accounts are by invitation and adults-only.
2. Identity request.
3. Independent administrator review. Nobody can approve their own claim, and claims never auto-approve.
4. Sourced proposal.
5. Seven-day objection window, decided by an administrator.
6. Accepted entry. It keeps its source and log entry, and it can be reverted.

## 4. Translation provenance

- **Note in English mode:** the reader now says "English: assisted translation; Hindi is the preserved original source", and that summaries are editorial guides.
- **Fallback detection:** `englishWithStatus` reports whether a paragraph is being shown in Hindi because no translation exists. Such paragraphs get `lang="hi"` and a "Not yet translated · original Hindi" label.
- **Current state:** all 1,369 current archive paragraphs have translations, so no fallback label appears today. A test covers the fallback path.
- **Performance:** the translation file is now checked at most once a second, instead of on every paragraph.

## 5. Mother and spouse empty states

**What the archive contains.** It has only `parent/father` relationships: 10,060 of them.

**Viewer panel.**
- When no mother is recorded, it now says so and explains that the historical record kept the father's line.
- When no spouse is recorded, it says no name is added by guesswork.
- Both notes link to a sourced request through `/members`, and to "How is it checked?" at `/journey#contribution-flow`.

**Other changes.**
- The viewer's intro text no longer implies that mother data exists.
- The suggested question changed from asking about a mother to asking about a father and grandfather.
- Mitra's answer for a missing mother or spouse adds the same explanation.

**Bug fixed.** In Hindi mode, sibling labels showed the English word "sibling". They now read "भाई / बहन".

## 6. Village aliases

**Coverage.** `content/village-aliases.json` has 53 entries covering all 46 villages, plus their duplicate-district website records.

**Sources for each spelling.** A spelling is included only when it is literally attested, with a citation, in one of:
- the book (paragraphs numbered from P0; 430 non-empty paragraphs; every earlier citation matched with no offset)
- the master CSV
- the website village records
- the people table

Pure Unicode variants are labelled as normalisation.

**Ambiguity handling.**
- Same-name villages in different districts stay separate and are flagged: नान्धा, नीमली, मारोत, भड़ताना, ढूँढवा, नंगला उगरसैन, गुगाहेड़ी 178/180.
- "उग्रसैन" on its own is the founder's personal name, so it does not resolve to a village.

**Code.** `lib/villages.mjs` resolves spellings. It is used by:
- village search, so "पाडला" finds पाढ़ला
- Mitra village matching
- the article → family-tree link. This fixes a real bug: the website's spelling (नान्धा) did not match the genealogy's spelling (नाँधा).

## 7. Viewer performance with privacy-safe caching

**How the cache works.** `lib/public-viewer.mjs` keeps one long-lived read-only connection per database.
- The cache key combines SQLite `PRAGMA data_version`, file identity (inode and birth time), file size and modification time, and the translation-file timestamp.
- `data_version` changes after every commit made by any other connection, including WAL commits that never touch the main file's modification time.
- Covered databases: the archive database and the separate member privacy database.
- Path tracing uses an adjacency index built once per graph.

**Effect.** A privacy withdrawal invalidates the cache on the very next request. A repeat `/api/viewer` call took 77 ms locally.

**Test.** A new test writes a privacy withdrawal through an open writer connection, so it exists only in the WAL. The next request excludes the person.

## 8. Counts and number/date emphasis

**Counts.**
- The website has 56 village articles. Once spellings are matched, they cover 46 distinct villages.
- The book (P5) and the master genealogy also list 46 villages.
- This is explained on the village index, on `/journey` and in the homepage statistic, which now reads 46 villages with "56 village articles on the website". No record was removed.

**Emphasis.** `lib/emphasis.mjs` classifies whole values:
- Dates, meaning years, ranges, full dates, and numbers next to era words, are bold.
- Quantities, meaning numbers with units or thousands separators, get a separate style.
- "20,000 बीघा" is no longer split into "20," plus a bold "000".
- "1165 साल" is styled as a quantity, not a date.
- Phone-like numbers are ignored.
- The source text is unchanged.

## 9. Second reviewer

- **Test:** a new end-to-end test, "owner identity claim waits for a separately appointed second reviewer". The owner cannot approve their own claim; the owner verifies a relative; the owner appoints that relative with the owner's password; the reviewer signs in again and approves the owner's claim.
- **Admin panel:** it now explains these four steps. It states that the system never appoints a reviewer automatically or creates a placeholder account, and it shows a status line when no verified member exists yet.
- **Not done:** no reviewer was appointed and nothing was self-approved. Choosing a real person remains Ajay's decision.

## Validation

**Tests.** `npm test` passed 74 of 74. That is the earlier 66, plus:
- the second-reviewer test
- the WAL privacy-cache test
- 6 content-display tests: emphasis, cover curation, aliases, counts, migration citations, translation fallback

**Build and typecheck.** The production `next build` and `tsc --noEmit` both passed.

**Source coverage.** I reran `.local-integration/audit-redesign.py` after the layout changes:
- 69 routes checked
- all 141 records present, with zero missing
- zero paragraph mismatches
- all 221 media/document references present, with zero missing
- 23 team records and 5 martyr records rendered

**Browser checks.** These were run with Playwright and Chrome against `http://localhost:3025`. Results are in `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/implementation-verification.json`.
- **Overflow:** no horizontal overflow at 360, 390 or 1366 px, in Hindi or English, on 8 pages. The `lang` attribute is correct on each.
- **Playback:** both videos play in Chrome (`readyState` 4, about 2.9 s played in 3 s, 1080×1920, one caption track each).
- **Slideshow:** keyboard and pause/play work. Swiping left advances, swiping right goes back, a small movement is ignored, and swiping pauses autoplay. I verified this with dispatched touch events: Playwright's protocol-level touch injection did not reach the page.
- **Gugaheri:** all 26 originals are still in the Photos tab.
- **Alias search:** "पाडला" finds पाढ़ला.
- **Public viewer API:** 10,061 records, 10,060 edges, no contact data, and `no-store`.

**Screenshots.** In `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/implementation/`:
- `village-gugaheri-hi-desktop.png`
- `village-gugaheri-mobile-cover.png`
- `village-gugaheri-en-desktop.png`
- `village-chhajja-placecard-hi.png`
- `villages-index-hi.png`
- `journey-hi-desktop.png`
- `journey-en-mobile.png`
- `journey-map-mobile.png`
- `history-en-translation.png`
- `watch-hi.png`
- `watch-mobile-hi.png`
- `watch-playing-desktop.png`

## Commits (pushed to both origin and review)

- `1a86e39`: "Communal village covers, Hindi reels, journey maps and verified content aids"
- `4f9f7c9`: "Compress history reel for source-package upload limit"
- This result document is committed separately; see `git log`.

## Deployment

- **Package:** `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/community-node-v12.zip`, 9,036,236 bytes. It holds 114 git-tracked source files only: no `.env.local`, data, `node_modules` or build output.
- **Upload:** the file was uploaded to the existing Hostinger Node app for `darkseagreen-newt-136595.hostingersite.com` through Deployments → Settings and redeploy → Upload new files.
- **Kept as they were:** Next.js, Node 24.x, `npm run build`, and the four existing environment variables. I didn't read or copy their values.
- **Status:** "Save and redeploy" started the v12 build. Hosted verification is recorded below.
- **Untouched:** the live Laravel site, the production MySQL database, the subdomains and the private database, media, key and recovery files.
- **Domain:** the `test.luhachvansh.com` mapping is still unresolved, as before.

### Hosted verification (staging, v12)

**Deployment status.** Hostinger marked `community-node-v12.zip` Completed and Current at 11:18 IST on 13.10.2026. Proof: `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/screenshots/implementation/hostinger-v12-current.png`.

**Results** (also in `.local-integration/staging-v12-verification.json` and `.local-integration/redesign-render-coverage-staging-v12.json`):
- **Health:** `/api/health` returned `storageReady: true`.
- **Coverage on staging:** 69 routes checked, all 141 records present, zero paragraph mismatches, all 221 media/document references present.
- **Gugaheri cover:** the hero is the community gathering photo (`66857963…`), not the portrait. There are 3 slides, and all 26 originals are still in the Photos tab.
- **`/journey`:** 16 map points, no mobile overflow.
- **`/watch`:** both reels play from staging (`readyState` 4, 2.9 s played in 3 s, 1080×1920).
- **Public viewer:** 10,061 records and 10,060 edges, with no contact data.
- **Private files:** the SQLite, `heritage-edit.json` and `heritage-en.json` URLs return 404; `.env` returns 403.
- **Live site:** the live `luhachvansh.com` root still returns 200.

**Screenshots:**
- `.local-integration/screenshots/implementation/staging-v12-gugaheri-cover.png`
- `.local-integration/screenshots/implementation/staging-v12-watch-mobile.png`

**Not done in this pass:**
- Member and owner sign-in, and the recovery vault, were not exercised, so that no credentials were handled. The member code paths are unchanged apart from the reviewer guidance text, and all 74 tests pass.
- Live Laravel, production MySQL, subdomains, and private database/media/key/recovery files were not touched.
- Local preview remains on `http://localhost:3025`, running the v12 production build.

## Outstanding human decisions

1. **Second reviewer:** choose a real, trusted relative as the second reviewer, verify them, and appoint them. They then review Ajay's own identity claim.
2. **Founder date:** clarify the 860/865 founder date with the author (Col. Karambir Singh Luhach).
3. **Map gaps:** optional. Use Census 2011 village codes to locate the 31 unverified villages, including Nandha.
4. **Domain:** the `test.luhachvansh.com` cutover is still a separate hosting task.
