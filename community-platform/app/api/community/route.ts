import { NextRequest, NextResponse } from 'next/server';
import { getStore, Problem } from '../../../lib/store.mjs';
import { localGuard } from '../../../lib/guard.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function guard(req:NextRequest,write=false){
 localGuard(req,process.env.LUHACH_LOCAL_PREVIEW,write);
}
function response(data:unknown,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});}
function failure(error:unknown){if(error instanceof Problem)return response({error:error.message},error.status);console.error('Community request failed',error);return response({error:'The change could not be saved. Please try again.'},500);}
export async function GET(req:NextRequest){try{guard(req);const db=getStore();const actor=db.actor(req.cookies.get('luhach_session')?.value);const q=req.nextUrl.searchParams;db.tick();if(q.get('action')==='search')return response({people:db.search(q.get('q')||'',q.get('village')||'',q.get('kind')||'all')});if(q.get('action')==='family')return response(db.family(q.get('id')||'demo-ananya'));return response(db.state(actor?.id));}catch(e){return failure(e);}}
export async function POST(req:NextRequest){try{guard(req,true);const raw=await req.text();if(raw.length>12000)throw new Problem('Request too large',413);let body;try{body=JSON.parse(raw);}catch{throw new Problem('Invalid request body');}const db=getStore();db.tick();
 if(body.action==='login'){const token=db.login(body.account);const res=response({ok:true});res.cookies.set('luhach_session',token,{httpOnly:true,sameSite:'strict',path:'/',maxAge:86400});return res;}
 if(body.action==='logout'){const res=response({ok:true});res.cookies.delete('luhach_session');return res;}
 const actor=db.actor(req.cookies.get('luhach_session')?.value);if(!actor)throw new Problem('Choose a local preview account first.',401);
 let id;
 switch(body.action){
 case 'claim':id=db.claim(actor.id,body.personId,body.reason);break;
 case 'claimDecision':db.decideClaim(actor.id,body.id,body.approve===true,body.reason);break;
 case 'propose':id=db.propose(actor.id,body.personId,body.payload);break;
 case 'object':db.object(actor.id,body.id,body.reason);break;
 case 'decide':db.decide(actor.id,body.id,body.decision,body.reason);break;
 case 'advance':db.advance(actor.id,body.days);break;
 default:throw new Problem('Unknown action');
 }return response({ok:true,id});
 }catch(e){return failure(e);}}
