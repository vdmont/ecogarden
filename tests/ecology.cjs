const assert=require('node:assert/strict');require('./load.cjs');const E=globalThis.Eco;
function scenario(seed){const p=E.defaultProfile();p.current=p.unlocked=5;const s=E.makeWorld(5,undefined,42);s.rng=seed;p.worlds[5]=s;const types=Object.keys(E.WEIGHTS);let k=0;
 s.cells.forEach((c,i)=>{if(!c)return;const x=i%s.w,y=Math.floor(i/s.w);if(x%7===0&&y%7===0){c.ground='spring';c.plant=null;}else if(c.ground==='soil'){c.plant=i%11===0?'bush':i%7===0?'flower':'grass';c.age=40;c.fert=.4;if(i%7===0){c.animal=E.animal(types[k++%types.length]);c.animal.age=k%30;}}});E.updateMoisture(s);
 const history=[];for(let t=0;t<=6000;t++){if(t%600===0){const counts={};let vegetation=0;for(const c of s.cells)if(c){if(c.plant)vegetation++;if(c.animal)counts[c.animal.type]=(counts[c.animal.type]||0)+1;}history.push({seconds:t/2,total:Object.values(counts).reduce((a,b)=>a+b,0),vegetation,counts});}if(t<6000)E.step(s,p);}
 assert(Number.isFinite(s.score));assert(history.every(row=>row.total<s.cells.filter(Boolean).length));E.validateProfile(JSON.parse(JSON.stringify(p)));return {seed,history};}
for(const seed of [42,2718,99173])console.log(JSON.stringify(scenario(seed)));
