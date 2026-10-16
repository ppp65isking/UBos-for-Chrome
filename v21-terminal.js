(()=>{
'use strict';
if(window.ubosTerminal21Loader)return;window.ubosTerminal21Loader=true;
const style=document.createElement('style');style.textContent=`
#desk>#shortcuts{display:grid;width:calc(100% - 32px);max-width:1080px;max-height:calc(100dvh - 140px);margin:0 16px;padding:8px;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));align-content:start;align-items:start;gap:12px;overflow:auto;scrollbar-width:thin}
#desk>#shortcuts>button{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:7px;width:100%;min-width:0;max-width:100%;min-height:96px;height:auto;padding:12px 6px;border:1px solid transparent;border-radius:18px;background:var(--tile);font:12px/1.4 'Google Sans',system-ui;overflow-wrap:anywhere;white-space:normal;text-align:center}
#desk>#shortcuts>button:hover{background:#929fff25;border-color:#9199af40}
#desk>#shortcuts>button>.ubos-desktop-label{display:block;max-width:100%;font:inherit;line-height:1.4;white-space:normal;overflow-wrap:anywhere}
#desk>#shortcuts>button>.u21-icon,#desk>#shortcuts>button>.ubos-vendor-art{display:flex;width:32px;height:32px;flex:0 0 32px;margin:0!important;font-size:28px}
#desk>#shortcuts>button>.u21-icon>svg,#desk>#shortcuts>button>.u21-icon>img{display:block;width:100%;height:100%;margin:0;object-fit:contain}
#welcome{display:none}
#taskbar button{font-size:12px;line-height:1.3;min-height:34px;padding:7px 10px}
@media(max-width:700px),(max-height:500px){#desk>#shortcuts{width:calc(100% - 16px);max-height:calc(100dvh - 125px);margin:0 8px;padding:6px;gap:8px;grid-template-columns:repeat(auto-fill,minmax(78px,1fr))}#desk>#shortcuts>button{min-height:90px;padding:10px 4px}}
@media(max-width:360px){#desk>#shortcuts{gap:6px;grid-template-columns:repeat(auto-fill,minmax(68px,1fr))}}`;
document.head.append(style);
const oldOpen=openApp;
openApp=function(id,...args){return oldOpen(id==='node-beta'?'terminal':id,...args)};
const legacy=wins.get('node-beta');if(legacy)legacy.querySelector('button[title="Close"]')?.click();
if(!wins.has('node-beta'))delete apps['node-beta'];
for(const b of document.querySelectorAll('#shortcuts button,#menu button'))if(b.dataset.app18==='node-beta'||b.textContent.trim()==='Node/npm Beta')b.remove();
// Labels use their own element, never the legacy icon-only span selector.
// Keep existing buttons, click handlers, artwork and saved app registrations.
const shortcuts=document.querySelector('#shortcuts');
shortcuts.setAttribute('aria-label','Desktop apps');
function normalizeDesktopLabels(){
 for(const button of shortcuts.querySelectorAll(':scope>button')){
  if(!button.querySelector(':scope>.u21-icon,:scope>.ubos-vendor-art'))continue;
  for(const child of [...button.children]){
   if(child.tagName!=='SPAN'||child.className&&child.className!=='label'||!child.textContent.trim()||child.querySelector('svg,img'))continue;
   const label=document.createElement('small');
   label.className='ubos-desktop-label';label.textContent=child.textContent;
   child.replaceWith(label);
  }
 }
}
new MutationObserver(normalizeDesktopLabels).observe(shortcuts,{childList:true,subtree:true});
normalizeDesktopLabels();
const attached=new WeakSet(),base=new URL('.',location.href);
function installV86Compatibility(win){
 if(win.ubosV86Compatibility221)return;
 let nativeStarter=win.V86Starter;
 const native=()=>typeof win.V86==='function'?win.V86:typeof nativeStarter==='function'?nativeStarter:null;
 function adapt(instance,name){
  const original=instance[name];if(typeof original!=='function')return;
  instance[name]=function(...args){
   const callback=typeof args[args.length-1]==='function'?args.pop():null;
   const operation=new Promise((resolve,reject)=>{let settled=false;
    const done=(error,value)=>{if(settled)return;settled=true;if(error){reject(error);return}if(name==='save_state'&&Object.prototype.toString.call(value)!=='[object ArrayBuffer]'&&!ArrayBuffer.isView(value)){reject(new Error('v86 returned an invalid VM state'));return}resolve(value)};
    try{const result=Reflect.apply(original,instance,[...args,done]);if(result&&typeof result.then==='function')Promise.resolve(result).then(value=>done(null,value),done);else if(result!==undefined)done(null,result)}catch(e){done(e)}
   });
   if(callback){operation.then(value=>callback(null,value),error=>callback(error));return}
   return operation;
  };
 }
 function Compatible(options){const Constructor=native();if(!Constructor)throw new Error('v86 library has not loaded a supported constructor (V86 or V86Starter).');const instance=Reflect.construct(Constructor,[{...options,disable_keyboard:true,disable_mouse:true}]);adapt(instance,'save_state');adapt(instance,'create_file');
 const state={ready:false,paused:false,alive:true};win.ubosLinuxVM=instance;win.ubosLinuxState=state;
 const notify=()=>win.dispatchEvent(new win.Event('ubos-linux-state'));
 instance.add_listener('emulator-ready',()=>{if(state.alive){state.ready=true;notify()}});
 for(const method of ['run','stop','destroy']){const original=instance[method];if(typeof original==='function')instance[method]=function(...args){const result=Reflect.apply(original,instance,args);if(method==='destroy'){state.alive=false;state.ready=false;if(win.ubosLinuxVM===instance)win.ubosLinuxVM=null}else state.paused=method==='stop';notify();return result}}
 notify();return instance}
 const descriptor=Object.getOwnPropertyDescriptor(win,'V86Starter');
 if(descriptor&&!descriptor.configurable){if(!descriptor.writable||!native())throw new Error('Cannot install the v86 compatibility adapter. Reopen Terminal.');win.V86Starter=Compatible}
 else Object.defineProperty(win,'V86Starter',{configurable:true,enumerable:true,get(){return native()?Compatible:undefined},set(value){if(value!==Compatible)nativeStarter=value}});
 win.ubosV86Compatibility221=true;
}
function attach(frame){
 if(!frame)return;
 const setup=()=>{try{
  if(!frame.isConnected||new URL(frame.src,base).pathname!==new URL('terminal.html',base).pathname)return;
  const doc=frame.contentDocument,win=frame.contentWindow;
  if(!doc?.querySelector('#form')||attached.has(doc))return;
  attached.add(doc);let ticks=0;
  const timer=setInterval(()=>{
   if(!frame.isConnected||frame.contentDocument!==doc){clearInterval(timer);return}
   if(win.terminal195Ready){clearInterval(timer);try{installV86Compatibility(win);const s=doc.createElement('script');s.src='terminal-v21.js?fix=23-input1';s.onload=()=>{const input=doc.createElement('script');input.src='terminal-v23.js';input.onerror=()=>tell('Terminal 2.3 input tools could not load.');doc.body.append(input)};s.onerror=()=>tell('Terminal 2.21 UI failed to load. The base Terminal is still available.');doc.body.append(s)}catch(e){tell('v86 compatibility setup failed: '+e.message)}}
   else if(++ticks>=3000){clearInterval(timer);tell('Terminal initialization timed out. Reopen Terminal to retry.')}
  },20);
 }catch(e){tell('Terminal attachment failed: '+e.message)}};
 frame.addEventListener('load',setup);setup();
}
const beforeRender=render;render=function(id,c){beforeRender(id==='node-beta'?'terminal':id,c);const frame=c.querySelector('iframe');if(frame)attach(frame)};
for(const frame of document.querySelectorAll('iframe'))attach(frame);
launcher();dock();
let featureTicks=0;const featureTimer=setInterval(()=>{if(window.ubosFeatures21){clearInterval(featureTimer);const s=document.createElement('script');s.src='assistant-v23.js';s.onerror=()=>tell('UB Assistant could not load.');document.body.append(s)}else if(++featureTicks>1500){clearInterval(featureTimer);tell('UB Assistant prerequisites timed out.')}},20);
})();