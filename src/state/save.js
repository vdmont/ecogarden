(function(){const {VERSION,LIFE,LEVELS,ACHIEVEMENTS,METRICS,EXTRA_METRICS,defaultProfile,makeWorld,animal,soil,updateMoisture}=Eco;
function validateProfile(input){
 if(!input||typeof input!=='object'||input.version!==VERSION)throw Error(T.m260);
 if(!Number.isInteger(input.unlocked)||input.unlocked<0||input.unlocked>5||!Number.isInteger(input.current)||input.current<0||input.current>input.unlocked)throw Error(T.m261);
 const finite=(x,a,b)=>typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b;
 if(!finite(input.totalScore,0,1e12)||!input.worlds||!input.achievements||!Array.isArray(input.completed)||input.completed.some(i=>!Number.isInteger(i)||i<0||i>4))throw Error(T.m262);
 const out=defaultProfile();for(const key of [...Object.keys(LIFE),'seed','grass','flower','tree','bush','water','spring','soil','rock','mountain','ash'])if(input.seen?.[key]===true)out.seen[key]=true;for(let l=0;l<6;l++){const r=input.records?.[l];if(r&&finite(r.bestScore,0,1e12)&&finite(r.completions,0,1e9))out.records[l]={bestScore:r.bestScore,completions:r.completions};}out.unlocked=input.unlocked;out.current=input.current;out.completed=[...new Set(input.completed)];out.totalScore=input.totalScore;
 for(const [id] of ACHIEVEMENTS)if(typeof input.achievements[id]==='string'&&input.achievements[id].length<80)out.achievements[id]=input.achievements[id];
 out.achievementPlaces={};for(const[id,value]of Object.entries(input.achievementPlaces||{})){if(ACHIEVEMENTS.some(a=>a[0]===id)&&value&&Number.isInteger(value.level)&&LEVELS[value.level]&&Number.isInteger(value.i)&&value.i>=0&&value.i<LEVELS[value.level].w*LEVELS[value.level].h)out.achievementPlaces[id]={level:value.level,i:value.i,type:Object.hasOwn(LIFE,value.type)?value.type:null};}
 for(const k of METRICS)if(finite(input.totals?.[k],0,1e9))out.totals[k]=input.totals[k];
 if(input.settings){for(const k of ['sound','labels','autoFocus'])if(typeof input.settings[k]==='boolean')out.settings[k]=input.settings[k];if(['auto','low','high'].includes(input.settings.quality))out.settings.quality=input.settings.quality;}
 for(const [key,s] of Object.entries(input.worlds)){
  const l=Number(key),cfg=LEVELS[l];if(!cfg||String(l)!==key||l>out.unlocked||!s||s.level!==l||s.w!==cfg.w||s.h!==cfg.h||!Array.isArray(s.cells)||s.cells.length!==cfg.w*cfg.h)throw Error(T.m263);
  const copy=makeWorld(l);for(let i=0;i<s.cells.length;i++){const c=s.cells[i];if(!copy.cells[i]){if(c!==null)throw Error(T.m264);continue;}if(!c||!['soil','water','spring','rock','mountain','ash'].includes(c.ground)||![null,'seed','grass','flower','tree','bush'].includes(c.plant))throw Error(T.m265);
   const d=soil();d.ground=c.ground;d.plant=c.plant;for(const k of ['age','waterAge','fire','ash','recovery','burns','fert','moist']){if(!finite(c[k],0,k==='fert'?3:k==='moist'?1:1e8))throw Error(T.m266);d[k]=c[k];}if(c.plantLife!==undefined&&!finite(c.plantLife,0,1e8))throw Error(T.m267);d.plantLife=c.plantLife??0;for(const key of ['elevation','variant']){if(c[key]!==undefined&&!finite(c[key],0,key==='variant'?4:4))throw Error(T.m268);d[key]=c[key]??(key==='variant'?(Math.imul(i+1,2654435761)>>>0)%5:0);}
   if(c.animal){const a=c.animal;if(!Object.hasOwn(LIFE,a.type))throw Error(T.m269);const b=animal(a.type);for(const k of ['age','full','drunk','sleep','dir','moved']){if(!finite(a[k],k==='age'?-100:k==='dir'?-Math.PI:k==='moved'?-1:0,1e9))throw Error(T.m270);b[k]=a[k];}for(const k of ['hunger','bred','petUntil','variant']){if(a[k]!==undefined&&!finite(a[k],0,1e12))throw Error(T.m271);b[k]=a[k]??0;}d.animal=b;}
   copy.cells[i]=d;
  }
  for(const k of ['tick','energy','score','combo','comboLeft','rng']){if(!finite(s[k],k==='combo'?1:0,k==='energy'?100:k==='combo'?8:k==='comboLeft'?48:1e12))throw Error(T.m272);copy[k]=s[k];}
  if(typeof s.complete!=='boolean')throw Error(T.m273);copy.complete=s.complete;
  for(const k of METRICS){if(EXTRA_METRICS.includes(k)&&s.metrics?.[k]===undefined)continue;if(!finite(s.metrics?.[k],0,1e9))throw Error(T.m274);copy.metrics[k]=s.metrics[k];}
  copy.lastCombo=typeof s.lastCombo==='string'?s.lastCombo.slice(0,60):'';
  copy.events=Array.isArray(s.events)?s.events.slice(0,40).filter(e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&typeof e.text==='string'&&Number.isInteger(e.i)&&e.i>=0&&e.i<copy.cells.length&&finite(e.tick,0,1e12)).map(e=>({id:e.id.slice(0,40),title:e.title.slice(0,100),text:e.text.slice(0,500),i:e.i,tick:e.tick})):[];
  copy.notified=Object.fromEntries(Object.keys(s.notified||{}).filter(k=>/^[a-zA-Z0-9]+$/.test(k)).slice(0,80).map(k=>[k,true]));updateMoisture(copy);out.worlds[key]=copy;for(const c of copy.cells)if(c){if(c.plant)out.seen[c.plant]=true;if(c.animal)out.seen[c.animal.type]=true;out.seen[c.ground]=true;}
 }
 return out;
}
Eco.validateProfile=validateProfile;})();

