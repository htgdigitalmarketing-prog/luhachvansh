import test from 'node:test';
import assert from 'node:assert/strict';
import {createVoiceSession,joinTranscript,speechSupport,voiceError,VOICE_LANGS} from '../lib/voice.mjs';
// A fake recogniser stands in for the browser API; no microphone is touched in tests.
class FakeRecognition{static last;constructor(){FakeRecognition.last=this;this.calls=[];}start(){this.calls.push('start');this.onstart?.();}stop(){this.calls.push('stop');this.onend?.();}abort(){this.calls.push('abort');this.onerror?.({error:'aborted'});this.onend?.();}
 say(parts){const results=parts.map(([t,isFinal])=>Object.assign([{transcript:t}],{isFinal}));this.onresult?.({resultIndex:0,results});}}
function session(base=''){const log={text:[],state:[]};const s=createVoiceSession({Recognition:FakeRecognition,lang:VOICE_LANGS.hi,base,onText:t=>log.text.push(t),onState:x=>log.state.push(x)});return {s,log,r:FakeRecognition.last};}
test('support detection covers standard and prefixed constructors',()=>{assert.equal(speechSupport({}),null);assert.equal(speechSupport({webkitSpeechRecognition:FakeRecognition}),FakeRecognition);assert.equal(speechSupport(undefined),null);});
test('listening fills the editable box with Hindi or English text and never submits',()=>{const {s,log,r}=session('मेरे गाँव');assert.equal(r.lang,'hi-IN');assert.equal(r.interimResults,true);assert.deepEqual(log.state[0],{listening:true});
 r.say([['नान्धा का',false]]);assert.equal(log.text.at(-1),'मेरे गाँव नान्धा का');r.say([['नान्धा का इतिहास',true]]);s.stop();assert.equal(log.text.at(-1),'मेरे गाँव नान्धा का इतिहास');assert.deepEqual(log.state.at(-1),{listening:false});assert.deepEqual(r.calls,['start','stop']);});
test('cancel restores the text typed before listening and stops the microphone',()=>{const {s,log,r}=session('typed');r.say([['spoken words',false]]);s.cancel();assert.equal(log.text.at(-1),'typed');assert.ok(r.calls.includes('abort'));assert.equal(log.state.some(x=>x.error),false,'own abort is not reported as an error');});
test('denied permission, missing microphone and unknown failures become typing fallbacks',()=>{assert.equal(voiceError('not-allowed'),'denied');assert.equal(voiceError('service-not-allowed'),'denied');assert.equal(voiceError('audio-capture'),'no-microphone');assert.equal(voiceError('aborted'),null);assert.equal(voiceError('weird'),'failed');
 const {log,r}=session('');r.onerror({error:'not-allowed'});r.onend();assert.deepEqual(log.state.at(-2),{listening:false,error:'denied'});assert.equal(log.text.at(-1),'');});
test('dispose stops listening without altering the text shown',()=>{const {s,log,r}=session('keep');r.say([['partial',false]]);const before=log.text.length;s.dispose();assert.ok(r.calls.includes('abort'));assert.equal(log.text.length,before);});
test('transcripts join with single spaces',()=>{assert.equal(joinTranscript('',''),'');assert.equal(joinTranscript('a  ','  b   c '),'a b c');assert.equal(joinTranscript('  ','x'),'x');});
