# Luhach Vansh wiki — 14.10.2026

The wiki is a bilingual encyclopedia inside the existing community app. `/wiki` is its searchable hub, `/wiki/<slug>` holds ten connected topic guides, and `/wiki/village/<original-id>` holds one entry for each original village article. The existing archive remains the full source reader.

The topic series covers identity, history, migration, villages, family records, traditions, people, memories, sources, and contribution. Each topic has a table of contents, section-level source links and related reading. The hub offers a suggested reading sequence and searches Hindi/English titles and source-backed village aliases. Village entries retain separate source IDs, including duplicate-name articles, and link to the original text, media and documents. The original article’s first two paragraphs are excerpts, with English translation fallback disclosed.

Topic guides live in `community-platform/content/wiki.mjs` and are versioned with code. `lib/wiki.mjs` resolves pages and creates the search catalogue. Server-rendered village entries use the existing read-only public heritage projection; they do not read member contacts, messages or private family tables. Client search receives only the public catalogue. No new database tables, migrations, user roles or anonymous write endpoints are required. Accepted contributions continue through existing member tools; the wiki is not an unrestricted public editor.

Historical prose is attributed to the existing book/archive. Origin traditions remain traditions, 860/865 founder-date variants remain unresolved, and paragraph references remain distinct from printed page numbers. No dates, personal details or genealogy links are inferred. Per-section links let readers return to the complete source context.

Deploy the source package to the existing isolated test.luhachvansh.com Node app using its current persistent database and environment. This request authorizes making the wiki live there. The original Laravel production host is outside the code target. Rollback uses the preceding v20 source deployment; persistent archive/member storage is unaffected. The test host retains its existing noindex policy.

Further expansion can add sourced thematic articles and richer village summaries through the same content schema. An edit/revision workflow would be a later feature requiring review controls; it is not represented as already available.

## Public publishing fallback

Hostinger repeatedly failed to prepare its upload service on 14.10.2026, before accepting the source package. The wiki was therefore published separately at **https://admirable-kitten-6793df.netlify.app/** in Ajay Luhach's existing Netlify account. Project ID: `606097a9-45c7-4ef7-b183-6723216a41a4`. The public site is static HTML, CSS and JavaScript: no SQLite, member accounts, private records, secrets or server functions.

`integration/build-wiki-static.mjs` generates this edition from the same ten topic guides and the existing read-only public heritage projection. It exports 56 village excerpts and their source-backed aliases, never member tables. Source links point back to test.luhachvansh.com. Hindi/English switching and search are implemented locally in the browser. Rebuild from the repository root with an explicit `LUHACH_HERITAGE_DB` pointing to the existing archive; the output defaults to ignored `.local-integration/wiki-static`. Upload only the generated static output to this existing Netlify project. `.netlify` is excluded by the generated output's `.gitignore`.

The first production deploy was `6ace83f38c2654828704cc86`, followed by the CSS correction `6ace84f9039c80dcdc5689d5`. Netlify shows the latter as currently published. The integrated Node package remains ready for Hostinger, but has not been deployed there. Moving the wiki to the main/custom domain is a separate hosting operation; no DNS change was made.
