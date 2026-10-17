(function () {
  const VERSION = 6,
    STEP_MS = 500;
  const LIFE = {
    bug: 150,
    butterfly: 150,
    bird: 360,
    sheep: 480,
    alpaca: 600,
    rabbit: 260,
    deer: 480,
    fox: 440,
    bee: 180,
    chicken: 340,
    frog: 360,
    hedgehog: 420,
    wolf: 600,
    squirrel: 340,
    boar: 480,
  };
  const ANIMAL_NAMES = {
    bug: T.m001,
    butterfly: T.m002,
    bird: T.m003,
    sheep: T.m004,
    alpaca: T.m005,
    rabbit: T.m006,
    deer: T.m007,
    fox: T.m008,
    bee: T.m009,
    chicken: T.m010,
    frog: T.m011,
    hedgehog: T.m012,
    wolf: T.m013,
    squirrel: T.m014,
    boar: T.m015,
  };
  const WEIGHTS = {
    bug: 20,
    bird: 15,
    sheep: 10,
    alpaca: 10,
    rabbit: 10,
    deer: 5,
    fox: 5,
    butterfly: 5,
    bee: 4,
    chicken: 4,
    frog: 3,
    hedgehog: 3,
    wolf: 2,
    squirrel: 2,
    boar: 2,
  };
  const EXTRA_METRICS = [
    'animalKinds',
    'meals',
    'coexist',
    'pets',
    'pollinated',
    'hunts',
    'arrivals',
    'stableSeconds',
    'lakeArea',
    'mountainArea',
    'forestArea',
    'washed',
  ];
  const PET_TITLES = {
    bug: T.m016,
    bird: T.m017,
    sheep: T.m018,
    alpaca: T.m019,
    rabbit: T.m020,
    deer: T.m021,
    fox: T.m022,
    butterfly: T.m023,
    bee: T.m024,
    chicken: T.m025,
    frog: T.m026,
    hedgehog: T.m027,
    wolf: T.m028,
    squirrel: T.m029,
    boar: T.m030,
  };
  const PLANT_LIFE = { seed: 360, grass: 360, flower: 240, tree: 1200, bush: 960 };

  const BREED = {
    bug: { cool: 36, food: 3, space: 5 },
    butterfly: { cool: 50, food: 3, space: 18 },
    bee: { cool: 70, food: 3, space: 20 },
    rabbit: { cool: 70, food: 3, space: 28 },
    sheep: { cool: 100, food: 4, space: 32 },
    alpaca: { cool: 140, food: 4, space: 38 },
    deer: { cool: 150, food: 4, space: 40 },
    boar: { cool: 240, food: 7, space: 75, limit: 12 },
    squirrel: { cool: 100, food: 4, space: 35 },
    bird: { cool: 100, food: 3, space: 30 },
    chicken: { cool: 110, food: 3, space: 32 },
    frog: { cool: 120, food: 3, space: 35 },
    hedgehog: { cool: 150, food: 4, space: 42 },
    fox: { cool: 180, food: 4, space: 45 },
    wolf: { cool: 220, food: 5, space: 60 },
  };

  // 每只动物的属性：一套属性决定它在各种环境里会怎样，而不是给每种动物写一条规则。
  //   move   walk=走 / fly=飞 / swim=游              —— 决定会不会被水冲走
  //   mass   体重，越重越难被推动
  //   climb  爬坡能力（0..3）                        —— 决定能不能跨过陡坡
  //   diet   plant=吃草 / insect=吃虫 / nectar=采蜜 / meat=吃小动物 / larva=幼虫
  //   plants 食谱：字符串=植物种类，[种类,最低年龄] 可以加年龄门槛，[种类,0,'nibble'] 表示只啃新芽
  //   eats   能吃的动物（不写就是不吃动物）
  // 下面这些名单与捕食关系全部由属性推出，改属性就等于改玩法，不需要再改名单。
  const TRAITS = {
    bug: {
      move: 'walk',
      mass: 0.4,
      climb: 1,
      diet: 'larva',
      plants: [['grass', 12], 'flower', ['bush', 80]],
    },
    butterfly: {
      move: 'fly',
      mass: 0.3,
      climb: 0,
      diet: 'nectar',
      plants: [
        ['flower', 0],
        ['bush', 50],
      ],
    },
    bee: {
      move: 'fly',
      mass: 0.4,
      climb: 0,
      diet: 'nectar',
      plants: [
        ['flower', 0],
        ['bush', 50],
      ],
    },
    bird: {
      move: 'fly',
      mass: 1,
      climb: 0,
      diet: 'insect',
      plants: ['seed', ['bush', 80]],
      eats: ['bug'],
    },
    chicken: {
      move: 'walk',
      mass: 1.4,
      climb: 1,
      diet: 'insect',
      plants: ['seed', ['bush', 80]],
      eats: ['bug'],
    },
    frog: { move: 'swim', mass: 1, climb: 1, diet: 'insect', plants: [], eats: ['bug', 'bee'] },
    hedgehog: { move: 'walk', mass: 1.4, climb: 2, diet: 'insect', plants: [], eats: ['bug'] },
    fox: {
      move: 'walk',
      mass: 2,
      climb: 2,
      diet: 'meat',
      plants: ['seed', ['bush', 80]],
      eats: ['rabbit', 'chicken', 'squirrel'],
    },
    wolf: {
      move: 'walk',
      mass: 2.6,
      climb: 2,
      diet: 'meat',
      plants: [],
      eats: ['rabbit', 'sheep', 'deer', 'boar'],
    },
    rabbit: {
      move: 'walk',
      mass: 1.5,
      climb: 1,
      diet: 'plant',
      plants: [['grass', 12], 'flower', ['bush', 80]],
    },
    squirrel: {
      move: 'walk',
      mass: 1.2,
      climb: 3,
      diet: 'plant',
      plants: [['tree', 0, 'nibble'], 'seed', ['bush', 80]],
    },
    sheep: {
      move: 'walk',
      mass: 3.2,
      climb: 2,
      diet: 'plant',
      plants: [['grass', 12], 'flower', ['bush', 80]],
    },
    alpaca: {
      move: 'walk',
      mass: 3.6,
      climb: 3,
      diet: 'plant',
      plants: [['grass', 12], 'flower', ['bush', 80]],
    },
    deer: {
      move: 'walk',
      mass: 3,
      climb: 3,
      diet: 'plant',
      plants: [['grass', 12], 'flower', ['bush', 80]],
    },
    boar: {
      move: 'walk',
      mass: 6,
      climb: 2,
      diet: 'plant',
      plants: [['grass', 12], 'flower', ['bush', 80]],
    },
  };

  const VISITORS = {
    abyssinian: ['阿比西尼亚猫', 'cat', 0xb98553, '沙色的小精灵'],
    ragdoll: ['布偶猫', 'cat', 0xe9e2d7, '蓝眼睛的拥抱'],
    tabby: ['狸花猫', 'cat', 0x817766, '小老虎也爱你'],
    orangeCat: ['橘猫', 'cat', 0xe7a350, '橘色的好心情'],
    borderCollie: ['边牧', 'dog', 0x383d3c, '聪明的朋友'],
    golden: ['金毛', 'dog', 0xd6ad65, '金色的陪伴'],
    samoyed: ['萨摩耶', 'dog', 0xf2eee3, '会笑的云朵'],
    capybara: ['卡皮巴拉', 'capy', 0x9d805e, '一起发呆吧'],
    nightHeron: ['夜鹭', 'bird', 0x596779, '夜色里的邻居'],
    redstart: ['红尾水鸲', 'bird', 0x435f76, '一抹红尾巴'],
    longtail: ['北长尾山雀', 'bird', 0xeee9dc, '雪团停在手心'],
    wren: ['冬鹪鹩', 'bird', 0x997654, '小小的歌声'],
    flamingo: ['火烈鸟', 'bird', 0xef9d9e, '粉色的来信'],
    dragon: ['龙', 'dragon', 0x68998b, '龙也喜欢摸摸'],
    pixiu: ['貔貅', 'myth', 0xd1af68, '小岛有福了'],
    baize: ['白泽', 'myth', 0xe7e5cf, '白泽知我心'],
  };
  const POOLS = {
    animal: WEIGHTS,
    rare: {
      abyssinian: 8,
      ragdoll: 8,
      tabby: 9,
      orangeCat: 9,
      borderCollie: 8,
      golden: 8,
      samoyed: 8,
      capybara: 10,
      nightHeron: 6,
      redstart: 7,
      longtail: 7,
      wren: 7,
      flamingo: 5,
    },
    legend: { dragon: 1, pixiu: 49, baize: 50 },
  };
  for (const [k, [name, kind, color, title]] of Object.entries(VISITORS)) {
    ANIMAL_NAMES[k] = name;
    PET_TITLES[k] = title;
    LIFE[k] = kind === 'bird' ? 380 : kind === 'dragon' ? 900 : 600;
    TRAITS[k] =
      kind === 'bird'
        ? {
            move: 'fly',
            mass: 0.7,
            climb: 0,
            diet: 'insect',
            plants: ['seed', ['bush', 60]],
            eats: ['bug', 'bee'],
          }
        : {
            move: kind === 'dragon' ? 'fly' : kind === 'capy' ? 'swim' : 'walk',
            mass: kind === 'dragon' ? 8 : 3,
            climb: 3,
            diet: 'plant',
            plants: [['grass', 12], 'flower', ['bush', 60]],
          };
    if (kind === 'cat' || kind === 'dog')
      TRAITS[k] = {
        move: 'walk',
        mass: kind === 'cat' ? 1.8 : 3,
        climb: kind === 'cat' ? 3 : 2,
        diet: 'meat',
        plants: [['bush', 60]],
        eats: kind === 'cat' ? ['bug', 'squirrel'] : ['rabbit'],
      };
    BREED[k] = {
      cool: kind === 'dragon' ? 1600 : 600,
      food: 5,
      space: 90,
      limit: kind === 'dragon' ? 2 : 5,
    };
  }
  const byDiet = (d) => Object.keys(TRAITS).filter((k) => TRAITS[k].diet === d);
  const HERBS = byDiet('plant'),
    HUNTERS = byDiet('insect'),
    POLLINATORS = byDiet('nectar');
  const PREY = {};
  for (const [type, t] of Object.entries(TRAITS)) if (t.eats && t.eats.length) PREY[type] = t.eats;

  Object.assign((globalThis.EcoData ??= {}), {
    VISITORS,
    POOLS,
    VERSION,
    STEP_MS,
    LIFE,
    ANIMAL_NAMES,
    WEIGHTS,
    HERBS,
    HUNTERS,
    POLLINATORS,
    PREY,
    EXTRA_METRICS,
    PET_TITLES,
    PLANT_LIFE,
    BREED,
    TRAITS,
  });
})();
