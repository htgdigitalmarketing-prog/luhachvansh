# Intelligent Luhach Mitra — 12.10.2026

Mitra now uses the existing server-side Gemini connection to call bounded read-only archive tools. Visitors explicitly enable the intelligent assistant; public records and their short conversation context are sent to Gemini. Web research has a separate switch. API keys remain server-side and were not copied from other conversations or put in Git.

Tools find historical people in either language, retrieve recorded relatives, trace actual relationship paths, search original website paragraphs, focus a resolved person and filter the tree by village. Retrieval covers history, villages, about/Kuldevi, biographies, team, martyrs and news. Duplicate names are returned for clarification; the server refuses arbitrary viewer focus until a person is resolved uniquely, chosen by the visitor, or established through explicit relatives of a resolved person.

The viewer consumes validated commands and highlights the recorded relationship path or focuses the selected branch. Links from chat also open the relevant viewer selection when asked from another page. All operations are read-only and public-projection based; private contacts, children, new member submissions and authentication records remain unavailable. No relationship is added or corrected by the assistant.

Gemini Google Search grounding provides broader Luhach web answers with external source cards, grounding evidence markers and provider Search Suggestions in a script-disabled sandboxed frame. Web claims do not establish family relationships or identity merges. If search is unavailable or supplies no grounded sources, the local answer is retained with an explicit status. AI failures fall back to recorded answers. Conversation/tool rounds, request size and per-IP hourly use are bounded.

Validation: full existing suite plus first six assistant tests passed 51/51; the additional ambiguity enforcement test and all seven assistant tests passed after the final change. Production build passes. A real Gemini call found Loonga Ram, retrieved Lal Singh as his father and returned the correct focus command. A real Google-grounded Luhach query returned three external sources and Search Suggestions. Browser review in Hindi confirmed that asking Mitra to find Loonga Ram changed the viewer selection from Lal Singh to Loonga Ram and displayed the recorded father.

Only the isolated temporary Hostinger Node app is a staging target. The existing test-domain mapping blocker remains independent of this assistant upgrade; the live Laravel website and production MySQL are not changed.
