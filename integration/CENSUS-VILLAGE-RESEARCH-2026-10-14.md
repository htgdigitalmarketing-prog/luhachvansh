# Census-backed village location research — 14.10.2026

## Result and limits

All 31 previously unlocated entries were reviewed against Col. Karambir Singh Luhach’s original book, the original public archive descriptions and Census 2011 location codes.

- **26 exact Census-code identity matches** now have approximate settlement coordinates joined by that exact code.
- **One additional approximate locality point** — Dan Shah Milak — is explicitly labelled a GeoNames locality without standalone Census village codes.
- **Historical Paintawas** is shown as the inferred current Kalan/Khurd area, with both independently Census-coded places061449/061448. The user authorised this working interpretation; no assertion that an undivided village is historically proved.
- **Three remain unplotted:** Nangla Ugrasen, Kadrabad’s ex-servicemen colony and Garhi Guldhar. Their reasons and rejected matches are displayed on the map page.

This is not a claim that all31 are independently identified Census villages. A parent village, same-name settlement or randomly chosen Kalan/Khurd is never substituted.

## Original source

Original file: `C:/Users/Admin/OneDrive/My Documents/luhach dynasty.zip`.
Entry: `luhach dynasty/लुहाच वंश का इतिहास 21 मई 2025 वर्ड/लुहाच वंश का इतिहास (1).docx`.
DOCX SHA256: `4fb30479ab20dd63775c88d0ffb16e4fff25a1ce6e93effb9be9514a338067b7`.
430 nonempty paragraphs, numbered from P0. The archive and DOCX were read without modification. No private account database, credential, recovery code, session or vault file was read for this task.

Official Census directory: https://censusindia.gov.in/nada/index.php/catalog/42648
Downloaded XLSX: https://censusindia.gov.in/nada/index.php/catalog/42648/download/46323/PC11_TV_DIR.xlsx

Coordinate extract: https://github.com/yashveeeeeeer/india-geodata/releases/tag/census/2011 — `Census_Villages.parquet`, an approximate-point dataset, not village polygons. Its exact village-code rows were cross-matched to the official XLSX, including state and village name. **The live NIC service timed out. These coordinates are sourced through the public extract, not claimed to be live government-verified.** The map states this limitation and separates Census identity links from coordinate-source links.

Locality coordinate: original GeoNames India gazetteer https://download.geonames.org/export/dump/IN.zip (CC BY). The Dan Shah point is a hollow marker and have no invented Census code.

## Significant resolutions

1. **Nandha**:061553, Badhra, 2011 Bhiwani; bookP110 gives current Charkhi Dadri. Approximate point28.44932,75.94152. Preserve both administrative eras.
2. **Punana / Punyana discrepancy**: bookP234 and the original article body say पुनाना, Jaipur/Jalsu. Census080280 Punana (2011 Amber/Jaipur) matches Bichpari, Nangal Ladi and Bishanpura nearby. Reject081866 Punyana in Sikar. The archive’s पुण्याना/Sikar fields remain unchanged; the map shows the discrepancy and uses the sourced Punana identity.
3. **Badarkha Sirbas**:121443, Shikarpur; bookP368’s Bikupur Ramnagar and Keratpur match. Reject121024 Badarkha, Anupshahr.
4. **Samaspur**:118923 Shamashpur, Mawana; bookP358’s Amarsinghpur, Narangpur and Atalpur match. Reject118788 Shamaspur and118682 Samaspur elsewhere.
5. **Bheevpura**:083961,Nawa; bookP229/230 and nearby Minda/Manda Bhimsingh match. Do not choose the similar Bhanwarpura name.
6. **Dariyapur**:115679 Daryapur Band, 2011 Moradabad/Sambhal; bookP410 neighbours Babu Khera/Dulahpur Band/Matipur match. Other Daryapur records are retained as distinct places.

## Remaining identification gaps

- **Nangla Ugrasen:** two UP revenue orders explicitly call it a hamlet of Kuchesar: https://vaad.up.nic.in/judgement/Print_Court_Order_External.aspx?login_type=AD&order_id=26245949 and order_id=21016113. Kuchesar120853 is the parent record; it is not given as the hamlet’s own code or exact point. BookP396/P398 corroborates the vicinity. Exact settlement point remains unestablished.
- **Kadrabad:** bookP157 describes a 1954 ex-servicemen colony near Turatpur,Murliwala,Chandika. Both exact-name Census records113436 and113772 are elsewhere. UP NHM’s https://upnrhm.gov.in/assets/site-files/asha/Compiled_Bijnor.pdf records Kadrabad subcentre serving Turatpur/Anwarpur Chandika. Precise colony point and own code remain unestablished; no arbitrary same-name point is used.
- **Paintawas historical interpretation:**061449 Pentawas Kalan and061448 Pantawas Khurd both exist. The relevant book account does not distinguish them. The user authorised a best inference of an older undivided village. Both current parts are shown as context, joined by a dashed connector, with inference explicitly unconfirmed.

- **Garhi Guldhar:** bookP347 says Sikrod east; GeoNames Garhi10265263 lies east of its Sikrod10265262 point, reversing that relation. Candidate rejected. The book explicitly says urban-absorbed; no own Census code established. Survey-of-India and PMGSY extracts did not yield an independently identified Garhi Guldhar point.

## Evidence and artifacts

Public review packet: `integration/CENSUS-VILLAGE-EVIDENCE-2026-10-14.json` (exact26 rows, code/state/district/tehsil, bookparagraph, retained coordinate row, source limitations).
Research originals, hashes, extraction and candidate/rejection files: `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/census-20261014/`.
Application data: `community-platform/content/village-geo.json`.
Map and source table: `community-platform/components/VillageMap.tsx`, styling in `VillageMap.css`.
Independent cross-check record: `C:/Users/Admin/Claude Memory/Virtual-IO/CROSSCHECK/2026-10-14-LUHACH-census-2011-village-identification-against-col-kar.md`.

## Validation and publication

101 tests passed before the additional Paintawas-area test; all four targeted mapping tests then passed, including regressions preventing wrong Punana/Badarkha/Samaspur matches, source-field overwrites, substituted parent pins and invented locality Census codes. Production build/type validation passed with the new source table and historical-area layer. Browser checks passed in Hindi/English at1366px and390px: no horizontal overflow,43 ordinary/locality points plus two labelled Paintawas part points,31 evidence-table rows,three unlocated entries. Source coverage:69routes,141records,221media/documentreferences,zero omitted paragraphs or media.

The checkout contains independently staged wiki work from another chat. This mapping patch preserves that work and uses a separate CSS file. No live Laravel/MySQL/private database changes. No deployment is claimed by this research document.

## Independent cross-check reconciliation

Claude independently reopened the original archive hash and relevant book paragraphs and confirmed the principal book readings. The bounded peer pass did not independently inspect all external Census/GIS files; no blanket peer certification is claimed. Codex then reopened the source passages and reconciled C1–C9 in the shared record: preserved book/Census administrative differences, rejected the Garhi candidate, kept bookChandika distinct from NHMAnwarpurChandika, and did not treat shared Ujhana/Dhundhwa prose or same-name father/son as established genealogy errors. Babu Khera/Daryapur extracted settlement points are not village-boundary bearings. GeoNamesCCBY4.0 and the extract publisher’s non-SHRUGCC0 declaration are recorded; no claims about independently verified upstream government licence terms.

A second search of SOI village-point and PMGSY habitation extracts confirmed both Paintawas parts but did not resolve NanglaUgrasen/Kadrabad/GarhiGuldhar. Research and rejected candidates are retained locally.

## Local review

Preview: http://localhost:3031/journey (separate production preview, current-host environment/private files preserved; no account actions).
Screenshots: `C:/Users/Admin/Projects/luhachvansh-integration/.local-integration/census-20261014/map-hi-1366.png`, `map-en-1366.png`, `map-hi-390.png`, `evidence-en-1366.png`.
Validation JSON: `.local-integration/census-20261014/browser-validation.json`, `render-coverage.json`.
Publication status: local implementation and GitHub patch; no Hostinger/live deployment performed by this mapping task. Unrelated staged wiki changes are preserved for the other chat.

Implementation commit: `aabbefb` (integration/test-community-20261012). Documentation follows in a separate commit; both remotes are updated after validation.
