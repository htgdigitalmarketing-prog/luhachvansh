import {NextRequest,NextResponse} from 'next/server';
import {getHub} from '../../../lib/hub.mjs';
import {localGuard} from '../../../lib/guard.mjs';
import {Problem} from '../../../lib/store.mjs';
import {viewerData} from '../../../lib/viewer.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 let data:unknown,status=200;
 try{localGuard(req,process.env.LUHACH_LOCAL_PREVIEW);const db=getHub(),a=db.actor(req.cookies.get('luhach_member_session')?.value);if(!a)throw new Problem('Sign in to explore the dynasty viewer.',401);data=viewerData(db,a.id);}
 catch(e){status=e instanceof Problem?e.status:500;data={error:e instanceof Problem?e.message:'Viewer unavailable.'};}
 return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store',Vary:'Cookie'}});
}
