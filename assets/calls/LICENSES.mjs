// 许可台账：游戏里用到的每一条外部音频素材，都登记在这里。
//
// ⚠ 本文件由 scripts/gen-licenses.cjs 生成，不要手改。改素材请改 music/ 下的源文件。
//
// 字段：
//   file         相对 assets/ 的路径
//   usedBy       哪些物种会播这一条（4 种猫共用猫录音就是这么来的）
//   license      许可全名
//   licenseUrl   许可全文
//   author       作者 / 版权方（CC BY / BY-SA / BY-NC 必须署名）
//   sourceUrl    素材页面地址
//   modified     素材包对它做了什么（裁切、降噪、限幅……改了就是演绎）
//   sha1         我们这份 mp3 的哈希，任何人拿它都能复核"台账里这条就是这条"
//
// 本批 70 条的许可分布：{"CC0 1.0":35,"CC BY 4.0":34,"CC BY-SA 4.0":1}

const ASSET_LICENSES = [
  {
    "file": "calls/alpaca_017.mp3",
    "usedBy": [
      "alpaca"
    ],
    "label": "羊驼",
    "title": "Alpaca noises",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "gtg777",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/gtg777/sounds/623809/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.5,
    "lufs": -18.56,
    "truePeakDb": -3.2,
    "noiseFloorDb": -39.35,
    "snrDb": 20.76,
    "sha1": "666b08258db368408f1eac38721e57c9413315e9"
  },
  {
    "file": "calls/alpaca_018.mp3",
    "usedBy": [
      "alpaca"
    ],
    "label": "羊驼",
    "title": "Camelids - Alpaca; High Moan, Take 2",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "TheKingOfGeeks360",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/TheKingOfGeeks360/sounds/868310/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.54,
    "lufs": -18,
    "truePeakDb": -4.91,
    "noiseFloorDb": -47.54,
    "snrDb": 26,
    "sha1": "63af4d065775d3552dcbc189877907bcff230259"
  },
  {
    "file": "calls/bee_087.mp3",
    "usedBy": [
      "bee"
    ],
    "label": "蜜蜂",
    "title": "Bumblebee",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Breviceps",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Breviceps/sounds/466795/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；循环（保留原 220ms 交叉淡化）",
    "durSec": 2.78,
    "lufs": -26.06,
    "truePeakDb": -7.51,
    "noiseFloorDb": -36.26,
    "snrDb": 13.33,
    "sha1": "a88b392228a1f241a4db0f873c3dd2e9a07ff43d"
  },
  {
    "file": "calls/bee_089.mp3",
    "usedBy": [
      "bee"
    ],
    "label": "蜜蜂",
    "title": "20100424.bee.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "dobroide",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/dobroide/sounds/95817/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；循环（保留原 220ms 交叉淡化）",
    "durSec": 2.78,
    "lufs": -25.69,
    "truePeakDb": -9.93,
    "noiseFloorDb": -32.78,
    "snrDb": 11.68,
    "sha1": "82e9deb2edaadcb030e59a5690b94640a00dfc72"
  },
  {
    "file": "calls/bird_006.mp3",
    "usedBy": [
      "bird"
    ],
    "label": "飞鸟",
    "title": "PALM BIRD CHIRP 001.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "sandyrb",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/sandyrb/sounds/156373/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.208,
    "lufs": -18.19,
    "truePeakDb": -8.78,
    "noiseFloorDb": -72.25,
    "snrDb": 51.56,
    "sha1": "5c9a1865337988702d13b4f50b6a6253ef75629f"
  },
  {
    "file": "calls/bird_007.mp3",
    "usedBy": [
      "bird"
    ],
    "label": "飞鸟",
    "title": "BIRDS_CHIRP_FEW_001.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "JoelAudio",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/JoelAudio/sounds/133896/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.2,
    "lufs": -18.01,
    "truePeakDb": -6.13,
    "noiseFloorDb": -40.22,
    "snrDb": 20.15,
    "sha1": "6c4695401bdb25d633b1ee9b3d293cd4d4bcd1e0"
  },
  {
    "file": "calls/bird_010.mp3",
    "usedBy": [
      "bird"
    ],
    "label": "飞鸟",
    "title": "Songbird Chirp",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "SFXMint",
    "source": "SFXMint",
    "sourceUrl": "https://sfxmint.com/sets/animal-calls",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -18.94,
    "truePeakDb": -3.2,
    "noiseFloorDb": -94.61,
    "snrDb": 74.16,
    "sha1": "bdf17de89b4ca323fb5ab1c10da08b0b5d53b0e3"
  },
  {
    "file": "calls/boar_050.mp3",
    "usedBy": [
      "boar"
    ],
    "label": "野猪",
    "title": "Wild Boar / Grunting / Squealing",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "TheVeoMammoth11",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/TheVeoMammoth11/sounds/492654/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.5,
    "lufs": -19.03,
    "truePeakDb": -3.2,
    "noiseFloorDb": -40,
    "snrDb": 23.19,
    "sha1": "d388b00979accf197e89ffc3d1ba08897dbb10ca"
  },
  {
    "file": "calls/boar_051.mp3",
    "usedBy": [
      "boar"
    ],
    "label": "野猪",
    "title": "wild pig 008.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "yottasounds",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/yottasounds/sounds/176731/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.789,
    "lufs": -18.98,
    "truePeakDb": -3.2,
    "noiseFloorDb": -94.78,
    "snrDb": 78.05,
    "sha1": "ed46c58117abfc0ed863bfa25bdf2a8040678103"
  },
  {
    "file": "calls/boar_052.mp3",
    "usedBy": [
      "boar"
    ],
    "label": "野猪",
    "title": "wild pig 004.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "yottasounds",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/yottasounds/sounds/176732/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.31,
    "lufs": -20.56,
    "truePeakDb": -3.2,
    "noiseFloorDb": -88.02,
    "snrDb": 69.65,
    "sha1": "08f51611ef4b19c948251ea13f7ea93ac78e18cd"
  },
  {
    "file": "calls/butterfly_095.mp3",
    "usedBy": [
      "butterfly"
    ],
    "label": "蝴蝶",
    "title": "Sound of Beating Wings ",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Uzbazur",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Uzbazur/sounds/257080/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -24.46,
    "truePeakDb": -3.2,
    "noiseFloorDb": -41.82,
    "snrDb": 19.37,
    "sha1": "8f3acbed4ffa5a3908c8d1c75b498e0fb122f3ee"
  },
  {
    "file": "calls/butterfly_096.mp3",
    "usedBy": [
      "butterfly"
    ],
    "label": "蝴蝶",
    "title": "Butterfly flying loop",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "fury12",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/fury12/sounds/496719/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -25.48,
    "truePeakDb": -3.2,
    "noiseFloorDb": -36.78,
    "snrDb": 11.42,
    "sha1": "e0e7bc152f3fa2042a8cd4da271373000a2fef7d"
  },
  {
    "file": "calls/butterfly_097.mp3",
    "usedBy": [
      "butterfly"
    ],
    "label": "蝴蝶",
    "title": "Light Wing Flap",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "TurboFool",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/TurboFool/sounds/561009/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -24.11,
    "truePeakDb": -5.84,
    "noiseFloorDb": -28.83,
    "snrDb": 11.59,
    "sha1": "200e90d70a8515b97cb34a8573642c1cfbdcfbcb"
  },
  {
    "file": "calls/capybara_075.mp3",
    "usedBy": [
      "capybara"
    ],
    "label": "卡皮巴拉",
    "title": "Capybara",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Stan Rullman",
    "source": "iNaturalist",
    "sourceUrl": "https://www.inaturalist.org/observations/90187694",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -18.02,
    "truePeakDb": -6.72,
    "noiseFloorDb": -45.92,
    "snrDb": 24.77,
    "sha1": "2bf1163366819b8f099e7c40721d8715a2ac0ea4"
  },
  {
    "file": "calls/capybara_079.mp3",
    "usedBy": [
      "capybara"
    ],
    "label": "卡皮巴拉",
    "title": "Capivara",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "author": "Sidnei Dantas",
    "source": "iNaturalist",
    "sourceUrl": "https://www.inaturalist.org/observations/39058843",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.9,
    "lufs": -17.98,
    "truePeakDb": -3.77,
    "noiseFloorDb": -51.55,
    "snrDb": 32.72,
    "sha1": "e6492ed16ee80bd588a6561f157c2ba21beeced2"
  },
  {
    "file": "calls/cat_063.mp3",
    "usedBy": [
      "abyssinian"
    ],
    "label": "猫",
    "title": "cat meow",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "tuberatanka",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/tuberatanka/sounds/110011/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.5,
    "lufs": -18.03,
    "truePeakDb": -10.44,
    "noiseFloorDb": -50.51,
    "snrDb": 29.87,
    "sha1": "5d1fba6e48d7394f40854addfbf02b1abfbb2f01"
  },
  {
    "file": "calls/cat_064.mp3",
    "usedBy": [
      "ragdoll"
    ],
    "label": "猫",
    "title": "cat meow short",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "skymary",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/skymary/sounds/412017/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.5,
    "lufs": -18.04,
    "truePeakDb": -4.48,
    "noiseFloorDb": -56.34,
    "snrDb": 36.6,
    "sha1": "e5a0d314db36535c517517856b50be8687e71ff5"
  },
  {
    "file": "calls/cat_065.mp3",
    "usedBy": [
      "tabby"
    ],
    "label": "猫",
    "title": "Cat trilling",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "jsbarrett",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/jsbarrett/sounds/200336/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.5,
    "lufs": -18.65,
    "truePeakDb": -3.2,
    "noiseFloorDb": -55.1,
    "snrDb": 39.06,
    "sha1": "f17ec82ff81b0ed4f120688fad4c3d280e0636b1"
  },
  {
    "file": "calls/cat_066.mp3",
    "usedBy": [
      "orangeCat"
    ],
    "label": "猫",
    "title": "Cat Purr.mp3",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "soundmary",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/soundmary/sounds/194926/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.5,
    "lufs": -19.12,
    "truePeakDb": -3.2,
    "noiseFloorDb": -34.98,
    "snrDb": 19.21,
    "sha1": "580fd6fea7d524d20fcb14261a74b668486737ab"
  },
  {
    "file": "calls/chicken_001.mp3",
    "usedBy": [
      "chicken"
    ],
    "label": "小鸡",
    "title": "Chicken clucking",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Breviceps",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Breviceps/sounds/456803/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.2,
    "lufs": -17.97,
    "truePeakDb": -7.1,
    "noiseFloorDb": -48.8,
    "snrDb": 28.64,
    "sha1": "c726db1bfe828d1d8c57373caf146ed1ca76fcac"
  },
  {
    "file": "calls/chicken_003.mp3",
    "usedBy": [
      "chicken"
    ],
    "label": "小鸡",
    "title": "Chicken Clucking.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Angel_Perez_Grandi",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Angel_Perez_Grandi/sounds/49805/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.2,
    "lufs": -17.99,
    "truePeakDb": -3.47,
    "noiseFloorDb": -47.37,
    "snrDb": 29.01,
    "sha1": "9fcd65191bc116c1180361ca9ef3380bf9518b6e"
  },
  {
    "file": "calls/chicken_004.mp3",
    "usedBy": [
      "chicken"
    ],
    "label": "小鸡",
    "title": "Chicks very young.wav",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "AGFX",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/AGFX/sounds/43380/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.2,
    "lufs": -18.49,
    "truePeakDb": -3.2,
    "noiseFloorDb": -52.94,
    "snrDb": 36.43,
    "sha1": "2aaa19477f6f71c5fd1afb7bfcf3dac0eee0a120"
  },
  {
    "file": "calls/chicken_005.mp3",
    "usedBy": [
      "chicken"
    ],
    "label": "小鸡",
    "title": "Hen Cluck 02",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "SFXMint",
    "source": "SFXMint",
    "sourceUrl": "https://sfxmint.com/sets/animal-calls",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.2,
    "lufs": -20.62,
    "truePeakDb": -3.2,
    "noiseFloorDb": -89.79,
    "snrDb": 72.7,
    "sha1": "c9701336d66762abb795896f4c6ed5e4149e867b"
  },
  {
    "file": "calls/cricket_090.mp3",
    "usedBy": [
      "bug"
    ],
    "label": "蟋蟀/幼虫",
    "title": "Cricket chirping",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "GB01",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/GB01/sounds/530477/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；循环（保留原 220ms 交叉淡化）",
    "durSec": 2.78,
    "lufs": -26.08,
    "truePeakDb": -12.7,
    "noiseFloorDb": -42.59,
    "snrDb": 15.65,
    "sha1": "d7fc59eab318627daa3d04ec6ed87004daf92166"
  },
  {
    "file": "calls/cricket_091.mp3",
    "usedBy": [
      "bug"
    ],
    "label": "蟋蟀/幼虫",
    "title": "cricket chirping (slow)",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "_sinny_",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/_sinny_/sounds/822935/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；循环（保留原 220ms 交叉淡化）",
    "durSec": 2.61,
    "lufs": -26.06,
    "truePeakDb": -11.09,
    "noiseFloorDb": -44.6,
    "snrDb": 16.59,
    "sha1": "a1c577aa51a9020c51ac3c55e46c6dfe88721424"
  },
  {
    "file": "calls/cricket_093.mp3",
    "usedBy": [
      "bug"
    ],
    "label": "蟋蟀/幼虫",
    "title": "Cricket singing (close recording)",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "felix.blume",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/felix.blume/sounds/476082/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；循环（保留原 220ms 交叉淡化）",
    "durSec": 2.78,
    "lufs": -27.79,
    "truePeakDb": -3.2,
    "noiseFloorDb": -37.43,
    "snrDb": 13.51,
    "sha1": "722f029bbea6539a986a7030febbeeaf3c13af15"
  },
  {
    "file": "calls/deer_029.mp3",
    "usedBy": [
      "deer"
    ],
    "label": "小鹿",
    "title": "Deer_Bark_5_s",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "ferventtorpor",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/ferventtorpor/sounds/696776/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.82,
    "lufs": -18.43,
    "truePeakDb": -3.2,
    "noiseFloorDb": -34.46,
    "snrDb": 16.95,
    "sha1": "6153fcb71a42b8a23cf3c389a37369f2255259fc"
  },
  {
    "file": "calls/dog_070.mp3",
    "usedBy": [
      "borderCollie"
    ],
    "label": "狗",
    "title": "dog tripple bark",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "crazymonke9",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/crazymonke9/sounds/418108/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.8,
    "lufs": -18.81,
    "truePeakDb": -3.2,
    "noiseFloorDb": -98.93,
    "snrDb": 83.52,
    "sha1": "17d41952ce54cb88d43af32fdfe731585c9d8cc2"
  },
  {
    "file": "calls/dog_072.mp3",
    "usedBy": [
      "golden"
    ],
    "label": "狗",
    "title": "Dog whining sound",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Piink_Aces",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Piink_Aces/sounds/257824/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.8,
    "lufs": -18.09,
    "truePeakDb": -7.54,
    "noiseFloorDb": -55.92,
    "snrDb": 38.63,
    "sha1": "e448fa49b580116edb900f8b85a633748b2763eb"
  },
  {
    "file": "calls/dog_074.mp3",
    "usedBy": [
      "borderCollie"
    ],
    "label": "狗",
    "title": "Dog Bark 25",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "SFXMint",
    "source": "SFXMint",
    "sourceUrl": "https://sfxmint.com/sets/animal-calls",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.8,
    "lufs": -18.48,
    "truePeakDb": -3.2,
    "noiseFloorDb": -77.17,
    "snrDb": 62.08,
    "sha1": "743c2304a7fb31ac47307c36b9963ba7d9c8cc2b"
  },
  {
    "file": "calls/dragon_126.mp3",
    "usedBy": [
      "dragon",
      "pixiu",
      "baize"
    ],
    "label": "龙/貔貅/白泽",
    "title": "DRAGON_ROAR.wav",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "JoelAudio",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/JoelAudio/sounds/85568/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.47,
    "lufs": -18.5,
    "truePeakDb": -3.2,
    "noiseFloorDb": -84.9,
    "snrDb": 69.14,
    "sha1": "6667a6d7bb3a09cd0156660591424b3533873022"
  },
  {
    "file": "calls/dragon_128.mp3",
    "usedBy": [
      "dragon",
      "pixiu"
    ],
    "label": "龙/貔貅/白泽",
    "title": "Dragon Roar",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "qubodup",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/qubodup/sounds/442964/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 3,
    "lufs": -17.99,
    "truePeakDb": -4.83,
    "noiseFloorDb": -37.05,
    "snrDb": 19.46,
    "sha1": "fd9b3752f333f977ef42ef6b4d77468e2dcc2b49"
  },
  {
    "file": "calls/dragon_129.mp3",
    "usedBy": [
      "dragon",
      "baize"
    ],
    "label": "龙/貔貅/白泽",
    "title": "Dragon: Several roars, growls and snarls",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Breviceps",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Breviceps/sounds/479380/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 3,
    "lufs": -18.03,
    "truePeakDb": -4.02,
    "noiseFloorDb": -23.65,
    "snrDb": 10.25,
    "sha1": "7c8a5014da4a2c0ab51eb67a64f9eb50820b393d"
  },
  {
    "file": "calls/flamingo_121.mp3",
    "usedBy": [
      "flamingo"
    ],
    "label": "火烈鸟",
    "title": "Flamingo Calls, Ensemble, A.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "InspectorJ",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/InspectorJ/sounds/400860/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -19.06,
    "truePeakDb": -3.2,
    "noiseFloorDb": -46.57,
    "snrDb": 28.22,
    "sha1": "cc3d433902ecb4182c10f49c056aae899a20c270"
  },
  {
    "file": "calls/flamingo_122.mp3",
    "usedBy": [
      "flamingo"
    ],
    "label": "火烈鸟",
    "title": "The call of the flamingo",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "linlinn",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/linlinn/sounds/848862/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -17.99,
    "truePeakDb": -3.88,
    "noiseFloorDb": -32.34,
    "snrDb": 14.58,
    "sha1": "b186154dfba9a00f21a90447b9a7de84a6e3fe4a"
  },
  {
    "file": "calls/flamingo_123.mp3",
    "usedBy": [
      "flamingo"
    ],
    "label": "火烈鸟",
    "title": "Flaming różowy",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Mateusz Bronikowski",
    "source": "iNaturalist",
    "sourceUrl": "https://www.inaturalist.org/observations/328920336",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -19.96,
    "truePeakDb": -3.2,
    "noiseFloorDb": -30.96,
    "snrDb": 12.16,
    "sha1": "8667617e4567bbe6ff815c0c39648e219910b63a"
  },
  {
    "file": "calls/fox_033.mp3",
    "usedBy": [
      "fox"
    ],
    "label": "狐狸",
    "title": "Fox Call - Cleanup of sound by Janneair",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "qubodup",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/qubodup/sounds/192782/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；FFT 降噪 nr=10（去除残余背景）；首尾淡化",
    "durSec": 1.8,
    "lufs": -17.98,
    "truePeakDb": -7.8,
    "noiseFloorDb": -99.27,
    "snrDb": 80.32,
    "sha1": "ccfbf76f8ca9539e1cb507b86056a118d48d5080"
  },
  {
    "file": "calls/fox_034.mp3",
    "usedBy": [
      "fox"
    ],
    "label": "狐狸",
    "title": "Fox Screams",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Soundburst",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Soundburst/sounds/634005/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.8,
    "lufs": -17.92,
    "truePeakDb": -6.25,
    "noiseFloorDb": -49.31,
    "snrDb": 30.57,
    "sha1": "5b3ede01d5da6b70ee44dde475483e5209f6facd"
  },
  {
    "file": "calls/fox_035.mp3",
    "usedBy": [
      "fox"
    ],
    "label": "狐狸",
    "title": "Fox Mating Call",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Bpianoholic",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Bpianoholic/sounds/511000/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；谱减去混响 β=0.9 + FFT 降噪 nr=12；循环（首尾接近静音，未额外交叉淡化）",
    "durSec": 1.8,
    "lufs": -18,
    "truePeakDb": -4.64,
    "noiseFloorDb": -36.56,
    "snrDb": 16.36,
    "sha1": "109c8f6d7dbabba0392a0d991c9fb1a8c27140e4"
  },
  {
    "file": "calls/fox_037.mp3",
    "usedBy": [
      "fox"
    ],
    "label": "狐狸",
    "title": "Renard roux",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Yves Bas",
    "source": "iNaturalist",
    "sourceUrl": "https://www.inaturalist.org/observations/342879989",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；谱减去混响 β=1.0 + FFT 降噪 nr=15；首尾淡化; 最终限幅 0.63（保证真峰值）",
    "durSec": 1.8,
    "lufs": -18.92,
    "truePeakDb": -3.98,
    "noiseFloorDb": -34.51,
    "snrDb": 18.62,
    "sha1": "ac209035f9685c86c5a71ca59ba387c691e9ab10"
  },
  {
    "file": "calls/frog_080.mp3",
    "usedBy": [
      "frog"
    ],
    "label": "青蛙",
    "title": "Frog.ogg",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "egomassive",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/egomassive/sounds/536759/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.57,
    "lufs": -18.14,
    "truePeakDb": -7.48,
    "noiseFloorDb": -120,
    "snrDb": 101.36,
    "sha1": "80dac727a8616caee2f6bd581b5c7cbeb38328bf"
  },
  {
    "file": "calls/frog_081.mp3",
    "usedBy": [
      "frog"
    ],
    "label": "青蛙",
    "title": "Coqui.aif",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "dashatron",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/dashatron/sounds/191524/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.9,
    "lufs": -17.98,
    "truePeakDb": -6.98,
    "noiseFloorDb": -72.93,
    "snrDb": 53.44,
    "sha1": "90e3301fe5c28c97e9d41ed9be0c8f6c4df86ae2"
  },
  {
    "file": "calls/frog_082.mp3",
    "usedBy": [
      "frog"
    ],
    "label": "青蛙",
    "title": "tree frog duett.mp3",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "reinsamba",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/reinsamba/sounds/15691/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.9,
    "lufs": -18.05,
    "truePeakDb": -6.09,
    "noiseFloorDb": -55.13,
    "snrDb": 36.27,
    "sha1": "a026fc755eb4ab348246c1fa5a31f0af2310f12a"
  },
  {
    "file": "calls/frog_083.mp3",
    "usedBy": [
      "frog"
    ],
    "label": "青蛙",
    "title": "200703101950PacificChorusFrogsSoloNR.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "daveincamas",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/daveincamas/sounds/32807/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.9,
    "lufs": -17.96,
    "truePeakDb": -7.17,
    "noiseFloorDb": -54.19,
    "snrDb": 35.83,
    "sha1": "0619a2325c678e57ecdc8845834bd0dc7be8bbeb"
  },
  {
    "file": "calls/frog_085.mp3",
    "usedBy": [
      "frog"
    ],
    "label": "青蛙",
    "title": "Frog Croak 14",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "SFXMint",
    "source": "SFXMint",
    "sourceUrl": "https://sfxmint.com/sets/animal-calls",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.9,
    "lufs": -17.96,
    "truePeakDb": -3.21,
    "noiseFloorDb": -63.28,
    "snrDb": 46,
    "sha1": "9011c4f685c5990e184e05f490308afaf9311cb3"
  },
  {
    "file": "calls/hedgehog_056.mp3",
    "usedBy": [
      "hedgehog"
    ],
    "label": "刺猬",
    "title": "hedgehog.mp3",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "soundmary",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/soundmary/sounds/194938/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -22.36,
    "truePeakDb": -3.2,
    "noiseFloorDb": -32.38,
    "snrDb": 12.73,
    "sha1": "d6644d61c33a3a8989f384d9648cd1d66697877d"
  },
  {
    "file": "calls/hedgehog_057.mp3",
    "usedBy": [
      "hedgehog"
    ],
    "label": "刺猬",
    "title": "Hedgehog.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "juskiddink",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/juskiddink/sounds/58289/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -22.15,
    "truePeakDb": -3.73,
    "noiseFloorDb": -29.65,
    "snrDb": 13.31,
    "sha1": "d35062d435408c4771cbd991b72b2589e692b2ec"
  },
  {
    "file": "calls/hedgehog_058.mp3",
    "usedBy": [
      "hedgehog"
    ],
    "label": "刺猬",
    "title": "Hedgehog smell and run.mp3",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "ffdown",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/ffdown/sounds/570301/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2,
    "lufs": -22.02,
    "truePeakDb": -4.92,
    "noiseFloorDb": -24.8,
    "snrDb": 10.63,
    "sha1": "0c83cf1a7382143261b081357630ff043af9d31d"
  },
  {
    "file": "calls/longtail_109.mp3",
    "usedBy": [
      "longtail"
    ],
    "label": "北长尾山雀",
    "title": "Long-tailed Tit",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Jose Gutierrez Higa",
    "source": "iNaturalist",
    "sourceUrl": "https://www.inaturalist.org/observations/360941705",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.8,
    "lufs": -18.31,
    "truePeakDb": -4.65,
    "noiseFloorDb": -30.67,
    "snrDb": 12.64,
    "sha1": "5be552dc49b95919c37ec817e1c9aa05a3d26c09"
  },
  {
    "file": "calls/longtail_110.mp3",
    "usedBy": [
      "longtail"
    ],
    "label": "北长尾山雀",
    "title": "Длиннохвостая синица",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Слава",
    "source": "iNaturalist",
    "sourceUrl": "https://www.inaturalist.org/observations/244132625",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.8,
    "lufs": -19.2,
    "truePeakDb": -3.2,
    "noiseFloorDb": -35.18,
    "snrDb": 19.96,
    "sha1": "b94a8d84828996fb86e05a8996fc7de9095304f1"
  },
  {
    "file": "calls/nightHeron_103.mp3",
    "usedBy": [
      "nightHeron"
    ],
    "label": "夜鹭",
    "title": "grey heron calls at night on lake",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Garuda1982",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Garuda1982/sounds/645157/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.2,
    "lufs": -18.45,
    "truePeakDb": -3.2,
    "noiseFloorDb": -40.06,
    "snrDb": 20.44,
    "sha1": "4cc84a10a81a60adbc5f4249f6d00df8bfbed673"
  },
  {
    "file": "calls/rabbit_021.mp3",
    "usedBy": [
      "rabbit"
    ],
    "label": "兔子",
    "title": "Rabbit oinks and squeaks",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "kessir",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/kessir/sounds/372075/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.5,
    "lufs": -19.6,
    "truePeakDb": -3.2,
    "noiseFloorDb": -40.27,
    "snrDb": 25.35,
    "sha1": "097ab36d62d03b83ba90525912950262e67020d1"
  },
  {
    "file": "calls/rabbit_024.mp3",
    "usedBy": [
      "rabbit"
    ],
    "label": "兔子",
    "title": "Domestic Rabbit",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Naelin",
    "source": "iNaturalist",
    "sourceUrl": "https://www.inaturalist.org/observations/265568116",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.5,
    "lufs": -17.24,
    "truePeakDb": -3.81,
    "noiseFloorDb": -52.03,
    "snrDb": 32.63,
    "sha1": "6a8bec6c57f6c8c13a43ffd2ecc1c9d3af7ae4bc"
  },
  {
    "file": "calls/redstart_104.mp3",
    "usedBy": [
      "redstart"
    ],
    "label": "红尾水鸲",
    "title": "1165black_ redstart.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "reinsamba",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/reinsamba/sounds/56302/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.5,
    "lufs": -18.03,
    "truePeakDb": -7.92,
    "noiseFloorDb": -57.05,
    "snrDb": 36.93,
    "sha1": "5bc20d3594dad5b8388e5584bd0c1c63d57413f1"
  },
  {
    "file": "calls/redstart_106.mp3",
    "usedBy": [
      "redstart"
    ],
    "label": "红尾水鸲",
    "title": "Feeding chicks - Blackredstart aka Rougequeue noir",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Sadiquecat",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Sadiquecat/sounds/740067/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.5,
    "lufs": -19.12,
    "truePeakDb": -3.2,
    "noiseFloorDb": -42.51,
    "snrDb": 22.54,
    "sha1": "c9c1f9c3f9c6cc68a08a12df8188dff6749414d8"
  },
  {
    "file": "calls/redstart_107.mp3",
    "usedBy": [
      "redstart"
    ],
    "label": "红尾水鸲",
    "title": "Горихвістка чорна",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Igor Balashov",
    "source": "iNaturalist",
    "sourceUrl": "https://www.inaturalist.org/observations/373109329",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.5,
    "lufs": -18.02,
    "truePeakDb": -5.85,
    "noiseFloorDb": -59.01,
    "snrDb": 37.64,
    "sha1": "041d2d78885e9e2cffc94927588fc5eaa040ecd0"
  },
  {
    "file": "calls/sheep_011.mp3",
    "usedBy": [
      "sheep"
    ],
    "label": "小羊",
    "title": "Sheep bleating",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "zachrau",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/zachrau/sounds/362283/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.2,
    "lufs": -18.13,
    "truePeakDb": -9.79,
    "noiseFloorDb": -61.19,
    "snrDb": 41.3,
    "sha1": "71774fd9c9679a0c9e9f2dd170611f75f5d997c6"
  },
  {
    "file": "calls/sheep_012.mp3",
    "usedBy": [
      "sheep"
    ],
    "label": "小羊",
    "title": "sheep bleat outdoors",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Yuval",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Yuval/sounds/210511/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.2,
    "lufs": -18.4,
    "truePeakDb": -5.25,
    "noiseFloorDb": -57.98,
    "snrDb": 39.22,
    "sha1": "0dfbfbbfce707080e42b9e2e1f2ae11381d5de6c"
  },
  {
    "file": "calls/sheep_013.mp3",
    "usedBy": [
      "sheep"
    ],
    "label": "小羊",
    "title": "Sheeheep.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "HerbertBoland",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/HerbertBoland/sounds/75190/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.2,
    "lufs": -18.08,
    "truePeakDb": -5.27,
    "noiseFloorDb": -29.42,
    "snrDb": 10.23,
    "sha1": "0dc0a1571351887089ccd82ec8b7b2b400fe9e7b"
  },
  {
    "file": "calls/sheep_014.mp3",
    "usedBy": [
      "sheep"
    ],
    "label": "小羊",
    "title": "Sheep_Bleat.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "n_audioman",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/n_audioman/sounds/321967/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 1.2,
    "lufs": -18,
    "truePeakDb": -6.48,
    "noiseFloorDb": -59.14,
    "snrDb": 40.03,
    "sha1": "dd7fee9ff866de197a775ae58f72258cb74ac9a1"
  },
  {
    "file": "calls/sheep_016.mp3",
    "usedBy": [
      "sheep"
    ],
    "label": "小羊",
    "title": "Baa",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Technopeasant",
    "source": "OpenGameArt",
    "sourceUrl": "https://opengameart.org/content/baby-animals-sounds-pack",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 0.997,
    "lufs": -18.09,
    "truePeakDb": -10,
    "noiseFloorDb": -44.94,
    "snrDb": 24.26,
    "sha1": "a4d6108068937ded3759b1331790e829382b685b"
  },
  {
    "file": "calls/squirrel_046.mp3",
    "usedBy": [
      "squirrel"
    ],
    "label": "松鼠",
    "title": "Squirrel Chatter 4 3 2016 Lincoln Nebraska .mp3",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "bmccoy2",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/bmccoy2/sounds/342105/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.5,
    "lufs": -20.12,
    "truePeakDb": -3.2,
    "noiseFloorDb": -49.7,
    "snrDb": 29.82,
    "sha1": "aeea79fdb95450b7081bc81c2cc7b79b494b796c"
  },
  {
    "file": "calls/squirrel_047.mp3",
    "usedBy": [
      "squirrel"
    ],
    "label": "松鼠",
    "title": "Red_Squirrel_chatter.wav",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "philberts",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/philberts/sounds/111393/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 2.5,
    "lufs": -18.07,
    "truePeakDb": -3.95,
    "noiseFloorDb": -32.76,
    "snrDb": 13.42,
    "sha1": "1dab57f16302cfac3f79a3702d5f97eb12948e02"
  },
  {
    "file": "calls/squirrel_048.mp3",
    "usedBy": [
      "squirrel"
    ],
    "label": "松鼠",
    "title": "squirrel chatter w city.wav",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Littlebrojay",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Littlebrojay/sounds/195440/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；小波降噪 sigma=0.04 / 80%；首尾淡化",
    "durSec": 2.5,
    "lufs": -18,
    "truePeakDb": -5.16,
    "noiseFloorDb": -45.21,
    "snrDb": 25.24,
    "sha1": "c0bc8e069ad05079685f198e3a2ec2ecef53e4d5"
  },
  {
    "file": "calls/wolf_040.mp3",
    "usedBy": [
      "wolf"
    ],
    "label": "狼",
    "title": "Wolf Crying Howl",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "EminYILDIRIM",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/EminYILDIRIM/sounds/541282/",
    "modified": "按报告裁切 0.00–4.28s；48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 4.28,
    "lufs": -17.99,
    "truePeakDb": -8.36,
    "noiseFloorDb": -48.4,
    "snrDb": 30.21,
    "sha1": "964d88bbb815955ed2707e6be3a19216c8946520"
  },
  {
    "file": "calls/wren_114.mp3",
    "usedBy": [
      "wren"
    ],
    "label": "冬鹪鹩",
    "title": "Wren song close",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "Sacha.Julien",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Sacha.Julien/sounds/734533/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 3,
    "lufs": -18.32,
    "truePeakDb": -3.2,
    "noiseFloorDb": -43.37,
    "snrDb": 23.3,
    "sha1": "b9cdc504f7c0b8c149b3b6259a9a619c653808f0"
  },
  {
    "file": "calls/wren_115.mp3",
    "usedBy": [
      "wren"
    ],
    "label": "冬鹪鹩",
    "title": "WinterWren1.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "Coppersmith Barbet",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/Coppersmith Barbet/sounds/33376/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 3,
    "lufs": -18.08,
    "truePeakDb": -7.75,
    "noiseFloorDb": -34.84,
    "snrDb": 16.52,
    "sha1": "aabec4ee62707380e23f86bd2640752ad80cf817"
  },
  {
    "file": "calls/wren_116.mp3",
    "usedBy": [
      "wren"
    ],
    "label": "冬鹪鹩",
    "title": "Winter Wren.mp3",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "wildear1",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/wildear1/sounds/94845/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 3,
    "lufs": -18.06,
    "truePeakDb": -7.42,
    "noiseFloorDb": -32.05,
    "snrDb": 13.29,
    "sha1": "25b1ad19690b61f34db87b7439453e2c635a2c4c"
  },
  {
    "file": "calls/wren_117.mp3",
    "usedBy": [
      "wren"
    ],
    "label": "冬鹪鹩",
    "title": "The song of an Eurasian Wren",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "author": "hoshisato",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/hoshisato/sounds/853671/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 3,
    "lufs": -18.06,
    "truePeakDb": -5.23,
    "noiseFloorDb": -34.33,
    "snrDb": 15.28,
    "sha1": "854eb4f9ee071644237cbb72ffad49663aea3592"
  },
  {
    "file": "calls/wren_118.mp3",
    "usedBy": [
      "wren"
    ],
    "label": "冬鹪鹩",
    "title": "winter wren wind leaves.wav",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "author": "klankbeeld",
    "source": "Freesound",
    "sourceUrl": "https://freesound.org/people/klankbeeld/sounds/265633/",
    "modified": "48kHz/16bit/单声道；LUFS 归一化；真峰值 ≤ −3.2 dBTP；首尾淡化",
    "durSec": 3,
    "lufs": -19.01,
    "truePeakDb": -3.2,
    "noiseFloorDb": -38.59,
    "snrDb": 21.45,
    "sha1": "7808ff143a3b104747090aff64d8b08744e5376b"
  }
];

// 一眼能查的两件事：哪条是 NC（将来要删）、哪条要署名。
const NON_COMMERCIAL = [];
const ATTRIBUTION_REQUIRED = ["calls/bee_089.mp3","calls/bird_006.mp3","calls/bird_007.mp3","calls/boar_050.mp3","calls/boar_051.mp3","calls/boar_052.mp3","calls/butterfly_095.mp3","calls/capybara_075.mp3","calls/capybara_079.mp3","calls/cat_066.mp3","calls/chicken_003.mp3","calls/dog_070.mp3","calls/dog_072.mp3","calls/flamingo_121.mp3","calls/flamingo_122.mp3","calls/flamingo_123.mp3","calls/fox_033.mp3","calls/fox_037.mp3","calls/frog_082.mp3","calls/frog_083.mp3","calls/hedgehog_056.mp3","calls/hedgehog_057.mp3","calls/longtail_109.mp3","calls/longtail_110.mp3","calls/nightHeron_103.mp3","calls/rabbit_024.mp3","calls/redstart_104.mp3","calls/redstart_107.mp3","calls/sheep_013.mp3","calls/sheep_014.mp3","calls/squirrel_046.mp3","calls/wolf_040.mp3","calls/wren_115.mp3","calls/wren_116.mp3","calls/wren_118.mp3"];
