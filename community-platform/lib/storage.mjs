import {DatabaseSync} from 'node:sqlite';
import {existsSync} from 'node:fs';
import {dirname,isAbsolute,resolve} from 'node:path';
import {Problem} from './store.mjs';
// The hosted test deployment must keep using the preserved owner database. A missing, relative or moved
// LUHACH_MEMBER_DB must fail closed instead of silently creating a fresh empty database (which would look like
// a brand-new site: zero articles, "owner setup" prompts, no accounts) and split member data across two files.
export function memberDbPath(env=process.env){
 const file=env.LUHACH_MEMBER_DB;
 if(env.LUHACH_DEPLOYMENT==='test'){
  if(!file||!isAbsolute(file)||!existsSync(file))throw new Problem('Member storage is not connected on this server. The administrator must point the deployment at the preserved database.',503);
  return file;
 }
 return file||resolve('data/members.sqlite');
}
const count=(db,sql,...args)=>{try{return db.prepare(sql).get(...args)?.n??0;}catch{return 0;}};
// Booleans and public content counts only: no paths, environment values, account names or private rows.
export function storageDiagnostics(env=process.env){
 const file=env.LUHACH_MEMBER_DB,heritage=env.LUHACH_HERITAGE_DB||file;
 const checks={deploymentFlag:env.LUHACH_DEPLOYMENT==='test',memberDbConfigured:!!file,memberDbAbsolute:!!file&&isAbsolute(file),memberDbExists:!!file&&isAbsolute(file)&&existsSync(file),
  heritageOverride:!!env.LUHACH_HERITAGE_DB,heritageDbExists:!!heritage&&isAbsolute(heritage)&&existsSync(heritage),legacyTables:false,accountsPresent:false,
  archivePeople:0,content:{village:0,about:0,history:0,news:0},legacyMediaFolder:false,translations:false,editorial:false,recoveryKey:false,memberMediaFolder:false};
 if(checks.memberDbExists){let db;try{db=new DatabaseSync(file,{readOnly:true});checks.accountsPresent=count(db,'SELECT COUNT(*) n FROM credentials')>0;}catch{}finally{db?.close();}
  checks.recoveryKey=existsSync(file+'.recovery-key');checks.memberMediaFolder=existsSync(file+'.media');}
 if(checks.heritageDbExists){let db;try{db=new DatabaseSync(heritage,{readOnly:true});
  checks.legacyTables=!!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='legacy_records'").get();
  checks.archivePeople=count(db,"SELECT COUNT(*) n FROM people WHERE kind='archive' AND active=1");
  for(const table of Object.keys(checks.content))checks.content[table]=count(db,'SELECT COUNT(*) n FROM legacy_records WHERE source_table=?',table);
 }catch{}finally{db?.close();}
  const root=dirname(heritage);checks.legacyMediaFolder=existsSync(resolve(root,'legacy-media'));checks.translations=existsSync(resolve(root,'heritage-en.json'));checks.editorial=existsSync(resolve(root,'heritage-edit.json'));}
 return checks;
}
