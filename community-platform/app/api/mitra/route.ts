import {NextRequest,NextResponse} from 'next/server';
import {answerIntelligent} from '../../../lib/mitra-agent.mjs';
import {Problem} from '../../../lib/store.mjs';
import {createHash} from 'node:crypto';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const rates=new Map<string,{count:number,until:number}>();
export async function POST(req:NextRequest){
 try{
  const origin=req.headers.get('origin'),host=req.headers.get('host');
  if(!origin||new URL(origin).host!==host)throw new Problem('Same-origin request required',403);
  const reader=req.body?.getReader();let raw='',bytes=0;const decoder=new TextDecoder();if(reader){try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>50000){await reader.cancel();throw new Problem('Question too long.',413);}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}}if(raw.length>14000)throw new Problem('Question too long.',413);
  const b=JSON.parse(raw);if(!b||typeof b.question!=='string'||b.question.length>600)throw new Problem('Invalid request.');
  const key=createHash('sha256').update(req.headers.get('x-forwarded-for')?.split(',')[0]||'local').digest('hex');
  const now=Date.now();for(const [k,r] of rates)if(r.until<now)rates.delete(k);
  const rate=rates.get(key)||{count:0,until:now+3600000};if(rate.count>=40)throw new Problem('Hourly AI allowance reached. You can still browse source passages.',429);rate.count++;rates.set(key,rate);
  return NextResponse.json(await answerIntelligent(b),{headers:{'Cache-Control':'no-store'}});
 }catch(e){return NextResponse.json({error:e instanceof Problem?e.message:'Assistant unavailable.'},{status:e instanceof Problem?e.status:500,headers:{'Cache-Control':'no-store'}});}
}
