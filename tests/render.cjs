const assert=require('node:assert/strict');require('./load.cjs');
const E=globalThis.Eco,s=E.makeWorld(3),view=Object.create(GardenView.prototype),a=E.animal('alpaca');
view.world=s;view.motion=new WeakMap();view.lastAnimalFrame=0;view.animals={count:0,instanceMatrix:{},instanceColor:{}};let boxes=[];view.put=(mesh,...args)=>{assert(args.every(Number.isFinite));boxes.push(args);};
let i=s.cells.findIndex((c,i)=>c&&s.cells[i+1]&&i%s.w>3&&i%s.w<20);s.cells[i].animal=a;
view.drawAnimals(100);const before={...view.motion.get(a)};s.cells[i].animal=null;s.cells[i+1].animal=a;a.dir=Math.PI/2;
view.drawAnimals(116);const first={...view.motion.get(a)};assert(first.x>before.x&&first.x<before.x+1);assert(first.yaw>0&&first.yaw<Math.PI/2);
for(let t=132;t<=700;t+=16)view.drawAnimals(t);assert(Math.abs(view.motion.get(a).x-before.x-1)<.02);
for(const type of Object.keys(E.WEIGHTS)){a.type=type;boxes=[];view.drawAnimals(716);assert(boxes.length>=5,type);}
a.type='alpaca';boxes=[];view.drawAnimals(732);assert(boxes.some(b=>b[6]===0xf1eadb));
console.log('PASS continuous movement, shortest-angle turning, all 15 model geometries, ivory alpaca');
// Stable vegetation does not depend on frame time; nearby shades must not share identical cube faces.
for(const plant of ['grass','flower','bush','tree']){const variants=new Set();for(let variant=0;variant<5;variant++){let parts=[];GardenModels.plants({b:(...args)=>parts.push(args),c:{plant,age:160,variant},i:1,x:0,z:0,variant,wet:true,labelList:[]});assert(parts.length>0);assert(parts.flat().every(Number.isFinite));variants.add(JSON.stringify(parts));}assert(variants.size>=3,plant);}
const meshes=()=>({count:0,instanceMatrix:{},instanceColor:{}});view.waterfalls=meshes();view.flames=meshes();view.fireCores=meshes();let edge=s.cells.findIndex((c,i)=>c&&E.nearby(s,i).length<8);s.cells[edge].ground='water';boxes=[];view.drawEffects(1000);assert(boxes.some(b=>b[1]<-1));const effects=JSON.stringify(boxes);boxes=[];view.drawEffects(1100);assert.notEqual(JSON.stringify(boxes),effects);
console.log('PASS persistent plant variants and animated edge waterfalls');
