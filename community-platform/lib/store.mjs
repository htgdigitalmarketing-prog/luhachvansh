import { DatabaseSync } from 'node:sqlite';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const DAY=86400000;
const digest=s=>createHash('sha256').update(s).digest('hex');
export class Problem extends Error { constructor(message,status=400){super(message);this.status=status;} }
const need=(condition,message,status=400)=>{if(!condition)throw new Problem(message,status);};
const text=(value,max=200)=>String(value??'').trim().slice(0,max);
const normal=s=>s.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
export class Store {
 constructor(path=resolve('data/community.sqlite'),options={}){
  if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
  this.db=new DatabaseSync(path);this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  this.db.exec(`
   CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS people(id TEXT PRIMARY KEY,legacy_id TEXT UNIQUE,name TEXT NOT NULL,aliases TEXT NOT NULL DEFAULT '',gender TEXT NOT NULL DEFAULT 'unknown',village TEXT NOT NULL DEFAULT '',generation TEXT,source TEXT NOT NULL,source_page TEXT,notes TEXT NOT NULL DEFAULT '',kind TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,active INTEGER NOT NULL DEFAULT 1,proposal_id TEXT);
   CREATE TABLE IF NOT EXISTS relationships(id TEXT PRIMARY KEY,a TEXT NOT NULL REFERENCES people(id),b TEXT NOT NULL REFERENCES people(id),type TEXT NOT NULL,role TEXT,source TEXT NOT NULL,proposal_id TEXT,active INTEGER NOT NULL DEFAULT 1,CHECK(a<>b));
   CREATE INDEX IF NOT EXISTS relations_a ON relationships(a,active); CREATE INDEX IF NOT EXISTS relations_b ON relationships(b,active);
   CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY,name TEXT NOT NULL,role TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id),expires INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS claims(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id),person_id TEXT NOT NULL REFERENCES people(id),reason TEXT NOT NULL,status TEXT NOT NULL,created INTEGER NOT NULL,decision TEXT);
   CREATE TABLE IF NOT EXISTS proposals(id TEXT PRIMARY KEY,author TEXT NOT NULL REFERENCES accounts(id),anchor TEXT NOT NULL REFERENCES people(id),version INTEGER NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL,created INTEGER NOT NULL,due INTEGER NOT NULL,decision TEXT,person_id TEXT);
   CREATE TABLE IF NOT EXISTS objections(id TEXT PRIMARY KEY,proposal_id TEXT NOT NULL REFERENCES proposals(id),author TEXT NOT NULL REFERENCES accounts(id),reason TEXT NOT NULL,created INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id),proposal_id TEXT,body TEXT NOT NULL,created INTEGER NOT NULL,seen INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,actor TEXT NOT NULL,action TEXT NOT NULL,entity TEXT NOT NULL,detail TEXT NOT NULL,created INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS imports(hash TEXT PRIMARY KEY,filename TEXT NOT NULL,count INTEGER NOT NULL,created INTEGER NOT NULL);
  `);
  this.db.prepare("INSERT OR IGNORE INTO meta VALUES('clock_offset','0')").run();
  if(options.seed!==false)this.seed();
 }
 all(sql,...args){return this.db.prepare(sql).all(...args);}
 one(sql,...args){return this.db.prepare(sql).get(...args);}
 run(sql,...args){return this.db.prepare(sql).run(...args);}
 transaction(fn){this.db.exec('BEGIN IMMEDIATE');try{const r=fn();this.db.exec('COMMIT');return r;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 now(){return Date.now()+Number(this.one("SELECT value FROM meta WHERE key='clock_offset'").value);}
 log(actor,action,entity,detail){this.run('INSERT INTO audit(actor,action,entity,detail,created) VALUES(?,?,?,?,?)',actor,action,entity,JSON.stringify(detail),this.now());}
 seed(){
  this.run("INSERT OR IGNORE INTO people(id,name,aliases,gender,village,source,notes,kind) VALUES('demo-rohan','Rohan','रोहन','male','Pune','Illustrative family; not a historical claim','Sample record for linking a new married daughter.','demo')");
  if(this.one("SELECT id FROM accounts WHERE id='member'"))return;
  this.transaction(()=>{
   for(const a of [['member','Ananya · contributor','member'],['relative','Meera · family reviewer','member'],['admin','Community administrator','admin']])this.run('INSERT INTO accounts VALUES(?,?,?)',...a);
   const persons=[['rajveer','Rajveer Luhach','राजवीर लुहाच','male','Nandha'],['kavita','Kavita Luhach','कविता लुहाच','female','Nandha'],['ananya','Ananya Luhach','अनन्या लुहाच','female','Nandha'],['arjun','Arjun Luhach','अर्जुन लुहाच','male','Nandha'],['vikram','Vikram','विक्रम','male','Rohtak'],['ishaan','Ishaan','ईशान','male','Rohtak'],['meera','Meera','मीरा','female','Rohtak']];
   for(const [id,name,aliases,gender,village]of persons)this.run('INSERT INTO people(id,name,aliases,gender,village,source,notes,kind) VALUES(?,?,?,?,?,?,?,?)','demo-'+id,name,aliases,gender,village,'Illustrative family; not a historical claim','Sample record for trying the contribution workflow.','demo');
   for(const [a,b,type,role] of [['rajveer','ananya','parent','father'],['kavita','ananya','parent','mother'],['rajveer','arjun','parent','father'],['kavita','arjun','parent','mother'],['rajveer','kavita','spouse',null],['ananya','vikram','spouse',null],['ananya','ishaan','parent','mother'],['vikram','ishaan','parent','father'],['meera','vikram','parent','mother']])this.run('INSERT INTO relationships(id,a,b,type,role,source) VALUES(?,?,?,?,?,?)',randomUUID(),'demo-'+a,'demo-'+b,type,role,'Illustrative family');
   this.run('INSERT INTO claims VALUES(?,?,?,?,?,?,?)',randomUUID(),'relative','demo-kavita','Sample family steward','approved',this.now(),'Seeded local review account');
  });
 }
 login(id){need(['member','relative','admin'].includes(id),'Unknown preview account');const token=randomBytes(32).toString('hex');this.run('INSERT INTO sessions VALUES(?,?,?)',digest(token),id,Date.now()+DAY);return token;}
 actor(token){return token?this.one('SELECT a.* FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.hash=? AND s.expires>?',digest(token),Date.now())||null:null;}
 user(id){const a=this.one('SELECT * FROM accounts WHERE id=?',id);need(a,'Sign in first',401);return a;}
 admin(id){const a=this.user(id);need(a.role==='admin','Administrator access required',403);return a;}
 person(id){return this.one('SELECT * FROM people WHERE id=? AND active=1',id);}
 search(q='',village='',kind='all'){
  const clean=text(q,100).replace(/[!%_]/g,'!$&');const like='%'+clean+'%';
  return this.all(`SELECT id,name,aliases,village,gender,kind,source_page,generation FROM people WHERE active=1 AND (?='all' OR kind=?) AND (?='' OR village=?) AND (name LIKE ? ESCAPE '!' OR aliases LIKE ? ESCAPE '!' OR village LIKE ? ESCAPE '!' OR legacy_id LIKE ? ESCAPE '!') ORDER BY CASE WHEN kind='demo' THEN 0 ELSE 1 END,name LIMIT 60`,kind,kind,village,village,like,like,like,like);
 }
 family(id){
  const p=this.person(id);need(p,'Person not found',404);
  const edges=this.all('SELECT * FROM relationships WHERE active=1 AND (a=? OR b=?)',id,id);
  const parents=edges.filter(r=>r.type==='parent'&&r.b===id).map(r=>({...this.person(r.a),relationship:r.role||'parent'}));
  const spouses=edges.filter(r=>r.type==='spouse').map(r=>({...this.person(r.a===id?r.b:r.a),relationship:'spouse'}));
  const children=edges.filter(r=>r.type==='parent'&&r.a===id).map(r=>({...this.person(r.b),relationship:'child'}));
  const siblings=parents.length?this.all(`SELECT DISTINCT p.* FROM relationships r JOIN people p ON p.id=r.b WHERE r.active=1 AND p.active=1 AND r.type='parent' AND r.a IN (${parents.map(()=>'?').join(',')}) AND p.id<>?`,...parents.map(p=>p.id),id):[];
  return {person:p,parents,spouses,children,siblings,claims:this.all("SELECT c.id,c.status,a.name FROM claims c JOIN accounts a ON a.id=c.account_id WHERE person_id=? AND status IN ('pending','approved')",id),history:this.all('SELECT * FROM audit WHERE entity=? ORDER BY id DESC LIMIT 15',id)};
 }
 claim(actor,personId,reason){this.user(actor);need(this.person(personId),'Person not found',404);need(text(reason).length>=8,'Explain your connection (at least 8 characters).');need(!this.one("SELECT id FROM claims WHERE account_id=? AND person_id=? AND status IN ('pending','approved')",actor,personId),'You already have a claim for this person.');const id=randomUUID();this.transaction(()=>{this.run('INSERT INTO claims VALUES(?,?,?,?,?,?,NULL)',id,actor,personId,text(reason,1000),'pending',this.now());this.log(actor,'claim_requested',personId,{claim:id});this.notify('admin',null,'A profile claim needs review.');});return id;}
 decideClaim(actor,id,approve,reason){this.admin(actor);need(text(reason).length>=8,'Record a review reason (at least 8 characters).');return this.transaction(()=>{const c=this.one('SELECT * FROM claims WHERE id=?',id);need(c&&c.status==='pending','Claim is no longer pending',409);need(c.account_id!==actor,'A separate reviewer must decide your claim',403);need(!approve||!this.one("SELECT id FROM claims WHERE person_id=? AND status='approved'",c.person_id),'A steward already holds this profile; resolve ownership separately.',409);this.run('UPDATE claims SET status=?,decision=? WHERE id=?',approve?'approved':'rejected',text(reason,1000),id);this.log(actor,approve?'claim_approved':'claim_rejected',c.person_id,{claim:id,reason});this.notify(c.account_id,null,approve?'Your profile claim was approved. You can contribute.':'Your claim was declined: '+text(reason));});}
 notify(account,proposal,body){this.run('INSERT INTO notifications VALUES(?,?,?,?,?,0)',randomUUID(),account,proposal,body,this.now());}
 validatePayload(anchor,payload){
  need(['mother','father','daughter','son','spouse'].includes(payload.relation),'Choose a supported relationship.');
  const p={relation:payload.relation,name:text(payload.name),aliases:text(payload.aliases),gender:text(payload.gender),village:text(payload.village),source:text(payload.source,1000),existingId:text(payload.existingId),secondId:text(payload.secondId)};
  need(p.source.length>=8,'Please explain the source of this information (at least 8 characters).');
  if(p.existingId){need(this.person(p.existingId),'Linked person no longer exists');need(p.existingId!==anchor.id,'A person cannot be their own relative');p.name=this.person(p.existingId).name;}
  else {need(p.name.length>=2,'Enter a full name.');need(['female','male','unknown'].includes(p.gender),'Choose gender or leave it unknown.');need(p.village,'Enter a village or place.');}
  if(p.secondId){need(this.person(p.secondId),'Additional relative was not found');need(p.secondId!==anchor.id&&p.secondId!==p.existingId,'Choose a different additional relative.');}
  for(const id of [p.existingId,p.secondId].filter(Boolean))need((this.person(id).kind==='demo')===(anchor.kind==='demo'),'Sample people cannot be linked to historical records.');
  if(!p.existingId){const duplicates=this.all('SELECT id,name FROM people WHERE village=? AND active=1',p.village).filter(r=>normal(r.name)===normal(p.name));need(!duplicates.length,'This name already exists in the same village. Select the existing person instead.',409);}
  return p;
 }
 propose(actor,anchorId,payload){
  this.user(actor);need(this.one("SELECT id FROM claims WHERE account_id=? AND status='approved'",actor),'An approved profile claim is needed before contributing.',403);
  const anchor=this.person(anchorId);need(anchor,'Person not found',404);const p=this.validatePayload(anchor,payload);
  const candidate=p.existingId||'new-person';this.validateEdges(this.edgesFor(anchorId,candidate,p));
  const id=randomUUID();this.transaction(()=>{this.run('INSERT INTO proposals(id,author,anchor,version,payload,status,created,due) VALUES(?,?,?,?,?,?,?,?)',id,actor,anchorId,anchor.version,JSON.stringify(p),'pending',this.now(),this.now()+7*DAY);this.log(actor,'proposal_submitted',anchorId,{proposal:id,payload:p,version:anchor.version});const recipients=new Set(['admin',actor]);for(const person of [anchorId,p.existingId,p.secondId].filter(Boolean)){for(const c of this.all("SELECT account_id FROM claims WHERE person_id=? AND status='approved'",person))recipients.add(c.account_id);}for(const account of recipients)this.notify(account,id,`${p.name}: ${p.relation} proposal for ${anchor.name}. Review within seven days.`);});return id;
 }
 edgesFor(anchor,person,p){const edges=[];if(['mother','father'].includes(p.relation))edges.push([person,anchor,'parent',p.relation]);else if(['daughter','son'].includes(p.relation))edges.push([anchor,person,'parent',this.person(anchor)?.gender==='female'?'mother':this.person(anchor)?.gender==='male'?'father':null]);else edges.push([anchor,person,'spouse',null]);if(p.secondId){if(p.relation==='spouse')edges.push([p.secondId,person,'parent',null]);else edges.push([person,p.secondId,'spouse',null]);}return edges;}
 validateEdges(edges){
  const all=this.all("SELECT a,b,type,role FROM relationships WHERE active=1");
  for(const [a,b,type,role]of edges){
   need(a!==b,'A person cannot be their own relative.');
   need(!all.some(r=>r.type===type&&((r.a===a&&r.b===b)||(type==='spouse'&&r.a===b&&r.b===a))),'This relationship already exists.',409);
   if(type==='parent'){
    need(!role||!all.some(r=>r.type==='parent'&&r.b===b&&r.role===role),'This parent is already recorded. Replacing parentage requires a separate dispute review.',409);
    const seen=new Set();const stack=[a];while(stack.length){const n=stack.pop();need(n!==b,'This link would create an ancestry cycle.',409);if(seen.has(n))continue;seen.add(n);for(const r of all)if(r.type==='parent'&&r.b===n)stack.push(r.a);}
   }
   all.push({a,b,type,role});
  }
 }
 object(actor,id,reason){this.user(actor);need(text(reason).length>=8,'Explain the objection (at least 8 characters).');this.transaction(()=>{const p=this.one('SELECT * FROM proposals WHERE id=?',id);need(p&&['pending','disputed','conflict'].includes(p.status),'This proposal is no longer open.',409);need(p.author!==actor,'Withdraw your own proposal instead of objecting.');this.run('INSERT INTO objections VALUES(?,?,?,?,?)',randomUUID(),id,actor,text(reason,1000),this.now());this.run("UPDATE proposals SET status='disputed' WHERE id=?",id);this.log(actor,'objection',p.anchor,{proposal:id,reason});this.notify('admin',id,'Objection raised; automatic acceptance is paused.');this.notify(p.author,id,'Your proposal has an objection: '+text(reason));});}
 accept(actor,id,automatic=false,reason=''){
  const p=this.one('SELECT * FROM proposals WHERE id=?',id);need(p&&['pending','disputed','conflict'].includes(p.status),'This proposal is no longer open.',409);
  if(automatic){need(p.status==='pending'&&p.due<=this.now(),'Not eligible for automatic acceptance');need(!this.one('SELECT id FROM objections WHERE proposal_id=?',id),'An objection prevents automatic acceptance');}
  else {this.admin(actor);need(actor!==p.author,'A separate reviewer must decide your own proposal.',403);need(text(reason).length>=8,'Record a decision reason.');}
  const anchor=this.person(p.anchor);need(anchor,'Anchor no longer exists',409);need(!automatic||anchor.version===p.version,'Family changed during review; an administrator must reconcile the proposal.',409);
  const payload=this.validatePayload(anchor,JSON.parse(p.payload));const personId=payload.existingId||randomUUID();const edges=this.edgesFor(p.anchor,personId,payload);this.validateEdges(edges);
  if(!payload.existingId)this.run('INSERT INTO people(id,name,aliases,gender,village,source,notes,kind,proposal_id) VALUES(?,?,?,?,?,?,?,?,?)',personId,payload.name,payload.aliases,payload.gender,payload.village,payload.source,'',anchor.kind==='demo'?'demo':'community',id);
  for(const [a,b,type,role]of edges)this.run('INSERT INTO relationships(id,a,b,type,role,source,proposal_id) VALUES(?,?,?,?,?,?,?)',randomUUID(),a,b,type,role,payload.source,id);
  for(const node of new Set(edges.flatMap(e=>e.slice(0,2))))this.run('UPDATE people SET version=version+1 WHERE id=?',node);
  this.run('UPDATE proposals SET status=?,decision=?,person_id=? WHERE id=?',automatic?'auto_accepted':'accepted',automatic?'Accepted after seven days with no objection.':text(reason,1000),personId,id);
  this.log(actor,automatic?'proposal_auto_accepted':'proposal_accepted',p.anchor,{proposal:id,person:personId,reason});this.notify(p.author,id,'Your family addition has been accepted.');
 }
 decide(actor,id,decision,reason){
  return this.transaction(()=>{
   const p=this.one('SELECT * FROM proposals WHERE id=?',id);need(p,'Proposal not found',404);
   if(decision==='withdraw'){need(p.author===actor&&['pending','disputed','conflict'].includes(p.status),'Only the author may withdraw an open proposal',403);this.run("UPDATE proposals SET status='withdrawn',decision=? WHERE id=?",text(reason)||'Withdrawn by author',id);this.log(actor,'proposal_withdrawn',p.anchor,{proposal:id});return;}
   this.admin(actor);need(text(reason).length>=8,'Record a decision reason.');need(actor!==p.author,'A separate reviewer must decide your proposal.',403);
   if(decision==='accept')return this.accept(actor,id,false,reason);
   if(decision==='reject'){need(['pending','disputed','conflict'].includes(p.status),'Proposal is no longer open',409);this.run("UPDATE proposals SET status='rejected',decision=? WHERE id=?",text(reason,1000),id);}
   else if(decision==='revert'){
    need(['accepted','auto_accepted'].includes(p.status),'Only accepted changes can be reverted',409);
    const created=this.one('SELECT id FROM people WHERE proposal_id=?',id);
    need(!created||!this.one('SELECT id FROM relationships WHERE active=1 AND (a=? OR b=?) AND (proposal_id IS NULL OR proposal_id<>?)',created.id,created.id,id),'Later family links depend on this person. Resolve those changes first; descendants will not be deleted.',409);
    need(!created||!this.one("SELECT id FROM claims WHERE person_id=? AND status IN ('pending','approved')",created.id),'This person has a profile claim. Resolve stewardship before reverting.',409);
    this.run('UPDATE relationships SET active=0 WHERE proposal_id=?',id);if(created)this.run('UPDATE people SET active=0 WHERE id=?',created.id);
    this.run('UPDATE people SET version=version+1 WHERE id=?',p.anchor);this.run("UPDATE proposals SET status='reverted',decision=? WHERE id=?",text(reason,1000),id);
   }else throw new Problem('Unknown decision');
   this.log(actor,'proposal_'+decision,p.anchor,{proposal:id,reason});this.notify(p.author,id,'Proposal '+decision+': '+text(reason));
  });
 }
 tick(){this.transaction(()=>{for(const p of this.all("SELECT id FROM proposals WHERE status='pending' AND due<=?",this.now())){try{this.accept('system',p.id,true);}catch(e){if(!(e instanceof Problem))throw e;this.run("UPDATE proposals SET status='conflict',decision=? WHERE id=?",e.message,p.id);this.notify('admin',p.id,'Automatic acceptance paused: '+e.message);}}});}
 advance(actor,days){this.admin(actor);need(Number.isInteger(days)&&days>=1&&days<=8,'Advance between 1 and 8 preview days');this.transaction(()=>{this.run("UPDATE meta SET value=CAST(value AS INTEGER)+? WHERE key='clock_offset'",days*DAY);this.log(actor,'preview_clock_advanced','clock',{days});});this.tick();}
 state(actor){
  this.tick();const user=actor?this.user(actor):null;
  const proposals=user?this.all(`SELECT p.*,a.name AS author_name,x.name AS anchor_name FROM proposals p JOIN accounts a ON a.id=p.author JOIN people x ON x.id=p.anchor ORDER BY p.created DESC LIMIT 100`).map(p=>({...p,payload:JSON.parse(p.payload),objections:this.all('SELECT o.*,a.name AS author_name FROM objections o JOIN accounts a ON a.id=o.author WHERE proposal_id=?',p.id)})):[];
  return {actor:user,now:this.now(),previewDays:Number(this.one("SELECT value FROM meta WHERE key='clock_offset'").value)/DAY,counts:{archive:this.one("SELECT COUNT(*) AS n FROM people WHERE kind='archive'").n,community:this.one("SELECT COUNT(*) AS n FROM people WHERE kind='community' AND active=1").n,villages:this.one("SELECT COUNT(DISTINCT village) AS n FROM people WHERE kind='archive'").n,pending:this.one("SELECT COUNT(*) AS n FROM proposals WHERE status IN ('pending','disputed','conflict')").n},villages:this.all("SELECT village,COUNT(*) AS count FROM people WHERE active=1 AND kind='archive' GROUP BY village ORDER BY village"),claims:user?this.all(`SELECT c.*,p.name AS person_name,a.name AS account_name FROM claims c JOIN people p ON p.id=c.person_id JOIN accounts a ON a.id=c.account_id WHERE ?='admin' OR c.account_id=? ORDER BY created DESC`,user.role,user.id):[],proposals,notifications:user?this.all('SELECT * FROM notifications WHERE account_id=? ORDER BY created DESC LIMIT 50',user.id):[],audit:user?.role==='admin'?this.all('SELECT * FROM audit ORDER BY id DESC LIMIT 40'):[]};
 }
 importRecords(rows,filename,hash){
  if(this.one('SELECT hash FROM imports WHERE hash=?',hash))return {count:0,alreadyImported:true};
  need(!this.one('SELECT hash FROM imports LIMIT 1'),'A different import is already present. Reconcile a new version explicitly; existing records will not be overwritten.',409);
  const ids=new Set(rows.map(r=>r.ID));need(ids.size===rows.length,'Duplicate source IDs');for(const r of rows)need(!r['Father ID']||ids.has(r['Father ID']),'Missing source parent');
  this.transaction(()=>{for(const r of rows)this.run('INSERT INTO people(id,legacy_id,name,aliases,village,generation,source,source_page,notes,kind) VALUES(?,?,?,?,?,?,?,?,?,?)','legacy:'+r.ID,r.ID,r['Person Name'],r['Villages List']||'',r['Village Name'],r.Generation,filename,r.Page,r['Notes/Migration']||'','archive');for(const r of rows)if(r['Father ID'])this.run('INSERT INTO relationships(id,a,b,type,role,source) VALUES(?,?,?,?,?,?)',randomUUID(),'legacy:'+r['Father ID'],'legacy:'+r.ID,'parent','father',filename+' · page '+r.Page);this.run('INSERT INTO imports VALUES(?,?,?,?)',hash,filename,rows.length,this.now());this.log('system','source_import','archive',{filename,hash,count:rows.length});});return {count:rows.length};
 }
 close(){this.db.close();}
}
let singleton;
export const getStore=()=>{if(!singleton){const db=new Store(resolve('data/demo.sqlite'));need(!db.one("SELECT id FROM people WHERE kind<>'demo' LIMIT 1"),'The demonstration database must contain fictional records only.',403);singleton=db;}return singleton;};
