const assert=require('node:assert/strict');require('./load.cjs');const E=Eco,D=EcoData;
const p=E.defaultProfile();p.current=p.unlocked=5;const s=E.makeWorld(5,2,42);p.worlds[5]=s;const i=s.cells.findIndex(c=>c?.ground==='soil'&&!c.animal);s.cells[i].plant='grass';s.cells[i].age=30;
for(let l=0;l<5;l++)for(const pool of ['rare','legend'])assert(!E.LEVELS[l].tools.includes(pool));
const counts={};for(let n=0;n<10000;n++){s.cells[i].animal=null;const r=E.place(s,'legend',i,p);assert(r.ok);assert(Object.hasOwn(D.POOLS.legend,r.type));counts[r.type]=(counts[r.type]||0)+1;}assert(counts.dragon>50&&counts.dragon<160,JSON.stringify(counts));assert(p.achievements.dragonGuest);
for(let n=0;n<200;n++){s.cells[i].animal=null;const r=E.place(s,'rare',i,p);assert(r.ok&&D.POOLS.rare[r.type]);}assert(p.achievements.rareGuest);
for(const type of Object.keys(D.VISITORS)){s.cells[i].animal=E.animal(type);s.cells[i].animal.age=10;assert(E.pet(s,i,p).ok);assert(p.achievements['pet'+type]);assert.equal(E.validateProfile(p).worlds[5].cells[i].animal.type,type);assert(D.BREED[type].limit<=5);}
console.log('PASS sixth-only visitor pools, rare dragon distribution, all new pet achievements and save round trips');
const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
for(let n=1;n<=6;n++){p.totalScore=n*100;GardenSlots.write(storage,n,p);}for(let n=1;n<=6;n++)assert.equal(GardenSlots.read(storage,n).profile.totalScore,n*100);
const before=data.get('ecogarden-manual-1');assert.throws(()=>GardenSlots.write({setItem(){throw Error('quota');}},1,p));assert.equal(data.get('ecogarden-manual-1'),before);assert.throws(()=>GardenSlots.write(storage,7,p));
p.settings.music=false;p.settings.autosave=false;assert.equal(E.validateProfile(p).settings.music,false);assert.equal(E.validateProfile(p).settings.autosave,false);const old=JSON.parse(JSON.stringify(p));delete old.settings.music;delete old.settings.autosave;assert(E.validateProfile(old).settings.music);assert(E.validateProfile(old).settings.autosave);
console.log('PASS six independent compact slots, quota failure, bounds and legacy settings defaults');

const handlers={},v=Object.create(GardenView.prototype);v.canvas={addEventListener:(k,f)=>handlers[k]=f};v.pointers=new Map();v.yaw=0;v.isPainting=()=>true;v.pick=x=>x<100?-1:Math.floor(x/10);let placed=0,ended=0;v.onPick=()=>placed++;v.onStrokeEnd=()=>ended++;v.bind();
const event=x=>({pointerId:1,clientX:x,clientY:20,button:0});handlers.pointerdown(event(20));handlers.pointermove(event(150));handlers.pointerup(event(150));assert.notEqual(v.yaw,0);assert.equal(placed,0,'starting outside rotates even after crossing land');const yaw=v.yaw;handlers.pointerdown(event(120));handlers.pointermove(event(160));handlers.pointerup(event(160));assert.equal(v.yaw,yaw);assert(placed>0);assert.equal(ended,1);console.log('PASS create mode outside drag rotates, inside drag paints');
