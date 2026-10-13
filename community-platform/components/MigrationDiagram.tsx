import Link from 'next/link';import {Text} from './Language';
import migration from '../content/migration.json';import {resolveVillage,looseVillage} from '../lib/villages.mjs';import {englishText} from '../lib/heritage.mjs';
type Row={year:number,from:string,to:string,migrant:string,cite:string};
const href=(name:string)=>{const r=resolveVillage(name);const id=(r.entries[0] as {records?:string[]}|undefined)?.records?.[0];return id?'/heritage/villages/'+id:undefined;};
const en=(name:string)=>{const e=resolveVillage(name).entries[0] as {english?:string}|undefined;return e?.english||englishText(name);};
// Schematic only: columns are the book's recorded years, not distance or direction.
export default function MigrationDiagram(){
 const rows=migration.table.rows as Row[],years=[...new Set(rows.map(r=>r.year))];
 const W=1160,colX=(i:number)=>230+i*135,rowY=(i:number,n:number,c:number)=>n===1?(c%2?170:450):90+i*(430/n)+(430/n)/2,originY=310;
 const nodes=years.flatMap((y,c)=>{const list=rows.filter(r=>r.year===y);return list.map((r,i)=>({...r,x:colX(c),y:rowY(i,list.length,c)}));});
 const at=(name:string)=>nodes.find(n=>looseVillage(n.to)===looseVillage(name));const giravad=at('गिरावड़');
 return <section className="journey-block" aria-labelledby="migration-diagram-title">
  <h2 id="migration-diagram-title"><Text value="नाँधा से गाँवों तक: पुस्तक में दर्ज निकासी" en="From Nandha to the villages: departures recorded in the book"/></h2>
  <p className="journey-source"><Text value={`स्रोत: ${migration.source.authorHi}, '${migration.source.titleHi}', ${migration.source.date}, सारणी ${migration.table.cite}। यह योजनात्मक चित्र है: स्तंभ दर्ज वर्ष दिखाते हैं; दूरी और दिशा वास्तविक नहीं हैं।`} en={`Source: ${migration.source.authorEn}, '${migration.source.titleEn}', ${migration.source.date}, table ${migration.table.cite}. This is a schematic diagram: columns show the recorded years; distance and direction are not geographic.`}/></p>
  <div className="journey-scroll"><svg className="migration-svg" viewBox={`0 0 ${W} 600`} role="img" aria-labelledby="migration-svg-desc"><desc id="migration-svg-desc">Schematic of departures from Nandha recorded in the book's table, grouped by year; the same information is listed below as text.</desc>
   {years.map((y,c)=><g key={y}><line x1={colX(c)} x2={colX(c)} y1={60} y2={540} className="mig-grid"/><text x={colX(c)} y={45} className="mig-year" textAnchor="middle">{y}</text></g>)}
   <text x={colX(years.length)} y={45} className="mig-year" textAnchor="middle">1954–1971</text>
   {nodes.map((n,i)=><path key={'p'+i} d={`M110 ${originY} C ${(110+n.x)/2} ${originY}, ${(110+n.x)/2} ${n.y}, ${n.x-8} ${n.y}`} className="mig-link"/>)}
   {giravad&&migration.secondHops.map((h,i)=>{const y=giravad.y+(i?70:-70),x=colX(years.length);return <g key={h.to}><path d={`M${giravad.x+8} ${giravad.y} C ${giravad.x+60} ${giravad.y}, ${x-60} ${y}, ${x-8} ${y}`} className="mig-link second"/><circle cx={x} cy={y} r={7} className="mig-node second"/><a href={href(h.to)}><text x={x} y={y-14} textAnchor="middle" className="mig-label"><Text value={h.to} en={en(h.to)}/></text></a><text x={x} y={y+22} textAnchor="middle" className="mig-cite">{h.cite.split(',')[0]}</text></g>;})}
   <circle cx={95} cy={originY} r={16} className="mig-origin"/><text x={95} y={originY+40} textAnchor="middle" className="mig-label strong"><Text value="नाँधा" en="Nandha"/></text><text x={95} y={originY+58} textAnchor="middle" className="mig-cite">865 / 860 ई.*</text>
   {nodes.map((n,i)=>{const link=href(n.to);const label=<text x={n.x+12} y={n.y+5} className="mig-label"><Text value={n.to} en={en(n.to)}/></text>;return <g key={'n'+i}><circle cx={n.x} cy={n.y} r={7} className="mig-node"/>{link?<a href={link}>{label}</a>:label}<text x={n.x+12} y={n.y+21} className="mig-cite">{n.cite}</text></g>;})}
   <text x={20} y={585} className="mig-cite"><Text value="* संस्थापक की तिथि के दो रूप पुस्तक में हैं; नीचे देखें। ठोस रेखा: सारणी की निकासी। बिंदीदार: गिरावड़ से बाद का प्रवास।" en="* The book records two founder dates; see below. Solid line: table departure. Dashed: later move from Giravad."/></text>
  </svg></div>
  <h3><Text value="पाठ रूप में" en="As text"/></h3>
  <ol className="migration-list">{years.map(y=><li key={y}><strong>{y} <Text value="ई." en="CE"/></strong><ul>{rows.filter(r=>r.year===y).map(r=><li key={r.cite}>{href(r.to)?<Link href={href(r.to)!}><Text value={r.to} en={en(r.to)}/></Link>:<Text value={r.to} en={en(r.to)}/>} — <Text value={r.migrant} en={englishText(r.migrant)}/> <small>({r.cite})</small></li>)}</ul></li>)}
   {migration.secondHops.map(h=><li key={h.to}><strong><Text value={h.yearText} en={h.yearEn}/></strong><ul><li><Text value={`${h.from} → ${h.to}`} en={`${en(h.from)} → ${en(h.to)}`}/> <small>({h.cite})</small></li></ul></li>)}</ol>
  <p><Text value={migration.route.hi} en={migration.route.en}/> <small>({migration.route.cite})</small></p>
 </section>;
}
