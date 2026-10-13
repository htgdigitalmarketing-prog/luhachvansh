import test from 'node:test';
import assert from 'node:assert/strict';
import geo from '../content/village-geo.json' with {type:'json'};
const place=name=>geo.places.find(p=>p.en===name);
test('Census map keeps identity and coordinate provenance separate',()=>{
 const linked=geo.places.filter(p=>p.coordinateMethod==='code-linked-point-extract');assert.equal(linked.length,26);
 for(const p of linked){assert.match(p.census.code,/^\d{6}$/);assert.equal(p.sourceId,p.census.code);assert.ok(p.lat>=25&&p.lat<=31&&p.lon>=74&&p.lon<=81);assert.match(p.sourceUrl,/india-geodata/);assert.match(p.book.paragraph,/^P\d+$/);}
 assert.match(geo.research.coordinateCaveat,/Live NIC unavailable/);
});
test('book disambiguation rejects wrong same-name villages without changing original fields',()=>{
 assert.equal(place('Nandha').census.code,'061553');assert.equal(place('Nandha').census.district,'Bhiwani');assert.equal(place('Nandha').district,'Charkhi Dadri');
 assert.equal(place('Badrakha').census.code,'121443');assert.equal(place('Samaspur').census.code,'118923');
 const p=place('Punyana');assert.equal(p.district,'Sikar');assert.equal(p.census.code,'080280');assert.equal(p.census.district.trim(),'Jaipur');assert.equal(p.mappedName.en,'Punana');assert.ok(p.sourceDiscrepancy.en);
});
test('no false Census codes or substituted parent/Khurd/Kalan pins for ambiguous settlements',()=>{
 for(const name of ['Nangla Ugrasen','Kadrabad','Garhi Guldhar']){const p=place(name);assert.equal(p.status,'ambiguous');assert.equal(p.lat,undefined);assert.equal(p.census,undefined);assert.ok(p.resolution.en);}
 for(const name of ['Danshah Malik']){const p=place(name);assert.equal(p.status,'locality');assert.equal(p.census,undefined);assert.equal(p.source,'GeoNames');}
});


test('historical Paintawas remains an inference with both exact-coded present-day parts',()=>{const p=place('Paintawas');assert.equal(p.status,'historical-area');assert.equal(p.lat,undefined);assert.equal(p.census,undefined);assert.deepEqual(p.candidateLocations.map(c=>c.code),['061449','061448']);assert.match(p.interpretation.en,/not confirmed/);});
