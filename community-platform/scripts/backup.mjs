import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { backup } from 'node:sqlite';
import { getMembers } from '../lib/members.mjs';
mkdirSync('backups',{recursive:true});const file=resolve('backups',`members-${new Date().toISOString().replaceAll(':','-')}.sqlite`);const store=getMembers();await backup(store.db,file);store.close();console.log(file);
