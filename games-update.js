(()=>{
'use strict';
if(window.ubosGamesUpdate)return;
window.ubosGamesUpdate=true;
const q=s=>document.querySelector(s),library=q('#library'),grid=q('.hub-grid')||library;
if(!library||!grid)return;
const style=document.createElement('style');
style.textContent='.extra-game-board{display:grid;gap:8px;width:min(100%,390px);margin:18px 0;touch-action:none}.extra-2048-board{grid-template-columns:repeat(4,1fr);padding:10px;background:#111b2b;border-radius:18px}.extra-2048-tile{display:grid;place-items:center;aspect-ratio:1;border-radius:12px;background:#ffffff12;font-size:clamp(18px,5vw,30px);font-weight:700}.extra-2048-tile[data-value="2"]{background:#b6c9d833}.extra-2048-tile[data-value="4"]{background:#9ce0b533}.extra-2048-tile[data-value="8"]{background:#f4c27c55}.extra-2048-tile[data-value="16"]{background:#ee997755}.extra-2048-tile[data-value="32"],.extra-2048-tile[data-value="64"]{background:#d5798c77}.extra-ttt-board{grid-template-columns:repeat(3,1fr)}.extra-ttt-board button{aspect-ratio:1;font-size:clamp(32px,10vw,58px);font-weight:700}';
document.head.append(style);
const originals=window.show;
function backToLibrary(){for(const section of document.querySelectorAll('.extra-game-screen'))section.hidden=true;originals('library')}
function openGame(section){originals('library');library.hidden=true;q('#dino18')?.setAttribute('hidden','');section.hidden=false}
function addCard(id,title,description,play){const card=document.createElement('article');card.className='card';card.dataset.extraGame=id;const heading=document.createElement('h2');heading.textContent=title;const detail=document.createElement('p');detail.textContent=description;const button=document.createElement('button');button.textContent='Play '+title;button.onclick=play;card.append(heading,detail,button);grid.append(card)}
function addScreen(id,title,instructions){const section=document.createElement('section');section.className='extra-game-screen';section.hidden=true;section.innerHTML='<div class="row"><button type="button" data-extra-back>← Games</button><strong></strong></div><h1></h1><p class="muted"></p>';section.querySelector('strong').textContent=title;section.querySelector('h1').textContent=title;section.querySelector('.muted').textContent=instructions;document.querySelector('main').append(section);section.querySelector('[data-extra-back]').onclick=backToLibrary;return section}

const game2048=addScreen('2048','2048','Use arrow keys or swipe to slide tiles. Matching tiles merge; reach 2048!');
const score2048=document.createElement('p');score2048.setAttribute('role','status');game2048.append(score2048);
const board2048=document.createElement('div');board2048.className='extra-game-board extra-2048-board';board2048.setAttribute('role','grid');board2048.setAttribute('aria-label','2048 game board');game2048.append(board2048);
const new2048=document.createElement('button');new2048.textContent='New game';game2048.insertBefore(new2048,score2048);
let tiles=[],score=0,over=false,won=false,touchStart=null;
function best2048(){try{return Number(localStorage.getItem('ubos.games.2048.best'))||0}catch{return 0}}
function save2048(){try{if(score>best2048())localStorage.setItem('ubos.games.2048.best',String(score))}catch{}}
function draw2048(){board2048.replaceChildren();tiles.forEach(value=>{const tile=document.createElement('div');tile.className='extra-2048-tile';tile.dataset.value=value;tile.setAttribute('role','gridcell');tile.setAttribute('aria-label',value?String(value):'empty');tile.textContent=value||'';board2048.append(tile)});score2048.textContent='Score '+score+' · Best '+Math.max(score,best2048())+(won?' · 2048 reached!':over?' · No more moves. Start a new game.':'')}
function addTile(){const empty=tiles.map((v,i)=>v? -1:i).filter(i=>i>=0);if(empty.length)tiles[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<.9?2:4}
function newGame2048(){tiles=Array(16).fill(0);score=0;over=won=false;addTile();addTile();draw2048()}
function lineMove(line){const values=line.filter(Boolean),out=[];for(let i=0;i<values.length;i++){if(values[i]===values[i+1]){out.push(values[i]*2);score+=values[i]*2;i++}else out.push(values[i])}while(out.length<4)out.push(0);return out}
function move2048(direction){if(over)return;const before=tiles.join(','),next=Array(16).fill(0);for(let n=0;n<4;n++){let ids=Array.from({length:4},(_,i)=>direction==='left'?n*4+i:direction==='right'?n*4+3-i:direction==='up'?i*4+n:(3-i)*4+n);const moved=lineMove(ids.map(i=>tiles[i]));ids.forEach((id,i)=>next[id]=moved[i])}tiles=next;if(before!==tiles.join(',')){addTile();if(!won&&tiles.includes(2048)){won=true;save2048()}save2048()}over=!tiles.includes(0)&&!canMove();draw2048()}
function canMove(){for(let i=0;i<16;i++){if(tiles[i]===tiles[i+1]&&i%4!==3)return true;if(tiles[i]===tiles[i+4])return true}return false}
const directionByKey={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};
document.addEventListener('keydown',e=>{if(game2048.hidden)return;const direction=directionByKey[e.key];if(direction){e.preventDefault();move2048(direction)}});
board2048.onpointerdown=e=>{touchStart=[e.clientX,e.clientY];board2048.setPointerCapture(e.pointerId)};
board2048.onpointerup=e=>{if(!touchStart)return;const dx=e.clientX-touchStart[0],dy=e.clientY-touchStart[1];touchStart=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;move2048(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up')};
new2048.onclick=newGame2048;
addCard('2048','2048','Slide and merge tiles to reach 2048.',()=>{openGame(game2048);newGame2048()});

const tic=addScreen('tic-tac-toe','Tic-Tac-Toe','Two players take turns. Get three in a row to win.');
const ticStatus=document.createElement('p');ticStatus.setAttribute('role','status');tic.append(ticStatus);
const ticBoard=document.createElement('div');ticBoard.className='extra-game-board extra-ttt-board';ticBoard.setAttribute('role','grid');ticBoard.setAttribute('aria-label','Tic-Tac-Toe board');tic.append(ticBoard);
const resetTic=document.createElement('button');resetTic.textContent='New game';tic.append(resetTic);
let marks=Array(9).fill(''),turn='X',finished=false;
const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function drawTic(){ticBoard.replaceChildren();marks.forEach((mark,i)=>{const cell=document.createElement('button');cell.type='button';cell.setAttribute('role','gridcell');cell.setAttribute('aria-label','Cell '+(i+1)+(mark?', '+mark:' empty'));cell.textContent=mark;cell.disabled=finished||!!mark;cell.onclick=()=>playTic(i);ticBoard.append(cell)});const winner=wins.find(line=>line.every(i=>marks[i]===marks[line[0]]&&marks[i]));ticStatus.textContent=winner?'Player '+marks[winner[0]]+' wins!':finished?'Draw game. Start a new game.':'Player '+turn+' to move'}
function playTic(i){if(finished||marks[i])return;marks[i]=turn;const winner=wins.some(line=>line.every(j=>marks[j]===turn));if(winner||marks.every(Boolean))finished=true;else turn=turn==='X'?'O':'X';drawTic()}
function newTic(){marks=Array(9).fill('');turn='X';finished=false;drawTic()}
resetTic.onclick=newTic;
addCard('tic-tac-toe','Tic-Tac-Toe','A quick two-player game. Line up three marks to win.',()=>{openGame(tic);newTic()});

const search=document.querySelector('.hub-controls input[aria-label="Search games"]');
if(search)search.addEventListener('input',()=>{const term=search.value.trim().toLowerCase();for(const card of grid.querySelectorAll('[data-extra-game]'))card.hidden=!card.querySelector('h2').textContent.toLowerCase().includes(term)});
newGame2048();
newTic();
})();
