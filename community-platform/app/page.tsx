import Link from 'next/link';
import {readHeritage} from '../lib/heritage.mjs';
export const dynamic='force-dynamic';
export default function Home(){
 const data=readHeritage();
 const about=data?.about.find((r:any)=>r.id==='1');
 const hero=data?.gallery.find((r:any)=>r.photo.mime.startsWith('image/'))?.photo.url||'/heritage/gathering.webp';
 return <main className="heritage-home">
 <section className="heritage-hero"><div><span className="eyebrow">लुहाच परिवार · हमारी साझा धरोहर</span><h1>अपनी जड़ों से जुड़ें।<br/>हर रिश्ते को जगह दें।</h1><p className="heritage-hindi">हमारा इतिहास, हमारे गाँव और हमारे परिवार — एक साथ।</p><p>अपने पुरखों और परिवार की शाखाओं को खोजें। बेटियों, माताओं और बहुओं के छूटे हुए रिश्ते जोड़कर वंशावली पूरी करने में साथ दें।</p><div className="hub-actions"><Link className="button primary" href="/vanshavali">वंशावली देखें →</Link><Link className="button" href="/heritage/villages">अपने गाँव के बारे में पढ़ें</Link></div></div><figure><img src={hero} alt="लुहाच परिवार के पुराने संग्रह की तस्वीर"/><figcaption>लुहाच परिवार की स्मृतियों से</figcaption></figure></section>
 <section className="heritage-stats"><div><strong>{data?.villages.length||'—'}</strong><span>गाँव के लेख और दस्तावेज़</span></div><div><strong>10,061</strong><span>वंशावली में संजोए गए नाम</span></div><div><strong>हर रिश्ता</strong><span>बेटियाँ, माताएँ और बहुएँ भी</span></div></section>
 <section className="heritage-intro"><span className="eyebrow">हमारा परिवार</span><h2>लुहाच वंश के बारे में</h2><p className="home-story">{about?.text.slice(0,650)||'लुहाच परिवार के इतिहास, गाँव और स्मृतियों के संग्रह में आपका स्वागत है।'}</p><Link className="button" href="/heritage/about">पूरा परिचय पढ़ें →</Link><div className="hub-grid">{[
 ['हमारा इतिहास','लुहाच वंश का इतिहास और पुराने लेख।','/heritage/history'],
 ['हमारे गाँव','गाँव का इतिहास, तस्वीरें और मूल वंशावली दस्तावेज़।','/heritage/villages'],
 ['वंशावली और जार्विस','परिवार की शाखाएँ देखें, रिश्ते खोजें और अपने प्रश्न पूछें।','/vanshavali'],
 ['तस्वीरें और स्मृतियाँ','समारोहों और गाँवों की पुरानी तस्वीरें।','/heritage/gallery'],
 ['समाज की प्रतिभाएँ','समाज के सदस्यों के परिचय और उपलब्धियाँ।','/heritage/achievers'],
 ['हमारे शहीद','वीरता और बलिदान को नमन।','/heritage/shaheed'],
 ['कुलदेवी','संग्रह में संजोई गई हमारी परंपरा।','/heritage/kuldevi'],
 ['हमारी टीम','समाज को जोड़ने वाले साथी।','/heritage/team'],
 ['सदस्य समुदाय','गाँव की जानकारी और फोटो जोड़ें; सहमति से सदस्यों से जुड़ें।','/community']
 ].map(([title,body,href],i)=><Link className="heritage-feature" href={href} key={href}><span>{String(i+1).padStart(2,'0')}</span><h3>{title}</h3><p>{body}</p><strong>खोलें →</strong></Link>)}</div></section>
 <section className="heritage-band"><h2>बेटी की कहानी भी वंशावली का हिस्सा है।</h2><p>एक ही व्यक्ति को जन्म के परिवार और विवाह के परिवार से जोड़ें। नया नाम जोड़ने से पहले खोजें, ताकि एक व्यक्ति की दो प्रविष्टियाँ न बनें। सदस्य जानकारी जोड़ सकते हैं; आपत्ति आने पर प्रशासक उसका समाधान करेंगे।</p><Link className="button" href="/members">अपने परिवार का छूटा रिश्ता जोड़ें →</Link></section>
 <section className="heritage-intro"><h2>समाज के समाचार</h2><div className="hub-three">{data?.news.slice(0,3).map((r:any)=><Link href={'/heritage/news/'+r.id} key={r.id}><h3>{r.title}</h3><p>{r.text.slice(0,230)}…</p><strong>पूरा समाचार पढ़ें →</strong></Link>)}</div><Link className="button" href="/heritage/news">सभी समाचार देखें</Link></section>
 <section className="heritage-intro"><h2>विश्वास और आपकी सहमति</h2><div className="hub-three"><p><strong>रिश्ते का सत्यापन</strong><br/>सदस्य की परिवार से पहचान की जाँच प्रशासक करते हैं।</p><p><strong>साझा करना आपका निर्णय</strong><br/>नई प्रोफ़ाइल और बच्चों की जानकारी निजी रहती है। संपर्क और स्थान के लिए अलग सहमति ली जाती है।</p><p><strong>स्रोत के साथ जानकारी</strong><br/>परिवार के अभिलेख या जानकारी देने वाले व्यक्ति का उल्लेख रखें, ताकि सुधार और विवाद का समाधान हो सके।</p></div></section>
 </main>;
}
