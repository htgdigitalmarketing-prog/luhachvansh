import test from 'node:test';
import assert from 'node:assert/strict';
import {localGuard} from '../lib/guard.mjs';
const req=(host,origin)=>({headers:new Headers({host,...(origin?{origin}:{})})});
test('local API is disabled without explicit launch flag',()=>assert.throws(()=>localGuard(req('localhost:3020'),'0'),/disabled/));
test('remote hosts are refused including misleading subdomains',()=>{for(const host of ['example.org','localhost.evil.org','127.0.0.1.evil.org'])assert.throws(()=>localGuard(req(host),'1'),/disabled/);});
test('mutations require exact local origin and permit both loopback spellings',()=>{for(const host of ['localhost:3020','127.0.0.1:3020']){assert.doesNotThrow(()=>localGuard(req(host,'http://'+host),'1',true));assert.throws(()=>localGuard(req(host,'https://evil.org'),'1',true),/Same-origin/);assert.throws(()=>localGuard(req(host),'1',true),/Same-origin/);}});
