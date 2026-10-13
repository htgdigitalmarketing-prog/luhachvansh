'use client';
import {useLanguage} from '../Language';
import {ROLE_STYLE} from './CanvasTreeVisualizer';
// Text legend for the canvas: colours repeat what each node already prints, so nothing relies on colour alone.
export default function RoleLegend({members=false}:{members?:boolean}){
 const {language}=useLanguage(),hi=language==='hi',say=(h:string,e:string)=>hi?h:e;
 const d=ROLE_STYLE.daughter,l=ROLE_STYLE['daughter-in-law'];
 return <section className="role-legend" aria-label={say('वंश-वृक्ष के रंगों का अर्थ','Family tree colour key')}>
  <h3>{say('रंग और रेखाओं का अर्थ','Colour and line key')}</h3>
  <ul>
   <li><span className="role-swatch" style={{background:d.bg,borderColor:d.border}}/>{say('बेटी — दर्ज माता-पिता से जन्म का परिवार','Daughter — her recorded birth family')}</li>
   <li><span className="role-swatch" style={{background:l.bg,borderColor:l.border}}/>{say('बहू — विवाह से जुड़ा परिवार','Daughter-in-law — the family she married into')}</li>
   <li><span className="role-swatch" style={{background:`linear-gradient(90deg,${d.bg} 50%,${l.bg} 50%)`,borderColor:l.border}}/>{say('बेटी · बहू — एक ही व्यक्ति, दोनों परिवारों से जुड़ी','Daughter · daughter-in-law — one person linked to both families')}</li>
   <li><span className="role-line"/>{say('सीधी रेखा: माता-पिता और संतान','Solid line: parent and child')}</li>
   <li><span className="role-line spouse"/>{say('बैंगनी बिंदीदार रेखा: पति-पत्नी','Purple dashed line: spouses')}</li>
   {members&&<li><span className="role-swatch dashed"/>{say('बिंदीदार किनारा: सदस्य द्वारा जोड़ा गया व्यक्ति — निजी, केवल आपको दिख रहा है','Dashed border: added by a member — private, shown to you only')}</li>}
  </ul>
  <p>{say('भूमिका संदर्भ से तय होती है: एक महिला की एक ही प्रविष्टि रहती है, जो जन्म और विवाह दोनों परिवारों से जुड़ती है। पुराने अभिलेख के मूल क्रमांक (जैसे गाँव_ii_38_8) कभी नहीं बदले जाते। बाद में जोड़े गए व्यक्ति को LV-XXXX-XXXX जैसा स्थायी कोड मिलता है; इसमें गाँव, लिंग, पीढ़ी या परिवार की कोई जानकारी नहीं होती और यह कभी दोबारा नहीं दिया जाता।','Roles depend on context: a woman has one entry, linked to both her birth and married families. Original archive codes (such as village_ii_38_8) never change. People added later get a permanent code such as LV-XXXX-XXXX, which encodes no village, gender, generation or family and is never reused.')}</p>
 </section>;
}
