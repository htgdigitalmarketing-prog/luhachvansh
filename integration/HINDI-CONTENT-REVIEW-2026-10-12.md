# Hindi content restoration — 12.10.2026

The local alternative now displays the captured website content on visitor pages, instead of limiting it to the admin source-review screen. The default document language, navigation, home page, member forms, community controls and dynasty-viewer instructions are Hindi.

## Visible content

- `/heritage/about`, `/heritage/kuldevi`: the two original introduction/tradition records and available images.
- `/heritage/history`: the original historical article.
- `/heritage/villages`: 56 source entries, searchable by village/district and filterable by state. Detail pages include their complete text, 46 linked original documents and 93 available village photos.
- `/heritage/gallery`: 49 validated gallery images.
- `/heritage/news`: five original news records.
- `/heritage/team`, `/heritage/achievers`, `/heritage/shaheed`: 23 team entries, 77 public biographies/achievements and five memorial entries. Private form submissions, phone numbers, current member locations and military identifiers are excluded from this public projection.
- `/vanshavali`: the interactive viewer/Jarvis, plus the original website's chart. The home page's primary action and main navigation open the viewer. Interactive person records remain subject to login, family verification and existing privacy rules; the previously public chart is viewable without login.

Legacy reader URLs such as `/history`, `/present`, `/memories`, `/evolution` and `/news_details/:id` redirect to their equivalent pages. Imported rich text is rendered as plain paragraphs; source scripts, style directives and handlers are not executed. Media is served only by validated hashed IDs referenced by the public content projection, from outside the public directory.

## Storage and incomplete source files

`LUHACH_HERITAGE_DB` optionally selects a read-only content snapshot. Otherwise the app reads the legacy tables inside `LUHACH_MEMBER_DB`; the already uploaded isolated staging database has these tables. Its `legacy-media` folder must stay beside the SQLite snapshot. No exported data or private environment values are committed to Git.

Five nonempty village-photo references point to files absent from the captured image archives. One gallery row points to a PHP file rather than an image; it remains quarantined. These source issues are preserved for review. Numeric/ambiguous state values are labelled unclear in the reader interface rather than guessed.

Preserved biographies are original website material, not verified member accounts or identity merges. The 77 profile reconciliation candidates remain for independent review.

## Validation and deployment status

- 44 tests passed, including new read-only public projection/privacy and rich-text handling tests.
- Production build passed, including the heritage pages and media route.
- Local HTTP checks passed for all nine content sections, a village detail, home, login, community and viewer; invalid section returned 404.
- 93 linked images/documents checked through the HTTP media route returned 200. Traversal input was refused. Legacy redirects returned 307.
- Hindi home and village listing checked at 390px viewport without horizontal overflow; home image loaded. Screenshots remain private under `.local-integration/screenshots/`.

Review locally at `http://localhost:3023/`. These corrections have not been uploaded to the temporary Hostinger app yet. The separate custom-domain cutover blocker remains: Hostinger must detach the existing test mapping while preserving production MySQL, files and email before connecting the Node app. Production is unchanged.
