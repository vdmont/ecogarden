(function(){const {PET_TITLES,ANIMAL_NAMES,EXTRA_METRICS}=globalThis.EcoData||{};
const ACHIEVEMENTS=[
 ['seed',T.m108,T.m109],['sprout',T.m110,T.m111],
 ['bug',T.m112,T.m113],['bird',T.m114,T.m115],
 ['fire',T.m116,T.m117],['drunk',T.m118,T.m119],
 ['alpaca',T.m120,T.m121],['alpacaSnack',T.m122,T.m123],
 ['baby',T.m124,T.m125],['sober',T.m126,T.m127],
 ['combo',T.m128,T.m129],['p500',T.m130,T.m131],
 ['p2500',T.m132,T.m133],['p10000',T.m134,T.m135],
 ['diverse',T.m136,T.m137],['freedom',T.m138,T.m139],
 ['cycle',T.m140,T.m141],['fox',T.m142,T.m143],['rabbit',T.m144,T.m145]
];
ACHIEVEMENTS.push(...Object.entries(PET_TITLES).map(([type,title])=>['pet'+type,title,T.m146+ANIMAL_NAMES[type]]),['petFriends',T.m147,T.m148],['petAll',T.m149,T.m150],['petDrunk',T.m151,T.m152],['pollinator',T.m153,T.m154],['allAnimals',T.m155,T.m156],['balance',T.m157,T.m158],['manyBabies',T.m159,T.m160],['foodWeb',T.m161,T.m162]);
ACHIEVEMENTS.push(['rareGuest','特别的来客','在自由花园邀请一位稀有动物'],['legendGuest','传说落在小岛上','邀请貔貅、白泽或龙'],['dragonGuest','原来真的有龙','在传说动物中遇见龙']);
const SECRET=new Set(['drunk','sober','petDrunk']);
const METRICS=['sprouted','bugMeals','birdMeals','bushPlaced','rocksPlaced','burned','reborn','sheepMeals','drunk','lakePlaced','mountainPlaced','forestPlaced','diversity','placed','births',...EXTRA_METRICS];

Object.assign(globalThis.EcoData??={}, {ACHIEVEMENTS,SECRET,METRICS});})();
