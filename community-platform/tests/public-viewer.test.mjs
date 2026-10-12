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
