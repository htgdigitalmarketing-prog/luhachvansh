# Luhach Vansh wiki — 14.10.2026

The wiki is a bilingual encyclopedia inside the existing community app. `/wiki` is its searchable hub, `/wiki/<slug>` holds ten connected topic guides, and `/wiki/village/<original-id>` holds one entry for each original village article. The existing archive remains the full source reader.

The topic series covers identity, history, migration, villages, family records, traditions, people, memories, sources, and contribution. Each topic has a table of contents, section-level source links and related reading. The hub offers a suggested reading sequence and searches Hindi/English titles and source-backed village aliases. Village entries retain separate source IDs, including duplicate-name articles, and link to the original text, media and documents. The original article’s first two paragraphs are excerpts, with English translation fallback disclosed.

Topic guides live in `community-platform/content/wiki.mjs` and are versioned with code. `lib/wiki.mjs` resolves pages and creates the search catalogue. Server-rendered village entries use the existing read-only public heritage projection; they do not read member contacts, messages or private family tables. Client search receives only the public catalogue. No new database tables, migrations, user roles or anonymous write endpoints are required. Accepted contributions continue through existing member tools; the wiki is not an unrestricted public editor.

Historical prose is attributed to the existing book/archive. Origin traditions remain traditions, 860/865 founder-date variants remain unresolved, and paragraph references remain distinct from printed page numbers. No dates, personal details or genealogy links are inferred. Per-section links let readers return to the complete source context.

Deploy the source package to the existing isolated test.luhachvansh.com Node app using its current persistent database and environment. This request authorizes making the wiki live there. The original Laravel production host is outside the code target. Rollback uses the preceding v20 source deployment; persistent archive/member storage is unaffected. The test host retains its existing noindex policy.

Further expansion can add sourced thematic articles and richer village summaries through the same content schema. An edit/revision workflow would be a later feature requiring review controls; it is not represented as already available.
