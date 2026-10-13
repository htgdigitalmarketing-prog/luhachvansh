export type Bilingual={hi:string,en:string};
export type WikiPage={slug:string,title:Bilingual,summary:Bilingual,category:string,related:string[],sections:{id:string,title:Bilingual,body:Bilingual,source:{label:string,href:string}}[]};
export type WikiEntry={href:string,title:Bilingual,summary:Bilingual,category:string,search:string};
export const wikiPages:WikiPage[];
export function wikiBySlug(slug:string):WikiPage|null;
export function wikiIndex(villages?:{id:string,name:string}[]):WikiEntry[];
export function searchWiki(entries:WikiEntry[],query?:string,category?:string):WikiEntry[];
