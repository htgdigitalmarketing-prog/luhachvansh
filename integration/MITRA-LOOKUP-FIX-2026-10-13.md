# Mitra lookup correction — 13.10.2026

The user reported that a name/village lookup returned generic passages and “AI unavailable” despite enabling Gemini. Reproduction and sanitized provider tracing established that Gemini was responding normally: it tried several village/name spellings, then the fourth tool round ended with another tool request. The application never made a final synthesis call and mislabeled the bounded search as provider unavailability.

The bounded tool loop now always gets a final tool-free synthesis request when no answer has been written. Provider failure and empty-answer fallback messages are distinct, retain collected evidence and candidates, and no longer discard fallback sources or candidate matches. The model is told that a candidate archive match does not establish the visitor's identity or link a same-name biography automatically.

Search recognizes Gugaheri/Gugahedi and the corresponding Hindi spelling variants as search aliases while retaining original archive names. A trailing Luhach surname can be omitted when searching this gotra-specific archive's given-name entries. Duplicate-name clarification and validated viewer commands remain enforced.

The exact reported query succeeded with the real Gemini API, returned the matching archive candidate, recorded family details and correct viewer focus command. Production build and all 54 tests passed, including regressions for village spelling, unchanged source records and final synthesis after all four tool rounds. No new API credential or provider change was needed. All changes concern the isolated community app; original Laravel source and production MySQL remain unchanged.
