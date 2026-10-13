import {DatabaseSync} from 'node:sqlite';
import {existsSync,statSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {graphData} from './viewer.mjs';
import {Problem} from './store.mjs';
import {englishTexts} from './heritage.mjs';
// Privacy-safe cache. Each database keeps one long-lived read-only connection; `PRAGMA data_version`
// changes after every commit made by any other connection, including WAL commits that leave the main
// file's mtime untouched. File identity (inode/birth time) reopens a replaced file. A privacy withdrawal
// therefore invalidates the cached graph on the very next request; nothing is served from a stale version.
const handles=new Map();let cached=null;
function versionOf(path){
 const st=statSync(path),identity=`${st.ino}:${st.birthtimeMs}`;let h=handles.get(path);
 if(!h||h.identity!==identity){try{h?.db.close();}catch{}h={db:new DatabaseSync(path,{readOnly:true}),identity};handles.set(path,h);}
 return {db:h.db,version:`${identity}:${h.db.prepare('PRAGMA data_version').get().data_version}:${st.size}:${st.mtimeMs}`};
}
export function resetViewerCache(){for(const h of handles.values())try{h.db.close();}catch{}handles.clear();cached=null;}
export function publicViewerData(){
 const path=resolve(process.env.LUHACH_HERITAGE_DB||process.env.LUHACH_MEMBER_DB||'data/members.sqlite');
 if(!existsSync(path))throw new Problem('Archive unavailable.',503);
 const memberPath=process.env.LUHACH_MEMBER_DB&&resolve(process.env.LUHACH_MEMBER_DB)!==path&&existsSync(process.env.LUHACH_MEMBER_DB)?resolve(process.env.LUHACH_MEMBER_DB):'';
 const english=resolve(dirname(path),'heritage-en.json'),englishStamp=existsSync(english)?statSync(english).mtimeMs:0;
 const archive=versionOf(path),members=memberPath?versionOf(memberPath):null,key=[path,archive.version,memberPath,members?.version,englishStamp].join('|');
 if(cached?.key===key)return cached.data;
 const hidden=new Set();
 if(members){const m=members.db;if(m.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='profile_privacy'").get())for(const p of m.prepare("SELECT person_id FROM profile_privacy WHERE audience='private' OR life='child'").all())hidden.add(p.person_id);
  for(const p of m.prepare('SELECT id FROM people WHERE active=0').all())hidden.add(p.id);}
 const data=publicGraph(archive.db,hidden);cached={key,data};return data;
}
export function publicGraph(db,hidden=new Set()){
 const privacy=!!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='profile_privacy'").get();
 const people=db.prepare("SELECT id,legacy_id,name,aliases,gender,village,generation FROM people p WHERE active=1 AND kind='archive'"+(privacy?" AND NOT EXISTS(SELECT 1 FROM profile_privacy v WHERE v.person_id=p.id AND (v.audience='private' OR v.life='child'))":"")).all().filter(p=>!hidden.has(p.id));
 const ids=new Set(people.map(p=>p.id));
 const edges=db.prepare('SELECT id,a,b,type,role FROM relationships WHERE active=1').all().filter(e=>ids.has(e.a)&&ids.has(e.b));
 const data=graphData(people,edges),names=englishTexts(data.records.map(p=>p.name)),villages=englishTexts(data.records.map(p=>p.villageName));
 return {...data,records:data.records.map((p,i)=>({...p,nameEnglish:names[i],villageEnglish:villages[i]})),notice:'Public historical archive. Private profiles, children, contacts and new member submissions are excluded.'};
}
export function publicFamily(data,id){
 const p=data.records.find(p=>p.id===id);if(!p)throw new Problem('Person not found',404);
 const small=(p,relationship)=>({id:p.id,name:p.name,nameEnglish:p.nameEnglish,village:p.villageName,relationship});
 const parents=data.edges.filter(e=>e.type==='parent'&&e.b===id),lookup=new Map(data.records.map(p=>[p.id,p]));
 const parentIds=new Set(parents.map(e=>e.a)),spouses=new Set(),children=new Set(),siblings=new Set();
 for(const e of data.edges){if(e.type==='spouse'){if(e.a===id)spouses.add(e.b);if(e.b===id)spouses.add(e.a);}else if(e.type==='parent'){if(e.a===id)children.add(e.b);if(parentIds.has(e.a)&&e.b!==id)siblings.add(e.b);}}
 const people=(ids,relation)=>[...ids].map(id=>small(lookup.get(id),relation));
 return {person:small(p),parents:parents.map(e=>small(lookup.get(e.a),e.role||'parent')),spouses:people(spouses,'spouse'),children:people(children,'child'),siblings:people(siblings,'sibling')};
}
// Adjacency is derived once per graph object; a new graph (after any data change) gets a fresh index.
const indexes=new WeakMap();
function linkIndex(data){let i=indexes.get(data);if(i)return i;const records=new Map(data.records.map(p=>[p.id,p])),links=new Map();for(const e of data.edges){for(const [a,b,relation] of [[e.a,e.b,e.type==='spouse'?'spouse':'child'],[e.b,e.a,e.type==='spouse'?'spouse':e.role||'parent']]){const list=links.get(a)||[];list.push({id:b,relation});links.set(a,list);}}i={records,links};indexes.set(data,i);return i;}
export function publicLineage(data,from,to){
 const {records,links}=linkIndex(data);
 if(!records.has(from)||!records.has(to))throw new Problem('Person not found',404);
 const queue=[from],paths=new Map([[from,[]]]);for(let i=0;i<queue.length;i++){const a=queue[i],steps=paths.get(a);if(a===to)return {found:true,steps:steps.map(s=>({...s,person:{id:s.id,name:records.get(s.id).name}}))};if(steps.length>=1000)continue;for(const next of links.get(a)||[]){if(!paths.has(next.id)){paths.set(next.id,[...steps,next]);queue.push(next.id);}}}
 return {found:false,message:'No public recorded path was found. Missing or private links are not inferred.'};
}
