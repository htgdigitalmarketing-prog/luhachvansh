import {NextRequest} from 'next/server';
import {reelResponse} from '../../../lib/reel-media.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=(request:NextRequest)=>reelResponse(request);
export const HEAD=(request:NextRequest)=>reelResponse(request);
