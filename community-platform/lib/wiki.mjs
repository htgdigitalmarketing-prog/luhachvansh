import {wikiPages} from '../content/wiki.mjs';
import {villageSpellings} from './villages.mjs';
export {wikiPages};
export const wikiBySlug=slug=>wikiPages.find(page=>page.slug===slug)||null;
export function wikiIndex(villages=[]){return [
 ...wikiPages.map(p=>({href:'/wiki/'+p.slug,title:p.title,summary:p.summary,category:p.category,search:[p.title.hi,p.title.en,p.summary.hi,p.summary.en,...p.sections.flatMap(s=>[s.title.hi,s.title.en])].join(' ')})),
 ...villages.map(v=>{const spellings=villageSpellings(v.id,v.name),english=spellings.find(s=>/[a-z]/i.test(s)&&!/[ऀ-ॿ]/.test(s));return {href:'/wiki/village/'+encodeURIComponent(v.id),title:{hi:v.name,en:english||v.name},summary:{hi:`मूल गाँव-लेख ${v.id} · इतिहास और स्मृतियाँ`,en:`Original village article ${v.id} · history and memories`},category:'village',search:[v.name,...spellings,v.id].join(' ')};})
 ];}
export function searchWiki(entries,query='',category='all'){const words=String(query).normalize('NFC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);return entries.filter(e=>(category==='all'||e.category===category)&&words.every(w=>e.search.normalize('NFC').toLocaleLowerCase().includes(w)));}
