(function(root){
const prefix='ecogarden-manual-';
function key(n){if(!Number.isInteger(n)||n<1||n>6)throw Error('无效的存档位');return prefix+n;}
function pack(profile){const p=JSON.parse(JSON.stringify(profile));for(const w of Object.values(p.worlds)){const keys=[...new Set(w.cells.filter(Boolean).flatMap(Object.keys))];w.cellColumns=keys;w.cells=w.cells.map(c=>c?keys.map(k=>c[k]??null):null);}return p;}
function unpack(profile){for(const w of Object.values(profile.worlds||{}))if(w.cellColumns){const keys=w.cellColumns;w.cells=w.cells.map(row=>row?Object.fromEntries(keys.map((k,i)=>[k,row[i]])):null);delete w.cellColumns;}return profile;}
function read(storage,n){const raw=storage.getItem(key(n));if(!raw)return null;const value=JSON.parse(raw);return {savedAt:value.savedAt,profile:Eco.validateProfile(unpack(value.profile))};}
function write(storage,n,profile){const value={savedAt:new Date().toISOString(),profile:pack(Eco.validateProfile(profile))};storage.setItem(key(n),JSON.stringify(value));return value;}
root.GardenSlots={read,write};})(globalThis);
