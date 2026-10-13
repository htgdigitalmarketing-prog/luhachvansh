import {Text} from './Language';
// Accessible flowchart: an ordered list read in sequence by screen readers, drawn as connected steps on screen.
// Every statement mirrors lib/members.mjs (claims) and lib/store.mjs (proposals); see tests/members.test.mjs.
const steps=[
 {hi:'सदस्य खाता',en:'Member account',bodyHi:'वयस्क सदस्य निमंत्रण से खाता बनाते हैं। नई प्रोफ़ाइल और बच्चों की जानकारी शुरू से निजी रहती है।',bodyEn:'Adults join by invitation. New profiles and all children\'s details start private.'},
 {hi:'परिवार की पहचान का अनुरोध',en:'Family identity request',bodyHi:'सदस्य बताते हैं कि अभिलेख में कौन-सी प्रविष्टि उनकी है (स्वयं, अभिभावक या संबंधी) और जाँच कैसे हो सकती है।',bodyEn:'The member says which archive entry is theirs (self, guardian or relative) and how it can be checked.'},
 {hi:'स्वतंत्र प्रशासक की जाँच',en:'Independent administrator review',bodyHi:'कोई दूसरा प्रशासक जाँच का आधार और कारण दर्ज करता है। कोई भी अपना अनुरोध स्वयं स्वीकृत नहीं कर सकता; यह कभी अपने-आप स्वीकृत नहीं होता।',bodyEn:'A different administrator records the method and reason. Nobody can approve their own request, and it is never approved automatically.'},
 {hi:'छूटी जानकारी का प्रस्ताव',en:'Proposal for missing information',bodyHi:'सत्यापित सदस्य स्रोत सहित माता, बेटी, पति/पत्नी या अन्य छूटा रिश्ता जोड़ने का प्रस्ताव देते हैं।',bodyEn:'Verified members propose a missing mother, daughter, spouse or other link, with its source.'},
 {hi:'आपत्ति हो तो समाधान',en:'Objections are resolved',bodyHi:'सात दिन तक परिवार आपत्ति कर सकता है। आपत्ति आने पर प्रशासक दोनों पक्ष देखकर निर्णय लेते हैं।',bodyEn:'For seven days the family can object. An objection sends the proposal to an administrator, who decides after hearing both sides.'},
 {hi:'स्रोत सहित स्वीकृत प्रविष्टि',en:'Accepted entry with its source',bodyHi:'बिना आपत्ति वाला योग्य प्रस्ताव समय-सीमा पूरी होने पर स्वीकार होता है; हर स्वीकृति का स्रोत और लॉग रहता है और उसे वापस भी लिया जा सकता है। प्रस्तावक की पहचान सत्यापित न हो तो प्रस्ताव रुका रहता है, और बच्चे की जानकारी पर हमेशा प्रशासक निर्णय लेते हैं।',bodyEn:'An eligible unopposed proposal is accepted when its review period ends; every acceptance keeps its source and log entry and can be reverted. A proposal waits while its author\'s identity is unverified, and a child\'s record is always decided by an administrator.'},
];
export default function ContributionFlow(){
 return <section id="contribution-flow" className="flow-section" aria-labelledby="contribution-flow-title">
  <h2 id="contribution-flow-title"><Text value="योगदान और जाँच कैसे होती है" en="How contributions are checked"/></h2>
  <p><Text value="यह क्रम वेबसाइट के वास्तविक नियमों पर आधारित है। पहचान की पुष्टि (चरण 3) और जानकारी के प्रस्ताव (चरण 4–6) अलग-अलग जाँचे जाते हैं।" en="This sequence follows the website's actual rules. Identity verification (step 3) and information proposals (steps 4–6) are checked separately."/></p>
  <ol className="flowchart">{steps.map((s,i)=><li key={s.en} className={i===4?'flow-branch':undefined}><span className="flow-number" aria-hidden="true">{i+1}</span><div><strong><Text value={s.hi} en={s.en}/></strong><p><Text value={s.bodyHi} en={s.bodyEn}/></p></div></li>)}</ol>
  <p className="flow-note"><Text value="ध्यान दें: किसी व्यक्ति का नाम केवल नाम या गाँव मिलने से नहीं जोड़ा जाता। प्रमाण के बिना कोई पहचान या रिश्ता नहीं बनाया जाता।" en="Note: nobody is linked merely because a name or village matches. No identity or relationship is created without evidence."/></p>
 </section>;
}
