(function(){
const VERSION=6, STEP_MS=500;
const LIFE={bug:180,butterfly:180,bird:480,sheep:720,alpaca:840,rabbit:360,deer:720,fox:600,bee:240,chicken:480,frog:480,hedgehog:600,wolf:840,squirrel:480,boar:720};
const ANIMAL_NAMES={bug:T.m001,butterfly:T.m002,bird:T.m003,sheep:T.m004,alpaca:T.m005,rabbit:T.m006,deer:T.m007,fox:T.m008,bee:T.m009,chicken:T.m010,frog:T.m011,hedgehog:T.m012,wolf:T.m013,squirrel:T.m014,boar:T.m015};
const WEIGHTS={bug:20,bird:15,sheep:10,alpaca:10,rabbit:10,deer:5,fox:5,butterfly:5,bee:4,chicken:4,frog:3,hedgehog:3,wolf:2,squirrel:2,boar:2};
const HERBS=['sheep','alpaca','rabbit','deer','boar','squirrel'], HUNTERS=['bird','chicken','frog','hedgehog'], POLLINATORS=['butterfly','bee'];
const PREY={bird:['bug'],chicken:['bug'],frog:['bug','bee'],hedgehog:['bug'],fox:['rabbit','chicken','squirrel'],wolf:['rabbit','sheep','deer','boar']};
const EXTRA_METRICS=['animalKinds','meals','coexist','pets','pollinated','hunts','arrivals','stableSeconds','lakeArea','mountainArea','forestArea'];
const PET_TITLES={bug:T.m016,bird:T.m017,sheep:T.m018,alpaca:T.m019,rabbit:T.m020,deer:T.m021,fox:T.m022,butterfly:T.m023,bee:T.m024,chicken:T.m025,frog:T.m026,hedgehog:T.m027,wolf:T.m028,squirrel:T.m029,boar:T.m030};
const PLANT_LIFE={seed:360,grass:360,flower:240,tree:1200,bush:960};

const BREED={bug:{cool:36,food:3,space:5},butterfly:{cool:50,food:3,space:18},bee:{cool:70,food:3,space:20},rabbit:{cool:70,food:3,space:28},sheep:{cool:100,food:4,space:32},alpaca:{cool:140,food:4,space:38},deer:{cool:150,food:4,space:40},boar:{cool:240,food:7,space:75,limit:12},squirrel:{cool:100,food:4,space:35},bird:{cool:100,food:3,space:30},chicken:{cool:110,food:3,space:32},frog:{cool:120,food:3,space:35},hedgehog:{cool:150,food:4,space:42},fox:{cool:180,food:4,space:45},wolf:{cool:220,food:5,space:60}};

Object.assign(globalThis.EcoData??={}, {VERSION,STEP_MS,LIFE,ANIMAL_NAMES,WEIGHTS,HERBS,HUNTERS,POLLINATORS,PREY,EXTRA_METRICS,PET_TITLES,PLANT_LIFE,BREED});})();
