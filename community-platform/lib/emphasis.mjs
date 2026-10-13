// Splits display text into plain, date and quantity segments. The source text itself is never changed;
// only whole numbers are classified, so "20,000" can no longer be emphasised as "20," + a bold "000".
const digit=s=>s.replace(/[०-९]/g,d=>String(d.charCodeAt(0)-0x966));
const months='जनवरी|फ़रवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|सितम्बर|अक्टूबर|अक्तूबर|नवंबर|नवम्बर|दिसंबर|दिसम्बर|January|February|March|April|May|June|July|August|September|October|November|December';
const units='साल|वर्ष|वर्षों|बरस|years?|बीघा|बीघे|एकड़|acres?|किलोमीटर|किमी|km|कोस|मील|गाँव|गांव|villages?|पीढ़ी|पीढ़ियाँ|पीढ़ियों|generations?|लोग|लोगों|सदस्य|परिवार|families|people|रुपये|रुपए|₹|प्रतिशत|%';
const N='[0-9०-९]+(?:[,.][0-9०-९]+)*';
const pattern=new RegExp(`(?<![0-9०-९A-Za-z])(?:[0-9०-९]{1,2}\\s+(?:${months})\\s+[0-9०-९]{4}|[0-9०-९]{1,2}[./-][0-9०-९]{1,2}[./-][0-9०-९]{2,4}|${N}(?:\\s*[–-]\\s*${N})?)(?![0-9०-९])`,'gu');
const unitAfter=new RegExp(`^\\s*(?:${units})`,'iu');
const eraAfter=/^\s*(?:ई\.?|ईस्वी|ईसवी|सन्|CE|AD|BC|ई\.पू\.)/u,eraBefore=/(?:सन्?|संवत्?|वि\.\s?सं\.?|ईस्वी|in|year|since|सन)\s*$/iu;
export function emphasisSegments(text){
 const s=String(text??''),out=[];let last=0;
 for(const m of s.matchAll(pattern)){
  const value=m[0],start=m.index,before=s.slice(Math.max(0,start-14),start),after=s.slice(start+value.length,start+value.length+16);
  let kind=null;
  if(/[^\d०-९\s,.–-]/u.test(value)||/^[0-9०-९]{1,2}[./-][0-9०-९]{1,2}[./-]/.test(value))kind='date';
  else if(value.includes(',')||unitAfter.test(after))kind='number';
  else{const parts=value.split(/\s*[–-]\s*/).map(v=>Number(digit(v).replace(/[,.]/g,'')));const year=parts.every(n=>Number.isInteger(n)&&n>=300&&n<=2100)&&parts.every(v=>String(v).length>=3);if(year||(eraAfter.test(after)||eraBefore.test(before))&&parts.every(n=>n>=1&&n<=2100))kind='date';}
  if(!kind)continue;
  if(start>last)out.push({text:s.slice(last,start),kind:'text'});out.push({text:value,kind});last=start+value.length;
 }
 if(last<s.length)out.push({text:s.slice(last),kind:'text'});return out;
}
