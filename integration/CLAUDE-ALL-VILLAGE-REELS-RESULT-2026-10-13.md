# Claude result — Hindi reels for every village, male narration — 13.10.2026

**Brief.** `integration/CLAUDE-ALL-VILLAGE-REELS-2026-10-13.md`.

**Status.** Complete as an isolated, rendered set: **46 village reels plus 2 re-voiced reels, all 48 files validated.** Nothing is deployed or public. Codex integrates.

**Output folder.** Everything is in `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/village-reels-20261013/`, called "the folder" below.

**Concurrency boundary, as kept:**
- No app code, content catalogue or public media changed.
- No Git refs changed; no commit, push or deploy.
- No browser automation, no secret reads, and no member data or database writes.
- The archive SQLite was opened read-only, for the public `legacy_records`/`legacy_media` projection only.

## Progress log
- **13:40 IST.** Voice inventory verified. Source bundle exported: 46 villages and 56 articles reconciled.
- **13:55 IST.** All 46 scripts written and machine-validated, 46 of 46 passing. Both existing reels re-voiced. Full village render started.
- **14:20 IST.** The first 13 village reels were rendered.
  - A local offline speech check (faster-whisper small) was run on both re-voiced reels.
  - The renderer was revised after inspecting contact sheets. Communal photos now appear only in the opening montage, labelled as current gatherings or places, because earlier drafts paired them with historical facts.
- **15:05 IST.** All 46 rendered. All 48 files validated. Speech check run on all 48. Inventory written.

## Voice

**Inventory.** The installed provider, edge-tts 7.2.8 (Microsoft neural voices, free, no account), lists 322 voices. For Hindi it offers exactly two: `hi-IN-MadhurNeural` (male) and `hi-IN-SwaraNeural` (female). The list is saved in the folder as `voices-hindi.json`.

**Local voices.** Checking the Windows SAPI/OneCore voice registry needed a permission this session did not have, so no local Hindi male voice could be confirmed.

**Settings used.** Every narration uses `hi-IN-MadhurNeural`, rate −6%, pitch −3 Hz. That is about 2.1 words per second: calm and mature, without sounding slowed. These were modest adjustments chosen after comparing three sample settings.

**What was sent to the speech service.** Only public narration sentences. No profile or member text.

**Disclosure.** Each end card says "आवाज़: कंप्यूटर-जनित हिन्दी पुरुष वाणी" (voice: computer-generated Hindi male voice).

**Speech check.** I transcribed every narration offline with faster-whisper small and compared it with its script.
- Character similarity ranges from 0.70 to 0.90, mean 0.85.
- I inspected the lowest, पाढ़ला at 0.70. Whisper spelled years as words ("एक हजार सात सौ पचहत्तर" for 1775). No sentence was missing, and every line has its full measured duration.
- Results are in `asr-check.json`.

## Coverage and grouping

**Grouping method.** I grouped the website's 56 village articles into 46 villages using the source-backed alias table (`community-platform/content/village-aliases.json`). Grouping is never by article count.
- Grouped villages get one reel that lists all their article IDs, both on the end card and in the manifest.
- The groups are: नान्धा (104, 230), गुगाहेड़ी (106, 178, 180), नीमली (107, 236), मारोत (108, 202), भड़ताना (117, 234), ढूँढवा (119, 237), नंगला उगरसैन (122, 197, 242) and गहना (128, 240).

**Inventory.**
- Sources export: `sources/village-sources.json`
- Machine-readable inventory: `reels-index.json`
- Per-village table: `inventory-table.md`
- Poster overview: `all-village-posters.jpg`

**Totals:**
- 46 village reels covering 56 articles
- 11 with curated communal photos (gatherings, temple, memorial), shown only in the opening scene
- 35 using neutral village cards and quoted source cards, with no photographs
- 16 containing a book-table departure row (schematic Nandha→village card, citing the book paragraph)
- 16 with a verified-coordinate mini map; 30 villages say on screen that their map location is not verified
- 12 carrying a flag or an on-screen uncertainty note

The full per-village table, also in `inventory-table.md`:

| Slug | Village | District · State | Articles | Length | Size | Visuals | Book row | Location | Flag/uncertainty | Speech check |
|---|---|---|---|---|---|---|---|---|---|---|
| v104 | नान्धा (Nandha) | चरखी दादरी · Haryana | 104, 230 | 77.0 s | 4.2 MB | communal photos ×2 | — | not verified | yes | 0.868 |
| v105 | गिरावड़ (Girawad) | रोहतक · Haryana | 105 | 83.7 s | 5.4 MB | communal photos ×5 | P116 | verified map | — | 0.863 |
| v106 | गुगाहेड़ी (Gugaheri) | रोहतक · Haryana | 106, 178, 180 | 89.0 s | 4.4 MB | communal photos ×3 | — | not verified | yes | 0.827 |
| v107 | नीमली (Nimli) | चरखी दादरी · Haryana | 107, 236 | 85.0 s | 4.5 MB | communal photos ×2 | — | verified map | yes | 0.895 |
| v108 | मारोत (Marot) | झज्जर · Haryana | 108, 202 | 82.8 s | 2.9 MB | source cards | — | not verified | yes | 0.789 |
| v109 | रानीला (Ranila) | चरखी दादरी · Haryana | 109 | 78.5 s | 5.2 MB | communal photos ×1 | — | verified map | — | 0.9 |
| v112 | रीवाड़ी खेड़ा (Rewari Khera) | झज्जर · Haryana | 112 | 82.9 s | 3.8 MB | communal photos ×1 | — | verified map | — | 0.853 |
| v113 | रिटौली (Ritoli) | रोहतक · Haryana | 113 | 79.2 s | 3.6 MB | communal photos ×2 | — | verified map | — | 0.872 |
| v114 | मोहला (Mohla) | हिसार · Haryana | 114 | 85.6 s | 3.0 MB | source cards | P115 | not verified | — | 0.847 |
| v115 | अलखपुरा (Alakhpura) | भिवानी · Haryana | 115 | 79.2 s | 2.8 MB | source cards | P129 | not verified | yes | 0.886 |
| v116 | सिवाड़ा (Siwara) | भिवानी · Haryana | 116 | 82.7 s | 2.7 MB | source cards | P117 | verified map | — | 0.856 |
| v117 | भड़ताना (Bhadtana) | जिन्द · Haryana | 117, 234 | 82.0 s | 2.8 MB | source cards | P124 | not verified | yes | 0.879 |
| v118 | उझाणा (Ujhana) | जिन्द · Haryana | 118 | 77.1 s | 2.8 MB | source cards | P121 | verified map | — | 0.853 |
| v119 | ढूँढवा (Dhundhwa) | कैथल · Haryana | 119, 237 | 86.6 s | 2.9 MB | source cards | P122 | not verified | yes | 0.864 |
| v120 | पाढ़ला (Padla) | कैथल · Haryana | 120 | 86.7 s | 2.9 MB | source cards | P123 | verified map | — | 0.697 |
| v121 | नली हुसैनपुर (Nali Husainpur) | हापुड़ · UttarPradesh | 121 | 87.0 s | 4.9 MB | communal photos ×3 | P125 | not verified | — | 0.876 |
| v122 | नंगला उगरसैन (Nangla Ugrasen) | बुलन्दशहर · UttarPradesh | 122, 197, 242 | 83.6 s | 4.5 MB | communal photos ×2 | P118 | not verified | yes | 0.865 |
| v123 | सेहरा (Sehra) | बुलन्दशहर · UttarPradesh | 123 | 83.5 s | 2.9 MB | source cards | P126 | verified map | — | 0.837 |
| v124 | सालहेवाला (Salhewala) | भिवानी · Haryana | 124 | 79.6 s | 2.9 MB | source cards | P130 | not verified | — | 0.871 |
| v125 | भैसाखुर (Bhainsakhur) | बुलन्दशहर · UttarPradesh | 125 | 82.5 s | 2.7 MB | source cards | P127 | verified map | — | 0.864 |
| v126 | खाद मोहननगर (Khad Mohan Nagar) | बुलन्दशहर · UttarPradesh | 126 | 87.6 s | 3.0 MB | source cards | P128 | not verified | — | 0.843 |
| v127 | भंडोली (Bhandoli) | बुलन्दशहर · UttarPradesh | 127 | 82.1 s | 4.1 MB | communal photos ×3 | P119 | not verified | — | 0.866 |
| v128 | गहना (Gahna) | बुलन्दशहर · UttarPradesh | 128, 240 | 75.1 s | 2.4 MB | source cards | — | not verified | yes | 0.811 |
| v129 | बदरखा सिरवास (Badarkha Sirwas) | बुलन्दशहर · UttarPradesh | 129 | 73.3 s | 2.5 MB | source cards | — | not verified | — | 0.85 |
| v130 | सियाल्ली (Syarli) | बुलन्दशहर · UttarPradesh | 130 | 62.1 s | 2.1 MB | source cards | — | not verified | yes | 0.861 |
| v131 | इगलास (Iglas) | अलीगढ · UttarPradesh | 131 | 40.2 s | 1.2 MB | source cards | — | verified map | — | 0.848 |
| v132 | अमरपुर (Amarpur) | मेरठ · UttarPradesh | 132 | 85.5 s | 2.9 MB | source cards | — | not verified | — | 0.873 |
| v133 | भडंग़पुर (Bhadangpur) | हापुड़ · UttarPradesh | 133 | 84.5 s | 2.9 MB | source cards | — | not verified | yes | 0.861 |
| v134 | गढ़ी गुलडहर (Garhi Guldhar) | गाजियाबाद · UttarPradesh | 134 | 74.8 s | 2.4 MB | source cards | — | not verified | — | 0.867 |
| v135 | ज्ञानपुर (Gyanpur) | मुरादाबाद · UttarPradesh | 135 | 83.1 s | 2.7 MB | source cards | P120 | verified map | — | 0.872 |
| v136 | छज्जा नगला (Chhajja Nangla) | मुरादाबाद · UttarPradesh | 136 | 84.3 s | 2.9 MB | source cards | — | not verified | — | 0.883 |
| v137 | मुण्डाखेड़ी (Munda Kheri) | मुरादाबाद · UttarPradesh | 137 | 78.2 s | 2.6 MB | source cards | — | not verified | — | 0.845 |
| v138 | दांशाह मलिक (Danshah Milak) | मुरादाबाद · UttarPradesh | 138 | 52.2 s | 1.7 MB | source cards | — | not verified | — | 0.85 |
| v140 | घरोट (Gharot) | अमरोहा · UttarPradesh | 140 | 73.4 s | 2.4 MB | source cards | — | not verified | — | 0.835 |
| v141 | बाबूखेड़ा (Babu Khera) | सम्भल · UttarPradesh | 141 | 61.7 s | 2.0 MB | source cards | — | not verified | — | 0.868 |
| v142 | दरियापुर (Dariyapur) | सम्भल · UttarPradesh | 142 | 83.5 s | 2.7 MB | source cards | — | not verified | — | 0.836 |
| v143 | कादराबाद (Kadrabad) | बिजनौर · UttarPradesh | 143 | 76.2 s | 2.5 MB | source cards | — | not verified | — | 0.774 |
| v144 | भींवपुरा (Bhinwpura) | नागौर · Rajasthan | 144 | 85.3 s | 4.9 MB | communal photos ×2 | — | not verified | — | 0.81 |
| v145 | किशनगढ़ रेनवाल (Kishangarh Renwal) | जयपुर · Rajasthan | 145 | 72.5 s | 2.3 MB | source cards | — | verified map | — | 0.854 |
| v146 | सारगोथ (Sargoth) | सीकर · Rajasthan | 146 | 62.4 s | 2.0 MB | source cards | — | verified map | — | 0.84 |
| v147 | पुण्याना (Punana) | सीकर · Rajasthan | 147 | 68.5 s | 2.2 MB | source cards | — | not verified | yes | 0.862 |
| v148 | धींगपुर (Dhingpur) | सीकर · Rajasthan | 148 | 74.3 s | 2.4 MB | source cards | — | verified map | — | 0.865 |
| v149 | खाटू श्याम (Khatu Shyam) | सीकर · Rajasthan | 149 | 67.9 s | 2.3 MB | source cards | — | verified map | — | 0.788 |
| v245 | मोहम्मद पुर जाटान (Mohammadpur Jatan) | बरेली · UttarPradesh | 245 | 68.7 s | 2.2 MB | source cards | — | not verified | — | 0.862 |
| v246 | कबूलपुर (Kabulpur) | रोहतक · Haryana | 246 | 74.7 s | 2.4 MB | source cards | — | not verified | — | 0.896 |
| v247 | समस पुर (Samaspur) | मेरठ · UttarPradesh | 247 | 77.9 s | 2.6 MB | source cards | — | not verified | — | 0.82 |

## How facts and images were sourced

**Scripts.** Six parallel writers worked from `SCRIPT-GUIDE.md`, using only the public village articles, the book's migration table and the record fields.
- Every narrated line cites `article:paragraph`, `book:P###` or `record`.
- `validate_scripts.py` passed all 46. Every citation resolves. Every number in a line appears literally in its cited text. Each script ends with the exact closing line.
- I hand-checked the name-like words that the validator couldn't match exactly. They are inflections or synonyms of words in the source, e.g. टीबा→टीबे, भूत-पूर्व→भूतपूर्व, मृत्यु→देहांत.
- Each manifest records the omissions, with reasons: possibly living people, family disputes, implausible figures, and the disputed 860/865 founder date.
- Where sources disagree, the line gives a neutral range or no year. For example, सिवाड़ा says 1700–1800 and सेहरा says 1800–1835.
- For अलखपुरा, the book names the arriving ancestor राम सिंह while the article says राम सुख. The line gives the year only, and the end card notes the difference.

**Images.** Opening montages use only the curated communal covers from `content/village-covers.json`, which are public village-gallery photos.
- They are labelled: "तस्वीरें: वर्तमान सामूहिक आयोजन/स्थल — ऐतिहासिक घटनाओं की तस्वीरें नहीं" (current gatherings/places, not pictures of historical events).
- No individual portrait is used. No photograph was fabricated.

**Fact scenes.** Each fact scene quotes, word for word, the sentence of the cited paragraph that the narration paraphrases, with an "article N, paragraph M" label.

**Maps.** Mini maps appear only for the 16 villages with verified coordinates (`content/village-geo.json`), and are labelled "अनुमानित स्थान" (approximate location) with the source ID.

## Re-voiced existing reels

| File | Length | Size | Speech check | Notes |
|---|---|---|---|---|
| `existing/luhach-history-hi.mp4` | 51.1 s | 9.6 MB | 0.861 | Same script and visuals as v12, re-timed to the male voice |
| `existing/luhach-history-hi.upload.mp4` | 51.1 s | 5.5 MB | — | CRF 28 copy. The full-quality file would break the 10 MB package limit again. |
| `existing/luhach-viewer-hi.mp4` | 48.4 s | 3.1 MB | 0.889 | See below |

**How the viewer reel was rebuilt.** It reuses the real screencast band from the v12 reel and re-times each narration step to the new voice. Doing this meant no new browser automation was needed. Titles, source line, end card and captions are redrawn.

**Matching files.** Each reel has a matching `.vtt` (Hindi captions) and `.jpg` poster in `existing/`. The narration text is unchanged from `community-platform/content/reels.json`.

## Validation (`renders-validation.json`)

**All 48 files pass:**
- H.264, 1080×1920, 30 fps
- AAC narration with no silent tracks (mean levels around −17 dB)
- WebVTT marked `Language: hi`, with cues in order, non-empty, and within the video
- a poster present for every file

**Contact sheets.** Every village has `villages/<slug>/contact.jpg`, sampled every 4 s. I reviewed representative ones: v106, v118, v144 and v147, plus the poster overview.

**Total size.** 151 MB for the 48 MP4s.

**Duration — honest note.**
- 13 villages fall within 45–75 s.
- 32 run 75–89 s.
- 1 (इगलास, very thin source) is 40 s.

The overrun is my sizing error. I gave the script writers 110–170 words per reel, which at this calm pace is 75–90 s. Tightening the pauses would save only about 5 s, and dropping sourced lines is an editorial cut, so I did neither. If shorter reels are wanted, the next step is to trim one or two lines per village in `scripts/` and re-run `render_all.py <slugs>`. Each village re-renders in about 1.5 minutes.

## Missing or blocked sources
- **Photos:** 35 villages have no curated communal photograph. Some have no photos at all; others have only portraits, logos or unrelated images. They use neutral cards; no image was invented.
- **Map locations:** 30 villages have no verified coordinates, including Nandha.
- **Empty articles:** 6 articles have no text (180, 197, 230, 237, 240, 242). They are covered as links within their village group.
- **Living people:** several articles name living people or present-day achievements. These were deliberately omitted (see the `omitted` field in each manifest).

## Public-ready outputs, per village

In `villages/<slug>/`:
- `<slug>.mp4`
- `<slug>.jpg` (poster)
- `<slug>.vtt` (Hindi captions)
- `manifest.json`, containing: article IDs and URLs, spellings, flags, uncertainty, voice settings, line-by-line text with citations and timings, images used, and omissions

`audio/`, `narration.wav` and `contact.jpg` are working files; don't publish them.

## Next integration step (Codex)
1. **Review** `all-village-posters.jpg`, a few contact sheets, and the `uncertainty` and `omitted` fields in `reels-index.json`.
2. **Copy** each village's `<slug>.mp4/.jpg/.vtt` into public media, for example `public/media/reels/villages/`. Wire each reel to its primary article and grouped article IDs, using a Watch block on the village page. Keep the full article as the main content.
3. **Replace** the two existing reels with `existing/luhach-history-hi.upload.mp4` (renamed to `luhach-history-hi.mp4`) and `existing/luhach-viewer-hi.mp4`, together with their new `.vtt` and posters. Update the durations in `content/reels.json` to 51.13 and 48.35.
4. **Package size:** the 46 village MP4s total about 140 MB, so the 10 MB upload limit will need a separate media upload route, or batching through the file manager. The source-only zip cannot carry them all.
5. **Commit, deploy and verify playback** on the test site. Only then call the reels public.
