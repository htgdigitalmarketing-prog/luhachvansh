import test from 'node:test';
import assert from 'node:assert/strict';
import {HubStore} from '../lib/hub.mjs';
import {publicGraph,publicFamily,publicLineage} from '../lib/public-viewer.mjs';
test('anonymous archive exposes recorded family links but excludes private people, children, member submissions and contacts',()=>{
 const db=new HubStore(':memory:');
 for(const [id,kind] of [['a','archive'],['b','archive'],['hidden','archive'],['child','archive'],['new','community']])db.run('INSERT INTO people(id,name,gender,village,source,notes,kind) VALUES(?,?,?,?,?,?,?)',id,id,'unknown','Village','secret evidence','private notes',kind);
 db.run("INSERT INTO profile_privacy(person_id,audience,life,contact_audience,email,phone,city,updated) VALUES('hidden','private','adult','private','secret@email.test','secret-phone','secret-location',0)");
 db.run("INSERT INTO profile_privacy(person_id,audience,life,contact_audience,email,phone,city,updated) VALUES('child','verified','child','private','','','',0)");
 for(const [id,a,b,type,role] of [['ab','a','b','parent','mother'],['hb','hidden','b','parent','father'],['newb','new','b','spouse',null]])db.run('INSERT INTO relationships(id,a,b,type,role,source) VALUES(?,?,?,?,?,?)',id,a,b,type,role,'secret source');
 const data=publicGraph(db.db);assert.deepEqual(data.records.map(p=>p.id),['a','b']);assert.equal(data.edges.length,1);assert.ok(!JSON.stringify(data).includes('secret'));assert.ok(!JSON.stringify(data).includes('private notes'));
 const family=publicFamily(data,'b');assert.equal(family.parents[0].id,'a');assert.equal(family.parents[0].relationship,'mother');assert.equal(family.spouses.length,0);
 assert.equal(publicLineage(data,'a','b').steps[0].relation,'child');assert.throws(()=>publicFamily(data,'hidden'),/not found/);assert.throws(()=>publicLineage(data,'a','child'),/not found/);
 assert.deepEqual(publicGraph(db.db,new Set(['b'])).records.map(p=>p.id),['a']);db.close();
});
test('viewer cache is reused until any WAL commit, and a privacy withdrawal hides the person on the next request',async()=>{
 const {mkdtempSync,rmSync}=await import('node:fs');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const {publicViewerData,resetViewerCache}=await import('../lib/public-viewer.mjs');
 const dir=mkdtempSync(join(tmpdir(),'viewer-cache-')),saved={h:process.env.LUHACH_HERITAGE_DB,m:process.env.LUHACH_MEMBER_DB};
 const archive=new HubStore(join(dir,'archive.sqlite')),members=new HubStore(join(dir,'members.sqlite'));
 try{
  for(const id of ['a','b'])archive.run("INSERT INTO people(id,name,gender,village,source,kind) VALUES(?,?,?,?,?,'archive')",id,id,'unknown','Village','Synthetic archive');
  archive.run("INSERT INTO relationships(id,a,b,type,role,source) VALUES('ab','a','b','parent','father','Synthetic archive')");
  process.env.LUHACH_HERITAGE_DB=join(dir,'archive.sqlite');process.env.LUHACH_MEMBER_DB=join(dir,'members.sqlite');resetViewerCache();
  const first=publicViewerData();assert.deepEqual(first.records.map(p=>p.id),['a','b']);assert.equal(publicViewerData(),first,'unchanged data is served from cache');
  // Written through the still-open writer connection, so the change lives only in the WAL file.
  members.run("INSERT INTO people(id,name,gender,village,source,kind) VALUES('b','b','unknown','Village','Synthetic archive','archive')");
  assert.notEqual(publicViewerData(),first,'any member-database commit invalidates the cache');
  members.run("INSERT INTO profile_privacy(person_id,audience,life,contact_audience,email,phone,city,updated) VALUES('b','private','adult','private','','','',0)");
  assert.deepEqual(publicViewerData().records.map(p=>p.id),['a'],'privacy withdrawal is never served from a stale cache');
  archive.run("UPDATE people SET active=0 WHERE id='a'");assert.deepEqual(publicViewerData().records.map(p=>p.id),[]);
 }finally{resetViewerCache();archive.close();members.close();process.env.LUHACH_HERITAGE_DB=saved.h;process.env.LUHACH_MEMBER_DB=saved.m;if(saved.h===undefined)delete process.env.LUHACH_HERITAGE_DB;if(saved.m===undefined)delete process.env.LUHACH_MEMBER_DB;rmSync(dir,{recursive:true,force:true});}
});
