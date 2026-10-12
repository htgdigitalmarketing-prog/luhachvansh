import {NextRequest,NextResponse} from 'next/server';
import {Problem} from '../../../lib/store.mjs';
import {publicViewerData,publicFamily,publicLineage} from '../../../lib/public-viewer.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 let data:unknown,status=200;
 try{const archive=publicViewerData();const action=req.nextUrl.searchParams.get('action');data=action==='family'?publicFamily(archive,req.nextUrl.searchParams.get('id')||''):action==='lineage'?publicLineage(archive,req.nextUrl.searchParams.get('from')||'',req.nextUrl.searchParams.get('to')||''):archive;}
 catch(e){status=e instanceof Problem?e.status:500;data={error:e instanceof Problem?e.message:'Viewer unavailable.'};}
 return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store',Vary:'Cookie'}});
}
