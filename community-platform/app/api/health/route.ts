import {NextResponse} from 'next/server';
import {storageDiagnostics} from '../../../lib/storage.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 // `checks` reports booleans and public content counts so a moved or empty database is diagnosable without shell access.
 const checks=storageDiagnostics();
 const storageReady=checks.deploymentFlag&&checks.memberDbExists&&checks.legacyTables;
 const contentReady=storageReady&&checks.content.village>0&&checks.archivePeople>0;
 return NextResponse.json({service:'luhach-community',storageReady,contentReady,checks},{status:storageReady?200:503,headers:{'Cache-Control':'no-store'}});
}
