(()=>{'use strict';const paths={notes:'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5',files:'M3 6h7l2 3h9v11H3z',storage:'M4 4h16v16H4z M7 4v7h10V4 M8 16h8',browser:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M3 12h18 M12 3c-5 6-5 12 0 18 M12 3c5 6 5 12 0 18',games:'M7 7h10c4 0 6 12 3 12l-5-4H9l-5 4C1 19 3 7 7 7 M6 11h5 M8.5 8.5v5 M16 10h.1 M19 12h.1',themes:'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-4-5-6-9-6 M7 8h.1 M12 6h.1 M17 8h.1',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',terminal:'M3 4h18v16H3z M6 8l4 4-4 4 M12 16h6',tools:'M4 3h16v18H4z M7 6h10 M7 10h2 M13 10h3 M7 14h2 M13 14h3 M7 18h2 M13 18h3',node:'M12 2l9 5v10l-9 5-9-5V7z M8 15V9l8 6V9',snake:'M5 5h10a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h11 M5 3v4 M18 15l3 2-3 2',mine:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',space:'M12 3l7 16-7-3-7 3z M9 19l-1 3 M15 19l1 3',battle:'M12 3l8 4v6c0 4-8 8-8 8s-8-4-8-8V7z M8 12h8 M12 8v8',dino:'M5 19v-7l5 3V6h10v7h-6v6 M4 12l-2-3 M8 19v3 M14 19v3 M16 9h.1',app:'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z'};window.ubosIcon=id=>'<svg data-ubos-icon="'+(Object.hasOwn(paths,id)?id:'app')+'" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.app)+'"/></svg>'})();

(()=>{
'use strict';
if(window.ubosVendorIcons22)return;
const sources={
  'Codex for UBos':{id:'codex',url:'https://openai.gallery.vsassets.io/_apis/public/gallery/publisher/openai/extension/chatgpt/latest/assetbyname/Microsoft.VisualStudio.Services.Icons.Default',listing:'https://marketplace.visualstudio.com/items?itemName=openai.chatgpt',credit:'Vendor-published product artwork'},
  'Claude Code for UBos':{id:'claude',url:'https://anthropic.gallery.vsassets.io/_apis/public/gallery/publisher/anthropic/extension/claude-code/latest/assetbyname/Microsoft.VisualStudio.Services.Icons.Default',listing:'https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code',credit:'Vendor-published product artwork'},
  'Discord for UBos':{id:'discord',url:new URL('vendor/app-icons/discord.svg',document.currentScript?.src||document.baseURI).href,listing:'https://discord.com/branding',credit:'Discord brand symbol from Bootstrap Icons; independent UBos integration'}
};
window.ubosVendorIcons22={sources};
window.ubosVendorIcons21={sources};
const byId=Object.fromEntries(Object.values(sources).map(source=>[source.id,source]));
const css=document.createElement('style');
css.textContent='.ubos-vendor-art{display:inline-flex!important;align-items:center;justify-content:center;width:26px;height:26px;flex:0 0 auto;vertical-align:middle;margin:0 7px 0 0!important;font-size:20px!important}.ubos-vendor-art img{width:100%;height:100%;object-fit:contain;display:block}.ubos-vendor-art [hidden]{display:none!important}#shortcuts .ubos-vendor-art{display:flex!important;width:38px;height:38px;margin:0 auto 6px!important}#shortcuts .ubos-vendor-fallback{margin:0!important;font-size:28px!important}.body h1>.ubos-vendor-art{width:38px;height:38px}.body h2>.ubos-vendor-art,.body h3>.ubos-vendor-art{width:30px;height:30px}.ubos-window-grip>.ubos-vendor-art{width:22px;height:22px}';
document.head.append(css);
function sourceFor(el){
  if(el.dataset.storeApp&&byId[el.dataset.storeApp])return byId[el.dataset.storeApp];
  if(el.matches('.ubos-window-grip')){const id=el.closest('.win')?.dataset.id;if(id?.startsWith('store-')&&byId[id.slice(6)])return byId[id.slice(6)]}
  if(el.closest('#running')&&sources[el.title])return sources[el.title];
  const copy=el.cloneNode(true);
  copy.querySelectorAll('[data-vendor-art],svg[data-ubos-icon]').forEach(node=>node.remove());
  return sources[copy.textContent.trim().replace(/^[◇◆◈▣]\s*/,'')];
}
function decorate(el,source){
  if(el.querySelector('[data-vendor-art]'))return;
  const first=el.firstElementChild;
  if(first?.matches('svg[data-ubos-icon]'))first.remove();
  else if(first?.tagName==='SPAN'&&!first.classList.contains('label')&&(first.querySelector('svg[data-ubos-icon]')||/^[◇◆◈▣]$/.test(first.textContent.trim())))first.remove();
  for(const child of el.childNodes)if(child.nodeType===Node.TEXT_NODE){child.nodeValue=child.nodeValue.replace(/^\s*[◇◆◈▣]\s*/,'');break}
  const holder=document.createElement('span');
  holder.className='ubos-vendor-art';holder.dataset.vendorArt=source.id;holder.setAttribute('aria-hidden','true');
  const fallback=document.createElement('span');fallback.className='ubos-vendor-fallback';fallback.textContent='◇';
  const img=document.createElement('img');
  img.alt='';img.width=38;img.height=38;img.hidden=true;img.referrerPolicy='no-referrer';img.decoding='async';
  img.onload=()=>{img.hidden=false;fallback.hidden=true;holder.title=source.credit};
  img.onerror=()=>{img.hidden=true;fallback.hidden=false;holder.title='Product artwork unavailable; generic fallback shown'};
  holder.append(img,fallback);el.prepend(holder);img.src=source.url;
}
const oldStore='Independent UBos integrations, not vendor-published UBos editions. Codex and Claude artwork is handled by the separate icon module; the Discord listing uses a generic diamond. No icon proves installation or connection status.';
const oldIcons='These are UBos integrations, not vendor-published UBos editions. Official app-icon assets are not bundled yet; no placeholder is represented as an official icon.';
const iconNote='Independent UBos integrations, not vendor-published UBos editions. Codex and Claude product artwork loads from their vendor Marketplace listings and requires network access. The Discord symbol is bundled from Bootstrap Icons. A generic diamond appears if artwork fails. Icons do not prove installation or connection status.';
function paint(){
  for(const el of document.querySelectorAll('#shortcuts button,#results button,#running button,.ubos-window-grip,.body h1,.body h2,.body h3')){const source=sourceFor(el);if(source)decorate(el,source)}
  for(const p of document.querySelectorAll('.body p')){
    if(p.textContent===oldStore||p.textContent===oldIcons)p.textContent=iconNote;
    else if(p.textContent.endsWith('A generic diamond is used for this listing; it is not an official Discord icon.'))p.textContent=p.textContent.replace('A generic diamond is used for this listing; it is not an official Discord icon.','The Discord brand symbol is bundled from Bootstrap Icons. This is an independent UBos integration, not an official Discord edition.');
  }
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;paint()})}
const observer=new MutationObserver(schedule);
observer.observe(document.body,{childList:true,subtree:true,characterData:true});
paint();
})();
