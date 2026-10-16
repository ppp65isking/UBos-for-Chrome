(()=>{
'use strict';
if(window.ubosTerminal21)return;window.ubosTerminal21=true;
const q=s=>document.querySelector(s);
const header=q('header'),title=header.querySelector('strong');
title.textContent='>_ Terminal · 2.1';
const CACHE='ubos.linux21.v86-0.5.44-buildroot68';
const MAX_ASSET=64*1024*1024,MAX_IMPORT=32*1024*1024;
const ASSETS={
 libv86:['v86 library','https://cdn.jsdelivr.net/npm/v86@0.5.44/build/libv86.js'],
 wasm:['v86 WebAssembly','https://cdn.jsdelivr.net/npm/v86@0.5.44/build/v86.wasm'],
 seabios:['SeaBIOS','https://cdn.jsdelivr.net/gh/copy/v86@94faf3d6b19ecabc53a4010aaa24252fa6a162e2/bios/seabios.bin'],
 vgabios:['VGA BIOS','https://cdn.jsdelivr.net/gh/copy/v86@94faf3d6b19ecabc53a4010aaa24252fa6a162e2/bios/vgabios.bin'],
 kernel:['Buildroot kernel','https://copy.sh/v86/images/buildroot-bzimage68.bin']
};
const style=document.createElement('style');
style.textContent=`#ubos-tabs{display:flex;gap:6px;padding:10px 14px 0}
#ubos-tabs button{border-radius:12px 12px 0 0;border-bottom:0}
#ubos-tabs button[aria-selected=true]{background:#ffffff1f;border-color:#7fd1ff80}
.ubos-pane{flex:1;min-height:0;display:flex;flex-direction:column}
#ubos-linux{gap:10px;padding:12px 14px;overflow:auto}
.ubos-card{border:1px solid #ffffff20;background:#ffffff08;border-radius:14px;padding:12px}
.ubos-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ubos-muted{opacity:.72;margin:6px 0 0}
.ubos-progress{height:8px;border-radius:99px;background:#ffffff18;overflow:hidden;margin-top:8px}
.ubos-progress>div{height:100%;width:0;background:#7fd1ff;transition:width .2s}
.ubos-log{flex:1;min-height:120px;margin:0;padding:10px;background:#0d1420;border:1px solid #ffffff20;border-radius:12px;overflow:auto;white-space:pre-wrap}
.ubos-serial{height:190px;flex:0 0 auto;background:#101827}
.ubos-chip{display:inline-block;padding:3px 8px;border-radius:99px;background:#ffffff12;font-size:11px}
.ubos-chip[data-state=ready]{background:#1d5c3a}
.ubos-chip[data-state=error]{background:#6b2430}
.ubos-code{display:block;margin-top:8px;padding:8px;background:#ffffff0d;border-radius:8px;overflow-wrap:anywhere}
.ubos-danger{color:#ffb4bd}`;
document.head.append(style);
const output=q('#output'),form=q('#form');
const tools=[...document.querySelectorAll('div')].find(n=>n.style?.cssText?.includes('align-items:center'));
const host=[...document.querySelectorAll('div')].find(n=>n.getAttribute('aria-label')==='Interactive Node terminal');
const tabs=document.createElement('nav');tabs.id='ubos-tabs';
const nodeBtn=Object.assign(document.createElement('button'),{type:'button',textContent:'Terminal + Node/npm'});
const linuxBtn=Object.assign(document.createElement('button'),{type:'button',textContent:'Linux Beta'});
nodeBtn.setAttribute('aria-selected','true');tabs.append(nodeBtn,linuxBtn);
const nodePane=document.createElement('section');nodePane.className='ubos-pane';
nodePane.append(output,tools,host,form);
const linuxPane=document.createElement('section');linuxPane.className='ubos-pane';linuxPane.id='ubos-linux';linuxPane.hidden=true;
header.after(tabs,nodePane,linuxPane);
function select(node){const isNode=node==='node';nodeBtn.setAttribute('aria-selected',isNode);linuxBtn.setAttribute('aria-selected',!isNode);nodePane.hidden=!isNode;linuxPane.hidden=isNode}
nodeBtn.onclick=()=>select('node');linuxBtn.onclick=()=>select('linux');
const statusCard=document.createElement('div');statusCard.className='ubos-card';
const chips=document.createElement('div');chips.className='ubos-row';
const vmChip=Object.assign(document.createElement('span'),{className:'ubos-chip',textContent:'VM stopped'});vmChip.dataset.state='idle';
const netChip=Object.assign(document.createElement('span'),{className:'ubos-chip',textContent:'Guest networking: off'});
const cacheChip=Object.assign(document.createElement('span'),{className:'ubos-chip',textContent:'Runtime: not downloaded'});
chips.append(vmChip,netChip,cacheChip);
const statusText=document.createElement('p');statusText.className='ubos-muted';statusText.textContent='Linux Beta is browser-local and optional. Runtime files download only when you press Start.';
const progress=document.createElement('div');progress.className='ubos-progress';const fill=document.createElement('div');progress.append(fill);
statusCard.append(chips,statusText,progress);
const actionCard=document.createElement('div');actionCard.className='ubos-card';
const actions=document.createElement('div');actions.className='ubos-row';
const fileCard=document.createElement('div');fileCard.className='ubos-card';
const fileRow=document.createElement('div');fileRow.className='ubos-row';
const fileInput=document.createElement('input');fileInput.type='file';fileInput.multiple=true;
const importNote=document.createElement('p');importNote.className='ubos-muted';importNote.textContent='Import trusted files into the guest 9p share. Maximum 32 MiB per file.';
const mount=document.createElement('code');mount.className='ubos-code';mount.textContent='mkdir -p /mnt/ubos; mount -t 9p -o trans=virtio,version=9p2000.L host9p /mnt/ubos';
fileCard.append(fileRow,importNote,mount);
const log=document.createElement('pre');log.className='ubos-log';
const serial=document.createElement('pre');serial.className='ubos-log ubos-serial';
const commandCard=document.createElement('div');commandCard.className='ubos-card';
const commands=document.createElement('div');commands.className='ubos-row';
commandCard.append(commands);
linuxPane.append(statusCard,actionCard,fileCard,commandCard,log,serial);
function say(text,cls){const line=document.createElement('div');if(cls)line.className=cls;line.textContent=text;log.append(line);log.scrollTop=log.scrollHeight}
function setVM(state,text){vmChip.dataset.state=state;vmChip.textContent=text}
function setProgress(value,text){fill.style.width=Math.max(0,Math.min(100,value))+'%';statusText.textContent=text}
function button(parent,text,fn,className){const b=document.createElement('button');b.type='button';b.textContent=text;if(className)b.className=className;b.onclick=async()=>{b.disabled=true;try{await fn()}catch(e){say('Error: '+e.message,'error')}finally{b.disabled=false}};parent.append(b);return b}
let emulator=null,paused=false,state=null,downloads=null;
async function cacheStatus(){try{const cache=await caches.open(CACHE);const found=(await Promise.all(Object.values(ASSETS).map(([,url])=>cache.match(url)))).filter(Boolean).length;cacheChip.textContent='Runtime: '+found+'/5 cached'}catch(e){cacheChip.textContent='Runtime cache unavailable'}}
function abortDownloads(){downloads?.abort();downloads=null}
async function fetchAsset([label,url],onProgress){
 const cache=await caches.open(CACHE);
 const hit=await cache.match(url);
 if(hit)return URL.createObjectURL(await hit.blob());
 downloads=new AbortController();
 const response=await fetch(url,{signal:downloads.signal,mode:'cors'});
 if(!response.ok)throw new Error(label+' download failed: '+response.status);
 const declared=Number(response.headers.get('content-length'))||0;
 if(declared>MAX_ASSET)throw new Error(label+' exceeds the 64 MiB limit');
 const reader=response.body?.getReader();
 if(!reader){const blob=await response.blob();if(blob.size>MAX_ASSET)throw new Error(label+' exceeds the 64 MiB limit');await cache.put(url,new Response(blob));return URL.createObjectURL(blob)}
 const parts=[];let received=0;
 for(;;){const{done,value}=await reader.read();if(done)break;received+=value.byteLength;if(received>MAX_ASSET){downloads.abort();throw new Error(label+' exceeds the 64 MiB limit')}parts.push(value);onProgress(received,declared,label)}
 const blob=new Blob(parts,{type:response.headers.get('content-type')||'application/octet-stream'});
 await cache.put(url,new Response(blob));
 return URL.createObjectURL(blob);
}
async function boot(){
 if(emulator){say('Linux VM is already running.');return}
 setProgress(1,'Preparing pinned Linux Beta downloads…');
 const urls={};let index=0;const names=Object.keys(ASSETS);
 for(const[name,asset]of Object.entries(ASSETS)){
  urls[name]=await fetchAsset(asset,(received,total,label)=>{
   const portion=total?received/total:.5;
   setProgress(1+(index+portion)/names.length*94,'Downloading '+label+'…');
  });
  index++;cacheStatus();
 }
 setProgress(96,'Starting Buildroot…');
 await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=urls.libv86;s.onload=resolve;s.onerror=()=>reject(new Error('v86 library could not load'));document.head.append(s)});
 if(typeof V86!=='function')throw new Error('v86 did not expose its expected API');
 emulator=new V86({wasm_path:urls.wasm,memory_size:128*1024*1024,vga_memory_size:8*1024*1024,bios:{url:urls.seabios},vga_bios:{url:urls.vgabios},bzimage:{url:urls.kernel},cmdline:'console=ttyS0 tsc=reliable',filesystem:{},autostart:true,disable_speaker:true});
 emulator.add_listener('emulator-ready',()=>{paused=false;setVM('ready','VM running');setProgress(100,'Linux Beta running. Guest networking is off.');say('Buildroot is ready. Guest changes are temporary unless you download a VM state.')});
 emulator.add_listener('download-error',event=>say('Runtime error: '+(event?.message||event),'error'));
 emulator.add_listener('serial0-output-byte',byte=>{serial.textContent+=String.fromCharCode(byte);if(serial.textContent.length>40000)serial.textContent=serial.textContent.slice(-30000);serial.scrollTop=serial.scrollHeight});
}
function requireVM(){if(!emulator)throw new Error('Start the Linux VM first');return emulator}
function send(text){requireVM().serial_send(text)}
button(actions,'Start',async()=>{if(paused){emulator.run();paused=false;setVM('ready','VM running');say('VM resumed.');return}await boot()});
button(actions,'Pause',()=>{const vm=requireVM();if(paused)throw new Error('VM is already paused');vm.stop();paused=true;setVM('idle','VM paused');say('VM paused. Guest memory remains in this tab.')});
button(actions,'Resume',()=>{const vm=requireVM();if(!paused)throw new Error('VM is already running');vm.run();paused=false;setVM('ready','VM running');say('VM resumed.')});
button(actions,'Stop VM',()=>{const vm=requireVM();try{vm.destroy()}catch(e){vm.stop()}emulator=null;paused=false;setVM('idle','VM stopped');setProgress(0,'VM stopped. Cached runtime files remain available.');say('VM stopped. Guest filesystem changes were temporary.')});
button(actions,'Download VM state',async()=>{const vm=requireVM();state=await vm.save_state();const url=URL.createObjectURL(new Blob([state],{type:'application/octet-stream'}));const a=document.createElement('a');a.href=url;a.download='ubos-linux21-vm-state.bin';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);say('VM state downloaded. It may contain private guest data.')});
button(actions,'Remove downloads',async()=>{if(emulator)throw new Error('Stop the VM first');const cache=await caches.open(CACHE);for(const[,url]of Object.entries(ASSETS))await cache.delete(url);setProgress(0,'Runtime downloads removed.');cacheStatus();say('Removed cached Linux Beta runtime files.')});
button(actions,'Cancel downloads',()=>{if(!downloads)throw new Error('No download is active');abortDownloads();setProgress(0,'Download cancelled.');say('Active runtime download cancelled.')});
fileInput.onchange=async()=>{
 const vm=requireVM();
 for(const f of fileInput.files){
  if(f.size>MAX_IMPORT){say('Skipped '+f.name+': over the 32 MiB import limit.','error');continue}
  const bytes=new Uint8Array(await f.arrayBuffer());
  vm.create_file('/ubos-import-'+f.name.replace(/[^\w.-]+/g,'_'),bytes);
  say('Imported '+f.name+' into the 9p shared folder.');
 }
 fileInput.value='';
};
fileRow.append(fileInput);
for(const command of ['uname -a','pwd','ls -la','busybox --list','df -h'])button(commands,command,()=>send(command+'\n'));
button(commands,'Ctrl+C',()=>send(String.fromCharCode(3)));
say('Linux Beta uses pinned v86 0.5.44 and Buildroot. It has no guest networking and does not provide apt, apk, GitHub CLI installation, or universal package compatibility.');
say('Guest changes are temporary unless you download a VM state. VM states may contain private guest data.');
cacheStatus();
})();