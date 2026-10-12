'use client';
import {wheelTransform,zoomAt} from '../../lib/viewer-interaction.mjs';
import {Text,useLanguage} from "../Language";

import React, { useEffect, useRef, useState } from 'react';
import { PersonRecord } from './types';
import { Loader2, ZoomIn, ZoomOut, Focus } from 'lucide-react';

interface CanvasTreeVisualizerProps {
  records: PersonRecord[];
  pathIds?: string[];
  onNodeClick?: (nodeId: string) => void;
  focusNodeId?: string | null;
  primaryNodeId?: string | null; // Start Node (A)
  targetNodeId?: string | null; // End Node (B)
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 60;
const FONT_SIZE = 11;
const X_GAP = 160;
const Y_GAP = 120;

const getVillageColor = (str: string) => {
  if (!str) return { bg: '#ffffff', border: '#e5e7eb', text: '#111827' };
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return { bg: `hsl(${h}, 70%, 94%)`, border: `hsl(${h}, 60%, 80%)`, text: `hsl(${h}, 90%, 25%)` };
};

export const CanvasTreeVisualizer: React.FC<CanvasTreeVisualizerProps> = ({
  records,
  onNodeClick,
  focusNodeId,
  primaryNodeId,
  targetNodeId, pathIds
}) => {
const {tr}=useLanguage();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [layoutNodes, setLayoutNodes] = useState<PersonRecord[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  // Viewport State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.1 });
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart=useRef({x:0,y:0,moved:false});
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // 1. Calculate Recursive Tree Layout (Forest Friendly)
  useEffect(() => {
    if (records.length === 0) return;
    setIsLayoutReady(false);

    setTimeout(() => {
        const nodeMap = new Map<string, PersonRecord>();
        const childrenMap = new Map<string, PersonRecord[]>();

        records.forEach(r => {
            r.x = 0;
            r.y = 0;
            nodeMap.set(r.id, r);
        });

        records.forEach(r => {
            if (r.fatherId && nodeMap.has(r.fatherId)) {
                if (!childrenMap.has(r.fatherId)) childrenMap.set(r.fatherId, []);
                childrenMap.get(r.fatherId)!.push(r);
            }
        });

        const roots = records.filter(r => !r.fatherId || !nodeMap.has(r.fatherId));

        roots.sort((a, b) => {
            if (a.villageName !== b.villageName) return a.villageName.localeCompare(b.villageName);
            return a.name.localeCompare(b.name);
        });

        let globalLeafCounter = 0;
        const processedIds = new Set<string>();
        const computedNodes: PersonRecord[] = [];

        const layoutDFS = (node: PersonRecord, depth=0) => {
             if(processedIds.has(node.id)) return;
             processedIds.add(node.id);
             const children = childrenMap.get(node.id) || [];

             if (children.length === 0) {
                 node.x = globalLeafCounter * X_GAP;
                 globalLeafCounter += 1;
             } else {
                 children.sort((a, b) => {
                    const idA = a.genealogyId || "";
                    const idB = b.genealogyId || "";
                    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                 });

                 children.forEach(c => layoutDFS(c,(node.generation ?? depth)+1));

                 const firstChild = children[0];
                 const lastChild = children[children.length - 1];

                 const startX = firstChild.x || 0;
                 const endX = lastChild.x || 0;

                 node.x = (startX + endX) / 2;
             }

             const gen = node.generation ?? depth;
             node.y = gen * Y_GAP;

             computedNodes.push(node);
        };

        roots.forEach(root => {
            layoutDFS(root);
            globalLeafCounter += 0.5;
        });

        records.filter(n=>!processedIds.has(n.id)).forEach(n=>layoutDFS(n));
        setLayoutNodes(computedNodes);
        setIsLayoutReady(true);

        setTransform(prev => ({
            ...prev,
            x: window.innerWidth / 2,
            y: 50,
            k: 0.15
        }));

    }, 50);
  }, [records]);

  // Highlight only the explicit, privacy-filtered server path.
  useEffect(() => { setHighlightedIds(new Set(pathIds || [])); }, [pathIds]);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer=new ResizeObserver(()=>setTransform(t=>({...t})));
    observer.observe(containerRef.current);return ()=>observer.disconnect();
  },[]);

  // 3. Focus Pan/Zoom (Enhanced for Bounding Box of Path)
  useEffect(() => {
    if (!isLayoutReady || !containerRef.current) return;

    // PRIORITY 1: Specific Node Focus (Navigation Step)
    if (focusNodeId) {
        const target = layoutNodes.find(n => n.id === focusNodeId);
        if (target && target.x !== undefined && target.y !== undefined) {
             const cx = containerRef.current.clientWidth / 2;
             const cy = containerRef.current.clientHeight / 2;
             const targetScale = 1.2; // ZOOM IN as requested (higher than default 0.8)
             setTransform({
                 x: cx - target.x * targetScale,
                 y: cy - target.y * targetScale,
                 k: targetScale
             });
        }
    }
    // PRIORITY 2: Path Overview (Initial Path Load when focusNodeId is cleared)
    else if (primaryNodeId && targetNodeId && highlightedIds.size > 0) {
         // Zoom to fit the entire highlighted path
         let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
         let count = 0;

         layoutNodes.forEach(n => {
             if (highlightedIds.has(n.id) && n.x !== undefined && n.y !== undefined) {
                 minX = Math.min(minX, n.x);
                 maxX = Math.max(maxX, n.x);
                 minY = Math.min(minY, n.y);
                 maxY = Math.max(maxY, n.y);
                 count++;
             }
         });

         if (count > 0) {
             const padding = 200;
             const width = maxX - minX + (NODE_WIDTH) + padding;
             const height = maxY - minY + (NODE_HEIGHT) + padding;
             const containerW = containerRef.current.clientWidth;
             const containerH = containerRef.current.clientHeight;

             let k = Math.min(containerW / width, containerH / height);
             k = Math.min(k, 1);
             k = Math.max(k, 0.1);
             const x = (containerW / 2) - ((minX + maxX) / 2) * k;
             const y = (containerH / 2) - ((minY + maxY) / 2) * k;
             setTransform({ x, y, k });
         }
    }
  }, [focusNodeId, primaryNodeId, targetNodeId, highlightedIds, isLayoutReady, layoutNodes]);

  // 4. Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLayoutReady) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Create Lookup Maps
    const nodeMap = new Map<string, PersonRecord>();
    const nameVillageMap = new Map<string, PersonRecord>();

    layoutNodes.forEach(n => {
        nodeMap.set(n.id, n);
        nameVillageMap.set(`${n.villageName}_${n.name}`.toLowerCase(), n);
    });

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    const viewportMinX = -transform.x / transform.k;
    const viewportMinY = -transform.y / transform.k;
    const viewportMaxX = (rect.width - transform.x) / transform.k;
    const viewportMaxY = (rect.height - transform.y) / transform.k;
    const buffer = NODE_WIDTH * 2;

    const isLineageActive = highlightedIds.size > 0;

    // Draw every explicit parent and spouse link; never infer by name.
    for (const node of layoutNodes) {
      for (const [id, spouse] of [...(node.parentIds || []).map(id=>[id,false] as const), ...(node.spouseIds || []).filter(id=>id<node.id).map(id=>[id,true] as const)]) {
        const relative=nodeMap.get(id);
        if(!relative || node.x===undefined || node.y===undefined || relative.x===undefined || relative.y===undefined) continue;
        const highlighted=highlightedIds.has(node.id)&&highlightedIds.has(id);
        ctx.beginPath();ctx.strokeStyle=highlighted?'#ea580c':spouse?'#8b5cad':'#94a3b8';
        ctx.lineWidth=highlighted?4:2;ctx.setLineDash(spouse?[8,5]:[]);
        ctx.moveTo(relative.x,relative.y);ctx.lineTo(node.x,node.y);ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Draw Nodes
    layoutNodes.forEach(node => {
        if (node.x === undefined || node.y === undefined) return;

        if (
            node.x + NODE_WIDTH/2 < viewportMinX - buffer ||
            node.x - NODE_WIDTH/2 > viewportMaxX + buffer ||
            node.y + NODE_HEIGHT/2 < viewportMinY - buffer ||
            node.y - NODE_HEIGHT/2 > viewportMaxY + buffer
        ) return;

        const isHighlighted = highlightedIds.has(node.id);
        const isFocus = node.id === focusNodeId;

        // Use primary/target IDs passed from parent to color distinctly
        const isPrimary = node.id === primaryNodeId;
        const isTarget = node.id === targetNodeId;

        if (isLineageActive && !isHighlighted) {
            ctx.globalAlpha = 0.3;
        } else {
            ctx.globalAlpha = 1.0;
        }

        const colors = getVillageColor(node.villageName);
        const x = node.x - NODE_WIDTH / 2;
        const y = node.y - NODE_HEIGHT / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 3, y + 3, NODE_WIDTH, NODE_HEIGHT);

        ctx.fillStyle = colors.bg;
        ctx.fillRect(x, y, NODE_WIDTH, NODE_HEIGHT);

        // BORDER COLOR LOGIC
        if (isHighlighted) {
            if (isPrimary) ctx.strokeStyle = '#2563eb';      // Blue for Start (A)
            else if (isTarget) ctx.strokeStyle = '#ea580c'; // Orange for End (B)
            else if (isFocus) ctx.strokeStyle = '#4f46e5';  // Indigo for intermediate focused step
            else ctx.strokeStyle = '#ea580c';               // Default Path Color
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1;
        }
        ctx.strokeRect(x, y, NODE_WIDTH, NODE_HEIGHT);

        // TEXT COLOR LOGIC
        if (isHighlighted) {
            if (isPrimary) ctx.fillStyle = '#1e3a8a';
            else if (isTarget) ctx.fillStyle = '#9a3412';
            else ctx.fillStyle = '#9a3412';
        } else {
            ctx.fillStyle = colors.text;
        }

        ctx.font = isHighlighted ? `bold ${FONT_SIZE + 1}px Inter, sans-serif` : `bold ${FONT_SIZE}px Inter, sans-serif`;
        ctx.textAlign = 'center';

        const metrics = ctx.measureText(node.name);
        if (metrics.width > NODE_WIDTH - 10) {
             ctx.font = `bold ${FONT_SIZE - 2}px Inter, sans-serif`;
        }
        ctx.fillText(node.name, node.x, node.y - 4);

        // Text (Full ID)
        ctx.fillStyle = isHighlighted ? '#ea580c' : '#4b5563';
        ctx.font = `400 ${FONT_SIZE - 3}px monospace`;
        let displayId = node.genealogyId || "";
        if (displayId.length > 20) displayId = "..." + displayId.slice(-18);
        ctx.fillText(displayId, node.x, node.y + 12);

        ctx.globalAlpha = 1.0;
    });

    ctx.restore();

  }, [layoutNodes, transform, isLayoutReady, focusNodeId, primaryNodeId, targetNodeId, highlightedIds]);

  // Input Handlers
  useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const wheel=(e:WheelEvent)=>{e.preventDefault();const rect=canvas.getBoundingClientRect();setTransform(t=>wheelTransform(t,e,e.clientX-rect.left,e.clientY-rect.top));};canvas.addEventListener('wheel',wheel,{passive:false});return()=>canvas.removeEventListener('wheel',wheel);},[]);
  const buttonZoom=(factor:number)=>{const rect=canvasRef.current?.getBoundingClientRect();if(rect)setTransform(t=>zoomAt(t,factor,rect.width/2,rect.height/2));};

  const resetView=()=>{const rect=canvasRef.current?.getBoundingClientRect();if(!rect||!layoutNodes.length)return;const focus=layoutNodes.find(n=>n.id===focusNodeId);const nodes=highlightedIds.size?layoutNodes.filter(n=>highlightedIds.has(n.id)):focus?layoutNodes.filter(n=>n.id===focus.id||n.fatherId===focus.id||n.id===focus.fatherId||focus.spouseIds?.includes(n.id)):layoutNodes;const xs=nodes.map(n=>n.x||0),ys=nodes.map(n=>n.y||0),minX=Math.min(...xs)-90,maxX=Math.max(...xs)+90,minY=Math.min(...ys)-60,maxY=Math.max(...ys)+60;const k=Math.max(.005,Math.min(1.4,rect.width/(maxX-minX),rect.height/(maxY-minY))*.85);setTransform({x:rect.width/2-(minX+maxX)/2*k,y:rect.height/2-(minY+maxY)/2*k,k});};
  const handleMouseDown = (e: React.PointerEvent<HTMLCanvasElement>) => {if(e.button!==0)return;pointerStart.current={x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);setIsDragging(true);setLastPos({x:e.clientX,y:e.clientY});};
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    if(Math.hypot(e.clientX-pointerStart.current.x,e.clientY-pointerStart.current.y)>5)pointerStart.current.moved=true;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.PointerEvent<HTMLCanvasElement>) => {setIsDragging(false);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(pointerStart.current.moved)return;
    if (!isLayoutReady) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.k;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.k;

    const clickedNode = layoutNodes.find(n =>
        n.x !== undefined && n.y !== undefined &&
        mouseX >= n.x - NODE_WIDTH/2 && mouseX <= n.x + NODE_WIDTH/2 &&
        mouseY >= n.y - NODE_HEIGHT/2 && mouseY <= n.y + NODE_HEIGHT/2
    );

    if (clickedNode && onNodeClick) {
        onNodeClick(clickedNode.id);
    }

  };

  return (
    <div ref={containerRef} className="dynasty-canvas">
      {!isLayoutReady && (
         <div className="dynasty-loading">
             <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
             <p className="font-semibold text-gray-700"> <Text value="परिवार की शाखाएँ तैयार हो रही हैं…"/> </p>
             <p className="text-xs text-gray-500"> <Text value="शाखाओं में व्यवस्थित हो रहे हैं:"/> {records.length} <Text value="व्यक्ति; कुल"/> {records.filter(r=>!r.fatherId).length} <Text value="परिवार के वृक्ष"/> </p>
         </div>
      )}

      <div className="dynasty-zoom">
         <button aria-label={tr("पास से देखें")} title={tr("पास से देखें")} onClick={() => buttonZoom(1.2)} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600"><ZoomIn className="w-5 h-5"/></button>
         <button aria-label={tr("दूर से देखें")} title={tr("दूर से देखें")} onClick={() => buttonZoom(1/1.2)} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600"><ZoomOut className="w-5 h-5"/></button>
         <button aria-label={tr("पूरा दृश्य देखें")} title={tr("पूरा दृश्य देखें")} onClick={resetView} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600"><Focus className="w-5 h-5"/></button>
      </div>

      <canvas
        ref={canvasRef}
        data-scale={transform.k} data-pan-x={transform.x} data-pan-y={transform.y} aria-label={tr("वंशावली")}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerCancel={() => setIsDragging(false)}
        className="block"
      />
    </div>
  );
};
