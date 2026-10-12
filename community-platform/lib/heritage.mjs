import { DatabaseSync } from 'node:sqlite';
import { existsSync,readFileSync,statSync } from 'node:fs';
import { resolve,dirname } from 'node:path';
import {createHash} from 'node:crypto';
let cachedTranslations={},cachedStamp='',cachedFile='';
export function englishText(value){
 const source=String(value??'');
 const dbPath=process.env.LUHACH_HERITAGE_DB||process.env.LUHACH_MEMBER_DB||resolve('data/members.sqlite');
 const file=resolve(dirname(dbPath),'heritage-en.json');
 if(!existsSync(file))return source;
 const stamp=String(statSync(file).mtimeMs);
 if(stamp!==cachedStamp||file!==cachedFile){try{cachedTranslations=JSON.parse(readFileSync(file,'utf8'));cachedStamp=stamp;cachedFile=file;}catch{return source;}}
 return source.split(/\n+/).map(p=>cachedTranslations[createHash('sha256').update(p).digest('hex')]||p).join('\n\n');
}
export function englishTexts(values){englishText('');return values.map(value=>String(value??'').split(/\n+/).map(p=>cachedTranslations[createHash('sha256').update(p).digest('hex')]||p).join('\n\n'));}

// Read the captured content without opening accounts, contacts or private forms.
export function openHeritage() {
  const path = process.env.LUHACH_HERITAGE_DB || process.env.LUHACH_MEMBER_DB || resolve('data/members.sqlite');
  if (!existsSync(path)) return null;
  const db = new DatabaseSync(path, { readOnly: true });
  if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='legacy_records'").get()) { db.close(); return null; }
  return db;
}
export function textOnly(value='') {
  return String(value ?? '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'')
    .replace(/<\/?(?:p|div|h[1-6]|li|br|tr)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'')
    .replace(/\\r\\n|\\n/g,'\n').replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>{const c=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return c>0&&c<=0x10ffff?String.fromCodePoint(c):'';})
    .replace(/&(nbsp|amp|quot|apos|lt|gt);/g,(_,n)=>({nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'})[n])
    .replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
export const sections = {
  about:'हमारे बारे में', history:'लुहाच वंश का इतिहास', kuldevi:'कुलदेवी',
  villages:'हमारे गाँव', gallery:'तस्वीरें और स्मृतियाँ', news:'समाचार',
  team:'हमारी टीम', achievers:'समाज की प्रतिभाएँ', shaheed:'हमारे शहीद',
};
const pathKey = p => String(p||'').replace(/\\/g,'/').replace(/^\/?public\//,'').replace(/^\//,'');
export function readHeritage() {
  const db=openHeritage(); if(!db)return null;
  try {
    const rows=table=>db.prepare('SELECT source_id,payload FROM legacy_records WHERE source_table=? ORDER BY CAST(source_id AS INTEGER)').all(table).map(r=>({...JSON.parse(r.payload),sourceId:r.source_id}));
    const media=db.prepare('SELECT id,path,mime,source_path FROM legacy_media').all();
    const photo=p=>{const m=media.find(m=>pathKey(m.source_path)===pathKey(p));return m?{id:m.id,mime:m.mime,url:'/api/heritage-media?id='+encodeURIComponent(m.id)}:null;};
    const basic=r=>({id:String(r.sourceId),name:textOnly(r.name),village:textOnly(r.village),district:textOnly(r.district),state:textOnly(r.state)});
    const villagePhotos=rows('village_gallery');
    return {
      about:rows('about').map(r=>({id:String(r.sourceId),text:textOnly(r.para),photos:[r.image_one_path,r.image_two_path].map(photo).filter(Boolean)})),
      history:rows('history').map(r=>({id:String(r.sourceId),text:textOnly(r.history)})),
      villages:rows('village').map(r=>({id:String(r.sourceId),name:textOnly(r.village),state:textOnly(r.state),district:textOnly(r.district),text:textOnly(r.description),document:photo(r.pdf_file),photos:villagePhotos.filter(p=>String(p.village_id)===String(r.id)).map(p=>photo(p.image_path)).filter(Boolean)})),
      gallery:rows('gallery').map(r=>({id:String(r.sourceId),photo:photo(r.images)})).filter(r=>r.photo),
      news:rows('news').reverse().map(r=>({id:String(r.sourceId),title:textOnly(r.news_title),text:textOnly(r.news),date:String(r.create_at||'').slice(0,10)})),
      team:rows('team').map(r=>({...basic(r),post:textOnly(r.post),profession:textOnly(r.profession)})),
      achievers:rows('members').map(r=>({id:String(r.sourceId),name:textOnly(r.name),village:textOnly(r.belong_from),profession:textOnly(r.profession),text:textOnly(r.achievements),photo:photo(r.photo)})),
      shaheed:rows('shaheed').filter(r=>!r.delete_at).map(r=>({...basic(r),father:textOnly(r.father_name),post:textOnly(r.post),unit:textOnly(r.unit),operation:textOnly(r.operation)})),
      originalTree:photo('frontend/img/vanshavali.png'),
    };
  } finally {db.close();}
}
