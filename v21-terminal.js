(()=>{
'use strict';
if(window.ubosTerminal21Loader)return;window.ubosTerminal21Loader=true;
const base=new URL('.',location.href);
const originalOpen=window.openApp;
if(typeof originalOpen==='function'){
 window.openApp=function(id,...rest){
  if(id==='node-beta')id='terminal';
  return originalOpen(id,...rest);
 };
}
if(window.apps){
 delete window.apps['node-beta'];
 document.querySelectorAll('[data-app18="node-beta"]').forEach(button=>button.remove());
 document.querySelectorAll('#shortcuts button,#menu button').forEach(button=>{
  if(button.textContent.trim()==='Node/npm Beta')button.remove();
 });
}
function attach(frame){
 if(!frame||frame.dataset.terminal21)return;
 try{if(new URL(frame.src,base).pathname!==new URL('terminal.html',base).pathname)return}catch(e){return}
 frame.dataset.terminal21='1';
 let ticks=0;
 const timer=setInterval(()=>{
  if(!frame.isConnected){clearInterval(timer);return}
  const win=frame.contentWindow;
  if(win&&win.terminal195Ready){
   clearInterval(timer);
   const script=frame.contentDocument.createElement('script');
   script.src='terminal-v21.js';
   script.onerror=()=>tell('Terminal 2.1 could not load. The existing Terminal remains available.');
   frame.contentDocument.body.append(script);
  }else if(++ticks>750){
   clearInterval(timer);
   tell('Terminal 2.1 could not attach because Terminal 1.95 did not finish loading.');
  }
 },20);
}
const previous=render;
render=function(id,container){
 previous(id,container);
 if(id!=='terminal')return;
 attach(container.querySelector('iframe'));
};
for(const frame of document.querySelectorAll('iframe'))attach(frame);
})();