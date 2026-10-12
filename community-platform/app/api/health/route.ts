import {NextResponse} from 'next/server';
import {DatabaseSync} from 'node:sqlite';
import {existsSync} from 'node:fs';
import {isAbsolute} from 'node:path';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 let storageReady=false;
 const file=process.env.LUHACH_MEMBER_DB;
 if(process.env.LUHACH_DEPLOYMENT==='test'&&file&&isAbsolute(file)&&existsSync(file)){
  let db:DatabaseSync|undefined;
  try{db=new DatabaseSync(file,{readOnly:true});storageReady=!!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='legacy_records'").get();}catch{}finally{db?.close();}
 }
 return NextResponse.json({service:'luhach-community',storageReady},{status:storageReady?200:503,headers:{'Cache-Control':'no-store'}});
}
