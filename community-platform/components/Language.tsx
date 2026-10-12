'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {hiText,enText} from '../lib/hindi.mjs';
type Language='hi'|'en';
type PublicPerson={id:string,name?:string,nameEnglish?:string};
const Context=createContext<{language:Language,setLanguage:(l:Language)=>void,tr:(v:unknown,en?:string)=>string,person:PublicPerson|null,setPerson:(p:PublicPerson|null)=>void}>({language:'hi',setLanguage:()=>{},tr:v=>hiText(v),person:null,setPerson:()=>{}});
export function LanguageProvider({children}:{children:React.ReactNode}){
 const [language,setLanguage]=useState<Language>('hi');
 const [person,setPerson]=useState<PublicPerson|null>(null);
 useEffect(()=>{const stored=localStorage.getItem('luhach-language');if(stored==='en'||stored==='hi')setLanguage(stored);},[]);
 useEffect(()=>{document.documentElement.lang=language;document.title=language==="hi"?"लुहाच परिवार — इतिहास, गाँव और वंशावली":"Luhach Family — History, Villages and Family Tree";localStorage.setItem('luhach-language',language);},[language]);
 return <Context.Provider value={{language,setLanguage,person,setPerson,tr:(v,en)=>language==='hi'?hiText(v):(en&&en!==String(v)?en:enText(v))}}>{children}</Context.Provider>;
}
export const useLanguage=()=>useContext(Context);
export function Text({value,en}:{value:unknown,en?:string}){const {tr}=useLanguage();return <>{tr(value,en)}</>;}
export function LanguageSwitch(){const {language,setLanguage}=useLanguage();return <div className="language-switch" aria-label="Language / भाषा"><button aria-pressed={language==='hi'} onClick={()=>setLanguage('hi')}>हिन्दी</button><button aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>English</button></div>;}
export function BilingualInput(props:React.InputHTMLAttributes<HTMLInputElement>){const {tr}=useLanguage();return <input {...props} placeholder={props.placeholder?tr(props.placeholder):undefined}/>;}
