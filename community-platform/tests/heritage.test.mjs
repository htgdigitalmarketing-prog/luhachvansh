import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readHeritage,textOnly,heritageDistricts} from '../lib/heritage.mjs';

test('public heritage is a read-only projection and excludes form contacts and military identifiers',()=>{
 const directory=mkdtempSync(join(tmpdir(),'luhach-heritage-')),path=join(directory,'archive.sqlite');
 const before=process.env.LUHACH_HERITAGE_DB;
 const db=new DatabaseSync(path);
 db.exec('CREATE TABLE legacy_records(source_table TEXT,source_id TEXT,payload TEXT); CREATE TABLE legacy_media(id TEXT,path TEXT,mime TEXT,source_path TEXT);');
 const insert=(t,id,p)=>db.prepare('INSERT INTO legacy_records VALUES(?,?,?)').run(t,id,JSON.stringify(p));
 insert('district','1',{district:'रोहतक',state_name:'1'});
 insert('about','1',{para:'<p>परिवार का परिचय</p>',image_one_path:''});
 insert('join_us','1',{contact_number:'PRIVATE-FORM-PHONE',email:'private@example.test',message:'PRIVATE-FORM-MESSAGE'});
 insert('team','1',{name:'टीम सदस्य',phone:'PRIVATE-TEAM-PHONE',village:'गाँव'});
 insert('members','1',{name:'प्रतिभा',photo:'',achievements:'उपलब्धि',current_city:'PRIVATE-CURRENT-LOCATION'});
 insert('shaheed','1',{name:'वीर',army_no:'PRIVATE-SERVICE-ID'});
 db.close();process.env.LUHACH_HERITAGE_DB=path;
 try{const result=readHeritage(),serialized=JSON.stringify(result);assert.equal(result.about[0].text,'परिवार का परिचय');assert.equal(result.team[0].name,'टीम सदस्य');assert.equal(heritageDistricts()['1'],'रोहतक');assert.ok(!serialized.includes('PRIVATE-'));assert.ok(!serialized.includes('private@example.test'));const check=new DatabaseSync(path,{readOnly:true});assert.equal(check.prepare('SELECT COUNT(*) n FROM legacy_records').get().n,6);check.close();}
 finally{if(before===undefined)delete process.env.LUHACH_HERITAGE_DB;else process.env.LUHACH_HERITAGE_DB=before;rmSync(directory,{recursive:true,force:true});}
});
test('legacy rich text is converted to paragraphs without executing source markup',()=>{
 assert.equal(textOnly('<style>body{display:none}</style><p>हमारा&nbsp;गाँव</p><script>alert(1)</script><p>बेटी &#x915; &amp; परिवार</p>'),'हमारा गाँव\n\nबेटी क & परिवार');
 assert.equal(textOnly('<img src=x onerror=alert(1)>स्मृति'),'स्मृति');
});
