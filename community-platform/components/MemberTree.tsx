'use client';
import {useEffect,useMemo,useState} from 'react';
import {CanvasTreeVisualizer,roleLabel} from './dynasty/CanvasTreeVisualizer';
import RoleLegend from './dynasty/RoleLegend';
import {PersonRecord} from './dynasty/types';
import {hiError} from '../lib/hindi.mjs';
import {useLanguage} from './Language';
type Tree={records:PersonRecord[],focus:string,own:string[],limited:boolean};
// Signed-in visual explorer: the member's own branch including private relatives they may see. Fetched with
// no-store on every open and dropped on sign-out, so another account never sees a cached tree.
export default function MemberTree({accountId,onOpen}:{accountId:string,onOpen:(p:{id:string,name:string,village:string})=>void}){
 const {language,tr}=useLanguage(),hi=language==='hi',say=(h:string,e:string)=>hi?h:e;
 const [tree,setTree]=useState<Tree|null>(null),[error,setError]=useState(''),[focus,setFocus]=useState('');
 useEffect(()=>{let live=true;setTree(null);setError('');
  fetch('/api/members?action=tree',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);if(live){setTree(d);setFocus(d.focus);}}).catch(e=>live&&setError(tr(hiError(e.message))));
  return()=>{live=false;};},[accountId]);
 const records=useMemo(()=>(tree?.records||[]).map(p=>({...p,name:hi?p.name:(p.nameEnglish||p.name)})),[tree,hi]);
 const selected=tree?.records.find(p=>p.id===focus);
 if(error)return <section className="m-panel"><p role="alert">{error}</p></section>;
 if(!tree)return <section className="m-panel" role="status">{say('आपका वंश-वृक्ष खुल रहा है…','Opening your family tree…')}</section>;
 return <section className="m-panel member-tree">
  <h2>{say('मेरा वंश-वृक्ष','My family tree')}</h2>
  <p className="m-muted">{say(`${tree.records.length} व्यक्ति: आपकी प्रविष्टि के सभी दर्ज पूर्वज और आस-पास का परिवार। निजी रिश्तेदार केवल आपको दिखते हैं; सार्वजनिक वंशावली में वे शामिल नहीं होते।`,`${tree.records.length} people: every recorded ancestor of your entry and your nearby family. Private relatives are shown only to you; they are not in the public family tree.`)}{tree.limited?say(' बहुत बड़ा परिवार — पहले 1500 व्यक्ति दिखाए गए।',' Very large family — the first 1,500 people are shown.'):''}</p>
  <div className="dynasty-map member-tree-map"><CanvasTreeVisualizer records={records} focusNodeId={focus} primaryNodeId={focus} onNodeClick={setFocus}/></div>
  {selected&&<p className="member-tree-selected" role="status"><strong>{hi?selected.name:(selected.nameEnglish||selected.name)}</strong> · {hi?selected.villageName:(selected.villageEnglish||selected.villageName)} · {selected.genealogyId}{selected.role?' · '+roleLabel(selected.role,hi):''}{selected.community?say(' · सदस्य द्वारा जोड़ा गया',' · added by a member'):''}{' '}<button className="outline" onClick={()=>onOpen({id:selected.id,name:selected.name,village:selected.villageName})}>{say('रिश्ते और विवरण देखें','See relationships and details')}</button></p>}
  <RoleLegend members/>
 </section>;
}
