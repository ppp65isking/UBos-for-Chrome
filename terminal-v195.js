(async()=>{
'use strict';if(window.terminal195)return;window.terminal195=true;
const node=parent.ubosNode,previousExecute=execute,id=crypto.randomUUID(),input=q('#input'),runButton=q('#run'),state=document.createElement('small'),tools=document.createElement('div'),host=document.createElement('div');let term=null,active=false;
document.querySelector('header strong').textContent='>_ Terminal · 1.95';
tools.id='node-tools';tools.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:7px 14px';
host.id='node-tty';host.style.cssText='flex:1;min-height:100px;padding:8px;overflow:hidden;background:#101827';host.setAttribute('aria-label','Interactive Node terminal');
const css=document.createElement('link');css.rel='stylesheet';css.crossOrigin='anonymous';css.href='https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.css';document.head.append(css);
q('#output').style.cssText='flex:0 1 24%;min-height:55px;max-height:30%;overflow:auto';q('#output').after(tools,host);
function button(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=async()=>{try{await fn()}catch(e){print(e.message,'error')}};tools.append(b)}
button('Save workspace',async()=>print('Saved '+await node.save()));button('Download ZIP',()=>node.download());button('Keep browser storage',async()=>print((await node.persist()).granted?'Persistent storage granted. Keep a ZIP backup too.':'Persistence not granted; local saves are best-effort.'));tools.append(state);
function update(){const s=node.status();state.textContent=(s.busy?s.phase:s.ready?'ready':'not started')+' · '+(s.dirty?'unsaved changes':s.savedAt?'saved '+new Date(s.savedAt).toLocaleTimeString():'no snapshot yet')+(s.saveError?' · SAVE FAILED: '+s.saveError:'')}
parent.addEventListener('ubos-node-state',update);window.addEventListener('pagehide',()=>{parent.removeEventListener('ubos-node-state',update);term?.dispose()},{once:true});update();
try{const{Terminal}=await import('https://esm.sh/@xterm/xterm@5.5.0');term=new Terminal({cursorBlink:true,fontSize:13,fontFamily:'ui-monospace, SFMono-Regular, Consolas, monospace',theme:{background:'#101827',foreground:'#d9e9ff'},scrollback:3000,convertEol:true});term.open(host);
function fit(){if(!term||!host.clientWidth||!host.clientHeight)return;const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font='13px monospace';const width=ctx.measureText('W').width;term.resize(Math.max(20,Math.floor((host.clientWidth-24)/width)),Math.max(4,Math.floor((host.clientHeight-16)/17)))}
const observer=new ResizeObserver(fit);observer.observe(host);window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});fit();term.onResize(size=>node.resize(size,id));term.onData(data=>{if(active&&node.status().owner===id)node.input(data,id).catch(e=>print(e.message,'error'))});term.writeln('Node/npm output. Enter commands below; answer running prompts here.');term.writeln('Ctrl+C is forwarded to the active process.');
}catch(e){host.textContent='Interactive terminal could not load: '+e.message+'. Virtual commands remain available.';print('Node process commands need interactive terminal assets.','error')}
async function runTTY(line){if(!term)throw new Error('Interactive terminal assets did not load. Reopen Terminal when network is available.');active=true;term.writeln('');term.writeln('$ '+line);term.focus();try{return await node.run(line,chunk=>term.write(chunk),{owner:id,cols:term.cols,rows:term.rows})}finally{active=false;update()}}
execute=async function(line){const args=tokens(line),command=args.shift()?.toLowerCase();if(command==='help'){print(`Virtual shell plus an interactive Node runner; not Bash. No pipes/redirection.
node-start               Boot/restore shared Node workspace
node --version / npm --version / npx --version
npm install <package>    Install trusted workspace dependencies
npm uninstall <package> Remove a workspace package
npx <package> [args]     May download and execute package code
node main.js / npm start Run project code
node-save / node-download / node-shutdown
node-status / node-stop  Runtime status / stop active process
node-write / node-cat / node-ls / node-import / node-export
Virtual commands: clear, pwd, ls, cd, mkdir, touch, cat, write, echo, rm, fetch, clone, install, apps, open, permissions.
Local dependencies restore from snapshots; browser storage is best-effort. Global npm installs are not supported. Stop active processes before saving or downloading.`);return}
if(command==='node-save'){print('Saved locally at '+await node.save());return}
if(command==='node-download'){await node.download();print('Workspace ZIP download requested.');return}
if(command==='node-shutdown'){await node.shutdown();print('Runtime stopped; saved workspace remains available.');return}
if(command==='node-start'){await node.boot();print(node.status().restored?'Runtime started; saved workspace restored.':'Runtime started; new starter workspace saved.');return}
if(command==='node'||command==='npm'||command==='npx'){await node.boot();if(command==='node'&&args.length===1&&args[0]==='start'){let exists=false;try{await node.read('start');exists=true}catch(e){if(!/ENOENT|not found|No such file/i.test(e.message))throw e}if(!exists){print('node start → node-start: runtime ready. Run node main.js or npm start.');return}}await runTTY(line);return}await previousExecute(line)};
run=async function(line){if(busy)return;busy=true;runButton.disabled=input.disabled=true;try{print((await path(cwd))+' $ '+line,'command');await execute(line)}catch(e){print('Error: '+e.message,'error')}finally{busy=false;runButton.disabled=input.disabled=false;q('#prompt').textContent=(await path(cwd))+' $';input.focus();update()}};
input.disabled=false;runButton.disabled=false;window.terminal195Ready=true;window.dispatchEvent(new Event('terminal195-ready'));
const launch=frameElement?.dataset.nodeLaunch;if(launch){delete frameElement.dataset.nodeLaunch;run('npm exec --offline -- '+JSON.stringify(launch))}
})();