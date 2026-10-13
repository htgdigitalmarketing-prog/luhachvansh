import Link from 'next/link';import {existsSync} from 'node:fs';import {resolve} from 'node:path';import {Text} from './Language';
import reels from '../content/reels.json';
import villages from '../content/village-reels.json';
import {reelReady} from '../lib/reel-media.mjs';
type Reel=(typeof reels.reels)[number]&{duration?:number,articles?:string[],externalMedia?:boolean};
// Videos speak and caption in Hindi only; the surrounding interface follows the chosen language.
export default function WatchSection({only,villageArticle,compact=false}:{only?:string,villageArticle?:string,compact?:boolean}){
 const list=([...(reels.reels as Reel[]),...(villages.reels as Reel[])]).filter(r=>villageArticle?r.articles?.includes(villageArticle):only?r.id===only:!r.articles);
 const sectionId=only||list[0]?.id||'all';
 return <section className={'watch-section'+(compact?' compact':'')} aria-labelledby={'watch-title-'+(compact?sectionId:'all')}>
  {!compact&&<h2 id={'watch-title-all'}><Text value="देखें और पढ़ें" en="Watch and read"/></h2>}
  {list.map(r=>{const ready=r.externalMedia?reelReady(r.slug):existsSync(resolve('public/media/reels/'+r.slug+'.mp4'));const asset=(kind:string)=>r.externalMedia?'/api/reel-media?slug='+r.slug+'&kind='+kind:'/media/reels/'+r.slug+'.'+({video:'mp4',poster:'jpg',captions:'vtt'}[kind]);return <article key={r.id} id={r.id} className="watch-card">
   <div className="watch-video">{ready?<video controls playsInline preload="metadata" poster={asset('poster')} width={540} height={960} aria-describedby={r.id+'-about'}><source src={asset('video')} type="video/mp4"/><track kind="captions" srcLang="hi" label="हिन्दी" src={asset('captions')}/></video>:<p className="watch-pending"><Text value="वीडियो तैयार किया जा रहा है।" en="The video is being prepared."/></p>}</div>
   <div className="watch-text"><span className="eyebrow"><Text value="हिन्दी वीडियो" en="Hindi video"/>{r.duration?` · ${Math.round(r.duration)} `:''}{r.duration?<Text value="सेकंड" en="seconds"/>:null}</span>
    <h3 id={compact?'watch-title-'+sectionId:undefined}>{r.titleHi}{' '}<small><Text value="" en={'· '+r.titleEn}/></small></h3>
    <p id={r.id+'-about'}><Text value={r.aboutHi} en={r.aboutEn}/></p>
    <p className="watch-language"><Text value="आवाज़: शांत हिन्दी पुरुष वाणी · कम्प्यूटर-जनित · हिन्दी कैप्शन" en="Calm Hindi male narration · computer-generated · Hindi captions"/></p>
    <details open={!compact}><summary><Text value="वीडियो का पूरा पाठ (हिन्दी)" en="Full video transcript (Hindi)"/></summary><div lang="hi">{r.narration.map((line,i)=><p key={i}>{line}</p>)}</div></details>
    <p className="journey-source"><Text value={r.sourcesHi} en={r.sourcesEn}/></p>
    <nav className="watch-read">{r.read.map(([href,hi,en])=><Link key={href} href={href}><Text value={hi} en={en}/> →</Link>)}</nav>
   </div></article>;})}
 </section>;
}
