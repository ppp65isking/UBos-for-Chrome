(()=>{
'use strict';
if(window.ubosPlusLoaded)return;
window.ubosPlusLoaded=true;
document.title='UBos Browser 1.5';
const subtitle=document.querySelector('#home .subtitle');
if(subtitle)subtitle.textContent='A better way into the web · Native Chrome tabs';

const tools=document.createElement('div');
tools.setAttribute('aria-label','UBos browser tools');
document.querySelector('#chrome').append(tools);

const add=(label,fn)=>{
  const button=document.createElement('button');
  button.textContent=label;
  button.onclick=fn;
  tools.append(button);
  return button;
};
const download=(value,name)=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
  const link=document.createElement('a');
  link.href=url;
  link.download=name;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};

add('⌕ Tabs',()=>{
  const section=panel('Search open tabs');
  const input=document.createElement('input'),list=document.createElement('div');
  input.placeholder='Filter tab addresses';
  input.setAttribute('aria-label','Search open tabs');
  section.append(input,list);
  const draw=()=>{
    list.replaceChildren();
    for(const tab of tabs.filter(tab=>(address(tab)||'New tab').toLowerCase().includes(input.value.toLowerCase()))){
      const button=document.createElement('button');
      button.textContent=address(tab)||'New tab';
      button.style.cssText='display:block;max-width:100%;overflow-wrap:anywhere';
      button.onclick=()=>{active=tab.id;paint();document.querySelector('#panel').hidden=true};
      list.append(button);
    }
  };
  input.oninput=draw;
  draw();
  input.focus();
});
add('Duplicate',()=>{
  const tab=current(),duplicate=createTab({history:tab.history.slice(),position:tab.position}),url=address(duplicate);
  if(externalMode&&url&&!openInChrome(url))message('Chrome blocked the new tab. Select Open in Chrome below.');
});
add('Save session',()=>{
  save('ubos.browser.session',tabs.map(tab=>({history:tab.history.slice(),position:tab.position})));
  message('Session saved locally. Use Restore session to reopen it.');
});
add('Restore session',()=>{
  const data=read('ubos.browser.session',[]);
  if(!Array.isArray(data)||!data.length){message('No saved session.');return}
  if(data.length>50||data.some(tab=>!tab||!Array.isArray(tab.history)||!tab.history.length||!Number.isInteger(tab.position)||tab.position<0||tab.position>=tab.history.length||tab.history.some(url=>url!==''&&!valid(url)))){
    message('Invalid saved session.');
    return;
  }
  if(!confirm('Open saved session in additional tabs?'))return;
  data.forEach(createTab);
});
add('Export bookmarks',()=>download(marks,'UBos-bookmarks.json'));
add('Import bookmarks',()=>{
  const input=document.createElement('input');
  input.type='file';
  input.accept='.json';
  input.onchange=async()=>{
    try{
      if(!input.files.length)return;
      const data=JSON.parse(await input.files[0].text());
      if(!Array.isArray(data)||data.some(url=>typeof url!=='string'||!valid(url)))throw new Error('Invalid bookmarks');
      if(!confirm('Merge '+data.length+' bookmarks?'))return;
      marks=[...new Set([...marks,...data])];
      save('ubos.browser.bookmarks',marks);
      paintMarks();
      message('Bookmarks imported.');
    }catch(error){message(error.message)}
  };
  input.click();
});

let externalMode=read('ubos.browser.nativeMode',true)!==false;
const mode=add('',()=>{
  externalMode=!externalMode;
  save('ubos.browser.nativeMode',externalMode);
  updateModeLabel();
  current().loaded='';
  paint();
});
function updateModeLabel(){
  mode.textContent=externalMode?'Sites: Chrome ↗':'Sites: embedded';
  mode.title=externalMode?'Open sites in native Chrome tabs; choose embedded mode only for sites that allow framing.':'Try loading sites inside UBos; many websites block embedded browsing.';
  mode.setAttribute('aria-pressed',String(externalMode));
}
updateModeLabel();

function openInChrome(url){
  if(!valid(url))return false;
  const popup=window.open('about:blank','_blank');
  if(!popup)return false;
  try{
    popup.opener=null;
    popup.location.replace(url);
    return true;
  }catch(error){
    popup.close();
    return false;
  }
}

const nativePage=document.createElement('section');
nativePage.id='native-page';
nativePage.hidden=true;
nativePage.setAttribute('aria-live','polite');
document.querySelector('#workspace').append(nativePage);

function showNativePage(url){
  const site=new URL(url);
  const card=document.createElement('div');
  card.className='native-card';
  const mark=document.createElement('div');
  mark.className='native-mark';
  mark.setAttribute('aria-hidden','true');
  mark.textContent='↗';
  const eyebrow=document.createElement('p');
  eyebrow.className='native-eyebrow';
  eyebrow.textContent='NATIVE CHROME TAB';
  const title=document.createElement('h2');
  title.textContent=site.hostname;
  const description=document.createElement('p');
  description.className='native-description';
  description.textContent='This site opens directly in Chrome, so sign-in, videos, downloads, and pages that block embedded browsers can work normally.';
  const launch=document.createElement('a');
  launch.className='native-launch';
  launch.href=url;
  launch.target='_blank';
  launch.rel='noopener noreferrer';
  launch.textContent='Open in Chrome ↗';
  const addressText=document.createElement('p');
  addressText.className='native-address';
  addressText.textContent=url;
  const copy=document.createElement('button');
  copy.className='native-copy';
  copy.textContent='Copy address';
  copy.onclick=async()=>{
    try{await navigator.clipboard.writeText(url);message('Address copied.')}
    catch{message('Clipboard access was denied. Copy the address from the address bar.')}
  };
  launch.onclick=event=>{
    event.preventDefault();
    if(!openInChrome(url))message('Chrome blocked the new tab. Allow pop-ups for this site, then select Open in Chrome.');
  };
  card.append(mark,eyebrow,title,description,launch,addressText,copy);
  nativePage.replaceChildren(card);
  nativePage.hidden=false;
}

const originalPaint=paint;
paint=function(){
  const tab=current(),url=address(tab);
  const native=externalMode&&!!url;
  if(native)tab.loaded=url;
  originalPaint();
  nativePage.hidden=true;
  if(native){
    if(tab.frame)tab.frame.hidden=true;
    showNativePage(url);
  }
};

const originalNavigate=navigate;
navigate=function(url){
  if(!externalMode||!valid(url))return originalNavigate(url);
  const tab=current();
  tab.history=tab.history.slice(0,tab.position+1);
  tab.history.push(url);
  tab.position++;
  tab.loaded=url;
  recent.unshift({url,time:Date.now()});
  recent=recent.slice(0,150);
  save('ubos.browser.history',recent);
  paint();
  document.querySelector('#panel').hidden=true;
  if(!openInChrome(url))message('Chrome blocked the new tab. Select Open in Chrome below or allow pop-ups for this site.');
};

external=function(url){
  if(!valid(url))return;
  if(!openInChrome(url))message('Chrome blocked the new tab. Allow pop-ups for this site, then select Open in Chrome.');
};

const originalSubmit=submit;
submit=function(raw){
  const value=String(raw).trim();
  if(externalMode&&value&&!/^[a-z][a-z0-9+.-]*:/i.test(value)&&!/^[^\s/]+\.[^\s/]+(?:\/.*)?$/.test(value)){
    navigate('https://www.google.com/search?q='+encodeURIComponent(value));
    return;
  }
  originalSubmit(raw);
};

document.querySelector('#back').onclick=()=>{
  const tab=current();
  if(!tab.position)return;
  tab.position--;
  tab.loaded=address(tab);
  paint();
  if(externalMode&&address(tab)&&!openInChrome(address(tab)))message('Chrome blocked the new tab. Select Open in Chrome below.');
};
document.querySelector('#forward').onclick=()=>{
  const tab=current();
  if(tab.position>=tab.history.length-1)return;
  tab.position++;
  tab.loaded=address(tab);
  paint();
  if(externalMode&&address(tab)&&!openInChrome(address(tab)))message('Chrome blocked the new tab. Select Open in Chrome below.');
};
document.querySelector('#reload').onclick=()=>{
  const tab=current(),url=address(tab);
  if(!url)return;
  if(externalMode){
    if(!openInChrome(url))message('Chrome blocked the new tab. Select Open in Chrome below.');
  }else if(tab.frame)tab.frame.src=url;
};

add('Add recommended shortcuts',()=>{
  const suggestions=[
    {name:'Wikipedia',url:'https://www.wikipedia.org/'},
    {name:'YouTube',url:'https://www.youtube.com/'},
    {name:'Google Maps',url:'https://maps.google.com/'},
    {name:'Gmail',url:'https://mail.google.com/'},
    {name:'Google Drive',url:'https://drive.google.com/'},
    {name:'MDN Web Docs',url:'https://developer.mozilla.org/'}
  ];
  const existing=new Set(shortcuts.map(shortcut=>shortcut.url));
  const additions=suggestions.filter(shortcut=>!existing.has(shortcut.url));
  if(!additions.length){message('All recommended shortcuts are already added.');return}
  shortcuts.push(...additions);
  save('ubos.browser.shortcuts',shortcuts);
  paintShortcuts();
  message(additions.length+' recommended shortcuts added. Edit or remove them from the new tab.');
});
add('Copy current URL',async()=>{
  const url=address(current());
  if(!url){message('There is no current website address to copy.');return}
  try{await navigator.clipboard.writeText(url);message('Current URL copied to the clipboard.')}
  catch{message('Clipboard access was denied. Copy the URL from the address bar instead.')}
});
add('Paste URL into address bar',async()=>{
  try{
    const value=await navigator.clipboard.readText();
    if(!value.trim()){message('Clipboard is empty.');return}
    document.querySelector('#address').value=value.trim();
    document.querySelector('#address').focus();
    message('Clipboard text placed in the address bar. Review it before opening.');
  }catch{message('Clipboard read was denied. Paste into the address bar with Ctrl+V instead.')}
});

const statusNote=document.querySelector('#status span');
if(statusNote)statusNote.textContent='Websites open in Chrome for full compatibility. UBos keeps your tabs, bookmarks, and entered-address history.';
const homeHint=document.querySelector('#home > p:last-child');
if(homeHint)homeHint.textContent='Search or enter a site to open it directly in Chrome. Sign-in, downloads, and sites that block embedded browsers work there.';
const redesign=document.createElement('style');
redesign.textContent=`
#chrome{padding:9px 12px 0;background:color-mix(in srgb,var(--chrome) 92%,var(--accent));backdrop-filter:blur(18px)}
#tabrow{gap:7px}#tabstrip{scrollbar-width:none}
.tab{border-radius:13px 13px 0 0;transition:background .16s,box-shadow .16s}
.tab.active{box-shadow:inset 0 2px var(--accent),0 5px 16px #0001}
.tab .choose{padding:10px 12px}
#navigation{gap:6px;padding:10px 0}
#navigation>button,#add-tab,#reopen,#menu{border-radius:50%;width:38px;height:38px;display:grid;place-items:center;padding:0;flex:none}
#addressbox{min-height:42px;padding:0 12px;border:1px solid transparent;transition:border-color .16s,box-shadow .16s}
#addressbox:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent);outline:0}
#address{min-width:0}
#go,#home-search button{border-radius:14px;padding:10px 16px;background:var(--accent);color:var(--bg);font-weight:600}
#external{color:var(--accent)}
#bookmarkbar{gap:4px;padding:0 0 7px}
#workspace{background:radial-gradient(ellipse at 50% 16%,color-mix(in srgb,var(--accent) 13%,transparent),transparent 58%),var(--bg)}
#home{padding:clamp(36px,8vh,84px) 20px 40px;background:none}
#home h1{font-size:clamp(42px,7vw,70px);font-weight:600;letter-spacing:-.055em;background:linear-gradient(120deg,var(--fg),var(--accent));background-clip:text;-webkit-background-clip:text;color:transparent}
#home .subtitle{font-size:15px;margin-bottom:30px}
#home-search{max-width:660px;min-height:60px;padding:8px 10px 8px 18px;border-radius:20px;border-color:var(--line);box-shadow:0 18px 50px #0002}
#shortcuts{max-width:760px;gap:14px}.shortcut{width:110px}
.shortcut .visit{border-radius:18px;padding:16px 5px;transition:background .16s,transform .16s}
.shortcut .visit:hover{transform:translateY(-2px)}
.shortcut .bubble{border:1px solid var(--line);box-shadow:0 8px 24px #0001}
#status{padding:9px 14px}#status button{border-radius:16px;color:var(--accent)}
[aria-label="UBos browser tools"]{gap:6px!important;padding:6px 0!important;border-top:1px solid var(--line);flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:thin}
[aria-label="UBos browser tools"] button{white-space:nowrap;border:1px solid var(--line);border-radius:14px;padding:7px 10px;background:color-mix(in srgb,var(--surface) 78%,transparent)}
[aria-label="UBos browser tools"] button:hover{border-color:var(--accent);background:var(--surface)}
#native-page{position:absolute;inset:0;z-index:2;display:grid;place-items:center;overflow:auto;padding:28px;background:radial-gradient(ellipse at 50% 40%,color-mix(in srgb,var(--accent) 10%,transparent),transparent 62%)}
.native-card{width:min(520px,100%);padding:clamp(26px,6vw,46px);border:1px solid var(--line);border-radius:28px;text-align:center;background:color-mix(in srgb,var(--surface) 86%,transparent);box-shadow:0 24px 80px #0002;backdrop-filter:blur(20px)}
.native-mark{display:grid;place-items:center;width:62px;height:62px;margin:0 auto 20px;border-radius:21px;background:color-mix(in srgb,var(--accent) 18%,var(--surface));color:var(--accent);font-size:30px}
.native-eyebrow{margin:0 0 9px;color:var(--accent);font-size:11px;font-weight:700;letter-spacing:.14em}
.native-card h2{margin:0;font-size:clamp(25px,5vw,38px);letter-spacing:-.04em;overflow-wrap:anywhere}
.native-description{max-width:390px;margin:14px auto 24px;line-height:1.6;opacity:.72}
.native-launch{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 22px;border-radius:16px;background:var(--accent);color:var(--bg);font-weight:650;text-decoration:none}
.native-launch:hover{filter:brightness(1.08)}
.native-address{margin:18px 0 2px;overflow-wrap:anywhere;font-size:12px;opacity:.58}
.native-copy{margin-top:4px;color:var(--accent)}
@media(max-width:560px){#chrome{padding-inline:7px}#navigation{gap:3px}#navigation>button,#add-tab,#reopen,#menu{width:34px;height:34px}#home{padding-top:36px}[aria-label="UBos browser tools"]{margin-inline:-4px}#native-page{padding:16px}}
`;
document.head.append(redesign);
paint();
})();
