(()=>{
'use strict';
if(window.ubosTerminal21Loader)return;window.ubosTerminal21Loader=true;
const style=document.createElement('style');style.textContent=`
#shortcuts{width:114px;grid-template-columns:minmax(0,1fr);align-content:start;gap:8px;padding:10px;overflow-x:hidden}
#shortcuts>button{box-sizing:border-box;width:100%;min-width:0;max-width:100%;min-height:72px;height:auto;padding:7px 4px!important;font:12px/1.3 'Google Sans',system-ui!important;overflow-wrap:anywhere;white-space:normal}
#shortcuts>button>span:not(.u21-icon):not(.ubos-vendor-art){display:block;font:12px/1.3 'Google Sans',system-ui!important;margin:3px 0 0;max-width:100%;white-space:normal;overflow-wrap:anywhere}
#shortcuts>button>.u21-icon{width:28px;height:28px;margin:0 auto 4px!important;font-size:28px}
#shortcuts>button>.ubos-vendor-art{width:28px;height:28px;margin:0 auto 4px!important}
#taskbar button{font-size:12px;line-height:1.3;min-height:34px;padding:7px 10px}
#u22-quick{position:absolute;right:16px;top:48px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;max-width:calc(100% - 140px);z-index:2}
#u22-quick button{font-size:12px!important;line-height:1.3;padding:7px 10px!important;min-height:34px}
@media(max-width:700px){#u22-quick{position:fixed;top:8px;right:8px;max-width:calc(100% - 140px)}}`;
document.head.append(style);
const oldOpen=openApp;
openApp=function(id,...args){return oldOpen(id==='node-beta'?'terminal':id,...args)};
const legacy=wins.get('node-beta');if(legacy)legacy.querySelector('button[title="Close"]')?.click();
if(!wins.has('node-beta'))delete apps['node-beta'];
for(const b of document.querySelectorAll('#shortcuts button,#menu button'))if(b.dataset.app18==='node-beta'||b.textContent.trim()==='Node/npm Beta')b.remove();
const links=document.createElement('nav');links.id='u22-quick';links.setAttribute('aria-label','UBos feature shortcuts');
for(const [label,id]of [['Terminal','terminal'],['UB Store','ub-store'],['Privacy locks','settings'],['Lazer Dodge','game-lazer']])btn(label,()=>{if(!apps[id]){tell('Feature module is not ready. Reload UBos if this persists.');return}const w=openApp(id);if(label==='Privacy locks')settingsUI(w.querySelector('.body'),'Privacy locks')},links);
document.querySelector('#desk').append(links);
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
 function Compatible(options){const Constructor=native();if(!Constructor)throw new Error('v86 library has not loaded a supported constructor (V86 or V86Starter).');const instance=Reflect.construct(Constructor,[options]);adapt(instance,'save_state');adapt(instance,'create_file');return instance}
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
   if(win.terminal195Ready){clearInterval(timer);try{installV86Compatibility(win);const s=doc.createElement('script');s.src='terminal-v21.js?fix=221-v86compat1';s.onerror=()=>tell('Terminal 2.21 UI failed to load. The base Terminal is still available.');doc.body.append(s)}catch(e){tell('v86 compatibility setup failed: '+e.message)}}
   else if(++ticks>=3000){clearInterval(timer);tell('Terminal initialization timed out. Reopen Terminal to retry.')}
  },20);
 }catch(e){tell('Terminal attachment failed: '+e.message)}};
 frame.addEventListener('load',setup);setup();
}
const beforeRender=render;render=function(id,c){beforeRender(id==='node-beta'?'terminal':id,c);const frame=c.querySelector('iframe');if(frame)attach(frame)};
for(const frame of document.querySelectorAll('iframe'))attach(frame);
launcher();dock();
})();