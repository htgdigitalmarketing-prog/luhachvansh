import Heritage from '../../../../components/Heritage';
import {sections} from '../../../../lib/heritage.mjs';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({params,searchParams}:{params:Promise<{section:string,id?:string[]}>,searchParams:Promise<{q?:string,region?:string}>}){
 const {section,id}=await params;const search=await searchParams;
 if(!Object.hasOwn(sections,section)||id&&id.length>1)notFound();
 return <Heritage section={section} id={id?.[0]} q={search.q} region={search.region}/>;
}
