import aliases from '../content/village-aliases.json' with {type:'json'};
// Source-backed village spellings (content/village-aliases.json). Matching is exact on a loose key that only
// folds Unicode presentation differences (nukta, chandrabindu/anusvara, joiners, case, punctuation); it never
// guesses. Same-name villages in different districts stay separate entries and are reported as ambiguous.
export const looseVillage=v=>String(v??'').normalize('NFD').replace(/[़‌‍]/g,'').replace(/ँ/g,'ं').normalize('NFC').toLowerCase().replace(/[\p{P}\p{S}]/gu,' ').replace(/\s+/g,' ').trim();
const entries=aliases.villages.map(v=>({...v,keys:new Set([v.canonical,v.english,...v.spellings.map(s=>s.spelling)].filter(Boolean).map(looseVillage))}));
export function villageEntries(query,data=entries){const q=looseVillage(query);return q?data.filter(v=>v.keys.has(q)):[];}
// One village name (spelling-insensitive) may still cover several district entries; `ambiguous` says so.
export function resolveVillage(query,data=entries){const found=villageEntries(query,data),names=[...new Set(found.map(v=>v.canonical))];return {entries:found,canonical:names.length===1?names[0]:null,ambiguous:found.length>1,archiveSpelling:found.map(v=>v.archiveSpelling).find(Boolean)||null,notes:found.flatMap(v=>v.ambiguous.map(a=>a.reason))};}
// Stable comparison key for a village name: the canonical name when the spelling is attested, else the loose form.
export const villageKey=v=>{const r=resolveVillage(v);return r.canonical?looseVillage(r.canonical):looseVillage(v);};
export function villageSpellings(recordId,name=''){const own=entries.filter(v=>v.records.includes(String(recordId))),list=own.length?own:villageEntries(name);return [...new Set(list.flatMap(v=>[v.canonical,v.english,...v.spellings.map(s=>s.spelling)]).filter(Boolean))];}
export function villageCounts(records){const keys=new Set(records.map(r=>{const own=entries.find(v=>v.records.includes(String(r.id)));return own?looseVillage(own.canonical):villageKey(r.name);}));return {articles:records.length,places:keys.size};}
