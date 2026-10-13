import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {reelResponse} from '../lib/reel-media.mjs';
test('public reel streaming supports seeking and refuses arbitrary files and malformed ranges',async()=>{
 const folder=mkdtempSync(join(tmpdir(),'reel-test-')),previous=process.env.LUHACH_REEL_DIR;process.env.LUHACH_REEL_DIR=folder;
 try{writeFileSync(join(folder,'v106.mp4'),'0123456789');writeFileSync(join(folder,'private.mp4'),'private');
  const request=(slug='v106',kind='video',range)=>new Request('http://localhost/api/reel-media?'+new URLSearchParams({slug,kind}),range?{headers:{range}}:{});
  let r=reelResponse(request());assert.equal(r.status,200);assert.equal(await r.text(),'0123456789');
  r=reelResponse(request('v106','video','bytes=2-5'));assert.equal(r.status,206);assert.equal(r.headers.get('content-range'),'bytes 2-5/10');assert.equal(await r.text(),'2345');
  r=reelResponse(request('v106','video','bytes=-3'));assert.equal(await r.text(),'789');
  assert.equal(reelResponse(request('v106','video','bytes=20-')).status,416);
  assert.equal(reelResponse(request('v106','video','bytes=1-2,4-5')).status,416);
  for(const slug of ['private','../private','v999999'])assert.equal(reelResponse(request(slug)).status,404);
  assert.equal(reelResponse(request('v106','__proto__')).status,404);
  assert.equal(reelResponse(new Request(request().url,{method:'HEAD'})).body,null);
 }finally{previous===undefined?delete process.env.LUHACH_REEL_DIR:process.env.LUHACH_REEL_DIR=previous;rmSync(folder,{recursive:true,force:true});}
});
test('village reel catalogue covers all 56 source articles once with Hindi male narration',()=>{
 const d=JSON.parse(readFileSync(new URL('../content/village-reels.json',import.meta.url),'utf8'));
 assert.equal(d.reels.length,46);const ids=d.reels.flatMap(r=>r.articles);assert.equal(ids.length,56);assert.equal(new Set(ids).size,56);
 for(const r of d.reels){assert.equal(r.voice,'hi-IN-MadhurNeural');assert.ok(r.narration.length);assert.ok(r.narration.every(s=>/[\u0900-\u097f]/.test(s)));}
});
