'use client';
import {useEffect,useRef,useState} from 'react';import {useLanguage} from './Language';
import type {Pair,Photo} from './ArchiveReading';
export type CoverSlide={photo:Photo,scene:string,label:Pair};
// Neutral place card: used when a village has no communal photograph. It never stands in for a person.
export function VillagePlaceCard({name,place,compact=false}:{name:Pair,place?:Pair,compact?:boolean}){
 const {language}=useLanguage();
 return <div className={'village-place-card'+(compact?' compact':'')} role="img" aria-label={(language==='hi'?'गाँव का परिचय चिह्न: ':'Village place card: ')+name[language]}>
 <svg viewBox="0 0 320 120" aria-hidden="true" focusable="false"><circle cx="262" cy="34" r="16" fill="#e4c48a"/><path d="M0 92 Q80 70 160 86 T320 80 V120 H0Z" fill="#c9d6bd"/><path d="M0 104 Q100 88 200 100 T320 98 V120 H0Z" fill="#aebf9f"/><path d="M150 120 Q168 98 196 84" stroke="#f6efe0" strokeWidth="7" fill="none" strokeLinecap="round"/><g fill="#8a6f50"><rect x="58" y="62" width="34" height="24" rx="2"/><path d="M54 64 L75 48 L96 64Z"/><rect x="104" y="68" width="26" height="18" rx="2"/><path d="M101 70 L117 58 L133 70Z"/></g><g fill="#6f8a63"><circle cx="226" cy="70" r="13"/><rect x="224" y="76" width="4" height="14"/></g></svg>
 <strong>{name[language]}</strong>{place&&<span>{place[language]}</span>}
 {!compact&&<small>{language==='hi'?'इस गाँव की कोई सामूहिक तस्वीर अभी चयनित नहीं है। सभी उपलब्ध मूल तस्वीरें "तस्वीरें" भाग में हैं।':'No communal photograph has been selected for this village yet. All available original photos remain in the Photos section.'}</small>}
 </div>;
}
export function VillageSlideshow({slides,title,place}:{slides:CoverSlide[],title:Pair,place?:Pair}){
 const {language}=useLanguage(),hi=language==='hi',say=(h:string,e:string)=>hi?h:e;
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(slides.length>1),[hold,setHold]=useState(false),touch=useRef<number|null>(null);
 useEffect(()=>{if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)setPlaying(false);},[]);
 useEffect(()=>{if(!playing||hold||slides.length<2)return;const t=setTimeout(()=>setIndex(i=>(i+1)%slides.length),6000);return()=>clearTimeout(t);},[playing,hold,index,slides.length]);
 if(!slides.length)return <VillagePlaceCard name={title} place={place}/>;
 const go=(n:number)=>setIndex((n+slides.length)%slides.length),slide=slides[index];
 return <section className="village-slideshow" aria-roledescription={say('स्लाइड शो','carousel')} aria-label={say(`${title.hi} की सामूहिक तस्वीरें`,`${title.en} — community photographs`)}
  onMouseEnter={()=>setHold(true)} onMouseLeave={()=>setHold(false)} onFocus={e=>{if(!(e.target as HTMLElement).dataset.play)setHold(true);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setHold(false);}}
  onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();go(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}}}
  onTouchStart={e=>{touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{const start=touch.current;touch.current=null;if(start===null)return;const dx=e.changedTouches[0].clientX-start;if(Math.abs(dx)>40){setPlaying(false);go(index+(dx<0?1:-1));}}}>
  <div className="village-slide" role="group" aria-roledescription={say('स्लाइड','slide')} aria-label={`${index+1} / ${slides.length}: ${slide.label[language]}`} aria-live={playing&&!hold?'off':'polite'}>
   <img key={slide.photo.id} src={slide.photo.url} alt={`${title[language]} — ${slide.label[language]}`}/>
   <p className="village-slide-caption"><strong>{slide.label[language]}</strong> · {say('हमारे संग्रह से','From our collection')} <span>{index+1} / {slides.length}</span></p>
  </div>
  {slides.length>1&&<div className="village-slide-controls">
   <button type="button" onClick={()=>{setPlaying(false);go(index-1);}} aria-label={say('पिछली तस्वीर','Previous photo')}>‹</button>
   <button type="button" data-play="1" onClick={()=>{setHold(false);setPlaying(p=>!p);}} aria-pressed={!playing} aria-label={playing?say('स्लाइड शो रोकें','Pause slideshow'):say('स्लाइड शो चलाएँ','Play slideshow')}>{playing?'❚❚':'▶'}</button>
   <div className="village-slide-dots">{slides.map((s,i)=><button type="button" key={s.photo.id} aria-current={i===index?'true':undefined} aria-label={`${say('तस्वीर','Photo')} ${i+1}: ${s.label[language]}`} onClick={()=>{setPlaying(false);setIndex(i);}}/>)}</div>
   <button type="button" onClick={()=>{setPlaying(false);go(index+1);}} aria-label={say('अगली तस्वीर','Next photo')}>›</button>
  </div>}
 </section>;
}
