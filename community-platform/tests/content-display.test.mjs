import test from 'node:test';
import assert from 'node:assert/strict';
import {emphasisSegments} from '../lib/emphasis.mjs';
import {villageCover} from '../lib/village-covers.mjs';
import {resolveVillage,villageKey,villageCounts,villageSpellings} from '../lib/villages.mjs';
import covers from '../content/village-covers.json' with {type:'json'};
import migration from '../content/migration.json' with {type:'json'};
const marked=t=>emphasisSegments(t).filter(s=>s.kind!=='text').map(s=>[s.text,s.kind]);
test('dates and quantities are emphasised as whole values without changing the text',()=>{
 assert.deepEqual(marked('लगभग 20,000 बीघा जमीन'),[['20,000','number']]);
 assert.deepEqual(marked('(860 ईस्वी-2025 ईस्वी) 1165 साल'),[['860','date'],['2025','date'],['1165','number']]);
 assert.deepEqual(marked('865 ईस्वी (विक्रम संवत 922)'),[['865','date'],['922','date']]);
 assert.deepEqual(marked('10 June 1971 को और 21 मई 2025'),[['10 June 1971','date'],['21 मई 2025','date']]);
 assert.deepEqual(marked('मोबाइल 9876543210'),[]);
 for(const t of ['लगभग 20,000 बीघा जमीन','सन 1947 में','कुल 8 लोग'])assert.equal(emphasisSegments(t).map(s=>s.text).join(''),t);
});
test('village covers use only curated communal photos that belong to that village',()=>{
 const photo=(id)=>({id,mime:'image/jpeg',url:'/api/heritage-media?id='+id});
 const config={villages:{'7':{slides:[{id:'crowd',scene:'gathering'},{id:'missing',scene:'temple'},{id:'odd',scene:'portrait'}]}}};
 const slides=villageCover({id:'7',photos:[photo('portrait-first'),photo('crowd'),photo('odd')]},config);
 assert.deepEqual(slides.map(s=>s.photo.id),['crowd'],'the first photo is never used by default; unknown scenes and absent photos are dropped');
 assert.deepEqual(villageCover({id:'8',photos:[photo('portrait-first')]},config),[],'no curated communal photo means a neutral place card');
 for(const [id,v] of Object.entries(covers.villages)){assert.ok(v.slides.length>0,id);for(const s of v.slides)assert.ok(['gathering','temple','landscape','memorial'].includes(s.scene),id);}
 assert.ok(!covers.villages['106'].slides.some(s=>s.id.startsWith('431a1255ce')),'Gugaheri cover never uses the individual portrait');
});
test('village spellings resolve only through attested aliases, keeping ambiguity visible',()=>{
 assert.equal(villageKey('नाँधा'),villageKey('नान्धा'));
 assert.equal(resolveVillage('पाडला').canonical,'पाढ़ला');
 assert.equal(resolveVillage('उझाना').canonical,'उझाणा');
 assert.equal(resolveVillage('ढुँढ़वा').canonical,'ढूँढवा');
 assert.equal(resolveVillage('उग्रसैन').canonical,null,'a personal name is not treated as a village');
 assert.equal(resolveVillage('मारोत').ambiguous,true,'same name in two districts stays ambiguous');
 assert.equal(resolveVillage('मारोत').archiveSpelling,'मारोत');
 assert.ok(villageSpellings('104').includes('नाँधा'));
});
test('village count distinguishes articles from places',()=>{
 const rows=[{id:'104',name:'नान्धा'},{id:'230',name:'नान्धा'},{id:'128',name:'गहना'},{id:'240',name:'Gahna'},{id:'105',name:'गिरावड़'}];
 assert.deepEqual(villageCounts(rows),{articles:5,places:3});
});
test('migration content keeps every book row with its paragraph citation',()=>{
 assert.equal(migration.table.rows.length,16);
 for(const r of migration.table.rows){assert.match(r.cite,/^P1(1[5-9]|2\d|30)$/);assert.ok(r.year>=1500&&r.year<=1875);}
 assert.ok(migration.variants.some(v=>v.id==='founder'&&v.en.includes('865')&&v.en.includes('860')),'both founder dates are kept');
});
test('English text reports untranslated Hindi paragraphs as fallbacks',async()=>{
 const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs');const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {createHash}=await import('node:crypto');
 const {englishWithStatus}=await import('../lib/heritage.mjs');const dir=mkdtempSync(join(tmpdir(),'translation-')),saved=process.env.LUHACH_HERITAGE_DB;
 try{process.env.LUHACH_HERITAGE_DB=join(dir,'archive.sqlite');writeFileSync(join(dir,'heritage-en.json'),JSON.stringify({[createHash('sha256').update('अनुवादित अनुच्छेद').digest('hex')]:'Translated paragraph'}));
  assert.deepEqual(englishWithStatus('अनुवादित अनुच्छेद'),{text:'Translated paragraph',fallback:false});
  assert.deepEqual(englishWithStatus('नया अनुच्छेद'),{text:'नया अनुच्छेद',fallback:true});
  assert.equal(englishWithStatus('Already English').fallback,false);
 }finally{if(saved===undefined)delete process.env.LUHACH_HERITAGE_DB;else process.env.LUHACH_HERITAGE_DB=saved;rmSync(dir,{recursive:true,force:true});}
});
