import test from 'node:test';
import assert from 'node:assert/strict';
import {HubStore} from '../lib/hub.mjs';
import {viewerData} from '../lib/viewer.mjs';
import {localGuard,secureSession} from '../lib/guard.mjs';
import {resolve} from 'node:path';
test('viewer includes explicit mother/spouse edges but never private people, contacts or inferred names',()=>{
 const db=new HubStore(':memory:');
 db.run('INSERT INTO accounts VALUES(?,?,?)','reader','Reader','member');
 db.run('INSERT INTO credentials VALUES(?,?,?,?,?,?)','reader','reader','unused','unused',1,Date.now());
 for(const [id,name,kind] of [['mother','Mother','archive'],['daughter','Daughter','archive'],['spouse','Spouse','archive'],['hidden','Private','community']])db.run('INSERT INTO people(id,name,gender,village,source,notes,kind) VALUES(?,?,?,?,?,?,?)',id,name,'unknown','Village','private evidence','secret notes',kind);
 for(const [a,b,type,role] of [['mother','daughter','parent','mother'],['daughter','spouse','spouse',null],['hidden','daughter','parent','father']])db.run('INSERT INTO relationships(id,a,b,type,role,source) VALUES(?,?,?,?,?,?)',a+b,a,b,type,role,'private evidence');
 const data=viewerData(db,'reader');assert.equal(data.records.length,3);assert.equal(data.edges.length,2);
 const p=data.records.find(p=>p.id==='daughter');assert.deepEqual(p.parentIds,['mother']);assert.deepEqual(p.spouseIds,['spouse']);assert.equal(p.fatherName,null);
 assert.ok(!JSON.stringify(data).includes('secret'));assert.ok(!JSON.stringify(data).includes('private evidence'));assert.ok(!JSON.stringify(data).includes('hidden'));
 db.run('UPDATE credentials SET verified=0 WHERE account_id=?','reader');assert.throws(()=>viewerData(db,'reader'),/verification/i);db.close();
});
test('staging guard permits only exact test host, HTTPS and same-origin mutations',()=>{
 const env={LUHACH_DEPLOYMENT:'test',LUHACH_MEMBER_DB:resolve('data/test.sqlite')};
 const request=(host,origin,proto='https')=>({headers:new Headers({host,'x-forwarded-proto':proto,...origin?{origin}:{}})});
 assert.doesNotThrow(()=>localGuard(request('test.luhachvansh.com','https://test.luhachvansh.com'),'0',true,env));
 for(const host of ['luhachvansh.com','www.luhachvansh.com','test.luhachvansh.com.evil.org'])assert.throws(()=>localGuard(request(host,'https://'+host),'0',true,env),/disabled/);
 assert.throws(()=>localGuard(request('test.luhachvansh.com','https://evil.org'),'0',true,env),/Same-origin/);
 assert.throws(()=>localGuard(request('test.luhachvansh.com',null,'http'),'0',false,env),/HTTPS/);
 assert.throws(()=>localGuard(request('test.luhachvansh.com'), '0',false,{LUHACH_DEPLOYMENT:'test'}),/storage/);
 assert.equal(secureSession(env),true);assert.equal(secureSession({}),false);
});
