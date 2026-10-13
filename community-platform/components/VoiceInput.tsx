'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,X} from 'lucide-react';
import {VOICE_LANGS,createVoiceSession,speechSupport} from '../lib/voice.mjs';
type Session={stop:()=>void,cancel:()=>void,dispose:()=>void};
const messages:Record<string,[string,string]>={
 denied:['माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र की सेटिंग में अनुमति दें, या प्रश्न टाइप करें।','Microphone permission was denied. Allow it in your browser settings, or type your question.'],
 'no-microphone':['कोई माइक्रोफ़ोन नहीं मिला। प्रश्न टाइप करें।','No microphone was found. Please type your question.'],
 'no-speech':['कोई आवाज़ सुनाई नहीं दी। फिर कोशिश करें या टाइप करें।','No speech was heard. Try again or type instead.'],
 network:['आवाज़ पहचानने वाली सेवा से संपर्क नहीं हो सका। प्रश्न टाइप करें।','The speech recognition service could not be reached. Please type your question.'],
 language:['इस ब्राउज़र में यह भाषा आवाज़ से लिखने के लिए उपलब्ध नहीं है।','This browser cannot recognise speech in that language.'],
 failed:['आवाज़ से लिखना शुरू नहीं हो सका। प्रश्न टाइप करें।','Voice typing could not start. Please type your question.'],
};
// User-triggered microphone input: start / stop / cancel, never submits, typing always remains available.
export default function VoiceInput({value,onChange,language,onListening}:{value:string,onChange:(v:string)=>void,language:'hi'|'en',onListening?:(on:boolean)=>void}){
 const hi=language==='hi',say=(h:string,e:string)=>hi?h:e;
 const [supported,setSupported]=useState<boolean|null>(null),[lang,setLang]=useState<'hi'|'en'>(language),[listening,setListening]=useState(false),[error,setError]=useState('');
 const session=useRef<Session|null>(null);
 useEffect(()=>{setSupported(!!speechSupport(window));},[]);
 useEffect(()=>{onListening?.(listening);},[listening]);
 // Closing the chat or hiding the page stops the microphone; nothing listens in the background.
 useEffect(()=>{const hide=()=>{if(document.hidden)session.current?.stop();};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);session.current?.dispose();};},[]);
 function start(){
  const Recognition=speechSupport(window);if(!Recognition||listening)return;setError('');setListening(true);
  try{session.current=createVoiceSession({Recognition,lang:VOICE_LANGS[lang],base:value,onText:onChange,onState:(s:{listening:boolean,error?:string})=>{setListening(s.listening);if(s.error)setError(s.error);}});}
  catch{setListening(false);setError('failed');}
 }
 if(supported===null)return null;
 if(!supported)return <p className="mitra-voice-note" role="note">{say('इस ब्राउज़र में बोलकर लिखने की सुविधा नहीं है। कृपया प्रश्न टाइप करें।','Voice typing is not supported in this browser. Please type your question.')}</p>;
 return <div className="mitra-voice">
  <div className="mitra-voice-controls">
   <label><span className="sr-only">{say('बोलने की भाषा','Speech language')}</span><select value={lang} disabled={listening} onChange={e=>setLang(e.target.value as 'hi'|'en')} aria-label={say('बोलने की भाषा','Speech language')}><option value="hi">हिन्दी</option><option value="en">English</option></select></label>
   {!listening?<button type="button" onClick={start}><Mic size={16}/> {say('बोलकर लिखें','Speak')}</button>:<>
    <button type="button" onClick={()=>session.current?.stop()}><Square size={14}/> {say('रोकें','Stop')}</button>
    <button type="button" onClick={()=>session.current?.cancel()}><X size={14}/> {say('रद्द करें','Cancel')}</button></>}
  </div>
  {listening&&<p className="mitra-listening" role="status"><span aria-hidden="true">●</span> {say('सुन रहा है… बोलना पूरा होने पर “रोकें” दबाएँ।','Listening… press “Stop” when you finish.')}</p>}
  {error&&<p role="alert">{say(...(messages[error]||messages.failed))}</p>}
  <small>{say('बोलकर लिखने के लिए आपका ब्राउज़र आवाज़ को बाहरी वाक्-पहचान सेवा (जैसे Google) को भेज सकता है। यह वेबसाइट आवाज़ रिकॉर्ड या सुरक्षित नहीं करती। प्रश्न अपने-आप नहीं भेजा जाता; भेजने से पहले लिखा हुआ पाठ जाँचें और सुधारें।','Your browser may send your voice to an external speech recognition service (for example Google) to turn it into text. This website does not record or store audio. Nothing is sent automatically; check and edit the text before asking.')}</small>
 </div>;
}
