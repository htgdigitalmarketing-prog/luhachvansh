import {dirname,resolve} from 'node:path';
import {existsSync,statSync,createReadStream} from 'node:fs';
import {Readable} from 'node:stream';
import reels from '../content/reels.json' with {type:'json'};
import villages from '../content/village-reels.json' with {type:'json'};
// Bundle the public allowlist: Hostinger relocates builds and removes the temporary source directory.
const catalogue=()=>[...reels.reels,...villages.reels];
export function reelMediaRoot(){return process.env.LUHACH_REEL_DIR||resolve(dirname(process.env.LUHACH_MEMBER_DB||resolve('data/members.sqlite')),'reels-public');}
export function reelReady(slug){return existsSync(resolve(reelMediaRoot(),slug+'.mp4'));}
export function reelResponse(request){
 const url=new URL(request.url),slug=url.searchParams.get('slug'),kind=url.searchParams.get('kind');
 const types={video:['mp4','video/mp4'],poster:['jpg','image/jpeg'],captions:['vtt','text/vtt; charset=utf-8']};
 if(!catalogue().some(r=>r.slug===slug)||!Object.hasOwn(types,kind))return new Response(null,{status:404});
 const [ext,mime]=types[kind],path=resolve(reelMediaRoot(),slug+'.'+ext);
 if(!existsSync(path))return new Response(null,{status:404});
 const size=statSync(path).size,headers={'Content-Type':mime,'Accept-Ranges':'bytes','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'};
 let start=0,end=size-1,status=200;const range=request.headers.get('range');
 if(range){const m=range.match(/^bytes=(\d*)-(\d*)$/);if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  if(!m[1])start=Math.max(0,size-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
 }
 headers['Content-Length']=String(end-start+1);
 return new Response(request.method==='HEAD'?null:Readable.toWeb(createReadStream(path,{start,end})),{status,headers});
}
