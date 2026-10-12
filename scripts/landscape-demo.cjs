const fs=require('node:fs'),path=require('node:path');require('../tests/load.cjs');const E=Eco,p=E.defaultProfile();p.current=4;p.unlocked=5;p.settings.sound=false;const s=E.makeWorld(4);s.rng=812;p.worlds[4]=s;
const at=(x,y)=>s.cells[y*s.w+x];for(let y=3;y<s.h-3;y++)for(let x=3;x<s.w-3;x++){const c=at(x,y);if(c&&c.ground==='soil'){c.plant=(x+y)%9===0?'flower':'grass';c.age=35;c.fert=.4;}}
for(const[tool,x,y]of [['lake',13,13],['lake',14,16],['mountain',23,9],['forest',8,8],['forest',24,18]]){s.energy=100;E.place(s,tool,y*s.w+x,p);}
for(let y=16;y<s.h;y++){const c=at(14,y);if(c){c.ground=y===16?'spring':'water';c.plant=null;c.waterAge=0;}for(const x of [13,15]){const d=at(x,y);if(d&&y>19){d.ground='water';d.plant=null;}}}
for(const[x,y]of [[16,13],[17,14],[18,13],[10,14],[19,17]]){const c=at(x,y);c.ground='soil';c.plant='bush';c.age=100;}
const positions=[[12,11],[15,12],[16,15],[18,15],[19,14],[21,16],[20,14],[17,12],[18,11],[19,12],[13,18],[17,17],[21,13],[22,16],[20,18]];
Object.keys(E.WEIGHTS).forEach((type,k)=>{const[x,y]=positions[k],c=at(x,y);c.ground='soil';c.plant=k%3?'grass':'flower';c.animal=E.animal(type);c.animal.variant=k%5;c.animal.dir=.7;});
const peak=at(23,9);peak.animal=E.animal('alpaca');peak.animal.dir=.6;
E.updateMoisture(s);E.refreshTerrain(s);E.check(s,p);s.energy=100;s.events=[{id:'modelDemo',title:'湖边的下午',text:'岸边的水，正向云端落下。',i:22*s.w+14,tick:0}];s.notified.modelDemo=true;
E.validateProfile(p);fs.writeFileSync(process.argv[2]||path.resolve(__dirname,'../docs/演示花园.json'),JSON.stringify(p));console.log('Generated optional landscape demo');
