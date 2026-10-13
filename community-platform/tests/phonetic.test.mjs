import test from 'node:test';
import assert from 'node:assert/strict';
import {phoneticScore,searchRecords} from '../lib/phonetic.mjs';
test('English keyboards find Hindi spelling candidates without altering names or collapsing ambiguity',()=>{
 for(const [q,name] of [['ajay','अजय'],['karambir','कर्मबीर'],['gugaheri','गुगाहेड़ी'],['shagun','शगुन'],['akshay','अक्षय'],['ram kumar','राम कुमार']]) assert.ok(phoneticScore(q,name)>0,q);
 const records=[{id:'a',name:'राम कुमार',villageName:'गाँव क'},{id:'b',name:'राम कुमार',villageName:'गाँव ख'},{id:'c',name:'अजय',villageName:'गाँव क'}];
 assert.deepEqual(searchRecords(records,'ram kumar').map(p=>p.id),['a','b']);
 assert.deepEqual(searchRecords(records,'ram kumar','गाँव ख').map(p=>p.id),['b']);
 assert.equal(records[0].name,'राम कुमार');
 assert.equal(phoneticScore('unrelatedperson','राम कुमार'),0);
 assert.equal(phoneticScore('%','राम कुमार'),0);
});
