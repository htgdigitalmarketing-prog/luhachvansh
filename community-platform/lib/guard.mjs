import { Problem } from './store.mjs';
import {isAbsolute} from 'node:path';
export function localGuard(req, enabled, write=false, env=process.env){
 const host=req.headers.get('host')||'';
 const hostedHosts=['test.luhachvansh.com','darkseagreen-newt-136595.hostingersite.com'];
 // Opt in to the authorized main-domain cutover; existing test deployments remain restricted.
 if(env.LUHACH_PRIMARY_HOST==='luhachvansh.com')hostedHosts.push('luhachvansh.com','www.luhachvansh.com');
 if(env.LUHACH_DEPLOYMENT==='test' && hostedHosts.includes(host)){
  if(!env.LUHACH_MEMBER_DB||!isAbsolute(env.LUHACH_MEMBER_DB))throw new Problem('Test storage is not configured.',503);
  if(req.headers.get('x-forwarded-proto')!=='https' && req.nextUrl?.protocol!=='https:')throw new Problem('HTTPS is required.',403);
  if(write&&req.headers.get('origin')!==`https://${host}`)throw new Problem('Same-origin request required',403);
  return;
 }
 if(enabled!=='1'||! /^(localhost|127\.0\.0\.1|\[::1\])(:\d{1,5})?$/.test(host))throw new Problem('This milestone is a local preview. Hosted access is disabled.',403);
 // Next.js may normalize req.url to localhost even for a 127.0.0.1 request.
 // Compare the browser origin to its actual Host, not the internal request URL.
 if(write&&req.headers.get('origin')!==`http://${host}`)throw new Problem('Same-origin request required',403);
}
export function secureSession(env=process.env){return env.LUHACH_DEPLOYMENT==='test';}
