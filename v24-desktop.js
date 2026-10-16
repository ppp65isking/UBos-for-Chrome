(()=>{
'use strict';
if(window.ubosDesktop24)return;
const q=s=>document.querySelector(s),desk=q('#desk'),shortcuts=q('#shortcuts');
if(!desk||!shortcuts)return;
window.ubosDesktop24=true;
const make=(tag,text,parent)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;parent?.append(el);return el};
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const bounded=(value,min,max,fallback)=>{const n=Number(value);return Number.isFinite(n)?Math.round(Math.max(min,Math.min(max,n))):fallback};
function config(){const p=object(prefs.desktop24);return{...p,name:typeof p.name==='string'?p.name.trim().slice(0,40):'',icon:bounded(p.icon??32,24,56,32),label:bounded(p.label??12,10,18,12),gap:bounded(p.gap??12,4,28,12),pins:Array.isArray(p.pins)?[...new Set(p.pins.filter(id=>typeof id==='string'&&id.length<=500))]:null,home:p.home===true,animation:p.animation!==false,glow:p.glow!==false}}
function locked(){return !!q('.u21-lock')||desk.inert||q('#ub-assistant')?.inert}
function write(patch){if(locked())return false;const latest=object(read('ubos.prefs',prefs)),next={...prefs,...latest,desktop24:{...object(latest.desktop24??prefs.desktop24),...patch}};if(!save('ubos.prefs',next))return false;prefs=next;sync();return true}
const style=make('style');style.id='ubos-desktop24-style';style.textContent=`
#u24-home{display:flex;align-items:center;flex-wrap:wrap;gap:10px 16px;margin:0 24px 12px;max-width:1064px}
#u24-home h1{flex:1;min-width:0;margin:0;font-size:clamp(20px,3vw,30px);font-weight:500;letter-spacing:-.7px;overflow-wrap:anywhere}
#u24-home button{min-height:44px;font-size:12px}
#u24-home form{flex:1 0 100%;display:flex;gap:8px;align-items:center;padding:6px;border-radius:20px;border:1px solid #9199af40;background:var(--glass);backdrop-filter:blur(var(--blur))}
#u24-home input{flex:1;min-width:0;border:0;background:transparent}
#desk>#shortcuts{max-height:var(--u24-room,calc(100dvh - 220px));gap:var(--u24-gap,12px);grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--u24-cell,88px)),1fr))}
#desk>#shortcuts>button{font-size:var(--u24-label,12px);min-height:calc(var(--u24-icon,32px) + var(--u24-label,12px)*2.8 + 24px)}
#desk>#shortcuts>button>.u21-icon,#desk>#shortcuts>button>.ubos-vendor-art{width:var(--u24-icon,32px);height:var(--u24-icon,32px);flex-basis:var(--u24-icon,32px)}
.u24-pin-list{display:grid;gap:6px;margin:12px 0;max-height:260px;overflow:auto}
.u24-pin-list label{display:flex;align-items:center;gap:10px;padding:8px;border:1px solid #8883;border-radius:12px;overflow-wrap:anywhere;min-height:44px}
.u24-pin-list input{flex:0 0 auto}.u24-search{width:100%}
#ub-assistant{width:min(680px,calc(100vw - 24px));border-radius:30px;box-shadow:0 20px 70px #0005,inset 0 0 0 1px #ffffff25}
#ub-assistant::before{background:linear-gradient(110deg,#78ece0,#a89cff,#f4c7ed,#7dbbff,#78ece0);background-size:300% 100%;animation-duration:7s}
#ub-assistant .ub-panel{border-radius:28px;padding:18px;background:var(--glass);backdrop-filter:blur(var(--blur)) saturate(155%);box-shadow:inset 0 1px #ffffff35;max-height:calc(100dvh - 120px);overflow:auto}
#ub-assistant .ub-panel>strong{display:block;font-size:16px;font-weight:500;margin:0 4px 12px}
#ub-assistant input{background:var(--tile);border:1px solid #9199af40;min-height:46px}
#ub-assistant button{min-height:44px;border-radius:14px}
#ub-assistant .ub-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:8px;margin-top:12px}
#ub-assistant .ub-results button{text-align:left;overflow-wrap:anywhere}
#ub-assistant p{margin:10px 4px 0;opacity:.8}
#ub-assistant-glow{border:1px solid #b3adff50;box-shadow:inset 0 0 24px #a89cff35,inset 0 0 64px #78ece015;border-radius:0}
body[data-u24-animation=off] #ub-assistant::before{animation:none}
body[data-u24-glow=off] #ub-assistant-glow{display:none!important}
body[data-u24-solid=on] #ub-assistant .ub-panel,body[data-u24-solid=on] #u24-home form{backdrop-filter:none;background:#252b43}
body.light[data-u24-solid=on] #ub-assistant .ub-panel,body.light[data-u24-solid=on] #u24-home form{background:#f1f5ff}
body.contrast #ub-assistant::before{background:var(--accent);animation:none}
body.contrast #ub-assistant .ub-panel,body.contrast #u24-home form{background:var(--glass);box-shadow:none}
body.contrast #ub-assistant-glow{display:none!important}
@media(prefers-reduced-motion:reduce){#ub-assistant::before{animation:none}}
@media(prefers-reduced-transparency:reduce){#ub-assistant .ub-panel,#u24-home form{backdrop-filter:none;background:#252b43}body.light #ub-assistant .ub-panel,body.light #u24-home form{background:#f1f5ff}}
@media(max-width:700px),(max-height:500px){#u24-home{margin:0 14px 8px;gap:8px}#ub-assistant .ub-panel{padding:12px}}
`;document.head.append(style);
const home=make('section');home.id='u24-home';home.setAttribute('aria-label','Personal desktop');const greeting=make('h1','Your desktop.',home);
function desktopSettings(){if(locked())return;const w=openApp('settings');if(w&&!w.classList.contains('u21-app-locked'))settingsUI(w.querySelector('.body'),'Desktop')}
btn('Personalize',desktopSettings,home).type='button';
const homeForm=make('form',undefined,home),homeInput=make('input',undefined,homeForm);homeInput.placeholder='Open an app or draft a command';homeInput.setAttribute('aria-label','Home Assistant command');homeInput.autocomplete='off';homeInput.maxLength=4000;make('button','Review',homeForm).type='submit';
homeForm.onsubmit=e=>{e.preventDefault();if(locked()||prefs.assistantMode==='off')return;const text=homeInput.value.trim();if(!text)return;window.ubosAssistant23?.show();const pill=q('#ub-assistant'),input=pill?.querySelector('input');if(!pill||pill.hidden||pill.inert||!input)return;input.value=text;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();homeInput.value=''};
shortcuts.before(home);
function buttons(){return [...shortcuts.querySelectorAll(':scope>button')]}
function idFor(button){const explicit=button.dataset.app18||button.dataset.nodeapp||button.dataset.installed||(button.dataset.storeApp?'store-'+button.dataset.storeApp:null);if(explicit&&Object.hasOwn(apps,explicit))return explicit;const art=button.querySelector('[data-u21-art]')?.dataset.u21Art;if(art&&Object.hasOwn(apps,art))return art;const text=button.querySelector('.ubos-desktop-label')?.textContent||button.textContent.trim();return Object.keys(apps).find(id=>apps[id][1]===text)||null}
function layout(){const top=shortcuts.getBoundingClientRect().top,bottom=q('#taskbar')?.getBoundingClientRect().top??innerHeight-80;shortcuts.style.setProperty('--u24-room',Math.max(0,bottom-top-12)+'px')}
function sync(){const c=config();greeting.textContent=c.name?'Hi, '+c.name+'.':'Your desktop.';for(const[key,value]of Object.entries({icon:c.icon+'px',label:c.label+'px',gap:c.gap+'px',cell:Math.max(76,c.icon+c.label*3+12)+'px'}))shortcuts.style.setProperty('--u24-'+key,value);document.body.dataset.u24Animation=c.animation?'on':'off';document.body.dataset.u24Glow=c.glow?'on':'off';document.body.dataset.u24Solid=prefs.solid||prefs.contrast?'on':'off';const hideHome=!c.home||prefs.assistantMode==='off';if(homeForm.hidden!==hideHome)homeForm.hidden=hideHome;
 const present=new Set(buttons().map(idFor));for(const id of c.pins||[]){if(present.has(id)||!Object.hasOwn(apps,id)||id==='node-beta')continue;const button=btn('',()=>openApp(id),shortcuts);button.dataset.app18=id;button.dataset.u24Created='1';const art=make('span',undefined,button);art.className='u21-icon';art.dataset.u21Art=id;art.setAttribute('aria-hidden','true');art.innerHTML=ubosIcon(id);make('small',apps[id][1],button).className='ubos-desktop-label';present.add(id)}
 for(const button of buttons()){const id=idFor(button);if(!id&&button.dataset.u24Created){button.remove();continue}const hidden=!!id&&c.pins!==null&&!c.pins.includes(id);if(button.hidden!==hidden)button.hidden=hidden}scheduleLayout()}
let layoutQueued=false;function scheduleLayout(){if(layoutQueued)return;layoutQueued=true;requestAnimationFrame(()=>{layoutQueued=false;layout()})}
let syncQueued=false;new MutationObserver(()=>{if(syncQueued)return;syncQueued=true;queueMicrotask(()=>{syncQueued=false;sync()})}).observe(shortcuts,{childList:true,subtree:true});
const resize=new ResizeObserver(scheduleLayout);resize.observe(home);if(q('#taskbar'))resize.observe(q('#taskbar'));window.addEventListener('resize',scheduleLayout);
const beforeApply=apply;apply=function(...args){const result=beforeApply(...args);sync();return result};
const beforeSettings=settingsUI;settingsUI=function(container,category){beforeSettings(container,category);const nav=container.querySelector('.settings nav'),section=container.querySelector('.settings section');if(!nav||!section)return;btn('Desktop',()=>settingsUI(container,'Desktop'),nav).className=category==='Desktop'?'chosen':'';
 function field(text,key,type,min,max){const label=make('label',undefined,section);label.className='setting';make('span',text,label);const input=make('input',undefined,label);input.type=type;input.setAttribute('aria-label',text);const value=config()[key];if(type==='checkbox')input.checked=value;else input.value=value;if(type==='text')input.maxLength=40;if(type==='range'){input.min=min;input.max=max;input.step=1;const out=make('output',value+' px',label);input.oninput=()=>out.textContent=input.value+' px'}input.onchange=()=>{const value=type==='checkbox'?input.checked:type==='range'?bounded(input.value,min,max,config()[key]):input.value.trim().slice(0,40);if(!write({[key]:value})){if(type==='checkbox')input.checked=config()[key];else input.value=config()[key];input.oninput?.()}else if(type==='text')input.value=config()[key]};return input}
 if(category==='UB Assistant'){make('h2','Glass effects',section);field('Animated gradient border','animation','checkbox');field('Inward screen-edge glow','glow','checkbox');make('p','Reduced motion, solid surfaces and high contrast take precedence over decorative effects.',section);return}
 if(category!=='Desktop')return;section.replaceChildren();make('h1','Desktop',section);field('Display name','name','text');field('Icon size','icon','range',24,56);field('Label size','label','range',10,18);field('Grid spacing','gap','range',4,28);field('Show home Assistant input','home','checkbox');make('p','The home input opens a draft in Assistant for review. Assistant Off hides it. Wallpaper stays in Appearance; these controls do not change it.',section);
 make('h2','Pinned apps',section);make('p','Unpinning hides only a desktop shortcut. Apps remain in the normal launcher. New shortcuts appear automatically while All shortcuts is selected.',section);const actions=make('div',undefined,section);actions.className='row';for(const[text,pins]of [['All shortcuts',null],['Clear pins',[]]])btn(text,()=>{if(write({pins}))settingsUI(container,'Desktop')},actions).type='button';const search=make('input',undefined,section);search.className='u24-search';search.placeholder='Search apps to pin';search.setAttribute('aria-label','Search pinned apps');const list=make('div',undefined,section);list.className='u24-pin-list';const current=config(),selected=new Set(current.pins??buttons().map(idFor).filter(Boolean));
 for(const[id,app]of Object.entries(apps).filter(([id])=>id!=='node-beta').sort((a,b)=>a[1][1].localeCompare(b[1][1]))){const label=make('label',undefined,list),box=make('input',undefined,label);box.type='checkbox';box.checked=selected.has(id);make('span',app[1],label);box.onchange=()=>{const c=config(),ids=new Set(c.pins??buttons().map(idFor).filter(Boolean));if(box.checked)ids.add(id);else ids.delete(id);if(!write({pins:[...ids]}))box.checked=config().pins===null?selected.has(id):config().pins.includes(id)}}
 search.oninput=()=>{const term=search.value.trim().toLowerCase();for(const label of list.children)label.hidden=!label.textContent.toLowerCase().includes(term)};
};
document.addEventListener('change',e=>{if(e.target.closest?.('.settings'))sync()});
window.addEventListener('storage',e=>{if(e.key==='ubos.prefs'){const next=read('ubos.prefs',null);if(next&&typeof next==='object'&&!Array.isArray(next)){prefs=next;sync()}}});
window.addEventListener('pagehide',()=>resize.disconnect(),{once:true});
sync();
})();