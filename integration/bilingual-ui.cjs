const ts=require('../community-platform/node_modules/typescript'),fs=require('fs');
const root=__dirname+'/../community-platform/';
const files=['app/page.tsx','app/layout.tsx','components/Heritage.tsx','app/vanshavali/page.tsx','components/Members.tsx','components/Hub.tsx','components/ProfilePicker.tsx','components/Install.tsx','components/dynasty/DynastyViewer.tsx','components/dynasty/CanvasTreeVisualizer.tsx'];
for(const file of files){const p=root+file;let code=fs.readFileSync(p,'utf8'),edits=[];const ast=ts.createSourceFile(file,code,99,true,4);function walk(n){if(ts.isJsxText(n)){const value=n.text.trim().replace(/\s+/g,' ');if(value&&/[A-Za-z\u0900-\u097f]/.test(value))edits.push([n.pos,n.end,' <Text value='+JSON.stringify(value)+'/> ']);}ts.forEachChild(n,walk)}walk(ast);for(const [a,b,t] of edits.sort((a,b)=>b[0]-a[0]))code=code.slice(0,a)+t+code.slice(b);
const rel=file.startsWith('components/dynasty/')?'../Language':file.startsWith('components/')?'./Language':file==='app/vanshavali/page.tsx'?'../../components/Language':'../components/Language';
code='import {Text} from '+JSON.stringify(rel)+';\n'+code;
// Preserve React client directive as the first statement.
code=code.replace(/^import[^\n]+\n(["']use client["'];)/,'$1\n'+code.split('\n')[0]);fs.writeFileSync(p,code);console.log(file,edits.length);}
