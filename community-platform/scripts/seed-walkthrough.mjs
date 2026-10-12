// Creates only this isolated, fictional demonstration database. Never uses LUHACH_MEMBER_DB.
import {HubStore} from '../lib/hub.mjs';
import {createHash} from 'node:crypto';
import {existsSync,writeFileSync} from 'node:fs';
const path='data/walkthrough-v3.sqlite';
if(existsSync(path))throw Error('Walkthrough database already exists; retained without changes.');
const d=new HubStore(path),password='Only for synthetic local UI tests 2026';
d.run("INSERT INTO meta VALUES('owner_setup',?)",createHash('sha256').update('walkthrough-setup').digest('hex'));
const register=(username,name,code,setup=false)=>d.register({username,name,code,password,adult:true,consent:true},setup);
const owner=await register('qa.owner','Demo Administrator','walkthrough-setup',true),admin=d.actor(owner.token).id;
const member=await register('qa.member','Ananya · demonstration',d.invite(admin,'Walkthrough member').code),alice=d.actor(member.token).id;
const friend=await register('qa.friend','Meera · demonstration',d.invite(admin,'Walkthrough connection').code),bob=d.actor(friend.token).id;
const newcomer=await register('qa.newcomer','Rohan · demonstration',d.invite(admin,'Walkthrough verification').code),rohan=d.actor(newcomer.token).id;
for(const [id,name,gender,village]of[['rajveer','Rajveer · fictional','male','Nandha · demo'],['kavita','Kavita · fictional','female','Nandha · demo'],['ananya','Ananya · fictional','female','Nandha · demo'],['arjun','Arjun · fictional','male','Nandha · demo'],['vikram','Vikram · fictional','male','Rohtak · demo'],['ishaan','Ishaan · fictional','male','Rohtak · demo'],['meera','Meera · fictional','female','Jaipur · demo'],['rohan','Rohan · fictional','male','Nandha · demo']]){d.run("INSERT INTO people(id,name,gender,village,source,kind) VALUES(?,?,?,?,?,'community')",'walk-'+id,name,gender,village,'Fictional walkthrough fixture; not a historical claim.');d.run("INSERT INTO profile_privacy VALUES(?,'verified','adult','private','','','',?)",'walk-'+id,Date.now());}
for(const[a,b,type,role]of[['rajveer','ananya','parent','father'],['kavita','ananya','parent','mother'],['rajveer','arjun','parent','father'],['kavita','arjun','parent','mother'],['rajveer','kavita','spouse',null],['ananya','vikram','spouse',null],['ananya','ishaan','parent','mother'],['vikram','ishaan','parent','father'],['meera','vikram','parent','mother']])d.run('INSERT INTO relationships(id,a,b,type,role,source) VALUES(?,?,?,?,?,?)',a+'-'+b,'walk-'+a,'walk-'+b,type,role,'Fictional walkthrough family');
d.run('UPDATE credentials SET verified=1 WHERE account_id IN (?,?)',alice,bob);
for(const[a,p,relationship]of[[alice,'ananya','self'],[alice,'kavita','relative'],[bob,'meera','self']]){const claim=d.requestClaim(a,'walk-'+p,'This is a fictional demonstration profile for testing.',relationship);d.verifyClaim(admin,claim,true,'Checked synthetic fixture; no real identity is asserted.','family_records');}
d.createProfile(rohan,{name:'Rohan new profile · fictional',village:'Nandha · demo',reason:'I am requesting review of this fictional demonstration profile.'});
for(const[a,p,city]of[[alice,'ananya','Delhi'],[bob,'meera','Jaipur']])d.saveDirectory(a,{person_id:'walk-'+p,enabled:true,consent:true,city,state:city==='Jaipur'?'Rajasthan':'Delhi',country:'India'});
d.connect(bob,{target:alice,note:'Hello Ananya. This is a fictional connection request for the website walkthrough.'});
const c=d.contribute(alice,{kind:'village',title:'A village memory · demonstration',village:'Nandha · demo',body:'This fictional submission shows how a member can preserve a village memory and invite corrections. It is not a claim about the village’s history.',source:'Synthetic walkthrough fixture, 10.10.2026.',consent:true});
writeFileSync('data/walkthrough-ids.json',JSON.stringify({admin,alice,bob,rohan,contribution:c.id},null,2));
d.run('DELETE FROM member_sessions');d.close();console.log('Isolated fictional walkthrough prepared; no real member database changed.');
