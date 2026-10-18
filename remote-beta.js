(()=>{
'use strict';if(window.ubosStore20)return;window.ubosStore20=true;
const key='ubos.store20.launchers',urlKey='ubos.remoteTerminal.url',desktopKey='ubos.remoteDesktop.url',chromeKey='ubos.chromePreview.url';
const catalog=[
{id:'codex',name:'Codex for UBos',docs:'https://developers.openai.com/codex/cli',kind:'cli'},
{id:'claude',name:'Claude Code for UBos',docs:'https://code.claude.com/docs/en/setup',kind:'cli'},
{id:'discord',name:'Discord for UBos',docs:'https://discord.com/download',kind:'desktop',category:'Desktop'},
{id:'chrome',name:'Google Chrome',docs:'https://www.google.com/chrome/',kind:'browser',category:'Browsers'}
];
const oldRender=render,oldSettings=settingsUI,remoteId='remote-terminal';
function installed(){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return new Set(Array.isArray(value)?value.filter(id=>catalog.some(app=>app.id===id)):[])}catch{return new Set()}}
function validateEndpoint(value,port,desktop=false){
 const u=new URL(value);
 const host=new RegExp('^[a-z0-9-]+-'+port+'[.]app[.]github[.]dev$');
 if(u.protocol!=='https:'||u.username||u.password||u.port||!host.test(u.hostname)||u.search||u.hash||(!desktop&&u.pathname!=='/')||(desktop&&!['/','/vnc.html'].includes(u.pathname)))throw new Error('Use the HTTPS Codespaces port-'+port+' URL'+(desktop?' with / or /vnc.html':' with /')+', without credentials, query parameters or fragments. Keep its forwarded port Private.');
 if(desktop)u.pathname='/vnc.html';
 return u.href;
}
function validateChromePreview(value){
 const u=new URL(value),host=new RegExp('^[a-z0-9-]+-7682[.]app[.]github[.]dev$');
 if(u.protocol!=='https:'||u.username||u.password||u.port||!host.test(u.hostname)||u.pathname!=='/'||u.search||u.hash)throw new Error('Use the private HTTPS Codespaces port-7682 URL ending in /, without credentials, query parameters, or fragments.');
 return u.href;
}
function stored(k){try{return localStorage.getItem(k)||''}catch{return''}}
async function ask(title,message){if(window.ubosDialog)return window.ubosDialog({kind:'confirm',title,message,okLabel:'Continue'});return confirm(title+'\n\n'+message)}
function text(parent,tag,value){const e=document.createElement(tag);e.textContent=value;parent.append(e);return e}
function link(parent,label,href){const a=document.createElement('a');a.textContent=label;a.href=href;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);return a}
function closeWindow(id){const w=wins.get(id);if(!w)return;const close=w.querySelector('.window-tools button[title="Close"]');if(close)close.click();else{w.remove();wins.delete(id)}}
function sync(){const wanted=installed();for(const app of catalog){const id='store-'+app.id;let shortcut=document.querySelector('[data-store-app="'+app.id+'"]');if(wanted.has(app.id)){apps[id]=['◇',app.name];if(!shortcut){shortcut=btn('◇ '+app.name,()=>openApp(id),document.querySelector('#shortcuts'));shortcut.dataset.storeApp=app.id}}else{closeWindow(id);delete apps[id];shortcut?.remove()}}launcher();dock()}
function add(app){const ids=installed();ids.add(app.id);if(!save(key,[...ids]))return false;sync();return true}
async function remove(app){if(!await ask('Remove '+app.name+' launcher?','This removes its UBos launcher only. It does not stop a remote app, uninstall its Linux package, delete account data, forget connection URLs, or stop the Codespace.'))return;const ids=installed();ids.delete(app.id);if(!save(key,[...ids]))return;sync();refreshViews()}
function refreshViews(){const store=wins.get('ub-store');if(store)storeUI(store.querySelector('.body'));for(const app of catalog){const w=wins.get('store-'+app.id);if(w)appUI(app,w.querySelector('.body'))}const remote=wins.get(remoteId);if(remote)render(remoteId,remote.querySelector('.body'));const settings=wins.get('settings');if(settings?.querySelector('[data-store-settings]'))settingsUI(settings.querySelector('.body'),'Apps')}
function command(parent,label,value){const box=document.createElement('div');box.className='card';text(box,'p',label);const code=text(box,'code',value);code.style.cssText='display:block;white-space:pre-wrap;user-select:text;margin:10px 0';btn('Copy command',async()=>{try{await navigator.clipboard.writeText(value);tell('Command copied. Paste it into a fresh Codespaces Bash shell at the repository root, not an active AI prompt.')}catch{tell('Clipboard unavailable. Select and copy the command shown.')}},box);parent.append(box)}
function openEndpoint(desktop){try{const target=validateEndpoint(stored(desktop?desktopKey:urlKey),desktop?6080:7681,desktop);window.open(target,'_blank','noopener,noreferrer')}catch(e){tell(e.message)}}
async function chromeStatus(path='/preview/browser/status',base=''){
 try{const response=await fetch(base+path,{credentials:base?'include':'same-origin',mode:base?'cors':'same-origin',cache:'no-store',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error(response.status===401?'Sign in to GitHub to access the private port.':'Private preview returned HTTP '+response.status+'.');const status=await response.json();return status}
 catch(e){return {error:e.message||'Private preview status unavailable.'}}
}
function browserStatus(parent,path='/preview/browser/status',name='Chrome',base=''){
 const status=text(parent,'p','Checking '+name+' status…');status.setAttribute('role','status');
 const check=async()=>{status.textContent='Checking '+name+' status…';const s=await chromeStatus(path,base);status.textContent=s.error?name+' status unavailable: '+s.error:name+': '+(s.installed?'installed':'not installed')+(s.version?' · version: '+s.version:'')+' · desktop: '+(s.displayReady?'ready':'not ready')+' · process: '+(s.running?'running':'stopped')+' · visible window: '+(s.windowMapped?'yes':'no');if(s.error)status.dataset.state='unknown';else status.dataset.state=s.installed?'installed':'missing'};
 btn('Refresh '+name+' diagnostics',check,parent);check();
}
function chromeAppUI(app,c){
 c.className='body';c.replaceChildren();text(c,'h1','Google Chrome');
 text(c,'p','Chrome opens inside this UBos app window using your private Codespaces desktop. The built-in Browser remains a separate alternative.');
 const input=document.createElement('input');input.type='url';input.value=stored(chromeKey);input.placeholder='https://your-codespace-7682.app.github.dev/';input.setAttribute('aria-label','Private Codespaces port 7682 URL');input.autocomplete='off';input.spellcheck=false;input.style.width='100%';c.append(input);
 const controls=document.createElement('div');controls.className='row';c.append(controls);
 btn('Save preview URL',()=>{try{const target=validateChromePreview(input.value.trim());localStorage.setItem(chromeKey,target);input.value=target;chromeAppUI(app,c)}catch(e){tell(e.message)}},controls);
 btn('Open built-in Browser',()=>openApp('browser'),controls);
 link(controls,'Codespaces','https://github.com/codespaces');
 text(c,'p','GitHub private-port authentication protects access; there is no UBos connection code. Opening this app starts Chrome if the Codespace and its preview server are already running. A stopped Codespace cannot be awakened by the public UBos page.');
 let base='';try{base=validateChromePreview(input.value.trim())}catch{}
 if(base){
  const statusArea=document.createElement('div');c.append(statusArea);browserStatus(statusArea,'/preview/browser/status','Chrome',base);
  link(c,'Authorize the private GitHub port (only if prompted)',base);
  const frame=document.createElement('iframe');frame.title='Google Chrome in UBos';frame.referrerPolicy='no-referrer';frame.allow='clipboard-read; clipboard-write';frame.style.cssText='display:block;width:100%;height:min(70vh,760px);min-height:380px;border:1px solid #8885;border-radius:14px;background:#191c35';frame.src=base+'preview/browser-viewer';c.append(frame);
 }else text(c,'p','Save the private port-7682 URL once. Chrome will then load automatically inside this window whenever its Codespace is running.');
}
function openRemote(){openEndpoint(false)}
function endpointUI(c,desktop=false){
 const k=desktop?desktopKey:urlKey,port=desktop?6080:7681;
 text(c,'h2',desktop?'Private cloud desktop':'Private remote terminal');
 const input=document.createElement('input');input.type='url';input.value=stored(k);input.placeholder='https://your-codespace-'+port+'.app.github.dev/'+(desktop?'vnc.html':'');input.setAttribute('aria-label',desktop?'Private Codespaces desktop URL':'Private Codespaces terminal URL');input.style.width='100%';input.autocomplete='off';input.spellcheck=false;c.append(input);
 const status=text(c,'p','');status.setAttribute('role','status');
 function statusText(){let configured=false;try{validateEndpoint(stored(k),port,desktop);configured=true}catch{}status.textContent=(configured?'Connection URL saved':'No valid connection URL saved')+' · port privacy, remote installation, running state and connection are not verified by UBos.'}
 const row=document.createElement('div');row.className='row';c.append(row);
 btn('Save URL',()=>{try{const target=validateEndpoint(input.value.trim(),port,desktop);localStorage.setItem(k,target);input.value=target;statusText();tell('URL saved in this browser. No password or GitHub token was saved. Privacy and connection are not verified.')}catch(e){tell(e.message)}},row);
 btn(desktop?'Open cloud desktop ↗':'Open private terminal ↗',()=>openEndpoint(desktop),row);
 btn('Forget URL',()=>{try{localStorage.removeItem(k);input.value='';statusText();tell('Saved URL removed. Remote apps and the Codespace were not stopped.')}catch(e){tell(e.message)}},row);
 link(row,'Start / stop Codespaces','https://github.com/codespaces');statusText();
 text(c,'p','Keep port '+port+' Private in the Codespaces Ports panel. UBos cannot inspect its visibility. Never paste passwords, tokens, or connection codes into this URL field. Start the Codespace before connecting.');
 if(desktop){text(c,'p','Opens the existing noVNC Linux desktop in a separate tab. It does not launch Discord, start a stopped Codespace, or embed the desktop in UBos. Verify the VNC password configuration before signing in to Discord. Enter passwords only in the private viewer.');text(c,'p','Discord and the desktop run on your Codespace, using its compute allowance while it runs. Closing this window, the viewer tab, or Discord does not stop the Codespace. Stop it through GitHub when finished. Stopped storage still uses allowance.')}else{text(c,'p','Unlock the terminal using the connection code from the private runner log. GitHub private-port authentication and the runner security policy do not reliably permit embedding. Runner startup is configured for Codespaces starts, but does not wake or stop the Codespace.')}
}
function appUI(app,c){
 c.className='body';c.replaceChildren();text(c,'h1',app.name);
 if(app.kind==='browser'){
  chromeAppUI(app,c);
  return;
 }
 text(c,'p',app.kind==='desktop'?'Real Linux Discord through your personal cloud desktop. This is an independent UBos integration, not an official Discord edition or an embedded Discord window.':'Official command-line tool on your personal Codespace. This UBos launcher is not a desktop GUI port.');
 text(c,'p','Launcher: '+(installed().has(app.id)?'added to this browser':'not added')+' · Linux installation: not verified · remote process: not verified · live connection: not verified.');
 const row=document.createElement('div');row.className='row';c.append(row);btn('UB Store',()=>openApp('ub-store'),row);btn(app.kind==='desktop'?'Open cloud desktop ↗':'Open private terminal ↗',()=>openEndpoint(app.kind==='desktop'),row);link(row,'Official documentation',app.docs);btn('Remove launcher',()=>remove(app),row);
 if(app.kind==='desktop')browserStatus(c,'/preview/status','Discord');
 endpointUI(c,app.kind==='desktop');
 if(app.kind==='desktop'){
  text(c,'h2','First-time setup');
  text(c,'p','The cloud graphical-desktop configuration must already be installed and tested. Adding this launcher does not provision Linux or install Discord. Open your existing Codespace, review remote-runner/DESKTOP-SETUP.md, and preserve important data before any container rebuild. No rebuild is needed just for this frontend update.');
  link(c,'Desktop setup guide','https://github.com/ppp65isking/UBos-for-Chrome/blob/main/remote-runner/DESKTOP-SETUP.md');
  text(c,'h2','Install and launch the Linux app');
  text(c,'p','Use a fresh Codespaces Bash terminal at this repository root after pulling main. Check status first; install only if missing. Once Discord is running, open the private cloud desktop to use it. The Install and Run commands below are manual commands, not one-click backend actions. Do not run Discord as root or disable its sandbox.');
  command(c,'Check managed program files (not running/connection status)','bash remote-runner/discord.sh status');
  command(c,'Install only if not already installed','bash remote-runner/discord.sh install');
  command(c,'Launch Discord in the configured Linux graphical session','bash remote-runner/discord.sh run');
  command(c,'Close Discord first; removal prompts for confirmation','bash remote-runner/discord.sh uninstall');
  text(c,'p','Uninstall removes only managed program files; it does not stop a process or remove Discord login/session data. Audio, microphone, video and screen sharing require separate testing and are not guaranteed by this launcher. A generic diamond is used for this listing; it is not an official Discord icon.');
 }else{
  text(c,'h2','Install, update, run, or uninstall on the Codespace');text(c,'p','Use a fresh Bash shell in this repository after pulling main. Review commands before running them. Install again to refresh the managed CLI package; the status command prints the installed version when present. Installation downloads vendor software; AI access requires a supported account. Managed removal leaves projects and account settings intact.');
  command(c,'Install or update the remote package','bash remote-runner/apps.sh install '+app.id);command(c,'Launch the real CLI','bash remote-runner/apps.sh run '+app.id);command(c,'Check installation and version','bash remote-runner/apps.sh status '+app.id);command(c,'Uninstall managed remote package','bash remote-runner/apps.sh uninstall '+app.id);
 }
}
function storeUI(c){
 c.className='body';c.replaceChildren();text(c,'h1','UB Store');text(c,'p','Search apps or filter by category. Adding a launcher does not install a remote package; use app diagnostics to verify what UBos can check.');
 const search=document.createElement('input');search.type='search';search.placeholder='Search apps and descriptions';search.setAttribute('aria-label','Search UB Store');search.style.width='100%';c.append(search);
 const categories=['All',...new Set(catalog.map(app=>app.category||'Developer'))],filters=document.createElement('div');filters.className='row';c.append(filters);let selected='All';
 const grid=document.createElement('div');grid.className='grid';c.append(grid);
 const draw=()=>{grid.replaceChildren();const ids=installed(),query=search.value.trim().toLowerCase();for(const app of catalog){const category=app.category||'Developer';if(selected!=='All'&&selected!==category)continue;if(query&&!(app.name+' '+app.kind+' '+category+' '+app.docs).toLowerCase().includes(query))continue;const card=document.createElement('article');card.className='card';text(card,'small',category);text(card,'h2',app.name);text(card,'p',app.kind==='browser'?'Real sandboxed Linux browser · private Codespaces desktop':app.kind==='desktop'?'Linux GUI · private cloud desktop · Codespaces compute usage':'Remote CLI · personal Codespace required');text(card,'p',ids.has(app.id)?'UBos launcher: added · remote installation: '+(app.kind==='browser'?'check diagnostics':'not checked'):'UBos launcher: not added · remote installation: not checked');btn(ids.has(app.id)?'Open diagnostics / launch':'Add launcher',()=>{if(ids.has(app.id)||add(app)){openApp('store-'+app.id);storeUI(c)}},card);if(ids.has(app.id))btn('Remove launcher',()=>remove(app),card);link(card,'Official documentation',app.docs);grid.append(card)}if(!grid.children.length)text(grid,'p','No apps match this search and category.')};
 for(const category of categories){const filter=btn(category,()=>{selected=category;for(const button of filters.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button===filter));draw()},filters);filter.setAttribute('aria-pressed',String(category===selected))}
 search.oninput=draw;draw();
 text(c,'p','Launcher status is stored in this browser. Chrome diagnostics can check installation, desktop readiness and process status only from the authenticated private preview; CLI package status requires its app-specific status command.');
 text(c,'p','Independent UBos integrations, not vendor-published editions. No listing or icon by itself proves a remote installation or connection.');
 const row=document.createElement('div');row.className='row';c.append(row);btn('Manage apps / connection URLs',()=>settingsUI(openApp('settings').querySelector('.body'),'Apps'),row);btn('Open private terminal ↗',openRemote,row);btn('Open cloud desktop ↗',()=>openEndpoint(true),row);
}
apps[remoteId]=[apps.terminal[0],'Remote Terminal Beta'];apps['ub-store']=['▣','UB Store'];
render=function(id,c){if(id==='ub-store'){storeUI(c);return}const app=catalog.find(a=>'store-'+a.id===id);if(app){appUI(app,c);return}if(id===remoteId){c.className='body';c.replaceChildren();text(c,'h1','Remote Terminal');endpointUI(c);return}oldRender(id,c)};
settingsUI=function(c,category){
 oldSettings(c,category);const nav=c.querySelector('.settings nav'),section=c.querySelector('.settings section');if(!nav||!section)return;btn('Apps',()=>settingsUI(c,'Apps'),nav).className=category==='Apps'?'chosen':'';if(category!=='Apps')return;
 section.replaceChildren();section.dataset.storeSettings='true';text(section,'h1','Apps');btn('Open UB Store',()=>openApp('ub-store'),section);text(section,'h2','Remote-app launchers');
 for(const app of catalog.filter(a=>installed().has(a.id))){const card=document.createElement('div');card.className='card';text(card,'h3',app.name);text(card,'p','Launcher added · remote installation and connection not verified');btn('Open setup / launch',()=>openApp('store-'+app.id),card);btn('Remove launcher',()=>remove(app),card);section.append(card)}
 endpointUI(section,true);endpointUI(section,false);text(section,'h2','Installed HTML apps');
 for(const item of items.filter(i=>i.ubosApp&&!i.deleted&&i.type==='file')){const card=document.createElement('div');card.className='card';text(card,'h3',item.name);btn('Uninstall',async()=>{if(!await ask('Uninstall '+item.name+'?','Move this installed HTML app to Files trash? Its source files and notes are not deleted.'))return;try{closeWindow('app-'+item.id);await window.ubosTerminal.trash(item.id);if(c.isConnected&&c.querySelector('[data-store-settings]'))settingsUI(c,'Apps')}catch(e){tell('Uninstall failed: '+e.message)}},card);section.append(card)}
 btn('Refresh app list',async()=>{try{await reload();if(c.isConnected&&c.querySelector('[data-store-settings]'))settingsUI(c,'Apps')}catch(e){tell(e.message)}},section);text(section,'p','Removing a remote launcher does not stop or uninstall its Linux app. Use the setup page for manual managed uninstall commands. Built-in apps and local Node packages are not removed here.');
};
for(const [id,label]of [['ub-store','▣ UB Store'],[remoteId,'Remote Terminal Beta']])btn(label,()=>openApp(id),document.querySelector('#shortcuts'));
window.addEventListener('storage',e=>{if(e.key===null||[key,urlKey,desktopKey,chromeKey].includes(e.key)){sync();refreshViews()}});sync();
})();
