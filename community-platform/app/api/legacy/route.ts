import {NextRequest,NextResponse} from 'next/server';
import {getHub} from '../../../lib/hub.mjs';
import {localGuard} from '../../../lib/guard.mjs';
import {Problem} from '../../../lib/store.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 let data:unknown,status=200;
 try{
  localGuard(req,process.env.LUHACH_LOCAL_PREVIEW);
  const db=getHub(),actor=db.actor(req.cookies.get('luhach_member_session')?.value);
  if(!actor)throw new Problem('Sign in as an administrator.',401);
  db.admin(actor.id);
  if(!db.one("SELECT name FROM sqlite_master WHERE type='table' AND name='legacy_records'"))throw new Problem('Legacy source capture is not loaded.',404);
  const table=req.nextUrl.searchParams.get('table')||'members';
  const tables=db.all('SELECT source_table AS name,COUNT(*) AS count FROM legacy_records GROUP BY source_table');
  if(!tables.some((t:{name:string})=>t.name===table))throw new Problem('Unknown source table.');
  const offset=Math.max(0,Number(req.nextUrl.searchParams.get('offset'))||0);
  const rows=db.all('SELECT source_id,payload,review_status FROM legacy_records WHERE source_table=? ORDER BY source_id LIMIT 20 OFFSET ?',table,offset);
  data={tables,table,offset,rows:rows.map((r:{source_id:string,payload:string,review_status:string})=>({...r,payload:JSON.parse(r.payload),match:table==='members'?JSON.parse(db.one('SELECT payload FROM legacy_matches WHERE legacy_id=?',r.source_id)?.payload||'null'):null})),notice:'Original source records. No identity merges, family links, login accounts or directory consent have been inferred.'};
 }catch(e){status=e instanceof Problem?e.status:500;data={error:e instanceof Problem?e.message:'Legacy archive unavailable.'};}
 return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store',Vary:'Cookie'}});
}
