(function(root){
'use strict';
const {VERSION,STEP_MS,LIFE,ANIMAL_NAMES,WEIGHTS,HERBS,HUNTERS,POLLINATORS,PREY,EXTRA_METRICS,PET_TITLES,PLANT_LIFE,BREED,TOOL,BASE,LATE,LEVELS,ACHIEVEMENTS,SECRET,METRICS}=EcoData;
const TERRAIN_UNLOCK={lake:300,forest:650,mountain:1000};
const blankMetrics=()=>Object.fromEntries(METRICS.map(k=>[k,0]));
const soil=()=>({ground:'soil',plant:null,animal:null,age:0,plantLife:0,waterAge:0,fire:0,ash:0,recovery:0,burns:0,fert:0,moist:0,elevation:0,variant:0});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function defaultProfile(){return {version:VERSION,unlocked:0,current:0,completed:[],achievements:{},totalScore:0,totals:blankMetrics(),worlds:{},tutorial:{},seen:{},records:{},settings:{sound:true,labels:true,autoFocus:false,quality:'auto'}};}
function valid(x,y,w,h){if(x<0||y<0||x>=w||y>=h)return false;let u=(x-w/2+.5)/(w/2-.5),v=(y-h/2+.5)/(h/2-.5),a=Math.atan2(v,u);return Math.pow(Math.abs(u),3.5)+Math.pow(Math.abs(v),3.5)<1+.045*Math.sin(a*5);}
function makeWorld(level){
 const cfg=LEVELS[level],s={level,w:cfg.w,h:cfg.h,cells:[],tick:0,energy:level===0?50:100,score:0,combo:1,comboLeft:0,lastCombo:'',metrics:blankMetrics(),complete:false,notified:{},events:[],rng:(1234567+Date.now()+level*177)>>>0};
 for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++)s.cells.push(valid(x,y,s.w,s.h)?soil():null);
 const at=(x,y)=>s.cells[y*s.w+x];const cx=Math.floor(s.w/2),cy=Math.floor(s.h/2);
 for(const [dx,dy] of [[-1,0],[0,0],[0,1]])at(cx+dx,cy+dy).ground='water';
 if(level>=1){for(let y=cy-3;y<=cy+3;y++)for(let x=cx-4;x<=cx+4;x++){let c=at(x,y);if(c&&c.ground==='soil'&&(x+y)%3!==0){c.plant='grass';c.age=20;}}}
 if(level>=3){for(let dx of [-4,-2,2,4]){let c=at(cx+dx,cy-3);if(c){c.plant='bush';c.age=70;}}}
 s.cells.forEach((c,i)=>{if(c)c.variant=(Math.imul(i+1,2654435761)>>>0)%5;});updateMoisture(s);return s;
}
function nearby(s,i,r=1){let x=i%s.w,y=Math.floor(i/s.w),out=[];for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){let xx=x+dx,yy=y+dy;if((dx||dy)&&xx>=0&&yy>=0&&xx<s.w&&yy<s.h&&s.cells[yy*s.w+xx])out.push(yy*s.w+xx);}return out;}
function updateMoisture(s){
 for(const c of s.cells)if(c)c.moist=0;
 s.cells.forEach((c,i)=>{if(c&&['water','spring'].includes(c.ground)){c.moist=1;for(const j of nearby(s,i,3)){let d=Math.max(Math.abs(j%s.w-i%s.w),Math.abs(Math.floor(j/s.w)-Math.floor(i/s.w)));s.cells[j].moist=Math.max(s.cells[j].moist,d===1?1:d===2?.6:.25);}}});
}
function rand(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function award(profile,id,s,i){if(profile.achievements[id])return false;profile.achievements[id]=new Date().toISOString();if(s&&Number.isInteger(i)&&s.cells[i]){profile.achievementPlaces??={};profile.achievementPlaces[id]={level:s.level,i,type:s.cells[i].animal?.type||null};}return true;}
function note(s,id,title,text,i){if(s.notified[id])return;s.notified[id]=true;s.events.unshift({id,title,text,i,tick:s.tick});s.events=s.events.slice(0,40);}
function count(s,key,n,p){s.metrics[key]=(s.metrics[key]||0)+n;if(p)p.totals[key]=(p.totals[key]||0)+n;}
function combo(s,source){s.combo=clamp(s.combo+1,1,8);s.comboLeft=48;s.lastCombo=source;}
function animal(type){return {type,age:0,full:0,drunk:0,sleep:0,dir:0,moved:-1,hunger:0,bred:0,petUntil:0,variant:0};}
function surfaceHeight(c){return c?.ground==='mountain'?(c.elevation||1.8):c?.ground==='rock'?.65:0;}
function isLand(c){return c&&['soil','ash'].includes(c.ground)&&!c.fire;}
function allow(s,tool,i,p,replace=false){
 const c=s.cells[i];if(!c)return T.m215;
 if(!LEVELS[s.level].tools.includes(tool))return T.m216;
 if(tool==='inspect'||tool==='erase')return '';
 if(s.level>=4&&TERRAIN_UNLOCK[tool]&&s.score<TERRAIN_UNLOCK[tool])return '需要 '+TERRAIN_UNLOCK[tool]+' 生态值解锁';
 if(s.level!==5&&s.energy<TOOL[tool].cost)return T.m217;
 if(tool==='fire')return c.plant&&['grass','flower','tree','bush'].includes(c.plant)&&!c.fire?'':T.m218;
 if((tool==='animal'||Object.hasOwn(LIFE,tool))){
  if(!isLand(c))return T.m219;if(c.animal)return T.m220;
  if(tool==='bug'&&!['grass','flower'].includes(c.plant))return T.m221;return '';
 }
 if(c.animal)return T.m222;
 if(!isLand(c))return T.m223;
 if(['lake','mountain','forest'].includes(tool)&&!c.fire&&!c.ash&&[null,'seed','grass','flower'].includes(c.plant))return '';if(c.fire||c.ash>0)return T.m224;
 if(c.plant&&!(replace&&['seed','flower'].includes(c.plant)))return T.m225;
 return '';
}
function place(s,tool,i,p,replace=false){
 const reason=allow(s,tool,i,p,replace);if(reason)return {ok:false,reason};const c=s.cells[i];
 if(tool==='inspect')return {ok:true};
 if(tool==='erase'){if(c.animal)c.animal=null;else{c.plant=null;c.ground='soil';c.elevation=0;c.age=0;c.fire=0;c.ash=0;}updateMoisture(s);refreshTerrain(s);return {ok:true};}
 if(s.level!==5)s.energy-=TOOL[tool].cost;count(s,'placed',1,p);
 if((tool==='animal'||Object.hasOwn(LIFE,tool))){let type=tool;if(tool==='animal'){let roll=rand(s)*100;for(const[k,w]of Object.entries(WEIGHTS)){roll-=w;if(roll<0){type=k;break;}}}c.animal=animal(type);c.animal.variant=c.variant;if(type==='alpaca')award(p,'alpaca',s,typeof i==='number'?i:-1);recordKinds(s);check(s,p);return {ok:true,type};}
 c.plantLife=0;
 if(tool==='seed'){c.plant='seed';c.age=0;c.plantLife=0;award(p,'seed',s,typeof i==='number'?i:-1);}
 if(tool==='water'){c.plant=null;c.ground='water';c.waterAge=0;}
 if(tool==='bush'){c.plant='bush';c.age=0;c.plantLife=0;count(s,'bushPlaced',1,p);}
 if(tool==='rock'){c.plant=null;c.ground='rock';count(s,'rocksPlaced',1,p);}
 if(tool==='fire'){c.fire=10;c.plant=null;count(s,'burned',1,p);note(s,'firstFire',T.m226,T.m227,i);}
 if(['lake','mountain','forest'].includes(tool)){
  if(['seed','grass','flower'].includes(c.plant))c.plant=null;
  const spots=[i,...nearby(s,i,tool==='forest'?3:2)].filter(j=>Math.hypot(j%s.w-i%s.w,Math.floor(j/s.w)-Math.floor(i/s.w))<=(tool==='forest'?3:2.6));for(const j of spots){let d=s.cells[j];if(!isLand(d)||d.animal||d.fire||d.ash>0||['tree','bush'].includes(d.plant))continue;d.plant=null;d.elevation=0;
   if(tool==='lake'){d.ground=j===i?'spring':'water';d.waterAge=0;}
   if(tool==='mountain'){const distance=Math.max(Math.abs(j%s.w-i%s.w),Math.abs(Math.floor(j/s.w)-Math.floor(i/s.w)));d.ground='mountain';d.elevation=distance===0?2.8:distance===1?1.8:.8;}
   if(tool==='forest'){d.plant=j===i||rand(s)<.72?'tree':'grass';d.age=0;d.plantLife=0;}
  }count(s,tool+'Placed',1,p);
 }
 updateMoisture(s);refreshTerrain(s);check(s,p);return {ok:true};
}
function recordKinds(s){let types=new Set(s.cells.filter(c=>c?.animal).map(c=>c.animal.type));s.metrics.animalKinds=Math.max(s.metrics.animalKinds||0,types.size);return types;}
function pet(s,i,p){const a=s.cells[i]?.animal;if(!a)return {ok:false,reason:T.m228};if(a.petUntil>s.tick)return {ok:false,reason:T.m229};a.petUntil=s.tick+6;count(s,'pets',1,p);award(p,'pet'+a.type,s,typeof i==='number'?i:-1);if(a.drunk||a.sleep)award(p,'petDrunk',s,typeof i==='number'?i:-1);let n=Object.keys(PET_TITLES).filter(k=>p.achievements['pet'+k]).length;if(n>=5)award(p,'petFriends',s,typeof i==='number'?i:-1);if(n===15)award(p,'petAll',s,typeof i==='number'?i:-1);return {ok:true,type:a.type};}
function eatPlants(s,i,a){let spots=[i,...nearby(s,i)];return spots.filter(j=>{let d=s.cells[j];if(['wolf','frog','hedgehog'].includes(a.type))return false;if(['fox','bird','chicken'].includes(a.type))return d.plant==='seed'||d.plant==='bush'&&d.age>=80;if(POLLINATORS.includes(a.type))return d.plant==='flower'||d.plant==='bush'&&d.age>=50;if(a.type==='squirrel')return d.plant==='tree'&&d.age%24<3||d.plant==='seed'||d.plant==='bush'&&d.age>=80;return d.plant==='grass'&&d.age>=12||d.plant==='flower'||d.plant==='bush'&&d.age>=80;}).sort((j,k)=>(s.cells[k].plant==='bush')-(s.cells[j].plant==='bush'));}
function canWalk(c,a){return !!c&&!c.fire&&(isLand(c)||a.type==='alpaca'&&['rock','mountain'].includes(c.ground))&&(!['tree','bush'].includes(c.plant)||['deer','squirrel','bird'].includes(a.type));}
function habitat(s,i,type){const nn=[i,...nearby(s,i,2)];if(type==='alpaca')return nn.some(j=>['mountain','rock'].includes(s.cells[j].ground))?2:0;if(['deer','squirrel'].includes(type))return Math.min(3,nn.filter(j=>s.cells[j].plant==='tree').length)*.8;if(type==='frog')return s.cells[i].moist>=.6?3:-3;if(type==='boar')return nn.some(j=>s.cells[j].plant==='bush')?1:0;return 0;}

function arrive(s,p){
 const nums={},pl={grass:0,flower:0,tree:0,bush:0,wet:0,mountain:0};for(const c of s.cells)if(c){if(c.animal)nums[c.animal.type]=(nums[c.animal.type]||0)+1;if(c.plant in pl)pl[c.plant]++;if(c.moist>=.6&&c.plant)pl.wet++;if(c.ground==='mountain')pl.mountain++;}
 const graze=pl.grass+pl.flower,bug=nums.bug||0,herbs=HERBS.reduce((n,k)=>n+(nums[k]||0),0);
 const ready={bug:graze>=6&&pl.wet>=3,bird:s.level>=1&&pl.tree>=1&&bug>=2,butterfly:s.level>=1&&pl.flower>=3,bee:pl.flower>=4,sheep:graze>=10&&pl.bush>=1,alpaca:graze>=12&&pl.bush>=1,rabbit:graze>=8&&pl.bush>=1,deer:pl.tree>=4&&graze>=8,fox:(nums.rabbit||0)+(nums.chicken||0)>=3,chicken:graze>=8&&bug>=1,frog:pl.wet>=5&&bug>=2,hedgehog:pl.tree>=2&&bug>=2,wolf:herbs>=8&&(pl.mountain>0||pl.tree>=5),squirrel:pl.tree>=5,boar:pl.bush>=3&&graze>=15};
 const options=Object.keys(WEIGHTS).filter(k=>ready[k]&&(s.level>=3||['bug','bird','butterfly'].includes(k))&&(nums[k]||0)<(k==='bug'?Math.min(8,Math.max(2,Math.floor(graze/12))):k==='boar'?2:3));
 if(!options.length||rand(s)>.7)return false;let roll=rand(s)*options.reduce((n,k)=>n+WEIGHTS[k],0),type=options.at(-1);for(const k of options){roll-=WEIGHTS[k];if(roll<0){type=k;break;}}
 const spots=s.cells.map((c,i)=>c&&!c.animal&&canWalk(c,{type})&&(type!=='bug'||['grass','flower'].includes(c.plant))&&(type!=='frog'||c.moist>=.6)?i:-1).filter(i=>i>=0);if(!spots.length)return false;
 const i=spots[Math.floor(rand(s)*spots.length)],a=animal(type);a.variant=s.cells[i].variant;a.moved=s.tick;s.cells[i].animal=a;count(s,'arrivals',1,p);note(s,'arrival'+type,ANIMAL_NAMES[type]+T.m230,T.m231,i);if(type==='alpaca')award(p,'alpaca',s,typeof i==='number'?i:-1);return type;
}
function refreshTerrain(s){if(s.level<4)return;s.metrics.lakeArea=largestLake(s);s.metrics.mountainArea=s.cells.filter(c=>c?.ground==='mountain').length;s.metrics.forestArea=s.cells.filter(c=>c?.plant==='tree').length;}
function largestLake(s){let best=0,seen=new Set();for(let i=0;i<s.cells.length;i++){if(seen.has(i)||!['water','spring'].includes(s.cells[i]?.ground))continue;let q=[i];seen.add(i);for(let n=0;n<q.length;n++)for(const j of nearby(s,q[n]))if(Math.abs(j%s.w-q[n]%s.w)+Math.abs(Math.floor(j/s.w)-Math.floor(q[n]/s.w))===1&&!seen.has(j)&&['water','spring'].includes(s.cells[j].ground)){seen.add(j);q.push(j);}best=Math.max(best,q.length);}return best;}
function census(s){const result={};s.cells.forEach((c,i)=>{if(c?.animal){const t=c.animal.type;(result[t]??=[]).push(i);}});return result;}
function step(s,p){
 s.tick++;s.energy=Math.min(100,s.energy+.24);if(s.comboLeft>0&&--s.comboLeft===0){s.combo=1;s.lastCombo='';}
 if(s.tick%4===0)updateMoisture(s);if(s.tick>=20&&s.tick%20===0)arrive(s,p);
 const population={},plants=s.cells.filter(c=>c?.plant&&c.plant!=='seed').length;for(const c of s.cells)if(c?.animal)population[c.animal.type]=(population[c.animal.type]||0)+1;
 const order=s.cells.map((c,i)=>c?i:-1).filter(i=>i>=0);for(let k=order.length-1;k>0;k--){let j=Math.floor(rand(s)*(k+1));[order[k],order[j]]=[order[j],order[k]];}
 for(const i of order){let c=s.cells[i],n=nearby(s,i),x=i%s.w,y=Math.floor(i/s.w);c.age++;if(c.recovery)c.recovery--;
  if(c.plant&&++c.plantLife>=PLANT_LIFE[c.plant]){const was=c.plant;c.plant=s.level>=3&&c.moist>0?'seed':null;c.plantLife=0;c.age=0;c.fert=Math.min(3,c.fert+.2);if(was==='tree'||was==='bush')note(s,'plantCycle',T.m232,T.m233,i);}
  if(c.ground==='water'&&++c.waterAge>700&&rand(s)<.0008&&!n.some(j=>s.cells[j].ground==='spring'))c.ground='soil';
  if(c.fire){if(c.animal){c.animal=null;c.fert=Math.min(3,c.fert+.3);}c.fire--;for(const j of n){if(Math.abs(j%s.w-x)+Math.abs(Math.floor(j/s.w)-y)!==1)continue;let d=s.cells[j];if(['grass','flower','tree','bush'].includes(d.plant)&&!d.fire&&rand(s)<.16){d.fire=10;d.plant=null;count(s,'burned',1,p);}}
   if(!c.fire){c.ground='ash';c.ash=30;c.age=0;c.recovery=180;c.fert=Math.min(3,c.fert+.6*Math.pow(.65,c.burns));c.burns++;}continue;
  }
  if(c.ash>0)c.ash--;
  if(c.ground==='ash'&&!c.plant&&!c.ash&&rand(s)<(c.moist>=.6?.025:.008)*(1+c.fert*.3)){
   c.plant='grass';c.age=0;c.plantLife=0;c.ground='soil';count(s,'reborn',1,p);combo(s,T.m234);award(p,'fire',s,typeof i==='number'?i:-1);note(s,'regrowth',T.m116,T.m235,i);
  }
  if(s.level>=3&&!c.plant&&isLand(c)&&!c.ash&&c.moist>=.6&&c.fert>0&&rand(s)<.012){c.plant='seed';c.age=0;c.plantLife=0;}
  if(c.plant==='seed'&&c.age>=8&&c.moist>=.6&&rand(s)<.14*(1+c.fert*.2)){c.plant='grass';c.age=0;c.plantLife=0;count(s,'sprouted',1,p);note(s,'firstSprout',T.m236,T.m237,i);}
  else if(c.plant==='grass'){
   if(c.moist>=.6&&rand(s)<.027){let choices=n.filter(j=>{let d=s.cells[j];return d.ground==='soil'&&!d.plant&&!d.fire&&!d.ash});if(choices.length){let d=s.cells[choices[Math.floor(rand(s)*choices.length)]];d.plant='seed';d.age=0;d.plantLife=0;}}
   if(c.age>80&&!c.recovery&&rand(s)<(s.level===0?.004:s.level>=3?.001:.016)*(1+c.moist)){c.plant='tree';c.age=0;c.plantLife=0;note(s,'tree',T.m238,T.m239,i);}
   else if(c.age>40&&rand(s)<.012){c.plant='flower';c.age=0;c.plantLife=0;}
  }else if(c.plant==='flower'&&s.level>=1&&c.age>100&&rand(s)<.004&&!c.animal&&(population.butterfly||0)<Math.max(3,plants/25)){c.animal=animal('butterfly');c.plant='grass';c.age=0;c.plantLife=0;note(s,'butterfly',T.m240,T.m241,i);}
  else if(c.plant==='tree'&&c.age>100&&s.tick%12===0&&rand(s)<.25){let empty=n.filter(j=>s.cells[j].ground==='soil'&&!s.cells[j].plant);if(empty.length){let j=empty[Math.floor(rand(s)*empty.length)];s.cells[j].plant='seed';s.cells[j].age=0;s.cells[j].plantLife=0;}}
  else if(c.plant==='bush'&&c.age===150){note(s,'ferment',T.m242,T.m243,i);}
  const a=c.animal;if(!a||a.moved===s.tick)continue;a.moved=s.tick;a.age++;
  if(a.age>=LIFE[a.type]){c.animal=null;c.fert=Math.min(3,c.fert+.35);award(p,'cycle',s,typeof i==='number'?i:-1);note(s,'lifeEnd'+a.type,ANIMAL_NAMES[a.type]+T.m244,T.m245,i);continue;}
  if(a.drunk>0){a.drunk--;if(a.drunk===0){a.sleep=20;note(s,'nap',T.m246,T.m247,i);}continue;}
  if(a.sleep>0){if(--a.sleep===0){award(p,'sober',s,typeof i==='number'?i:-1);note(s,'sober',T.m248,T.m249,i);}continue;}
  a.hunger=(a.hunger||0)+1;
  const predator=!!PREY[a.type], pollinator=POLLINATORS.includes(a.type), herb=HERBS.includes(a.type), budget=predator?300:200;
  if(a.hunger>budget){c.animal=null;c.fert=Math.min(3,c.fert+.3);continue;}
  let ate=false,food=eatPlants(s,i,a),prey=predator?nearby(s,i,2).filter(j=>PREY[a.type].includes(s.cells[j].animal?.type)):[];
  const appetite=a.type==='bug'?.055:predator?.14:pollinator?.07:.12;
  const preySupply=predator?PREY[a.type].reduce((sum,k)=>sum+(population[k]||0),0):0;
  const competitors=predator?Object.keys(PREY).filter(k=>PREY[k].some(t=>PREY[a.type].includes(t))).reduce((sum,k)=>sum+(population[k]||0),0):0;
  const huntingRate=appetite*Math.min(1,preySupply/Math.max(8,competitors*2));
  if(prey.length&&a.hunger>24&&rand(s)<huntingRate){
   let j=prey[Math.floor(rand(s)*prey.length)],victim=s.cells[j].animal.type;s.cells[j].animal=null;population[victim]=Math.max(0,(population[victim]||1)-1);s.cells[j].fert=Math.min(3,s.cells[j].fert+.2);ate=true;count(s,'hunts',1,p);
   if(a.type==='bird'){count(s,'birdMeals',1,p);combo(s,T.m250);note(s,'birdMeal',T.m251,T.m252,i);}
   if(a.type==='fox'){award(p,'fox',s,typeof i==='number'?i:-1);combo(s,T.m253);note(s,'foxMeal',T.m142,T.m254,i);}
  }else if(food.length&&(!predator||a.hunger>60)&&rand(s)<appetite){
   let j=food[0],d=s.cells[j],fermented=d.plant==='bush'&&d.age>=150;
   if(pollinator){count(s,'pollinated',1,p);d.fert=Math.min(3,d.fert+.04);const k=n.find(k=>s.cells[k].plant==='grass'&&s.cells[k].age>20);if(k!==undefined){s.cells[k].plant='flower';s.cells[k].plantLife=0;s.cells[k].age=0;}}
   else if(d.plant==='bush')d.age=0;
   else if(d.plant!=='tree'){d.plant=s.level>=3?'grass':null;d.age=0;d.plantLife=0;}
   d.fert=Math.min(3,d.fert+.12);ate=true;
   if(a.type==='bug'){count(s,'bugMeals',1,p);note(s,'bugFood',T.m112,T.m255,j);}
   if(a.type==='sheep')count(s,'sheepMeals',1,p);if(a.type==='alpaca')award(p,'alpacaSnack',s,typeof i==='number'?i:-1);
   if(fermented&&a.type==='sheep'){a.drunk=60;count(s,'drunk',1,p);award(p,'drunk',s,typeof i==='number'?i:-1);note(s,'drunk',T.m118,T.m256,i);combo(s,T.m257);}
  }
  if(ate){a.hunger=Math.max(0,a.hunger-100);a.full++;count(s,'meals',1,p);}
  if(a.type==='bird'&&s.tick%24===0){let j=n.find(j=>s.cells[j].ground==='soil'&&!s.cells[j].plant);if(j!==undefined){s.cells[j].plant='seed';s.cells[j].age=0;s.cells[j].plantLife=0;}}
  // Resource-dependent capacity and reproduction: feeding is required; scarcity stops births.
  const available=predator?PREY[a.type].reduce((sum,k)=>sum+(population[k]||0),0):plants;
  const breed=BREED[a.type],cap=Math.min(breed.limit||1000,predator?Math.max(2,Math.floor(available/4)):Math.max(2,Math.floor(plants/(breed.space*1.35))));
  const local=n.filter(j=>s.cells[j].animal?.type===a.type).length,habitatOK=a.type!=='frog'||c.moist>=.6;
  const adults=population[a.type]||0;
  if(a.full>=breed.food&&a.hunger<65&&a.age>20&&s.tick-(a.bred||0)>breed.cool&&available>0&&adults<cap&&habitatOK&&local<3&&rand(s)<.11*(1-adults/(cap+1))/(1+local)){
   let j=n.find(j=>isLand(s.cells[j])&&!s.cells[j].animal&&!['tree','bush'].includes(s.cells[j].plant));
   if(j!==undefined){let baby=animal(a.type);baby.age=-20;baby.variant=(a.variant+1)%5;baby.moved=s.tick;s.cells[j].animal=baby;a.full=0;a.bred=s.tick;population[a.type]=(population[a.type]||0)+1;count(s,'births',1,p);if(a.type==='sheep')award(p,'baby',s,typeof i==='number'?i:-1);if(a.type==='rabbit')award(p,'rabbit',s,typeof i==='number'?i:-1);}
  }
  if(!a.drunk&&!a.sleep&&a.petUntil<=s.tick&&rand(s)<(a.type==='bug'?.18:pollinator||a.type==='bird'?.42:.3)){
   let choices=n.filter(j=>canWalk(s.cells[j],a)&&!s.cells[j].animal);
   if(choices.length){const scores=choices.map(j=>{let nn=[j,...nearby(s,j)];return[j,habitat(s,j,a.type)+(predator?nn.filter(k=>PREY[a.type].includes(s.cells[k].animal?.type)).length*5+eatPlants(s,j,a).length*.15:eatPlants(s,j,a).reduce((sum,k)=>sum+(s.cells[k].plant==='bush'?4:1),0))];});
    let target=rand(s)<.65?scores.sort((a,b)=>b[1]-a[1])[0][0]:choices[Math.floor(rand(s)*choices.length)];
    a.dir=Math.atan2(target%s.w-x,Math.floor(target/s.w)-y);s.cells[target].animal=a;c.animal=null;
   }
  }
 }
 let kinds=new Set(),bio=0;for(const c of s.cells)if(c){if(c.plant){kinds.add(c.plant);bio+=c.plant==='tree'?3:1;}if(c.animal){kinds.add(c.animal.type);bio+=2;}if(['water','spring','rock','mountain'].includes(c.ground))kinds.add(c.ground==='spring'?'water':c.ground);}
 const types=recordKinds(s);if(types.size>=15)award(p,'allAnimals',s,typeof i==='number'?i:-1);
 const foodChain=plants>=15&&types.has('bug')&&HERBS.some(k=>types.has(k))&&HUNTERS.some(k=>types.has(k));
 if(foodChain)count(s,'coexist',.5,p);
 if(s.level>=4){s.metrics.lakeArea=largestLake(s);s.metrics.mountainArea=s.cells.filter(c=>c?.ground==='mountain').length;s.metrics.forestArea=s.cells.filter(c=>c?.plant==='tree').length;const running=foodChain&&kinds.size>=8&&s.metrics.hunts>0&&s.metrics.lakeArea>=12&&s.metrics.mountainArea>=5&&s.metrics.forestArea>=12;s.metrics.stableSeconds=running?Math.min(60,(s.metrics.stableSeconds||0)+.5):0;}
 s.metrics.diversity=kinds.size;let gain=bio*.012*(1+(s.combo-1)*.15);s.score+=gain;p.totalScore+=gain;
 check(s,p);return s;
}
function check(s,p){
 p.seen??={};for(const c of s.cells)if(c){if(c.plant)p.seen[c.plant]=true;if(c.animal)p.seen[c.animal.type]=true;p.seen[c.ground]=true;}p.records??={};const previous=p.records[s.level]||{};p.records[s.level]={bestScore:Math.max(previous.bestScore||0,s.score),completions:previous.completions||0};
 if(p.totals.pollinated>=12)award(p,'pollinator',s,typeof i==='number'?i:-1);if(p.totals.coexist>=300)award(p,'balance',s,typeof i==='number'?i:-1);if(p.totals.births>=20)award(p,'manyBabies',s,typeof i==='number'?i:-1);if(p.totals.hunts>=20)award(p,'foodWeb',s,typeof i==='number'?i:-1);
 if(p.totals.sprouted>=12)award(p,'sprout',s,typeof i==='number'?i:-1);if(p.totals.bugMeals>=4)award(p,'bug',s,typeof i==='number'?i:-1);if(p.totals.birdMeals>=3)award(p,'bird',s,typeof i==='number'?i:-1);if(s.combo>=4)award(p,'combo',s,typeof i==='number'?i:-1);if(s.metrics.diversity>=7)award(p,'diverse',s,typeof i==='number'?i:-1);
 for(const n of [500,2500,10000])if(p.totalScore>=n)award(p,'p'+n,s,typeof i==='number'?i:-1);
 let goals=LEVELS[s.level].goals;if(goals.length&&goals.every(([k,n])=>s.metrics[k]>=n)&&!s.complete){
  s.complete=true;p.records[s.level].completions++;if(!p.completed.includes(s.level))p.completed.push(s.level);p.unlocked=Math.min(5,Math.max(p.unlocked,s.level+1));
  if(p.unlocked===5)award(p,'freedom',s,typeof i==='number'?i:-1);note(s,'complete',T.m258,T.m259,Math.floor(s.cells.length/2));
 }
}

root.Eco={TERRAIN_UNLOCK,VERSION,STEP_MS,LIFE,WEIGHTS,BREED,arrive,census,habitat,canWalk,largestLake,refreshTerrain,surfaceHeight,PET_TITLES,SECRET,pet,PLANT_LIFE,ANIMAL_NAMES,TOOL,LEVELS,ACHIEVEMENTS,defaultProfile,makeWorld,nearby,updateMoisture,place,allow,step,check,soil,METRICS,EXTRA_METRICS,rand,award,animal,valid};
})(globalThis);
