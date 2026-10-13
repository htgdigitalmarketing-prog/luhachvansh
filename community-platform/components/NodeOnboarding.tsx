'use client';
import {FormEvent,useState} from 'react';
import {Search,UserCheck,UserPlus,AlertTriangle} from 'lucide-react';
import {hiError} from '../lib/hindi.mjs';
import {useLanguage} from './Language';
type Relative={name:string,nameEnglish?:string,relationship?:string};
type Candidate={id:string,name:string,nameEnglish?:string,village:string,villageEnglish?:string,generation:string,serial:string,father:Relative|null,grandfather:Relative|null,linked:boolean};
type Found={candidates:Candidate[],total:number,limited:boolean};
async function request(url:string,body?:Record<string,unknown>){
 const r=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});
 const d=await r.json();if(!r.ok)throw Object.assign(Error(d.error||'Request failed'),{status:r.status,raw:d.error});return d;
}
// Mandatory step after signup (and for any existing unlinked account): find your own archive entry among explicit
// candidates, or request a private new profile. Nothing is pre-selected and nothing is approved automatically.
export default function NodeOnboarding({actorName,onDone}:{actorName:string,onDone:(message:string)=>Promise<void>}){
 const {language,tr}=useLanguage(),hi=language==='hi',say=(h:string,e:string)=>hi?h:e;
 const [search,setSearch]=useState({name:actorName,village:'',parent:'',code:''}),[searched,setSearched]=useState<typeof search|null>(null);
 const [found,setFound]=useState<Found|null>(null),[chosen,setChosen]=useState(''),[missing,setMissing]=useState(false),[distinct,setDistinct]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const show=(e:unknown)=>setError(tr(hiError((e as Error).message)));
 const label=(p:{name:string,nameEnglish?:string})=>hi||!p.nameEnglish||p.nameEnglish===p.name?p.name:`${p.nameEnglish} (${p.name})`;
 async function find(e:FormEvent){e.preventDefault();setBusy(true);setError('');setChosen('');setMissing(false);
  try{setFound(await request('/api/members?action=candidates&'+new URLSearchParams(search)));setSearched(search);}catch(err){show(err);}finally{setBusy(false);}}
 async function claim(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=new FormData(e.currentTarget);setBusy(true);setError('');
  try{await request('/api/members',{action:'claimNode',id:chosen,reason:d.get('reason'),confirm:d.get('confirm')==='on',searchName:searched?.name,searchVillage:searched?.village,searchParent:searched?.parent,searchCode:searched?.code});
   await onDone(say('आपका अनुरोध प्रशासक को भेज दिया गया। जाँच पूरी होने तक यह लंबित रहेगा।','Your request was sent to the administrators. It stays pending until a reviewer checks it.'));}
  catch(err){show(err);}finally{setBusy(false);}}
 async function newProfile(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());setBusy(true);setError('');
  try{await request('/api/members',{...d,action:'createProfile',notListed:d.notListed==='on',confirmDistinct:d.confirmDistinct==='on'});
   await onDone(say('नई निजी प्रोफ़ाइल का अनुरोध भेज दिया गया। प्रशासक इसकी जाँच करेंगे।','Your private new-profile request was sent for review.'));}
  catch(err){if((err as {status?:number}).status===409&&/already recorded/.test((err as {raw?:string}).raw||''))setDistinct(true);show(err);}finally{setBusy(false);}}
 const candidate=found?.candidates.find(c=>c.id===chosen);
 return <section className="m-panel m-onboarding" aria-labelledby="onboarding-title">
  <span className="eyebrow">{say('अनिवार्य चरण · खाते को वंशावली से जोड़ें','Required step · link your account to the family tree')}</span>
  <h2 id="onboarding-title">{say('वंशावली में अपनी प्रविष्टि चुनें','Choose your own entry in the family tree')}</h2>
  <p>{say('आपका खाता बन गया है। अब बताइए कि वंशावली में आप कौन हैं। एक जैसे नाम के कई लोग होते हैं, इसलिए नाम के साथ गाँव या पिता/माता का नाम लिखें। कोई प्रविष्टि अपने-आप नहीं चुनी जाती, और आपका चयन एक अलग समीक्षक जाँचेगा। समय बीतने पर अपने-आप स्वीकृति नहीं होती।','Your account is ready. Now tell us who you are in the family tree. Many people share a name, so add your village or your father’s or mother’s name. Nothing is chosen for you, a separate reviewer checks your choice, and nothing is approved just because time passes.')}</p>
  {error&&<p className="m-alert error" role="alert">{error}</p>}
  <form className="m-form-grid" onSubmit={find}>
   <label>{say('आपका नाम (जैसा वंशावली में हो)','Your name (as in the family tree)')}<input value={search.name} onChange={e=>setSearch({...search,name:e.target.value})} required minLength={2} maxLength={120}/></label>
   <label>{say('पैतृक गाँव','Ancestral village')}<input value={search.village} onChange={e=>setSearch({...search,village:e.target.value})} maxLength={120} placeholder={say('जैसे गुगाहेड़ी','e.g. Gugaheri')}/></label>
   <label>{say('पिता या माता का नाम','Father’s or mother’s name')}<input value={search.parent} onChange={e=>setSearch({...search,parent:e.target.value})} maxLength={120}/></label>
   <label>{say('परिवार से मिला कोड (यदि हो)','Code from your family (if any)')}<input value={search.code} onChange={e=>setSearch({...search,code:e.target.value})} maxLength={20} placeholder="LV-XXXX-XXXX" autoComplete="off"/><small className="m-muted">{say('जिस रिश्तेदार ने आपको वंशावली में जोड़ा है, उनसे मिला कोड। कोड होने पर नाम की बजाय उसी से खोजा जाएगा।','From the relative who added you to the tree. If given, it is used instead of the name search.')}</small></label>
   <button className="primary" disabled={busy}><Search size={16}/> {say('वंशावली में खोजें','Search the family tree')}</button>
  </form>
  {found&&<>
   <h3>{found.candidates.length?say(`${found.total} संभावित प्रविष्टियाँ`,`${found.total} possible entries`):say('कोई मेल खाती प्रविष्टि नहीं मिली।','No matching entry was found.')}</h3>
   {found.limited&&<p className="m-muted">{say('बहुत से परिणाम हैं; केवल पहले 25 दिखाए गए हैं। गाँव या पिता का नाम जोड़कर खोज सीमित करें।','Many results; only the first 25 are shown. Add a village or parent’s name to narrow the search.')}</p>}
   {found.candidates.length>0&&<fieldset className="m-candidates"><legend>{say('ध्यान से जाँचकर केवल अपनी प्रविष्टि चुनें','Check carefully and choose only your own entry')}</legend>
    {found.candidates.map(c=><label key={c.id} className={'m-candidate'+(chosen===c.id?' active':'')}>
     <input type="radio" name="candidate" value={c.id} checked={chosen===c.id} onChange={()=>setChosen(c.id)}/>
     <span><strong>{label(c)}</strong>
      <small>{say('गाँव','Village')}: {hi?c.village:(c.villageEnglish||c.village)}{c.generation?` · ${say('पीढ़ी','Generation')} ${c.generation}`:''}{c.serial?` · ${say('मूल क्रमांक','Record no.')} ${c.serial}`:''}</small>
      <small>{say('पिता / माता','Parent')}: {c.father?label(c.father):say('दर्ज नहीं','not recorded')}{c.grandfather?` · ${say('दादा','Grandparent')}: ${label(c.grandfather)}`:''}</small>
      {c.linked&&<small className="m-warning"><AlertTriangle size={13}/> {say('यह प्रविष्टि पहले से किसी सत्यापित सदस्य से जुड़ी है। यदि यह आप हैं तो प्रशासक को कारण बताएँ।','This entry is already linked to a verified member. If it is you, explain this to the administrator.')}</small>}
     </span></label>)}
   </fieldset>}
   {candidate&&<form className="m-form-grid" onSubmit={claim}>
    <p className="m-note m-wide">{say('चुना गया:','Chosen:')} <strong>{label(candidate)}</strong> · {hi?candidate.village:(candidate.villageEnglish||candidate.village)}</p>
    <label className="m-wide">{say('समीक्षक इसकी जाँच कैसे करें?','How can a reviewer check this?')}<textarea name="reason" required minLength={15} maxLength={1000} placeholder={say('पिता, दादा या किसी परिचित रिश्तेदार का नाम और गाँव लिखें। पहचान-पत्र या घर का पूरा पता न दें।','Name your father, grandfather or a known relative and their village. No identity documents or home address.')}/></label>
    <label className="m-check m-wide"><input type="checkbox" name="confirm" required/>{say('मैंने नाम, पिता, गाँव और पीढ़ी जाँच ली है; यह प्रविष्टि मेरी अपनी है।','I checked the name, parent, village and generation; this entry is my own.')}</label>
    <button className="primary" disabled={busy}><UserCheck size={16}/> {say('यह मैं हूँ — जाँच के लिए भेजें','This is me — send for review')}</button>
   </form>}
   {searched&&!missing&&<button className="outline" onClick={()=>{setMissing(true);setChosen('');}}><UserPlus size={16}/> {say('मेरा नाम इस सूची में नहीं है','My entry is not in this list')}</button>}
   {missing&&<form className="m-form-grid" onSubmit={newProfile}>
    <h3 className="m-wide">{say('निजी नई प्रोफ़ाइल का अनुरोध','Request a private new profile')}</h3>
    <p className="m-muted m-wide">{say('नई प्रोफ़ाइल निजी रहेगी और समीक्षक की जाँच के बाद ही आपसे जुड़ेगी। पिता/माता का नाम केवल समीक्षा के लिए है; इससे वंशावली में कोई रिश्ता अपने-आप नहीं बनता।','The new profile stays private and is linked to you only after review. The parent’s name is review context only; it does not create a family-tree link by itself.')}</p>
    <label>{say('पूरा नाम','Full name')}<input name="name" defaultValue={searched?.name||actorName} required minLength={2} maxLength={120}/></label>
    <label>{say('हिंदी नाम / अन्य प्रचलित नाम','Hindi name / other known name')}<input name="aliases" maxLength={120}/></label>
    <label>{say('पैतृक गाँव','Ancestral village')}<input name="village" defaultValue={searched?.village||''} required maxLength={120}/></label>
    <label>{say('पिता या माता का नाम','Father’s or mother’s name')}<input name="parentName" defaultValue={searched?.parent||''} required minLength={2} maxLength={120}/></label>
    <label className="m-wide">{say('परिवार से रिश्ता और जाँच का तरीका','Family connection and how to check it')}<textarea name="reason" required minLength={15} maxLength={1000}/></label>
    <label className="m-check m-wide"><input type="checkbox" name="notListed" required/>{say('मैंने ऊपर की सूची देख ली है; उसमें मेरी प्रविष्टि नहीं है।','I have checked the list above; my entry is not in it.')}</label>
    {distinct&&<label className="m-check m-wide"><input type="checkbox" name="confirmDistinct" required/>{say('इस गाँव में इसी नाम का दर्ज व्यक्ति मैं नहीं हूँ।','I am not the person already recorded with this name in this village.')}</label>}
    <button className="primary" disabled={busy}>{say('निजी प्रोफ़ाइल का अनुरोध भेजें','Send private profile request')}</button>
   </form>}
  </>}
 </section>;
}
