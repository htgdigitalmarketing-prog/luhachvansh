// Read-only verification of our local or test deployment. No cookies, member data or mutations.
import {readFileSync,writeFileSync} from 'node:fs';
const origin=process.argv[2],output=process.argv[3];
if(!origin||!/^https:\/\/test\.luhachvansh\.com$|^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin))throw Error('Use the local preview or the test domain only.');
const list=['reels.json','village-reels.json'].flatMap(f=>JSON.parse(readFileSync(new URL('../content/'+f,import.meta.url),'utf8')).reels).filter(r=>!process.env.LUHACH_VERIFY_SLUGS||process.env.LUHACH_VERIFY_SLUGS.split(',').includes(r.slug));
if(!list.length)throw Error('No catalogue reels selected.');
const results=[];
for(let i=0;i<list.length;i+=4)await Promise.all(list.slice(i,i+4).map(async r=>{
 const result={slug:r.slug,assets:[],pages:[],ok:true};
 try{
  for(const kind of ['video','poster','captions']){const response=await fetch(origin+'/api/reel-media?'+new URLSearchParams({slug:r.slug,kind}),{method:'HEAD',signal:AbortSignal.timeout(20000)});const item={kind,status:response.status,bytes:Number(response.headers.get('content-length'))};result.assets.push(item);if(response.status!==200||!item.bytes)result.ok=false;}
  const seek=await fetch(origin+'/api/reel-media?'+new URLSearchParams({slug:r.slug,kind:'video'}),{headers:{Range:'bytes=0-63'},signal:AbortSignal.timeout(20000)});if(seek.status!==206||(await seek.arrayBuffer()).byteLength!==64)result.ok=false;
  const captions=await fetch(origin+'/api/reel-media?'+new URLSearchParams({slug:r.slug,kind:'captions'}),{signal:AbortSignal.timeout(20000)});if(!(await captions.text()).startsWith('WEBVTT'))result.ok=false;
  if(!r.articles){const legacy=await fetch(origin+'/media/reels/'+r.slug+'.mp4',{method:'HEAD',signal:AbortSignal.timeout(20000)});const bundled=readFileSync(new URL('../public/media/reels/'+r.slug+'.mp4',import.meta.url)).byteLength;result.legacyMaleCopy=legacy.status===200&&(legacy.url.includes('/api/reel-media?')||Number(legacy.headers.get('content-length'))===bundled);if(!result.legacyMaleCopy)result.ok=false;}
  for(const id of r.articles||[]){const response=await fetch(origin+'/heritage/villages/'+id,{signal:AbortSignal.timeout(20000)});const html=await response.text();const ok=response.status===200&&html.includes('slug='+r.slug+'&amp;kind=video')&&html.includes('community-logo.jpeg');result.pages.push({id,ok});if(!ok)result.ok=false;}
 }catch(e){result.ok=false;result.error=e.message;}
 results.push(result);
}));
const summary={origin,reels:results.length,articles:results.flatMap(r=>r.pages).length,ok:results.every(r=>r.ok),results};
if(output)writeFileSync(output,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({reels:summary.reels,articles:summary.articles,ok:summary.ok,failed:results.filter(r=>!r.ok)}));
if(!summary.ok)process.exitCode=1;
