import {NextRequest,NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {openHeritage,readHeritage} from '../../../lib/heritage.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 const id=req.nextUrl.searchParams.get('id')||'';
 if(!/^[a-f0-9]{64}$/.test(id))return new NextResponse('तस्वीर उपलब्ध नहीं है।',{status:404});
 const content=readHeritage();
 const allowed=new Set<string>();
 const collect=(v:any)=>{if(!v||typeof v!=='object')return;if(v.url?.startsWith('/api/heritage-media?')&&v.id)allowed.add(v.id);Object.values(v).forEach(collect);};
 collect(content);
 if(!allowed.has(id))return new NextResponse('तस्वीर उपलब्ध नहीं है।',{status:404});
 const db=openHeritage();if(!db)return new NextResponse(null,{status:404});
 try{
  const m=db.prepare('SELECT path,mime FROM legacy_media WHERE id=?').get(id) as {path:string,mime:string}|undefined;
  if(!m||! /^[a-f0-9]{64}\.(?:jpe?g|png|webp|pdf)$/i.test(m.path)||!['image/jpeg','image/png','image/webp','application/pdf'].includes(m.mime))return new NextResponse(null,{status:404});
  const root=dirname(process.env.LUHACH_HERITAGE_DB||process.env.LUHACH_MEMBER_DB||resolve('data/members.sqlite'));
  return new NextResponse(new Uint8Array(await readFile(resolve(root,'legacy-media',m.path))),{headers:{'Content-Type':m.mime,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'}});
 }catch{return new NextResponse('तस्वीर उपलब्ध नहीं है।',{status:404});}finally{db.close();}
}
