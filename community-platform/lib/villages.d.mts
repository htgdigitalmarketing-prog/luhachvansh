export function looseVillage(v:unknown):string;
export function villageEntries(query:unknown):{canonical:string,english:string,district:string,state:string,records:string[],archiveSpelling:string|null}[];
export function resolveVillage(query:unknown):{entries:unknown[],canonical:string|null,ambiguous:boolean,archiveSpelling:string|null,notes:string[]};
export function villageKey(v:unknown):string;
export function villageSpellings(recordId:string,name?:string):string[];
export function villageCounts(records:{id:string,name:string}[]):{articles:number,places:number};
