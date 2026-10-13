import covers from '../content/village-covers.json' with {type:'json'};
// A village cover is a curated communal scene, never "the first photo" (which may be one person's portrait).
// Curated IDs are intersected with the village's own public photos, so a removed or private photo can never appear.
export const sceneLabels={gathering:{hi:'सामूहिक आयोजन',en:'Community gathering'},temple:{hi:'गाँव का मंदिर',en:'Village temple'},landscape:{hi:'गाँव की धरती',en:'Village landscape'},memorial:{hi:'स्मारक स्थल',en:'Memorial site'}};
export function villageCover(village,config=covers){
 const curated=config.villages?.[String(village?.id)]?.slides||[],photos=new Map((village?.photos||[]).filter(p=>String(p?.mime||'').startsWith('image/')).map(p=>[p.id,p]));
 return curated.filter(s=>photos.has(s.id)&&sceneLabels[s.scene]).map(s=>({photo:photos.get(s.id),scene:s.scene,label:sceneLabels[s.scene]}));
}
