import Link from 'next/link';import {existsSync} from 'node:fs';import {resolve} from 'node:path';import {Text} from './Language';
import reels from '../content/reels.json';
type Reel=(typeof reels.reels)[number]&{duration?:number};
// Videos speak and caption in Hindi only; the surrounding interface follows the chosen language.
export default function WatchSection({only,compact=false}:{only?:string,compact?:boolean}){
 const list=(reels.reels as Reel[]).filter(r=>!only||r.id===only);
 return <section className={'watch-section'+(compact?' compact':'')} aria-labelledby={'watch-title-'+(only||'all')}>
  {!compact&&<h2 id={'watch-title-all'}><Text value="देखें और पढ़ें" en="Watch and read"/></h2>}
  {list.map(r=>{const ready=existsSync(resolve('public/media/reels/'+r.slug+'.mp4'));const base='/media/reels/'+r.slug;return <article key={r.id} id={r.id} className="watch-card">
   <div className="watch-video">{ready?<video controls playsInline preload="metadata" poster={base+'.jpg'} width={540} height={960} aria-describedby={r.id+'-about'}><source src={base+'.mp4'} type="video/mp4"/><track kind="captions" srcLang="hi" label="हिन्दी" src={base+'.vtt'}/></video>:<p className="watch-pending"><Text value="वीडियो तैयार किया जा रहा है।" en="The video is being prepared."/></p>}</div>
   <div className="watch-text"><span className="eyebrow"><Text value="हिन्दी वीडियो" en="Hindi video"/>{r.duration?` · ${Math.round(r.duration)} `:''}{r.duration?<Text value="सेकंड" en="seconds"/>:null}</span>
    <h3 id={compact?'watch-title-'+only:undefined}>{r.titleHi}{' '}<small><Text value="" en={'· '+r.titleEn}/></small></h3>
    <p id={r.id+'-about'}><Text value={r.aboutHi} en={r.aboutEn}/></p>
    <p className="watch-language"><Text value="आवाज़ और कैप्शन: हिन्दी" en="Narration and captions: Hindi only"/></p>
    <details open={!compact}><summary><Text value="वीडियो का पूरा पाठ (हिन्दी)" en="Full video transcript (Hindi)"/></summary><div lang="hi">{r.narration.map((line,i)=><p key={i}>{line}</p>)}</div></details>
    <p className="journey-source"><Text value={r.sourcesHi} en={r.sourcesEn}/></p>
    <nav className="watch-read">{r.read.map(([href,hi,en])=><Link key={href} href={href}><Text value={hi} en={en}/> →</Link>)}</nav>
   </div></article>;})}
 </section>;
}
