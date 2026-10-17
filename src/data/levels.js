(function(){const {PET_TITLES,ANIMAL_NAMES,EXTRA_METRICS}=globalThis.EcoData||{};
const TOOL={
 rare:{name:'稀有动物',icon:'🐈',cost:12,help:'猫猫、狗狗与特别的鸟儿'},legend:{name:'传说动物',icon:'🐉',cost:30,help:'貔貅、白泽，偶尔遇到龙'},
  animal:{name:'普通动物',icon:'🐾',cost:6,help:T.m032},
  inspect:{name:T.m033,icon:'⌕',cost:0,help:T.m034},
  seed:{name:T.m035,icon:T.m036,cost:1,help:T.m037},
  water:{name:T.m038,icon:T.m038,cost:3,help:T.m039},
  bug:{name:T.m001,icon:T.m040,cost:4,help:T.m041},
  bird:{name:T.m003,icon:T.m042,cost:6,help:T.m043},
  bush:{name:T.m044,icon:T.m045,cost:5,help:T.m046},
  rock:{name:T.m047,icon:T.m048,cost:2,help:T.m049},
  fire:{name:T.m050,icon:T.m051,cost:5,help:T.m052},
  sheep:{name:T.m004,icon:T.m053,cost:9,help:T.m054},
  alpaca:{name:T.m005,icon:T.m055,cost:12,help:T.m056},
  rabbit:{name:T.m006,icon:T.m057,cost:6,help:T.m058},
  deer:{name:T.m059,icon:T.m007,cost:10,help:T.m060},
  fox:{name:T.m008,icon:T.m061,cost:12,help:T.m062},
  lake:{name:T.m063,icon:T.m064,cost:15,help:T.m065},
  mountain:{name:T.m066,icon:T.m067,cost:18,help:T.m068},
  forest:{name:T.m069,icon:T.m070,cost:18,help:T.m071},
  erase:{name:T.m072,icon:T.m073,cost:0,help:T.m074}
};
const BASE=['inspect','seed','water','bug','erase'];
const LATE=['inspect','seed','water','animal','bush','rock','fire','erase'];
// 存档校验用的地形数值上限（含端点）：新增/放大高程或变体时只改这里，
// save.js 与模拟层共用，避免上限散落在多处各自硬编码。
const TERRAIN={MAX_ELEVATION:12,MAX_VARIANT:4};
const LEVELS=[
 {name:T.m075,tag:T.m076,w:16,h:12,tools:BASE,tip:T.m077,goals:[['sprouted',12,T.m078],['bugMeals',4,T.m079]]},
 {name:T.m080,tag:T.m081,w:20,h:14,tools:[...BASE,'bird','bush'],tip:T.m082,goals:[['birdMeals',3,T.m083],['bushPlaced',4,T.m084]]},
 {name:T.m085,tag:T.m086,w:26,h:18,tools:[...BASE,'bird','bush','rock','fire'],tip:T.m087,goals:[['rocksPlaced',6,T.m088],['burned',8,T.m089],['reborn',4,T.m090]]},
 {name:T.m091,tag:T.m092,w:28,h:20,tools:LATE,tip:T.m093,goals:[['animalKinds',4,T.m094],['meals',12,T.m095],['coexist',30,T.m096]]},
 {name:T.m097,tag:T.m098,w:36,h:26,tools:[...LATE,'lake','forest','mountain'],tip:T.m099,goals:[['lakeArea',12,T.m100],['mountainArea',5,T.m101],['forestArea',12,T.m102],['stableSeconds',60,T.m103],['births',6,T.m104]]},
 {name:T.m105,tag:T.m106,w:44,h:30,tools:[...LATE,'rare','legend','lake','forest','mountain'],tip:T.m107,goals:[]}
];

Object.assign(globalThis.EcoData??={}, {TOOL,BASE,LATE,LEVELS,TERRAIN});})();
