import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'csv-parse/sync';
import { getMembers } from '../lib/members.mjs';
const file=process.argv[2];if(!file)throw Error('Usage: npm run import -- "path/to/master.csv"');
const raw=readFileSync(file);const rows=parse(raw.toString('utf8').replace(/^\uFEFF+/,''),{columns:true,skip_empty_lines:true});
const db=getMembers();console.log(db.importRecords(rows,basename(file),createHash('sha256').update(raw).digest('hex')));db.close();
