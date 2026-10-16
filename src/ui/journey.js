(function(root){
'use strict';
const intro=[
 ['第一滴水','这座花园送给你！我来陪你试试怎么打理它，先从水边种点绿开始。'],
 ['谁来吃虫？','草养幼虫，幼虫养飞鸟。这次，我们接上一条食物链。'],
 ['火后的花园','留一圈石头，再点一小片火。给灰烬留些时间。'],
 ['林间来客','准备草地和浆果，邀请不同的邻居住进来。'],
 ['一座完整的岛','先养活小生命。生态值达到 300、650、1000，就能依次造湖、种森林、堆山。'],
 ['把时间交给花园','能量无限，地形仍靠本岛生态值解锁。慢慢建一座自己的花园。']
];
function nextStep(s,p){
 const m=s.metrics,done=p.tutorial||{};
 if(s.level===5||s.complete||done['chapter'+s.level])return null;
 const choose=(id,tool,title,body)=>done[id]?null:{id,tool,title,body};
 if(s.level===0){
  if(m.sprouted<12)return choose('sow','seed','把种子带到水边','白框是种子。拖到箭头处，或选中后在湿地上划一划。让 12 颗种子发芽。');
  if(m.bugMeals<4)return choose('feedBug','bug','给草地请一位小客人','把幼虫拖到草上。它吃过 4 次，这一关就完成了。');
 }
 if(s.level===1){
  if(m.bushPlaced<4)return choose('berries','bush','给邻居种点浆果','在空地种下 4 丛浆果。图标下面的小数字，是每次放置花掉的能量。');
  if(!s.cells.some(c=>c?.animal?.type==='bug')&&m.birdMeals<3)return {id:'food',tool:'bug',title:'飞鸟的午餐还没来',body:'先把幼虫放到草地。食物够了，再请飞鸟。'};
  if(m.birdMeals<3)return choose('birds','bird','让食物链接起来','在幼虫附近放一只飞鸟，观察 3 次捕食。任务一直在左上角。');
 }
 if(s.level===2){if(m.rocksPlaced<6)return choose('rocks','rock','先留一道防火边','放下 6 块石头，把准备燃烧的草地围开。');if(m.burned<8)return choose('fire','fire','只点一小片火','火也会伤害动物。选一片远离动物的草地，留意左上角的恢复任务。');return {id:'recover',title:'等土地缓一缓',body:'灰烬冷却后，在旁边补水。任务需要 4 次火后新生。'};}
 if(s.level===3)return choose('neighbors','animal','留出食物，再请邻居','种草和浆果，邀请 4 种动物。让它们进食并共同生活；不必一直放新动物。');
 if(s.level>=4){const next=Object.entries(Eco.TERRAIN_UNLOCK).find(([k,n])=>s.score<n);return next?{id:'terrain',tool:'seed',title:'先让小生命长起来',body:'发芽、进食和新生命都会增加生态值。下一项：'+Eco.TOOL[next[0]].name+' · '+next[1]+' 生态。'}:{id:'island',tool:s.metrics.lakeArea<12?'lake':s.metrics.forestArea<12?'forest':s.metrics.mountainArea<5?'mountain':null,title:'把山林和湖泊连起来',body:'左上角记录湖面、山地、森林、新生与持续生态。创造完，去观察模式看看它们。'};}
 return null;
}
function plan(s,p){const step=nextStep(s,p);return step&&(p.tutorialCounts?.[step.tool||step.id]||0)<2?step:null;}
function learned(p,step){if(!step)return;p.tutorialCounts??={};const key=step.tool||step.id;p.tutorialCounts[key]=Math.min(2,(p.tutorialCounts[key]||0)+1);}
function mount(api){
 const $=id=>document.getElementById(id),game=$('game');let started=false,mode='create',chapter=-1,drag=null,lastGuide=0;
 const home=document.createElement('div');home.id='welcome';home.innerHTML='<div class="welcome-art">🌱</div><p class="overline">朋友送来的一座花园</p><h1>生态花园</h1><p class="welcome-copy">送你一个大花园！<br>种一点绿，等一位邻居，<br>让生命慢慢接上生命。</p><div class="welcome-rules"><p><b>⚡ 能量</b> 放置会消耗，时间会补充。</p><p><b>✦ 生态</b> 发芽、进食、新生让它增加。</p><p><b>✓ 任务</b> 看左上角，全部完成后去下一关。</p></div><button id="enterGarden" class="primary">接过这座花园 →</button>';game.append(home);
 const bar=document.createElement('div');bar.id='modeBar';bar.innerHTML='<button id="createMode" aria-pressed="true">✿ 创造</button><button id="observeMode" aria-pressed="false">⌕ 观察</button><button id="gardenMenu">☰ 菜单</button>';document.querySelector('header').append(bar);
 const menu=document.createElement('dialog');menu.id='gardenMenuPanel';menu.innerHTML='<div class="dialogHead"><h2>歇一会儿</h2><button id="closeGardenMenu">返回花园</button></div><div class="menuGrid"></div>';game.append(menu);
 for(const id of ['chapterBtn','achieveBtn','helpBtn','saveBtn'])menu.querySelector('.menuGrid').append($(id));
 $('gardenMenu').onclick=()=>menu.showModal();$('closeGardenMenu').onclick=()=>menu.close();menu.querySelectorAll('.menuGrid button').forEach(b=>b.addEventListener('click',()=>menu.close()));
 const guide=document.createElement('section');guide.id='gardenerGuide';guide.innerHTML='<span class="gardener-avatar">✿</span><div><b id="guideTitle"></b><p id="guideBody"></p><button id="guideOK">知道啦</button></div>';game.append(guide);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='guideArrow';svg.innerHTML='<defs><marker id="arrowTip" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="white"/></marker></defs><path id="guideLine" fill="none" stroke="white" stroke-width="4" marker-end="url(#arrowTip)"/><circle id="guideTarget" r="19" fill="none" stroke="white" stroke-width="3"/>';game.append(svg);
 const setMode=m=>{mode=m;game.dataset.mode=m;$('createMode').setAttribute('aria-pressed',m==='create');$('observeMode').setAttribute('aria-pressed',m==='observe');api.choose(m==='observe'?'inspect':'seed');api.view.panMode=false;$('panToggle').setAttribute('aria-pressed','false');api.view.resize();};
 $('createMode').onclick=()=>setMode('create');$('observeMode').onclick=()=>setMode('observe');
 $('enterGarden').onclick=()=>{started=true;home.hidden=true;api.view.resize();};
 $('guideOK').onclick=()=>{const p=api.profile();p.tutorial??={};p.tutorial['intro'+api.world().level]=true;api.save();};
 const canvas=$('garden');canvas.addEventListener('dblclick',e=>{if(mode==='observe'){const i=api.view.pick(e.clientX,e.clientY);if(i>=0)api.focus(i);}});
 let tap=null;canvas.addEventListener('pointerup',e=>{if(mode!=='observe'||e.pointerType!=='touch')return;const now=performance.now();if(tap&&now-tap.t<320&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<15){api.focus(api.view.pick(e.clientX,e.clientY));tap=null;}else tap={t:now,x:e.clientX,y:e.clientY};});
 $('toolbar').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-tool]');if(!b||b.disabled||mode!=='create')return;drag={tool:b.dataset.tool,x:e.clientX,y:e.clientY};});
 window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)return;const r=canvas.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;api.choose(d.tool);api.pick(api.view.pick(e.clientX,e.clientY));});window.addEventListener('pointercancel',()=>drag=null);
 function update(){const now=performance.now();if(now-lastGuide<80)return;lastGuide=now;const s=api.world(),p=api.profile();if(!s)return;p.tutorial??={};
  if(chapter!==s.level){chapter=s.level;setMode('create');}
  if(s.metrics.sprouted>=12)p.tutorial.sow=true;if(s.metrics.bugMeals>=4)p.tutorial.feedBug=true;if(s.level===1&&s.metrics.bushPlaced>=4)p.tutorial.berries=true;if(s.level===1&&s.metrics.birdMeals>=3)p.tutorial.birds=true;if(s.level===2&&s.metrics.rocksPlaced>=6)p.tutorial.rocks=true;if(s.level===2&&s.metrics.burned>=8)p.tutorial.fire=true;if(s.level===3&&s.metrics.animalKinds>=4&&s.metrics.meals>=12)p.tutorial.neighbors=true;if(s.complete)p.tutorial['chapter'+s.level]=true;
  document.querySelectorAll('.guide-lit').forEach(b=>b.classList.remove('guide-lit'));svg.style.display='none';
  const hidden=s.level===5||!started||!!document.querySelector('dialog[open]')||mode==='observe';guide.hidden=hidden;if(hidden)return;
  if(!p.tutorial['intro'+s.level]){$('guideTitle').textContent='朋友的小纸条 · '+intro[s.level][0];$('guideBody').textContent=intro[s.level][1];$('guideOK').hidden=false;return;}
  const step=plan(s,p);guide.hidden=!step;$('guideOK').hidden=true;if(!step)return;$('guideTitle').textContent=step.title;$('guideBody').textContent=step.body;
  if(!step.tool)return;const b=document.querySelector('[data-tool="'+step.tool+'"]');if(!b)return;b.classList.add('guide-lit');
  let candidates=s.cells.map((c,i)=>({c,i})).filter(({c,i})=>c&&!Eco.allow(s,step.tool,i,p));if(step.tool==='seed')candidates=candidates.filter(({c})=>c.moist>=.6);if(step.tool==='bird')candidates.sort((a,b)=>Eco.nearby(s,b.i,2).filter(i=>s.cells[i].animal?.type==='bug').length-Eco.nearby(s,a.i,2).filter(i=>s.cells[i].animal?.type==='bug').length);
  if(!candidates.length)return;const target=api.view.screenCell(candidates[Math.floor(step.tool==='bird'?0:candidates.length/2)].i),r=b.getBoundingClientRect(),cr=canvas.getBoundingClientRect();if(!target||target.x<cr.left||target.x>cr.right||target.y<cr.top||target.y>cr.bottom)return;const x=r.left+r.width/2,y=r.top;svg.style.display='block';svg.setAttribute('viewBox','0 0 '+innerWidth+' '+innerHeight);$('guideLine').setAttribute('d',`M ${x} ${y} Q ${x-50} ${target.y+50} ${target.x} ${target.y+24}`);$('guideTarget').setAttribute('cx',target.x);$('guideTarget').setAttribute('cy',target.y);
 }
 game.dataset.mode='create';return{update,placed:tool=>{const step=plan(api.world(),api.profile());if(step?.tool===tool)learned(api.profile(),step);},active:()=>started,observe:()=>{if(mode!=='observe')setMode('observe');}};
}
root.GardenJourney={plan,learned,mount};
})(globalThis);
