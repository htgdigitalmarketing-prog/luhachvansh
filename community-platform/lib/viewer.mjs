// The old visualiser bundled its CSV in JavaScript. This adapter exposes only
// records the signed-in, verified member may currently see, with no contacts.
export function viewerData(db, actor) {
  db.requireVerified(actor);
  const people = db.all('SELECT * FROM people WHERE active=1').filter(p => db.visible(actor, p.id));
  const ids = new Set(people.map(p => p.id));
  const edges = db.all('SELECT id,a,b,type,role FROM relationships WHERE active=1')
    .filter(r => ids.has(r.a) && ids.has(r.b));
  return graphData(people,edges);
}
// Daughter / daughter-in-law are contextual roles of one woman in the shown graph, never separate identities:
// a woman with a recorded parent is a daughter of that family; a woman with a recorded spouse is a
// daughter-in-law of the family she married into. One node can carry both roles at once.
export function familyRole(p,hasParent,hasSpouse){
  if(p.gender!=='female')return null;
  return hasParent&&hasSpouse?'daughter+daughter-in-law':hasParent?'daughter':hasSpouse?'daughter-in-law':null;
}
export function graphData(people,edges){
  const parents = new Map(), spouses = new Map();
  for (const r of edges) {
    if (r.type === 'parent') { const a = parents.get(r.b) || []; a.push({id:r.a,role:r.role}); parents.set(r.b,a); }
    if (r.type === 'spouse') for (const [a,b] of [[r.a,r.b],[r.b,r.a]]) { const s=spouses.get(a)||[];s.push(b);spouses.set(a,s); }
  }
  const present=new Set(people.map(p=>p.id));
  return { records: people.map(p => {
    const links=parents.get(p.id)||[];
    return { id:p.id, genealogyId:p.legacy_id||p.public_code||p.id, name:p.name, aliases:p.aliases,
      role:familyRole(p,links.filter(l=>present.has(l.id)).length>0,(spouses.get(p.id)||[]).some(id=>present.has(id))),
      gender:p.gender, community:p.kind==='community', villageName:p.village||'', villages:p.village?[p.village]:[],
      generation:p.generation?Number(p.generation):null, pageNumber:'',
      // A single layout anchor is not the complete relationship model.
      fatherId:(links.find(r=>r.role==='father')||links[0])?.id||null,
      fatherName:null, parentIds:links.map(r=>r.id), spouseIds:spouses.get(p.id)||[],
      sons:[],siblings:[],attributes:null,migrationInfo:null };
  }), edges, notice:'Only visible records and explicit links. No name-based inferred parents. Contacts and source notes are excluded.' };
}
