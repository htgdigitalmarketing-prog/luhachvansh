import type {ArchivePhoto} from './heritage.d.mts';
export type CoverSlide={photo:ArchivePhoto,scene:string,label:{hi:string,en:string}};
export const sceneLabels:Record<string,{hi:string,en:string}>;
export function villageCover(village:{id:string,photos:ArchivePhoto[]}|null|undefined,config?:unknown):CoverSlide[];
