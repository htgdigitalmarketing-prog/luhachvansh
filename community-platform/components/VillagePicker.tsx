'use client';
import {useId,useState} from 'react';
import {phoneticScore} from '../lib/phonetic.mjs';
import {useLanguage} from './Language';
type Village={name:string,english?:string};
export default function VillagePicker({label,labelEn,items,value,onChange}:{label:string,labelEn:string,items:Village[],value:string,onChange:(v:string)=>void}){
 const {language}=useLanguage(),hi=language==='hi',id=useId();const [query,setQuery]=useState(''),[open,setOpen]=useState(false),[active,setActive]=useState(0);
 const selected=items.find(v=>v.name===value);
 const options=items.map(v=>({v,score:query?phoneticScore(query,[v.name,v.english]):1})).filter(r=>r.score).sort((a,b)=>b.score-a.score).slice(0,20).map(r=>r.v);
 function pick(v:string){onChange(v);setQuery('');setOpen(false);setActive(0);}
 return <div className="village-picker" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}><label htmlFor={id}>{hi?label:labelEn}</label>
  <input id={id} role="combobox" aria-expanded={open} aria-controls={id+'-options'} aria-autocomplete="list" autoComplete="off" value={open?query:(selected?(hi?selected.name:(selected.english||selected.name)):'')} placeholder={hi?'English में गाँव लिखें, फिर चुनें':'Type a village in English, then choose'}
   onFocus={()=>{setOpen(true);setQuery('');}} onChange={e=>{setQuery(e.target.value);setActive(0);if(value)onChange('');}}
   onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);return;}if(e.key==='ArrowDown'){e.preventDefault();setActive(a=>Math.min(a+1,options.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActive(a=>Math.max(a-1,0));}if(e.key==='Enter'&&open){e.preventDefault();if(options[active])pick(options[active].name);}}}/>
  {open&&<div className="village-options" id={id+'-options'} role="listbox"><button type="button" role="option" aria-selected={!value} onClick={()=>pick('')}>{hi?'सभी गाँव':'All villages'}</button>{options.map((v,i)=><button type="button" role="option" aria-selected={i===active} key={v.name} onClick={()=>pick(v.name)}><strong>{v.name}</strong>{v.english&&<small>{v.english}</small>}</button>)}{!options.length&&<p>{hi?'कोई गाँव नहीं मिला; दूसरी वर्तनी आज़माएँ।':'No village found; try another spelling.'}</p>}</div>}
 </div>;
}
