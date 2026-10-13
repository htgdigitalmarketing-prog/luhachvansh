'use client';
import {FormEvent,useState} from 'react';
import {Heart} from 'lucide-react';
import {useLanguage} from './Language';
import ProfilePicker from './ProfilePicker';
// Structured spouse / mother / daughter proposal for the member's own claimed node. The link, its source and
// its birth or marriage connection are explicit; a moderator decides, and the person stays private afterwards.
export default function RelativeForm({anchorName,identityVerified,busy,submit}:{anchorName:string,identityVerified:boolean,busy:boolean,submit:(data:Record<string,unknown>)=>Promise<boolean>}){
 const {language}=useLanguage(),hi=language==='hi',say=(h:string,e:string)=>hi?h:e;
 const [relation,setRelation]=useState('spouse'),[key,setKey]=useState(0);
 const second=relation==='spouse'
  ?[say('जन्म के परिवार की कड़ी: यदि उनके पिता या माता वंशावली में दर्ज हैं, उन्हें चुनें।','Birth-family link: if their father or mother is in the family tree, choose them.'),'Birth-family link: if their father or mother is in the family tree, choose them.']
  :[say('विवाह की कड़ी: यदि इस व्यक्ति के पति/पत्नी वंशावली में दर्ज हैं, उन्हें चुनें।','Marriage link: if this person’s husband or wife is in the family tree, choose them.'),'Marriage link: if this person’s husband or wife is in the family tree, choose them.'];
 async function send(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());if(await submit(d))setKey(k=>k+1);}
 return <section className="m-panel">
  <h2><Heart size={18}/> {say('पति/पत्नी, माता या बेटी जोड़ें','Add a spouse, mother or daughter')}</h2>
  <p className="m-muted">{say(`यह प्रस्ताव आपकी अपनी प्रविष्टि “${anchorName}” से जुड़ेगा। निजी परिचय में लिखी बात अपने-आप रिश्ता नहीं बनती; केवल यहाँ भेजा गया, स्रोत सहित प्रस्ताव जुड़ता है। आपकी पहचान सत्यापित होने के बाद सात दिन की आपत्ति अवधि चलती है; आपत्ति या टकराव न हो तो प्रस्ताव स्वीकार हो जाता है, आपत्ति होने पर प्रशासक निर्णय लेते हैं। बच्चे की जानकारी पर हमेशा प्रशासक निर्णय लेते हैं। जुड़ने के बाद व्यक्ति निजी रहता है: उसे आप, सीधे जुड़े सत्यापित परिवारजन और प्रशासक देख सकते हैं। सार्वजनिक वंशावली में वह तभी दिखेगा/दिखेगी जब वह वयस्क स्वयं अपने खाते से सहमति दे।`,`This proposal is linked to your own entry “${anchorName}”. Text in your private introduction never becomes a family link; only a sourced proposal sent here does. Once your identity is verified, a seven-day objection window runs: with no objection or conflict the proposal is accepted, and an administrator decides if anyone objects. A child's record is always decided by an administrator. The person stays private afterwards: you, directly linked verified relatives and administrators can see them. They appear in the public family tree only if that adult consents from their own account.`)}</p>
  {!identityVerified&&<p className="m-note">{say('आपकी अपनी पहचान अभी जाँच में है। प्रस्ताव अभी भेज सकते हैं; पहचान स्वीकृत होने पर उसकी सात दिन की आपत्ति अवधि शुरू होगी।','Your own identity is still being reviewed. You can send the proposal now; its seven-day objection window starts once your identity is approved.')}</p>}
  <form className="m-form-grid" key={key} onSubmit={send}>
   <label>{say('रिश्ता','Relationship')}<select name="relation" value={relation} onChange={e=>setRelation(e.target.value)}>
    <option value="spouse">{say('पति / पत्नी','Spouse')}</option><option value="mother">{say('माता','Mother')}</option><option value="daughter">{say('बेटी','Daughter')}</option><option value="son">{say('बेटा','Son')}</option><option value="father">{say('पिता','Father')}</option></select></label>
   <label>{say('जीवन की स्थिति','Life stage')}<select name="life" defaultValue="adult" required>
    <option value="adult">{say('वयस्क','Adult')}</option><option value="child">{say('बच्चा · 18 वर्ष से कम (निजी रहेगा)','Child · under 18 (stays private)')}</option><option value="deceased">{say('दिवंगत','Deceased')}</option><option value="unknown">{say('जानकारी नहीं','Not known')}</option></select></label>
   <ProfilePicker name="existingId" label="क्या यह व्यक्ति पहले से वंशावली में दर्ज है? तो उसी प्रविष्टि को चुनें, नई न बनाएँ।" labelEn="Is this person already in the family tree? Choose that entry instead of creating a new one."/>
   <p className="m-muted m-wide">{say('पहले से दर्ज व्यक्ति न मिले तो नीचे नया विवरण भरें:','If they are not already recorded, fill in the details below:')}</p>
   <label>{say('पूरा नाम','Full name')}<input name="name" maxLength={120}/></label>
   <label>{say('हिंदी नाम / अन्य नाम','Hindi name / other name')}<input name="aliases" maxLength={120}/></label>
   <label>{say('लिंग','Gender')}<select name="gender" defaultValue={relation==='son'||relation==='father'?'male':'female'} key={relation}><option value="female">{say('महिला','Female')}</option><option value="male">{say('पुरुष','Male')}</option><option value="unknown">{say('दर्ज नहीं','Not recorded')}</option></select></label>
   <label>{say(relation==='spouse'?'जन्म का गाँव / स्थान':'गाँव / स्थान',relation==='spouse'?'Birth village / place':'Village / place')}<input name="village" maxLength={120}/></label>
   <ProfilePicker name="secondId" label={second[0]} labelEn={second[1]}/>
   {relation==='spouse'?<label className="m-wide">{say('जन्म का परिवार (यदि वंशावली में नहीं): पिता/माता का नाम और गाँव','Birth family (if not in the tree): father’s/mother’s name and village')}<input name="birthFamily" maxLength={300}/></label>:null}
   <label className="m-wide">{say('विवाह का विवरण (वैकल्पिक): वर्ष या स्थान','Marriage details (optional): year or place')}<input name="marriage" maxLength={300}/></label>
   <label>{say('स्रोत का प्रकार','Kind of source')}<select name="sourceType" defaultValue="family_knowledge" required>
    <option value="family_knowledge">{say('परिवार की प्रत्यक्ष जानकारी','Direct family knowledge')}</option><option value="family_document">{say('परिवार का दस्तावेज़ (अपलोड न करें)','Family document (do not upload)')}</option><option value="archive_record">{say('वंशावली / पुस्तक का अभिलेख','Genealogy or book record')}</option><option value="community_elder">{say('समाज के बुज़ुर्ग की पुष्टि','Confirmed by a community elder')}</option></select></label>
   <label className="m-wide">{say('स्रोत का विवरण','Source details')}<textarea name="source" required minLength={15} maxLength={1000} placeholder={say('कौन इसकी पुष्टि कर सकता है या कौन-सा अभिलेख है? पहचान-पत्र संख्या या घर का पता न लिखें।','Who can confirm this, or which record shows it? No identity numbers or home address.')}/></label>
   <button className="primary" disabled={busy}>{say('समीक्षा के लिए भेजें','Send for review')}</button>
  </form>
 </section>;
}
