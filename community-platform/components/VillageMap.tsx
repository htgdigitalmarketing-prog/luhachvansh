import {Text} from './Language';
import geo from '../content/village-geo.json';import migration from '../content/migration.json';import {villageKey} from '../lib/villages.mjs';
type Place={hi:string,en:string,district:string,state:string,status:string,lat?:number,lon?:number,source?:string,sourceId?:string,sourceUrl?:string,evidence?:string,note?:string,reference?:boolean};
// Only coordinates verified against a named public source are plotted; everything else is listed as unverified.
export default function VillageMap(){
 const places=geo.places as Place[],shown=places.filter(p=>p.status==='verified'&&typeof p.lat==='number'&&typeof p.lon==='number');
 const villages=shown.filter(p=>!p.reference),refs=shown.filter(p=>p.reference),missing=places.filter(p=>!p.reference&&p.status!=='verified');
 if(!villages.length)return null;
 const year=(p:Place)=>migration.table.rows.find(r=>villageKey(r.to)===villageKey(p.hi))?.year;
 const lat=shown.map(p=>p.lat!),lon=shown.map(p=>p.lon!),pad=0.35,minLat=Math.min(...lat)-pad,maxLat=Math.max(...lat)+pad,minLon=Math.min(...lon)-pad,maxLon=Math.max(...lon)+pad;
 const k=Math.cos((minLat+maxLat)/2*Math.PI/180),W=1000,H=Math.round(W*(maxLat-minLat)/((maxLon-minLon)*k));
 const x=(p:Place)=>((p.lon!-minLon)/(maxLon-minLon))*W,y=(p:Place)=>((maxLat-p.lat!)/(maxLat-minLat))*H;
 const grid=(a:number,b:number)=>{const out=[];for(let v=Math.ceil(a);v<=Math.floor(b);v++)out.push(v);return out;};
 return <section className="journey-block" aria-labelledby="village-map-title">
  <h2 id="village-map-title"><Text value="गाँव मानचित्र पर" en="The villages on a map"/></h2>
  <p className="journey-source"><Text value={`केवल वही ${villages.length} गाँव दिखाए गए हैं जिनके निर्देशांक किसी नामित सार्वजनिक स्रोत (Wikidata / OpenStreetMap) से ज़िले सहित मिलान करके सत्यापित हुए। स्थान अनुमानित हैं; प्रशासनिक सीमाएँ नहीं दिखाई गई हैं। रंग पुस्तक की सारणी में दर्ज निकासी-वर्ष दिखाता है।`} en={`Only the ${villages.length} villages whose coordinates were verified, including the district, against a named public source (Wikidata / OpenStreetMap) are shown. Positions are approximate; administrative boundaries are not drawn. Colour shows the departure year recorded in the book's table.`}/></p>
  <div className="journey-scroll"><svg className="village-map-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="village-map-desc"><desc id="village-map-desc">Approximate positions of villages with verified coordinates, numbered to match the list below.</desc>
   <rect width={W} height={H} className="map-bg"/>
   {grid(minLon,maxLon).map(v=><g key={'x'+v}><line x1={(v-minLon)/(maxLon-minLon)*W} x2={(v-minLon)/(maxLon-minLon)*W} y1={0} y2={H} className="map-grid"/><text x={(v-minLon)/(maxLon-minLon)*W+4} y={H-6} className="map-axis">{v}°E</text></g>)}
   {grid(minLat,maxLat).map(v=><g key={'y'+v}><line y1={(maxLat-v)/(maxLat-minLat)*H} y2={(maxLat-v)/(maxLat-minLat)*H} x1={0} x2={W} className="map-grid"/><text y={(maxLat-v)/(maxLat-minLat)*H-4} x={4} className="map-axis">{v}°N</text></g>)}
   {refs.map(p=><g key={p.en}><rect x={x(p)-5} y={y(p)-5} width={10} height={10} className="map-ref"/><text x={x(p)+9} y={y(p)+4} className="map-ref-label"><Text value={p.hi} en={p.en}/></text></g>)}
   {villages.map((p,i)=>{const yr=year(p);return <a key={p.hi+p.district} href={p.sourceUrl} target="_blank" rel="noreferrer"><circle cx={x(p)} cy={y(p)} r={p.hi.startsWith('नान')||p.hi.startsWith('नाँ')?12:9} className={'map-dot '+(yr?'y'+yr:'other')}/><text x={x(p)} y={y(p)+4} textAnchor="middle" className="map-num">{i+1}</text></a>;})}
  </svg></div>
  <div className="map-legend"><span><i className="map-dot-key y1500"/>1500</span><span><i className="map-dot-key y1700"/>1700</span><span><i className="map-dot-key y1775"/>1775</span><span><i className="map-dot-key y1800"/>1800</span><span><i className="map-dot-key y1850"/>1850–1875</span><span><i className="map-dot-key other"/><Text value="सारणी में वर्ष नहीं" en="No year in the table"/></span><span><i className="map-ref-key"/><Text value="संदर्भ शहर" en="Reference city"/></span></div>
  <ol className="map-list">{villages.map(p=><li key={p.hi+p.district}><Text value={p.hi} en={p.en}/> · <Text value={p.district} en={p.district}/>{year(p)?` · ${year(p)}`:''} · <a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.source==='wikidata'?'Wikidata':p.source==='osm'?'OpenStreetMap':p.source} {p.sourceId}</a></li>)}</ol>
  <p className="journey-source"><Text value="मूल गाँव नाँधा का स्थान किसी सार्वजनिक मानचित्र-स्रोत में सत्यापित नहीं मिला, इसलिए उसका बिंदु नहीं लगाया गया। गाँवों का क्रम और संबंध ऊपर के योजनात्मक चित्र में देखें।" en="The origin village, Nandha, could not be verified in any public map source, so no point is placed for it. See the schematic diagram above for the order and links between villages."/></p>
  {missing.length>0&&<details className="map-missing"><summary><Text value={`${missing.length} गाँवों का स्थान अभी सत्यापित नहीं`} en={`${missing.length} villages not yet located`}/></summary><p><Text value="इनके लिए कोई सार्वजनिक स्रोत ज़िले सहित स्पष्ट रूप से नहीं मिला, या एक ही नाम के कई स्थान मिले। अनुमान से बिंदु नहीं लगाया गया।" en="No public source clearly matched these with their district, or several places share the name. No point is placed by guesswork."/></p><ul>{missing.map(p=><li key={p.hi+p.district}><Text value={p.hi} en={p.en}/> · {p.district} — {p.status==='ambiguous'?<Text value="अस्पष्ट" en="ambiguous"/>:<Text value="सत्यापित नहीं" en="unverified"/>}</li>)}</ul></details>}
  <p className="journey-source"><Text value="निर्देशांक: Wikidata (CC0) और OpenStreetMap योगदानकर्ता (ODbL)। हर क्रमांक अपने स्रोत से जुड़ा है।" en="Coordinates: Wikidata (CC0) and OpenStreetMap contributors (ODbL). Each number links to its source."/> <small><Text value={`जाँच: ${geo.checked}`} en={`Checked: ${geo.checked}`}/></small></p>
 </section>;
}
