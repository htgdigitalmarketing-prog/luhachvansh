import { getHub as getMembers } from '../lib/hub.mjs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const production=process.argv.includes('--production');
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), production ? 'start' : 'dev', '-H', '127.0.0.1', '-p', process.env.PORT || '3020'], {stdio:'inherit',env:{...process.env,LUHACH_LOCAL_PREVIEW:'1',...(!production?{LUHACH_DEV_DIST:'.next-dev'}:{})}});
// Process elapsed review deadlines while the local app is running, even without an open browser.
const timer=setInterval(()=>{try{getMembers().tick();}catch{console.error('Member deadline processing failed; retrying next minute.');}fetch(`http://127.0.0.1:${process.env.PORT||'3020'}/api/community?action=state`).catch(()=>{});},60000);
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
child.on('exit',code=>{clearInterval(timer);process.exit(code || 0);});
