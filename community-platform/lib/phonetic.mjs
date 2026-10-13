// Local candidate matching only. A phonetic match never selects a person or changes an archive record.
const consonants={क:'k',ख:'kh',ग:'g',घ:'gh',ङ:'n',च:'ch',छ:'chh',ज:'j',झ:'jh',ञ:'n',ट:'t',ठ:'th',ड:'d',ढ:'dh',ण:'n',त:'t',थ:'th',द:'d',ध:'dh',न:'n',प:'p',फ:'ph',ब:'b',भ:'bh',म:'m',य:'y',र:'r',ल:'l',व:'v',श:'sh',ष:'sh',स:'s',ह:'h',ळ:'l'};
const vowels={अ:'a',आ:'aa',इ:'i',ई:'ee',उ:'u',ऊ:'oo',ए:'e',ऐ:'ai',ओ:'o',औ:'au',ऋ:'ri'};
const marks={'ा':'aa','ि':'i','ी':'ee','ु':'u','ू':'oo','े':'e','ै':'ai','ो':'o','ौ':'au','ृ':'ri'};
export function romanize(value){
 const chars=[...String(value||'').normalize('NFD')];let out='';
 for(let i=0;i<chars.length;i++){const c=chars[i];if(consonants[c]){let sound=consonants[c];if(chars[i+1]==='़'){sound=c==='ड'||c==='ढ'?'r':c==='ज'?'z':sound;i++;}out+=sound;
  if(chars[i+1]==='्')i++;else if(marks[chars[i+1]])out+=marks[chars[++i]];else out+='a';
 }else if(vowels[c])out+=vowels[c];else if(c==='ं'||c==='ँ')out+='n';else if(c!=='़'&&c!=='्'&&!marks[c])out+=c;}
 return out.toLowerCase().replace(/a(?=\s|$)/g,'').replace(/\s+/g,' ').trim();
}
const clean=s=>String(s||'').normalize('NFD').toLowerCase().replace(/[़\u200c\u200d]/g,'').replace(/\b(?:dr|shri|sri)\.?\s*/g,'').replace(/(?:\s+|^)(?:luhach|लुहाच)\s*$/,'').replace(/[\p{P}\p{S}]/gu,' ').replace(/\s+/g,' ').trim();
export const phoneticKey=s=>romanize(clean(s)).replace(/\bsinh\b/g,'singh').replace(/chh|ch/g,'c').replace(/sh/g,'s').replace(/ph/g,'f').replace(/[vw]/g,'b').replace(/q/g,'k').replace(/z/g,'j').replace(/([kgtdb])h/g,'$1').replace(/[aeiou\s]/g,'').replace(/(.)\1+/g,'$1');
function close(a,b){if(a===b)return true;if(a.length<4||b.length<4||Math.abs(a.length-b.length)>1)return false;let i=0,j=0,n=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++n>1)return false;if(a.length>=b.length)i++;if(b.length>=a.length)j++;}return n+(a.length-i)+(b.length-j)<=1;}
export function phoneticScore(query,values){
 const raw=String(query||'').trim().toLowerCase();if(!raw)return 0;
 const texts=(Array.isArray(values)?values:[values]).filter(Boolean).map(String);
 if(texts.some(s=>s.toLowerCase().includes(raw)))return 5;
 const q=clean(raw);if(q.length<2)return 0;
 if(texts.some(s=>clean(s).includes(q)))return 4;
 // Hindi queries keep exact spelling semantics; casual English spellings get candidate options.
 if(!/[a-z]/i.test(q)||/[\u0900-\u097f]/.test(q))return 0;
 const words=q.split(' ').filter(Boolean), keys=words.map(phoneticKey);
 if(keys.some(k=>k.length<2))return 0;
 let best=0;for(const t of texts){const k=phoneticKey(t),parts=romanize(t).split(' ').map(phoneticKey);
  if(phoneticKey(q)===k)best=Math.max(best,3);
  else if(keys.every(key=>parts.some(p=>p===key||p.startsWith(key))))best=Math.max(best,2);
  else if(q.length>=4&&keys.every(key=>parts.some(p=>close(key,p))))best=Math.max(best,1);
 }return best;
}
export function searchRecords(records,query,village=''){
 if(!String(query||'').trim())return[];
 return records.filter(p=>!village||p.villageName===village||(p.villages||[]).includes(village))
  .map(p=>{const values=[p.name,p.nameEnglish,p.aliases,p.villageName,p.villageEnglish,p.genealogyId];return {p,score:phoneticScore(query,[...values,values.filter(Boolean).join(' ')])};})
  .filter(r=>r.score).sort((a,b)=>b.score-a.score).slice(0,12).map(r=>r.p);
}
