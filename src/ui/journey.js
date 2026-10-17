(function(root){
'use strict';
const intro=[
 ['送你一座小岛','你好，朋友！这座岛送给你，我们一起打理吧。放置需要能量，等一会儿就会恢复；植物发芽、动物进食和新生都会增加生态值。完成左上角任务，就能去下一关啦。'],
 ['谁来吃虫？','你种的草长得真好。再放些幼虫和飞鸟吧：草养幼虫，幼虫养飞鸟，这就是食物链。'],
 ['火后的花园','我陪你试试用火。先围一圈石头，再点燃一小片草地。别靠近动物哦，烧过的土地也需要休息。灰烬冷却后补水种植，肥力能帮助发芽、开花；反复烧同一块地，收益会递减。'],
 ['林间来客','新朋友来啦！想让大家住下来，需要：至少 15 格植物，同时有幼虫、一种草食动物（如羊、羊驼、兔子）和一种食虫动物（如鸟、鸡、青蛙）。保持这些邻居共存，累计 30 秒；还需 4 种动物和 12 次进食。'],
 ['一座完整的岛','小岛热闹起来啦！我陪你把山林和湖泊连起来。湖泊 300、森林 650、山脉 1000 生态解锁。完整生态需同时满足：15 格植物、幼虫＋草食动物＋食虫动物、8 种元素（含植物/动物/地形）、曾发生捕食，以及 12 格水域、12 棵树、5 格山地。全部满足才连续计时 60 秒，缺任一项会重新计时；本关另需 6 次自然新生。'],
 ['自由建造','能量无限，地形仍靠本岛生态值解锁。慢慢建一座自己的花园。']
];
function nextStep(s,p){
 const m=s.metrics,done=p.tutorial||{};
 if(s.level===5||s.complete||done['chapter'+s.level])return null;
 const choose=(id,tool,title,body)=>done[id]?null:{id,tool,title,body};
 if(s.level===0){
  if(m.sprouted<12)return choose('sow','seed','把种子带到水边','跟我试试：选中白框里的种子，拖到箭头指着的水边。让 12 颗种子发芽吧！');
  if(m.bugMeals<4)return choose('feedBug','bug','放置幼虫','给草地添一只幼虫吧！把它拖到草上，等它吃过 4 次就完成啦。');
 }
 if(s.level===1){
  if(m.bushPlaced<4)return choose('berries','bush','种植浆果','在空地种下 4 丛浆果。图标下面的小数字，是每次放置花掉的能量。');
  if(!s.cells.some(c=>c?.animal?.type==='bug')&&m.birdMeals<3)return {id:'food',tool:'bug',title:'准备食物',body:'先把幼虫放到草地。食物够了，再请飞鸟。'};
  if(m.birdMeals<3)return choose('birds','bird','让食物链接起来','在幼虫附近放一只飞鸟，观察 3 次捕食。任务一直在左上角。');
 }
 if(s.level===2){if(m.rocksPlaced<6)return choose('rocks','rock','先留一道防火边','放下 6 块石头，把准备燃烧的草地围开。');if(m.burned<8)return choose('fire','fire','只点一小片火','火也会伤害动物。选一片远离动物的草地，留意左上角的恢复任务。');return {id:'recover',title:'等土地缓一缓',body:'灰烬冷却后，在旁边补水。任务需要 4 次火后新生。'};}
 if(s.level===3)return choose('neighbors','animal','引入动物','种草和浆果，邀请 4 种动物。让它们进食并共同生活；不必一直放新动物。');
 if(s.level>=4){const next=Object.entries(Eco.TERRAIN_UNLOCK).find(([k,n])=>s.score<n);return next?{id:'terrain',tool:'seed',title:'提升生态',body:'发芽、进食和新生命都会增加生态值。下一项：'+Eco.TOOL[next[0]].name+' · '+next[1]+' 生态。'}:{id:'island',tool:s.metrics.lakeArea<12?'lake':s.metrics.forestArea<12?'forest':s.metrics.mountainArea<5?'mountain':null,title:'完善生态',body:'左上角记录湖面、山地、森林、新生与持续生态。创造完，去观察模式看看它们。'};}
 return null;
}
function plan(s,p){const step=nextStep(s,p);return step&&!p.tutorial?.['dismiss'+s.level+'_'+step.id]&&(p.tutorialCounts?.[step.tool||step.id]||0)<2?step:null;}
function learned(p,step){if(!step)return;p.tutorialCounts??={};const key=step.tool||step.id;p.tutorialCounts[key]=Math.min(2,(p.tutorialCounts[key]||0)+1);}

function mountCover(home,portrait=false){
 const canvas=home.querySelector(portrait?'#friendModels':'#coverModels');let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:portrait});}catch{return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(),geometry=new THREE.BoxGeometry(1,1,1),materials=new Map(),figures=[];
 scene.add(new THREE.HemisphereLight(0xfffbeb,0x849477,.8));const light=new THREE.DirectionalLight(0xfff2d9,.45);light.position.set(-5,12,14);scene.add(light);
 function part(g,x,y,z,w,h,d,c,tilt=0){if(!materials.has(c))materials.set(c,new THREE.MeshLambertMaterial({color:c}));const mesh=new THREE.Mesh(geometry,materials.get(c));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.rotation.z=tilt;g.add(mesh);}
 const types=portrait?['dragon']:Array.from({length:99},(_,i)=>Object.keys(EcoData.LIFE)[i%31]);
 types.forEach((type,i)=>{const group=new THREE.Group();scene.add(group);figures.push(group);
 if(type==='mountain'){for(let k=0;k<4;k++)part(group,0,.17+k*.34,0,1.5-k*.24,.35,1.3-k*.2,[0x879384,0x99a28e,0xb1b9a1,0xdbdfcc][k]);}
 else if(type==='tree'||type==='bush'){GardenModels.plants({b:(...args)=>part(group,...args),c:{plant:type,age:160,variant:i%5},i,x:0,z:0,variant:i%5,wet:false,labelList:[]});}
 else GardenModels.animals({a:{type,age:100,habit:0},part:(...args)=>part(group,...args),phase:0,t:0,i,labelList:[]});group.rotation.y=(i%3-1)*.22;
 });


 let width=24,elapsed=0,last=0;
 function layout(){figures.forEach((g,i)=>{if(portrait){g.position.set(0,-.9,0);g.scale.setScalar(1.45);g.rotation.set(.13,-.45,0);return;}const col=i%9,row=Math.floor(i/9),dx=3.2,dy=2.8,periodX=9*dx,periodY=11*dy;const wrap=(v,n)=>(v+n/2)%n-n/2;const u=wrap((col-4)*dx+(row%2)*.6+elapsed*.13,periodX),v=wrap((row-5)*dy+elapsed*.055,periodY),angle=.38;g.position.set(u*Math.cos(angle)-v*Math.sin(angle),u*Math.sin(angle)+v*Math.cos(angle),0);g.scale.setScalar(['bug','bee','butterfly','frog'].includes(types[i])?1.4:1.25);g.rotation.set(.18,.45+(i%3-1)*.12,0);});}
 function resize(){const w=portrait?320:home.clientWidth,h=portrait?230:home.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const height=portrait?2.7:16;width=height*w/h;camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.near=.1;camera.far=100;camera.position.set(0,0,22);camera.lookAt(0,0,0);camera.updateProjectionMatrix();layout();renderer.render(scene,camera);}
 if(portrait){resize();const img=document.createElement('img');img.src=canvas.toDataURL('image/png');img.alt='送你小岛的龙朋友';canvas.replaceWith(img);renderer.dispose();geometry.dispose();materials.forEach(m=>m.dispose());}else{const observer=new ResizeObserver(resize);observer.observe(home);resize();const reduced=matchMedia('(prefers-reduced-motion: reduce)');function frame(t){if(!home.isConnected)return;if(!home.hidden&&!document.hidden&&!reduced.matches){elapsed+=last?Math.min((t-last)/1000,.05):0;layout();renderer.render(scene,camera);}last=t;requestAnimationFrame(frame);}requestAnimationFrame(frame);}

}

function mount(api){
 const $=id=>document.getElementById(id),game=$('game');let started=false,mode='create',chapter=-1,drag=null,lastGuide=0;
 const home=document.createElement('div');home.id='welcome';home.innerHTML='<canvas id="coverModels" aria-hidden="true"></canvas><div class="coverTitle"><h1>生态花园</h1><p>Ecogarden</p><button id="enterGarden" class="primary">开始打造</button></div>';game.append(home);mountCover(home);
 const bar=document.createElement('div');bar.id='modeBar';bar.innerHTML='<button id="createMode" aria-pressed="true">✿ 创造</button><button id="observeMode" aria-pressed="false">⌕ 观察</button><button id="gardenMenu">☰ 菜单</button>';document.querySelector('header').append(bar);
 const menu=document.createElement('dialog');menu.id='gardenMenuPanel';menu.innerHTML='<div class="dialogHead"><h2>菜单</h2><button id="closeGardenMenu">返回花园</button></div><div class="menuGrid"></div>';game.append(menu);
 for(const id of ['chapterBtn','achieveBtn','helpBtn','saveBtn'])menu.querySelector('.menuGrid').append($(id));
 $('gardenMenu').onclick=()=>menu.showModal();$('closeGardenMenu').onclick=()=>menu.close();menu.querySelectorAll('.menuGrid button').forEach(b=>b.addEventListener('click',()=>menu.close()));
 const guide=document.createElement('section');guide.id='gardenerGuide';guide.innerHTML='<div class="guideFriends"><canvas id="friendModels"></canvas></div><div class="guideWords"><b id="guideTitle"></b><p id="guideBody"></p><button id="guideOK">知道啦</button></div>';game.append(guide);mountCover(guide,true);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='guideArrow';svg.innerHTML='<defs><marker id="arrowTip" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="white"/></marker></defs><path id="guideLine" fill="none" stroke="white" stroke-width="4" marker-end="url(#arrowTip)"/><circle id="guideTarget" r="19" fill="none" stroke="white" stroke-width="3"/>';game.append(svg);
 const setMode=m=>{mode=m;game.dataset.mode=m;$('createMode').setAttribute('aria-pressed',m==='create');$('observeMode').setAttribute('aria-pressed',m==='observe');api.choose(m==='observe'?'inspect':'seed');api.view.panMode=false;$('panToggle').setAttribute('aria-pressed','false');api.view.resize();};
 $('createMode').onclick=()=>setMode('create');$('observeMode').onclick=()=>setMode('observe');
 $('enterGarden').onclick=()=>{started=true;home.hidden=true;api.view.resize();};
 $('guideOK').onclick=()=>{const p=api.profile(),s=api.world(),step=plan(s,p);p.tutorial??={};p.tutorial['intro'+s.level]=true;if(step)p.tutorial['dismiss'+s.level+'_'+step.id]=true;guide.hidden=true;svg.style.display='none';api.save();};const taskHelp=document.createElement('button');taskHelp.id='taskHelp';taskHelp.className='textBtn';taskHelp.textContent='任务说明';document.querySelector('.mission').append(taskHelp);taskHelp.onclick=()=>{if(api.world().level===5)return;api.profile().tutorial['intro'+api.world().level]=false;lastGuide=0;update();};
 const canvas=$('garden');canvas.addEventListener('dblclick',e=>{if(mode==='observe'){const i=api.view.pick(e.clientX,e.clientY);if(i>=0)api.focus(i);}});
 let tap=null;canvas.addEventListener('pointerup',e=>{if(mode!=='observe'||e.pointerType!=='touch')return;const now=performance.now();if(tap&&now-tap.t<320&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<15){api.focus(api.view.pick(e.clientX,e.clientY));tap=null;}else tap={t:now,x:e.clientX,y:e.clientY};});
 $('toolbar').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-tool]');if(!b||b.disabled||mode!=='create')return;drag={tool:b.dataset.tool,x:e.clientX,y:e.clientY};});
 window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)return;const r=canvas.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;api.choose(d.tool);api.pick(api.view.pick(e.clientX,e.clientY));});window.addEventListener('pointercancel',()=>drag=null);
 function update(){const now=performance.now();if(now-lastGuide<80)return;lastGuide=now;const s=api.world(),p=api.profile();if(!s)return;p.tutorial??={};
  $('taskHelp').hidden=s.level===5;if(chapter!==s.level){chapter=s.level;setMode('create');}
  if(s.metrics.sprouted>=12)p.tutorial.sow=true;if(s.metrics.bugMeals>=4)p.tutorial.feedBug=true;if(s.level===1&&s.metrics.bushPlaced>=4)p.tutorial.berries=true;if(s.level===1&&s.metrics.birdMeals>=3)p.tutorial.birds=true;if(s.level===2&&s.metrics.rocksPlaced>=6)p.tutorial.rocks=true;if(s.level===2&&s.metrics.burned>=8)p.tutorial.fire=true;if(s.level===3&&s.metrics.animalKinds>=4&&s.metrics.meals>=12)p.tutorial.neighbors=true;if(s.complete)p.tutorial['chapter'+s.level]=true;
  document.querySelectorAll('.guide-lit').forEach(b=>b.classList.remove('guide-lit'));svg.style.display='none';
  const hidden=s.level===5||!started||!!document.querySelector('dialog[open]')||mode==='observe';guide.hidden=hidden;if(hidden)return;
  const step=plan(s,p),opening=!p.tutorial['intro'+s.level];guide.hidden=!opening&&!step;$('guideOK').hidden=false;if(guide.hidden)return;$('guideTitle').textContent=opening?intro[s.level][0]:step.title;$('guideBody').textContent=opening?intro[s.level][1]+(s.level<3&&step?' '+step.body:''):step.body;if(!step)return;
  if(!step.tool)return;const b=document.querySelector('[data-tool="'+step.tool+'"]');if(!b)return;b.classList.add('guide-lit');
  let candidates=s.cells.map((c,i)=>({c,i})).filter(({c,i})=>c&&!Eco.allow(s,step.tool,i,p));if(step.tool==='seed'){candidates=candidates.filter(({c})=>c.moist>=.6);candidates.sort((a,b)=>Eco.nearby(s,b.i).filter(j=>['water','spring'].includes(s.cells[j]?.ground)).length-Eco.nearby(s,a.i).filter(j=>['water','spring'].includes(s.cells[j]?.ground)).length);}if(step.tool==='bug')candidates=candidates.filter(({c})=>c.plant==='grass');if(step.tool==='bird')candidates.sort((a,b)=>Eco.nearby(s,b.i,2).filter(i=>s.cells[i].animal?.type==='bug').length-Eco.nearby(s,a.i,2).filter(i=>s.cells[i].animal?.type==='bug').length);
  if(!candidates.length)return;const cr=canvas.getBoundingClientRect(),gr=guide.getBoundingClientRect();const visible=candidates.map(v=>api.view.screenCell(v.i)).filter(v=>v&&v.x>cr.left+25&&v.x<cr.right-25&&v.y>cr.top+25&&v.y<cr.bottom-25&&!(v.x>gr.left-24&&v.x<gr.right+24&&v.y>gr.top-24&&v.y<gr.bottom+24));const target=visible[0],r=b.getBoundingClientRect();if(!target||target.x<cr.left||target.x>cr.right||target.y<cr.top||target.y>cr.bottom)return;const x=r.left+r.width/2,y=r.top;svg.style.display='block';svg.setAttribute('viewBox','0 0 '+innerWidth+' '+innerHeight);$('guideLine').setAttribute('d',`M ${x} ${y} Q ${x-50} ${target.y+50} ${target.x} ${target.y+24}`);$('guideTarget').setAttribute('cx',target.x);$('guideTarget').setAttribute('cy',target.y);
 }
 game.dataset.mode='create';return{update,reset:()=>{chapter=-1;started=false;home.hidden=false;guide.hidden=true;svg.style.display='none';lastGuide=0;setMode('create');},placed:tool=>{const step=plan(api.world(),api.profile());if(step?.tool===tool)learned(api.profile(),step);},active:()=>started,observe:()=>{if(mode!=='observe')setMode('observe');}};
}
root.GardenJourney={plan,learned,mount};
})(globalThis);
