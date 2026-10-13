import Link from 'next/link';import {Text} from '../../components/Language';import WatchSection from '../../components/WatchSection';
export const dynamic='force-dynamic';
export default function Watch(){
 return <main className="archive-page watch-page">
  <nav className="archive-breadcrumb"><Link href="/"><Text value="मुख्य पृष्ठ"/></Link><span>/</span><span><Text value="वीडियो" en="Watch"/></span></nav>
  <header className="reading-library-header"><span className="eyebrow"><Text value="छोटे हिन्दी वीडियो" en="Short Hindi videos"/></span><h1><Text value="देखें, फिर पढ़ें" en="Watch, then read"/></h1><p><Text value="दो छोटे वीडियो: एक हमारे इतिहास का परिचय, दूसरा वंशावली में अपना परिवार खोजने का तरीका। हर वीडियो के साथ उसका पूरा पाठ और स्रोत दिए गए हैं।" en="Two short videos: one introduces our history, the other shows how to find your family in the family tree. Each comes with its full transcript and sources."/></p></header>
  <WatchSection/>
 </main>;
}
