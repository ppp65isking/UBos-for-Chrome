(async()=>{
'use strict';
if(window.ubosTerminal21)return;window.ubosTerminal21=true;
const q=s=>document.querySelector(s);
const header=q('header'),title=header.querySelector('strong');
title.textContent='>_ Terminal · 2.1';
const MAX_ASSET=64*1024*1024,MAX_IMPORT=32*1024*1024;
const CACHE='ubos.linux21.v86-0.5.44-buildroot68';
const ASSETS={
 libv86:'https://cdn.jsdelivr.net/npm/v86@0.5.44/build/libv86.js',
 wasm:'https://cdn.jsdelivr.net/npm/v86@0.5.44/build/v86.wasm',
 seabios:'https://cdn.jsdelivr.net/gh/copy/v86@94faf3d6b19ecabc53a4010aaa24252fa6a162e2/bios/seabios.bin',
 vgabios:'https://cdn.jsdelivr.net/gh/copy/v86@94faf3d6b19ecabc53a4010aaa24252fa6a162e2/bios/vgabios.bin',
 kernel:'https://copy.sh/v86/images/buildroot-bzimage68.bin'
};
const output=q('#output'),tools=document.querySelector('header ~ div')||q('#output').nextElementSibling,form=q('#form');
const host=[...document.querySelectorAll('div')].find(n=>n.getAttribute('aria-label')==='Interactive Node terminal');
const tabs=document.createElement('div');
tabs.style.cssText='display:flex;gap:6px;padding:8px 14px 0;flex-wrap:wrap';
const nodeBtn=Object.assign(document.createElement('button'),{type:'button',textContent:'Terminal + Node/npm'});
const linuxBtn=Object.assign(document.createElement('button'),{type:'button',textContent:'Linux Beta'});
tabs.append(nodeBtn,linuxBtn);
const nodePane=document.createElement('section');
nodePane.style.cssText='flex:1;min-height:0;display:flex;flex-direction:column';
nodePane.append(output,tools,host,form);
const linuxPane=document.createElement('section');
linuxPane.hidden=true;
linuxPane.style.cssText='flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:12px 14px;overflow:auto';
header.after(tabs,nodePane,linuxPane);
function selectNode(){nodeBtn.setAttribute('aria-selected','true');linuxBtn.setAttribute('aria-selected','false');nodePane.hidden=false;linuxPane.hidden=true}
function selectLinux(){nodeBtn.setAttribute('aria-selected','false');linuxBtn.setAttribute('aria-selected','true');nodePane.hidden=true;linuxPane.hidden=false}
nodeBtn.onclick=selectNode;linuxBtn.onclick=selectLinux;selectNode();
const bar=document.createElement('div');bar.style.cssText='height:8px;border-radius:99px;background:#ffffff18;overflow:hidden';
const fill=document.createElement('div');fill.style.cssText='height:100%;width:0;background:#7fd1ff;transition:width .2s';bar.append(fill);
const status=document.createElement('p');status.textContent='Linux Beta is optional and browser-local. Runtime files are downloaded only when you start them.';
const log=document.createElement('pre');log.style.cssText='flex:1;min-height:140px;margin:0;padding:10px;background:#0d1420;border:1px solid #ffffff20;border-radius:12px;overflow:auto;white-space:pre-wrap';
const serial=document.createElement('pre');serial.style.cssText='height:180px;margin:0;padding:10px;background:#101827;border:1px solid #ffffff20;border-radius:12px;overflow:auto;white-space:pre-wrap';
const controls=document.createElement('div');controls.style.cssText='display:flex;gap:6px;flex-wrap:wrap';
const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;flex-wrap:wrap;align-items:center';
const file=document.createElement('input');file.type='file';file.multiple=true;file.accept='*/*';
const mount=document.createElement('code');mount.textContent='mkdir -p /mnt/ubos; mount -t 9p -o trans=virtio,version=9p2000.L host9p /mnt/ubos';
mount.style.cssText='display:block;padding:8px;background:#ffffff0d;border-radius:8px;overflow-wrap:anywhere';
linuxPane.append(status,bar,controls,row,log,serial,mount);
function say(text,cls=''){const line=document.createElement('div');if(cls)line.className=cls;line.textContent=text;log.append(line);log.scrollTop=log.scrollHeight}
function progress(value,label){fill.style.width=Math.max(0,Math.min(100,value))+'%';status.textContent=label}
function button(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=async()=>{b.disabled=true;try{await fn()}catch(e){say('Error: '+e.message,'error')}finally{b.disabled=false}};controls.append(b);return b}
let controller=null,emulator=null,state=null,booted=false;
async function cached(name,url){
 const cache=await caches.open(CACHE);
 const hit=await cache.match(url);
 if(hit)return hit;
 controller=new AbortController();
 const response=await fetch(url,{signal:controller.signal,mode:'cors'});
 if(!response.ok)throw new Error('Download failed: '+response.status+' '+name);
 const total=Number(response.headers.get('content-length'))||0;
 if(total>MAX_ASSET)throw new Error(name+' exceeds the 64 MiB download limit');
 const reader=response.body?.getReader();
 if(!reader){const blob=await response.blob();if(blob.size>MAX_ASSET)throw new Error(name+' exceeds the 64 MiB download limit');await cache.put(url,new Response(blob));return new Response(blob)}
 const parts=[];let received=0;
 for(;;){const{done,value}=await reader.read();if(done)break;received+=value.byteLength;if(received>MAX_ASSET){controller.abort();throw new Error(name+' exceeds the 64 MiB download limit')}parts.push(value);progress(total?received/total*100:Math.min(95,received/1000),'Downloading '+name+'…')}
 const blob=new Blob(parts,{type:response.headers.get('content-type')||'application/octet-stream'});
 await cache.put(url,new Response(blob));
 return new Response(blob);
}
async function assetURL(name,url){
 const response=await cached(name,url);
 const blob=await response.blob();
 return URL.createObjectURL(blob);
}
async function start(){
 if(emulator){say('VM is already running.');return}
 progress(2,'Preparing Linux Beta downloads…');
 const urls={};
 for(const[name,url]of Object.entries(ASSETS))urls[name]=await assetURL(name,url);
 progress(96,'Starting VM…');
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=urls.libv86;
  script.onload=resolve;script.onerror=()=>reject(new Error('libv86 could not load'));
  document.head.append(script);
 });
 if(typeof V86!=='function')throw new Error('v86 did not expose its expected API');
 emulator=new V86({
  wasm_path:urls.wasm,
  memory_size:128*1024*1024,
  vga_memory_size:8*1024*1024,
  bios:{url:urls.seabios},
  vga_bios:{url:urls.vgabios},
  bzimage:{url:urls.kernel},
  cmdline:'console=ttyS0 tsc=reliable',
  filesystem:{},
  autostart:true,
  disable_speaker:true
 });
 emulator.add_listener('emulator-ready',()=>{booted=true;progress(100,'Linux Beta running. Guest networking is OFF.');say('Buildroot started. Guest changes are temporary unless you download a VM state.')});
 emulator.add_listener('download-error',e=>say('Runtime download error: '+(e?.message||e),'error'));
 emulator.add_listener('serial0-output-byte',byte=>{serial.textContent+=String.fromCharCode(byte);if(serial.textContent.length>40000)serial.textContent=serial.textContent.slice(-30000);serial.scrollTop=serial.scrollHeight});
}
function send(text){if(!emulator||!booted)throw new Error('Start the Linux VM first');emulator.serial_send(text)}
button('Start / resume',async()=>{
 if(state&&emulator){await emulator.restore_state(state);say('Saved VM state restored.');return}
 await start();
});
button('Pause',()=>{if(!emulator)throw new Error('VM is not running');emulator.stop();say('VM paused.')});
button('Stop VM',()=>{
 if(!emulator)throw new Error('VM is not running');
 try{emulator.destroy()}catch(e){emulator.stop()}
 emulator=null;booted=false;state=null;progress(0,'VM stopped. Cached downloads remain available.');
 say('VM stopped. Guest filesystem changes were temporary.');
});
button('Download VM state',async()=>{
 if(!emulator)throw new Error('VM is not running');
 state=await emulator.save_state();
 const url=URL.createObjectURL(new Blob([state],{type:'application/octet-stream'}));
 const a=document.createElement('a');a.href=url;a.download='ubos-linux21-vm-state.bin';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
 say('VM state downloaded. It may contain private guest data; store it carefully.');
});
button('Remove runtime downloads',async()=>{
 if(emulator)throw new Error('Stop the VM before removing downloads');
 const cache=await caches.open(CACHE);
 for(const url of Object.values(ASSETS))await cache.delete(url);
 progress(0,'Runtime downloads removed.');
 say('Removed cached Linux Beta runtime files.');
});
file.onchange=async()=>{
 if(!emulator||!booted)throw new Error('Start the Linux VM before importing files');
 for(const f of file.files){
  if(f.size>MAX_IMPORT){say('Skipped '+f.name+': exceeds the 32 MiB import limit.','error');continue}
  const bytes=new Uint8Array(await f.arrayBuffer());
  emulator.create_file('/ubos-import-'+f.name.replace(/[^\w.-]+/g,'_'),bytes);
  say('Imported '+f.name+' into the 9p shared folder.');
 }
 file.value='';
};
row.append(file);
for(const command of ['uname -a','pwd','ls -la','busybox --list','df -h'])button(command,()=>send(command+'\n'));
button('Ctrl+C',()=>send(String.fromCharCode(3)));
say('Linux Beta uses v86 0.5.44 and Buildroot. No guest networking, apt/apk, GitHub CLI installation, or universal package compatibility is provided.');
say('Imported files appear in the guest 9p share. Mount them with the command above. Guest changes are temporary unless a VM state is downloaded; VM states may contain private guest data.');
})();