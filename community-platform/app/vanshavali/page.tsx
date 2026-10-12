import DynastyViewer from '../../components/dynasty/DynastyViewer';
import './viewer.css';
import {readHeritage} from '../../lib/heritage.mjs';
export const dynamic='force-dynamic';
export default function Page(){const chart=readHeritage()?.originalTree;return <><DynastyViewer/>{chart&&<section className="archive-page"><h2>पुराने संग्रह का मूल वंशावली चित्र</h2><p>पुरानी वेबसाइट पर उपलब्ध वंशावली का चित्र यहाँ भी देखें। नाम खोजने और रिश्तों पर प्रश्न पूछने के लिए ऊपर सदस्य लॉगिन से इंटरैक्टिव वंशावली खोलें।</p><a href={chart.url} target="_blank" rel="noreferrer" className="button primary">मूल वंशावली चित्र बड़े आकार में खोलें ↗</a><a href={chart.url} target="_blank" rel="noreferrer"><img style={{width:'100%',height:300,objectFit:'contain',marginTop:20}} src={chart.url} alt="पुराने संग्रह का लुहाच वंशावली चित्र"/></a></section>}</>;}
