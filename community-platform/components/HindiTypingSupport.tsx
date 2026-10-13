'use client';
import {useEffect,useState} from 'react';
import {phoneticScore} from '../lib/phonetic.mjs';
import {useLanguage} from './Language';
type Field=HTMLInputElement|HTMLTextAreaElement;
// Optional Hindi spelling choices across ordinary text fields. No automatic conversion, external service,
// person selection or credential handling. Passwords, usernames, codes, URLs and contact fields are excluded.
export default function HindiTypingSupport(){
 const {language}=useLanguage(),hi=language==='hi';const [field,setField]=useState<Field|null>(null),[value,setValue]=useState(''),[words,setWords]=useState<string[]>([]),[closed,setClosed]=useState(false);
 useEffect(()=>{let live=true;fetch('/api/typing',{cache:'no-store'}).then(r=>r.json()).then(d=>{if(live)setWords(d.words||[]);}).catch(()=>{});return()=>{live=false;};},[]);
 useEffect(()=>{const eligible=(e:Element|null):e is Field=>!!e&&((e instanceof HTMLTextAreaElement)||(e instanceof HTMLInputElement&&e.type==='text'))&&!e.hasAttribute('readonly')&&!e.hasAttribute('disabled')&&e.getAttribute('data-hindi-suggest')!=='off'&&!/password|username|handle|code|email|phone|token|url|website/i.test(e.getAttribute('name')||'')&&e.getAttribute('role')!=='combobox';
  const focus=(e:Event)=>{const f=e.target as Element;if(eligible(f)){setField(f);setValue(f.value);setClosed(false);}else if(!(f as Element)?.closest?.('.hindi-typing-support'))setField(null);};
  const input=(e:Event)=>{if(eligible(e.target as Element)){setField(e.target as Field);setValue((e.target as Field).value);setClosed(false);}};
  document.addEventListener('focusin',focus);document.addEventListener('input',input);return()=>{document.removeEventListener('focusin',focus);document.removeEventListener('input',input);};},[]);
 if(!field||closed||!value.trim())return null;
 const position=field.selectionStart??value.length,before=value.slice(0,position),last=before.match(/[A-Za-z]{2,40}$/)?.[0];if(!last)return null;
 const whole=field.tagName==='INPUT'&&/^[a-zA-Z .]{2,80}$/.test(value)?value.trim():last;
 let choices=words.map(w=>({w,score:phoneticScore(whole,w)})).filter(r=>r.score).sort((a,b)=>b.score-a.score).slice(0,6);
 const replaceWhole=choices.length>0&&whole!==last;
 if(!choices.length&&whole!==last)choices=words.map(w=>({w,score:phoneticScore(last,w)})).filter(r=>r.score).sort((a,b)=>b.score-a.score).slice(0,6);
 if(!choices.length)return null;
 function choose(word:string){if(!field)return;const next=replaceWhole?word:value.slice(0,position-last!.length)+word+value.slice(position);
  const proto=field instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,'value')?.set?.call(field,next);field.dispatchEvent(new Event('input',{bubbles:true}));field.focus({preventScroll:true});const caret=replaceWhole?word.length:position-last!.length+word.length;field.setSelectionRange(caret,caret);setValue(next);setClosed(true);}
 return <aside className="hindi-typing-support" aria-label={hi?'अंग्रेज़ी से हिन्दी टाइपिंग के विकल्प':'English to Hindi spelling choices'}>
  <div><strong>{hi?'English में लिखें → हिन्दी चुनें':'Type in English → choose Hindi'}</strong><button type="button" onClick={()=>setClosed(true)} aria-label={hi?'हिन्दी विकल्प बंद करें':'Close Hindi choices'}>×</button></div>
  <p>{hi?'इच्छानुसार चुनें; अंग्रेज़ी भी स्वीकार है। नाम/प्रविष्टि अपने-आप नहीं चुनी जाती।':'Choose if you wish; English is also accepted. No person or record is selected automatically.'}</p>
  <div>{choices.map(({w})=><button type="button" key={w} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(w)}>{w}</button>)}</div>
 </aside>;
}
