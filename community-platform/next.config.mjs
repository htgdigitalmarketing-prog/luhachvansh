import {fileURLToPath} from 'node:url';
export default { outputFileTracingRoot:fileURLToPath(new URL('.',import.meta.url)), distDir:process.env.LUHACH_DEV_DIST||'.next', poweredByHeader: false, serverExternalPackages: ['node:sqlite'], async redirects(){return [
 ...['luhach-history-hi','luhach-viewer-hi'].flatMap(slug=>[['mp4','video'],['jpg','poster'],['vtt','captions']].map(([ext,kind])=>({source:'/media/reels/'+slug+'.'+ext,destination:'/api/reel-media?slug='+slug+'&kind='+kind,permanent:false}))),
 ...[['about','about'],['history','history'],['kuldevi','kuldevi'],['present','villages'],['memories','gallery'],['news','news'],['team','team'],['shaheed','shaheed'],['achievers/all','achievers']].map(([old,section])=>({source:'/'+old,destination:'/heritage/'+section,permanent:false})),
 {source:'/news_details/:id',destination:'/heritage/news/:id',permanent:false},
 {source:'/evolution',destination:'/vanshavali',permanent:false},
 {source:'/join',destination:'/members',permanent:false},
 ];}, async headers() { return [{ source: '/:path*', headers: [{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'same-origin'},{key:'X-Frame-Options',value:'DENY'},{key:'X-Robots-Tag',value:'noindex, nofollow'}] }]; } };
