import {NextResponse} from 'next/server';
import {publicViewerData} from '../../../lib/public-viewer.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
// Public dictionary only. Typed text is matched in the browser and is never sent to this endpoint.
export async function GET(){
 try{const words=new Set<string>();for(const p of publicViewerData().records){for(const value of [p.name,p.villageName]){if(!value)continue;words.add(value);for(const word of value.match(/[\u0900-\u097f]+/g)||[])words.add(word);}}
  for(const word of 'मेरा मेरी मेरे हमारा हमारी हमारे परिवार गाँव गांव नाम पिता माता भाई बहन बेटी बेटा पत्नी पति जन्म विवाह वर्ष इतिहास पुराना नई नए नया जानकारी तस्वीर फोटो मंदिर समारोह समाज योगदान यहाँ वहाँ और में से को का की के है हैं था थे थी बहुत सुंदर अपना अपने अपनी रहता रहती रहते हूँ हम मैं आप भारत शहर राज्य देश नमस्ते धन्यवाद'.split(' '))words.add(word);
  return NextResponse.json({words:[...words].filter(w=>/[\u0900-\u097f]/.test(w))},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({words:[]},{status:503,headers:{'Cache-Control':'no-store'}});}
}
