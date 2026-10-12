import assert from 'node:assert/strict';import fs from 'node:fs';import sharp from 'sharp';
const base='http://127.0.0.1:3021';
const anon=await fetch(base+'/api/hub?action=content');assert.equal(anon.status,401);
for(const path of ['/api/hub','/api/research','/api/media']){const r=await fetch(base+path,{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:'{}'});assert.equal(r.status,403);}
const login=await fetch(base+'/api/members',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({action:'signin',username:'qa.member',password:'Only for synthetic local UI tests 2026'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
const invalid=await fetch(base+'/api/media',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'image/svg+xml'},body:'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'});assert.equal(invalid.status,400);
const privateContent=await fetch(base+'/api/hub?action=content',{headers:{Cookie:cookie}});const items=await privateContent.json();const photo=items.find(c=>c.media_id);assert.ok(photo,'Browser photo contribution exists');
const denied=await fetch(base+'/api/media?id='+photo.media_id);assert.equal(denied.status,401);
const image=await fetch(base+'/api/media?id='+photo.media_id,{headers:{Cookie:cookie}});assert.equal(image.headers.get('cache-control'),'no-store');const metadata=await sharp(Buffer.from(await image.arrayBuffer())).metadata();assert.equal(metadata.exif,undefined);assert.equal(metadata.format,'webp');
const exp=await fetch(base+'/api/hub?action=export',{headers:{Cookie:cookie}});const data=await exp.json();assert.equal(data.account.members,undefined);assert.equal(data.account.audit,undefined);assert.equal(data.account.invitations,undefined);
await fetch(base+'/api/members',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});
console.log('Hub HTTP checks passed: authentication, Origin enforcement, SVG rejection, private media, metadata stripping, no-store and personal export boundaries.');
