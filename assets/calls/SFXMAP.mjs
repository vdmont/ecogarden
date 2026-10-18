// 物种 → 叫声素材表。⚠ 本文件由 scripts/gen-sfxmap.cjs 生成，不要手改。
// 数据源：music/sfx-map.json（物种映射）+ music/manifest.json（许可与出处）。
//
// 为什么单独一个文件：build.cjs 是**扫源码里的字符串**来决定离线版内联哪些音频的，
// 所以路径必须原样出现在这里，扫到才会被打包。漏一个字符就是离线版少一条声音。
//
// 要改素材：改 music/ 里的源文件，然后跑 node scripts\gen-sfxmap.cjs。
(function (root) {
  root.EcoCalls = {
    // 素材包给的全局音量。混音那层还会按远近再加权，这里是底子。
    masterGain: 0.9,
    species: {
          "chicken": {
                "files": [
                      "assets/calls/chicken_001.mp3",
                      "assets/calls/chicken_003.mp3",
                      "assets/calls/chicken_004.mp3",
                      "assets/calls/chicken_005.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "bird": {
                "files": [
                      "assets/calls/bird_006.mp3",
                      "assets/calls/bird_007.mp3",
                      "assets/calls/bird_010.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "sheep": {
                "files": [
                      "assets/calls/sheep_011.mp3",
                      "assets/calls/sheep_012.mp3",
                      "assets/calls/sheep_013.mp3",
                      "assets/calls/sheep_014.mp3",
                      "assets/calls/sheep_016.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "alpaca": {
                "files": [
                      "assets/calls/alpaca_017.mp3",
                      "assets/calls/alpaca_018.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "rabbit": {
                "files": [
                      "assets/calls/rabbit_021.mp3",
                      "assets/calls/rabbit_024.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "fox": {
                "files": [
                      "assets/calls/fox_033.mp3",
                      "assets/calls/fox_034.mp3",
                      "assets/calls/fox_035.mp3",
                      "assets/calls/fox_037.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": [
                      "assets/calls/fox_035.mp3"
                ]
          },
          "wolf": {
                "files": [
                      "assets/calls/wolf_040.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "squirrel": {
                "files": [
                      "assets/calls/squirrel_046.mp3",
                      "assets/calls/squirrel_047.mp3",
                      "assets/calls/squirrel_048.mp3",
                      "assets/calls/squirrel_main.mp3",
                      "assets/calls/squirrel_alt_squeal.mp3",
                      "assets/calls/squirrel_alt_alarm.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "boar": {
                "files": [
                      "assets/calls/boar_050.mp3",
                      "assets/calls/boar_051.mp3",
                      "assets/calls/boar_052.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "hedgehog": {
                "files": [
                      "assets/calls/hedgehog_056.mp3",
                      "assets/calls/hedgehog_057.mp3",
                      "assets/calls/hedgehog_058.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "capybara": {
                "files": [
                      "assets/calls/capybara_075.mp3",
                      "assets/calls/capybara_079.mp3",
                      "assets/calls/capybara_cc0.mp3",
                      "assets/calls/capybara_substitute_guineapig.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "frog": {
                "files": [
                      "assets/calls/frog_080.mp3",
                      "assets/calls/frog_081.mp3",
                      "assets/calls/frog_082.mp3",
                      "assets/calls/frog_083.mp3",
                      "assets/calls/frog_085.mp3",
                      "assets/calls/frog_main.mp3",
                      "assets/calls/frog_alt.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "bee": {
                "files": [
                      "assets/calls/bee_087.mp3",
                      "assets/calls/bee_089.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": [
                      "assets/calls/bee_087.mp3",
                      "assets/calls/bee_089.mp3"
                ]
          },
          "butterfly": {
                "files": [
                      "assets/calls/butterfly_095.mp3",
                      "assets/calls/butterfly_096.mp3",
                      "assets/calls/butterfly_097.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "nightHeron": {
                "files": [
                      "assets/calls/nightHeron_103.mp3",
                      "assets/calls/night_heron_main.mp3",
                      "assets/calls/night_heron_alt.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "redstart": {
                "files": [
                      "assets/calls/redstart_104.mp3",
                      "assets/calls/redstart_106.mp3",
                      "assets/calls/redstart_107.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "longtail": {
                "files": [
                      "assets/calls/longtail_109.mp3",
                      "assets/calls/longtail_110.mp3",
                      "assets/calls/long_tailed_tit_main.mp3",
                      "assets/calls/long_tailed_tit_alt.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "wren": {
                "files": [
                      "assets/calls/wren_114.mp3",
                      "assets/calls/wren_115.mp3",
                      "assets/calls/wren_116.mp3",
                      "assets/calls/wren_117.mp3",
                      "assets/calls/wren_118.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "flamingo": {
                "files": [
                      "assets/calls/flamingo_121.mp3",
                      "assets/calls/flamingo_122.mp3",
                      "assets/calls/flamingo_123.mp3",
                      "assets/calls/flamingo_main.mp3",
                      "assets/calls/flamingo_alt.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "bug": {
                "files": [
                      "assets/calls/cricket_090.mp3",
                      "assets/calls/cricket_091.mp3",
                      "assets/calls/cricket_093.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": [
                      "assets/calls/cricket_090.mp3",
                      "assets/calls/cricket_091.mp3",
                      "assets/calls/cricket_093.mp3"
                ],
                "note": "幼虫不发声，用蟋蟀/虫鸣代替"
          },
          "abyssinian": {
                "files": [
                      "assets/calls/cat_063.mp3",
                      "assets/calls/cat_main.mp3",
                      "assets/calls/cat_alt_single.mp3"
                ],
                "rate": 1.12,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "ragdoll": {
                "files": [
                      "assets/calls/cat_064.mp3",
                      "assets/calls/cat_main.mp3",
                      "assets/calls/cat_alt_single.mp3"
                ],
                "rate": 0.93,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "tabby": {
                "files": [
                      "assets/calls/cat_065.mp3",
                      "assets/calls/cat_main.mp3",
                      "assets/calls/cat_alt_single.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "orangeCat": {
                "files": [
                      "assets/calls/cat_066.mp3",
                      "assets/calls/cat_main.mp3",
                      "assets/calls/cat_alt_single.mp3"
                ],
                "rate": 1.06,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "borderCollie": {
                "files": [
                      "assets/calls/dog_070.mp3",
                      "assets/calls/dog_074.mp3"
                ],
                "rate": 1.05,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "golden": {
                "files": [
                      "assets/calls/dog_072.mp3"
                ],
                "rate": 0.92,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "samoyed": {
                "files": [
                      "assets/calls/dog_main.mp3",
                      "assets/calls/dog_alt.mp3"
                ],
                "rate": 1.15,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "dragon": {
                "files": [
                      "assets/calls/dragon_126.mp3",
                      "assets/calls/dragon_128.mp3",
                      "assets/calls/dragon_129.mp3"
                ],
                "rate": 1,
                "gain": 1,
                "voices": 2,
                "loops": []
          },
          "pixiu": {
                "files": [
                      "assets/calls/dragon_126.mp3",
                      "assets/calls/dragon_128.mp3"
                ],
                "rate": 0.82,
                "gain": 0.95,
                "voices": 2,
                "loops": []
          },
          "baize": {
                "files": [
                      "assets/calls/dragon_129.mp3",
                      "assets/calls/dragon_126.mp3"
                ],
                "rate": 1.12,
                "gain": 0.9,
                "voices": 2,
                "loops": []
          }
    },
    // 每条文件的许可与出处。人看这里，机器靠它核对有没有漏登记。
    licenses: {
          "alpaca_017": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "gtg777",
                "title": "Alpaca noises",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/gtg777/sounds/623809/",
                "dur": 2.5,
                "lufs": -18.56,
                "truePeak": -3.2,
                "noise": -39.35,
                "snr": 20.76
          },
          "alpaca_018": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "TheKingOfGeeks360",
                "title": "Camelids - Alpaca; High Moan, Take 2",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/TheKingOfGeeks360/sounds/868310/",
                "dur": 0.54,
                "lufs": -18,
                "truePeak": -4.91,
                "noise": -47.54,
                "snr": 26
          },
          "bee_087": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Breviceps",
                "title": "Bumblebee",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Breviceps/sounds/466795/",
                "dur": 2.78,
                "lufs": -26.06,
                "truePeak": -7.51,
                "noise": -36.26,
                "snr": 13.33
          },
          "bee_089": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "dobroide",
                "title": "20100424.bee.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/dobroide/sounds/95817/",
                "dur": 2.78,
                "lufs": -25.69,
                "truePeak": -9.93,
                "noise": -32.78,
                "snr": 11.68
          },
          "bird_006": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "sandyrb",
                "title": "PALM BIRD CHIRP 001.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/sandyrb/sounds/156373/",
                "dur": 1.208,
                "lufs": -18.19,
                "truePeak": -8.78,
                "noise": -72.25,
                "snr": 51.56
          },
          "bird_007": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "JoelAudio",
                "title": "BIRDS_CHIRP_FEW_001.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/JoelAudio/sounds/133896/",
                "dur": 2.2,
                "lufs": -18.01,
                "truePeak": -6.13,
                "noise": -40.22,
                "snr": 20.15
          },
          "bird_010": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "SFXMint",
                "title": "Songbird Chirp",
                "source": "SFXMint",
                "sourceUrl": "https://sfxmint.com/sets/animal-calls",
                "dur": 2,
                "lufs": -18.94,
                "truePeak": -3.2,
                "noise": -94.61,
                "snr": 74.16
          },
          "boar_050": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "TheVeoMammoth11",
                "title": "Wild Boar / Grunting / Squealing",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/TheVeoMammoth11/sounds/492654/",
                "dur": 2.5,
                "lufs": -19.03,
                "truePeak": -3.2,
                "noise": -40,
                "snr": 23.19
          },
          "boar_051": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "yottasounds",
                "title": "wild pig 008.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/yottasounds/sounds/176731/",
                "dur": 0.789,
                "lufs": -18.98,
                "truePeak": -3.2,
                "noise": -94.78,
                "snr": 78.05
          },
          "boar_052": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "yottasounds",
                "title": "wild pig 004.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/yottasounds/sounds/176732/",
                "dur": 1.31,
                "lufs": -20.56,
                "truePeak": -3.2,
                "noise": -88.02,
                "snr": 69.65
          },
          "butterfly_095": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Uzbazur",
                "title": "Sound of Beating Wings ",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Uzbazur/sounds/257080/",
                "dur": 2,
                "lufs": -24.46,
                "truePeak": -3.2,
                "noise": -41.82,
                "snr": 19.37
          },
          "butterfly_096": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "fury12",
                "title": "Butterfly flying loop",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/fury12/sounds/496719/",
                "dur": 2,
                "lufs": -25.48,
                "truePeak": -3.2,
                "noise": -36.78,
                "snr": 11.42
          },
          "butterfly_097": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "TurboFool",
                "title": "Light Wing Flap",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/TurboFool/sounds/561009/",
                "dur": 2,
                "lufs": -24.11,
                "truePeak": -5.84,
                "noise": -28.83,
                "snr": 11.59
          },
          "capybara_075": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Stan Rullman",
                "title": "Capybara",
                "source": "iNaturalist",
                "sourceUrl": "https://www.inaturalist.org/observations/90187694",
                "dur": 2,
                "lufs": -18.02,
                "truePeak": -6.72,
                "noise": -45.92,
                "snr": 24.77
          },
          "capybara_079": {
                "license": "CC BY-SA 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
                "author": "Sidnei Dantas",
                "title": "Capivara",
                "source": "iNaturalist",
                "sourceUrl": "https://www.inaturalist.org/observations/39058843",
                "dur": 1.9,
                "lufs": -17.98,
                "truePeak": -3.77,
                "noise": -51.55,
                "snr": 32.72
          },
          "capybara_cc0": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Капыбара_12345",
                "title": "capybara（家养水豚现场声）",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/%D0%9A%D0%B0%D0%BF%D1%8B%D0%B1%D0%B0%D1%80%D0%B0_12345/sounds/849980/",
                "dur": 5.5,
                "lufs": -16.8,
                "truePeak": -3.03,
                "noise": -99.11,
                "snr": 75.39
          },
          "capybara_substitute_guineapig": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Breviceps",
                "title": "Squeaking Guinea Pigs",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Breviceps/sounds/583078/",
                "dur": 12,
                "lufs": -14.08,
                "truePeak": -1.76,
                "noise": -42.13,
                "snr": 29.86
          },
          "cat_063": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "tuberatanka",
                "title": "cat meow",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/tuberatanka/sounds/110011/",
                "dur": 1.5,
                "lufs": -18.03,
                "truePeak": -10.44,
                "noise": -50.51,
                "snr": 29.87
          },
          "cat_064": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "skymary",
                "title": "cat meow short",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/skymary/sounds/412017/",
                "dur": 1.5,
                "lufs": -18.04,
                "truePeak": -4.48,
                "noise": -56.34,
                "snr": 36.6
          },
          "cat_065": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "jsbarrett",
                "title": "Cat trilling",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/jsbarrett/sounds/200336/",
                "dur": 1.5,
                "lufs": -18.65,
                "truePeak": -3.2,
                "noise": -55.1,
                "snr": 39.06
          },
          "cat_066": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "soundmary",
                "title": "Cat Purr.mp3",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/soundmary/sounds/194926/",
                "dur": 1.5,
                "lufs": -19.12,
                "truePeak": -3.2,
                "noise": -34.98,
                "snr": 19.21
          },
          "cat_alt_single": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "tuberatanka",
                "title": "cat meow",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/tuberatanka/sounds/110011/",
                "dur": 1.54,
                "lufs": -16.17,
                "truePeak": -10.69,
                "noise": -50.63,
                "snr": 33.74
          },
          "cat_main": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Kinoton",
                "title": "Cat Meows 7x",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Kinoton/sounds/584895/",
                "dur": 12,
                "lufs": -19.14,
                "truePeak": -6.02,
                "noise": -240,
                "snr": 160.18
          },
          "chicken_001": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Breviceps",
                "title": "Chicken clucking",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Breviceps/sounds/456803/",
                "dur": 2.2,
                "lufs": -17.97,
                "truePeak": -7.1,
                "noise": -48.8,
                "snr": 28.64
          },
          "chicken_003": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Angel_Perez_Grandi",
                "title": "Chicken Clucking.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Angel_Perez_Grandi/sounds/49805/",
                "dur": 2.2,
                "lufs": -17.99,
                "truePeak": -3.47,
                "noise": -47.37,
                "snr": 29.01
          },
          "chicken_004": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "AGFX",
                "title": "Chicks very young.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/AGFX/sounds/43380/",
                "dur": 2.2,
                "lufs": -18.49,
                "truePeak": -3.2,
                "noise": -52.94,
                "snr": 36.43
          },
          "chicken_005": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "SFXMint",
                "title": "Hen Cluck 02",
                "source": "SFXMint",
                "sourceUrl": "https://sfxmint.com/sets/animal-calls",
                "dur": 2.2,
                "lufs": -20.62,
                "truePeak": -3.2,
                "noise": -89.79,
                "snr": 72.7
          },
          "cricket_090": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "GB01",
                "title": "Cricket chirping",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/GB01/sounds/530477/",
                "dur": 2.78,
                "lufs": -26.08,
                "truePeak": -12.7,
                "noise": -42.59,
                "snr": 15.65
          },
          "cricket_091": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "_sinny_",
                "title": "cricket chirping (slow)",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/_sinny_/sounds/822935/",
                "dur": 2.61,
                "lufs": -26.06,
                "truePeak": -11.09,
                "noise": -44.6,
                "snr": 16.59
          },
          "cricket_093": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "felix.blume",
                "title": "Cricket singing (close recording)",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/felix.blume/sounds/476082/",
                "dur": 2.78,
                "lufs": -27.79,
                "truePeak": -3.2,
                "noise": -37.43,
                "snr": 13.51
          },
          "dog_070": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "crazymonke9",
                "title": "dog tripple bark",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/crazymonke9/sounds/418108/",
                "dur": 0.8,
                "lufs": -18.81,
                "truePeak": -3.2,
                "noise": -98.93,
                "snr": 83.52
          },
          "dog_072": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Piink_Aces",
                "title": "Dog whining sound",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Piink_Aces/sounds/257824/",
                "dur": 0.8,
                "lufs": -18.09,
                "truePeak": -7.54,
                "noise": -55.92,
                "snr": 38.63
          },
          "dog_074": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "SFXMint",
                "title": "Dog Bark 25",
                "source": "SFXMint",
                "sourceUrl": "https://sfxmint.com/sets/animal-calls",
                "dur": 0.8,
                "lufs": -18.48,
                "truePeak": -3.2,
                "noise": -77.17,
                "snr": 62.08
          },
          "dog_alt": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "aunrea",
                "title": "Dog Bark",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/aunrea/sounds/495658/",
                "dur": 3.97,
                "lufs": -13.14,
                "truePeak": -3.68,
                "noise": -68.13,
                "snr": 51.99
          },
          "dog_main": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Primitv094",
                "title": "San Bernard dog bark",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Primitv094/sounds/784914/",
                "dur": 4.03,
                "lufs": -14,
                "truePeak": -5.77,
                "noise": -54.45,
                "snr": 42.63
          },
          "dragon_126": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "JoelAudio",
                "title": "DRAGON_ROAR.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/JoelAudio/sounds/85568/",
                "dur": 2.47,
                "lufs": -18.5,
                "truePeak": -3.2,
                "noise": -84.9,
                "snr": 69.14
          },
          "dragon_128": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "qubodup",
                "title": "Dragon Roar",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/qubodup/sounds/442964/",
                "dur": 3,
                "lufs": -17.99,
                "truePeak": -4.83,
                "noise": -37.05,
                "snr": 19.46
          },
          "dragon_129": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Breviceps",
                "title": "Dragon: Several roars, growls and snarls",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Breviceps/sounds/479380/",
                "dur": 3,
                "lufs": -18.03,
                "truePeak": -4.02,
                "noise": -23.65,
                "snr": 10.25
          },
          "flamingo_121": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "InspectorJ",
                "title": "Flamingo Calls, Ensemble, A.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/InspectorJ/sounds/400860/",
                "dur": 2,
                "lufs": -19.06,
                "truePeak": -3.2,
                "noise": -46.57,
                "snr": 28.22
          },
          "flamingo_122": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "linlinn",
                "title": "The call of the flamingo",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/linlinn/sounds/848862/",
                "dur": 2,
                "lufs": -17.99,
                "truePeak": -3.88,
                "noise": -32.34,
                "snr": 14.58
          },
          "flamingo_123": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Mateusz Bronikowski",
                "title": "Flaming różowy",
                "source": "iNaturalist",
                "sourceUrl": "https://www.inaturalist.org/observations/328920336",
                "dur": 2,
                "lufs": -19.96,
                "truePeak": -3.2,
                "noise": -30.96,
                "snr": 12.16
          },
          "flamingo_alt": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "dobroide",
                "title": "2019209_flamingos.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/s/496891/",
                "dur": 12,
                "lufs": -17.11,
                "truePeak": -1.78,
                "noise": -25.71,
                "snr": 8.37
          },
          "flamingo_main": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Grégoire Chauvot",
                "title": "Greater Flamingo — flight calls",
                "source": "xeno-canto",
                "sourceUrl": "https://xeno-canto.org/797505",
                "dur": 12,
                "lufs": -16.61,
                "truePeak": -1.65,
                "noise": -37.07,
                "snr": 21.88
          },
          "fox_033": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "qubodup",
                "title": "Fox Call - Cleanup of sound by Janneair",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/qubodup/sounds/192782/",
                "dur": 1.8,
                "lufs": -17.98,
                "truePeak": -7.8,
                "noise": -99.27,
                "snr": 80.32
          },
          "fox_034": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Soundburst",
                "title": "Fox Screams",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Soundburst/sounds/634005/",
                "dur": 1.8,
                "lufs": -17.92,
                "truePeak": -6.25,
                "noise": -49.31,
                "snr": 30.57
          },
          "fox_035": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Bpianoholic",
                "title": "Fox Mating Call",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Bpianoholic/sounds/511000/",
                "dur": 1.8,
                "lufs": -18,
                "truePeak": -4.64,
                "noise": -36.56,
                "snr": 16.36
          },
          "fox_037": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Yves Bas",
                "title": "Renard roux",
                "source": "iNaturalist",
                "sourceUrl": "https://www.inaturalist.org/observations/342879989",
                "dur": 1.8,
                "lufs": -18.92,
                "truePeak": -3.98,
                "noise": -34.51,
                "snr": 18.62
          },
          "frog_080": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "egomassive",
                "title": "Frog.ogg",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/egomassive/sounds/536759/",
                "dur": 0.57,
                "lufs": -18.14,
                "truePeak": -7.48,
                "noise": -120,
                "snr": 101.36
          },
          "frog_081": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "dashatron",
                "title": "Coqui.aif",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/dashatron/sounds/191524/",
                "dur": 0.9,
                "lufs": -17.98,
                "truePeak": -6.98,
                "noise": -72.93,
                "snr": 53.44
          },
          "frog_082": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "reinsamba",
                "title": "tree frog duett.mp3",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/reinsamba/sounds/15691/",
                "dur": 0.9,
                "lufs": -18.05,
                "truePeak": -6.09,
                "noise": -55.13,
                "snr": 36.27
          },
          "frog_083": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "daveincamas",
                "title": "200703101950PacificChorusFrogsSoloNR.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/daveincamas/sounds/32807/",
                "dur": 0.9,
                "lufs": -17.96,
                "truePeak": -7.17,
                "noise": -54.19,
                "snr": 35.83
          },
          "frog_085": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "SFXMint",
                "title": "Frog Croak 14",
                "source": "SFXMint",
                "sourceUrl": "https://sfxmint.com/sets/animal-calls",
                "dur": 0.9,
                "lufs": -17.96,
                "truePeak": -3.21,
                "noise": -63.28,
                "snr": 46
          },
          "frog_alt": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Garuda1982",
                "title": "frog croaking field recording",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Garuda1982/sounds/428536/",
                "dur": 12,
                "lufs": -14.17,
                "truePeak": -1.76,
                "noise": -30.67,
                "snr": 17.39
          },
          "frog_main": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "SpliceSound",
                "title": "Green frog, croaking.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/SpliceSound/sounds/188195/",
                "dur": 12,
                "lufs": -16.5,
                "truePeak": -1.73,
                "noise": -60.1,
                "snr": 45.04
          },
          "hedgehog_056": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "soundmary",
                "title": "hedgehog.mp3",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/soundmary/sounds/194938/",
                "dur": 2,
                "lufs": -22.36,
                "truePeak": -3.2,
                "noise": -32.38,
                "snr": 12.73
          },
          "hedgehog_057": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "juskiddink",
                "title": "Hedgehog.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/juskiddink/sounds/58289/",
                "dur": 2,
                "lufs": -22.15,
                "truePeak": -3.73,
                "noise": -29.65,
                "snr": 13.31
          },
          "hedgehog_058": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "ffdown",
                "title": "Hedgehog smell and run.mp3",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/ffdown/sounds/570301/",
                "dur": 2,
                "lufs": -22.02,
                "truePeak": -4.92,
                "noise": -24.8,
                "snr": 10.63
          },
          "long_tailed_tit_alt": {
                "license": "CC BY-SA 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
                "author": "Benoît Van Hecke",
                "title": "Long-tailed Tit — call, duet",
                "source": "xeno-canto",
                "sourceUrl": "https://xeno-canto.org/701097",
                "dur": 12,
                "lufs": -18.87,
                "truePeak": -4,
                "noise": -48.97,
                "snr": 30.08
          },
          "long_tailed_tit_main": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Lionel Triboulin",
                "title": "Long-tailed Tit — call",
                "source": "xeno-canto",
                "sourceUrl": "https://xeno-canto.org/1186424",
                "dur": 12,
                "lufs": -17.46,
                "truePeak": -1.02,
                "noise": -28.5,
                "snr": 12.34
          },
          "longtail_109": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Jose Gutierrez Higa",
                "title": "Long-tailed Tit",
                "source": "iNaturalist",
                "sourceUrl": "https://www.inaturalist.org/observations/360941705",
                "dur": 1.8,
                "lufs": -18.31,
                "truePeak": -4.65,
                "noise": -30.67,
                "snr": 12.64
          },
          "longtail_110": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Слава",
                "title": "Длиннохвостая синица",
                "source": "iNaturalist",
                "sourceUrl": "https://www.inaturalist.org/observations/244132625",
                "dur": 1.8,
                "lufs": -19.2,
                "truePeak": -3.2,
                "noise": -35.18,
                "snr": 19.96
          },
          "nightHeron_103": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Garuda1982",
                "title": "grey heron calls at night on lake",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Garuda1982/sounds/645157/",
                "dur": 2.2,
                "lufs": -18.45,
                "truePeak": -3.2,
                "noise": -40.06,
                "snr": 20.44
          },
          "night_heron_alt": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Philippe Grange",
                "title": "Black-crowned Night Heron — nocturnal flight call",
                "source": "xeno-canto",
                "sourceUrl": "https://xeno-canto.org/1186284",
                "dur": 1.15,
                "lufs": -12.46,
                "truePeak": -2.62,
                "noise": -21.87,
                "snr": 7.91
          },
          "night_heron_main": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Matthias Keller",
                "title": "Black-crowned Night Heron — nocturnal flight call",
                "source": "xeno-canto",
                "sourceUrl": "https://xeno-canto.org/1160373",
                "dur": 9.29,
                "lufs": -17.74,
                "truePeak": -1.76,
                "noise": -27.31,
                "snr": 10.14
          },
          "rabbit_021": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "kessir",
                "title": "Rabbit oinks and squeaks",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/kessir/sounds/372075/",
                "dur": 1.5,
                "lufs": -19.6,
                "truePeak": -3.2,
                "noise": -40.27,
                "snr": 25.35
          },
          "rabbit_024": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Naelin",
                "title": "Domestic Rabbit",
                "source": "iNaturalist",
                "sourceUrl": "https://www.inaturalist.org/observations/265568116",
                "dur": 1.5,
                "lufs": -17.24,
                "truePeak": -3.81,
                "noise": -52.03,
                "snr": 32.63
          },
          "redstart_104": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "reinsamba",
                "title": "1165black_ redstart.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/reinsamba/sounds/56302/",
                "dur": 2.5,
                "lufs": -18.03,
                "truePeak": -7.92,
                "noise": -57.05,
                "snr": 36.93
          },
          "redstart_106": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Sadiquecat",
                "title": "Feeding chicks - Blackredstart aka Rougequeue noir",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Sadiquecat/sounds/740067/",
                "dur": 2.5,
                "lufs": -19.12,
                "truePeak": -3.2,
                "noise": -42.51,
                "snr": 22.54
          },
          "redstart_107": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Igor Balashov",
                "title": "Горихвістка чорна",
                "source": "iNaturalist",
                "sourceUrl": "https://www.inaturalist.org/observations/373109329",
                "dur": 2.5,
                "lufs": -18.02,
                "truePeak": -5.85,
                "noise": -59.01,
                "snr": 37.64
          },
          "sheep_011": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "zachrau",
                "title": "Sheep bleating",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/zachrau/sounds/362283/",
                "dur": 1.2,
                "lufs": -18.13,
                "truePeak": -9.79,
                "noise": -61.19,
                "snr": 41.3
          },
          "sheep_012": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Yuval",
                "title": "sheep bleat outdoors",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Yuval/sounds/210511/",
                "dur": 1.2,
                "lufs": -18.4,
                "truePeak": -5.25,
                "noise": -57.98,
                "snr": 39.22
          },
          "sheep_013": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "HerbertBoland",
                "title": "Sheeheep.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/HerbertBoland/sounds/75190/",
                "dur": 1.2,
                "lufs": -18.08,
                "truePeak": -5.27,
                "noise": -29.42,
                "snr": 10.23
          },
          "sheep_014": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "n_audioman",
                "title": "Sheep_Bleat.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/n_audioman/sounds/321967/",
                "dur": 1.2,
                "lufs": -18,
                "truePeak": -6.48,
                "noise": -59.14,
                "snr": 40.03
          },
          "sheep_016": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Technopeasant",
                "title": "Baa",
                "source": "OpenGameArt",
                "sourceUrl": "https://opengameart.org/content/baby-animals-sounds-pack",
                "dur": 0.997,
                "lufs": -18.09,
                "truePeak": -10,
                "noise": -44.94,
                "snr": 24.26
          },
          "squirrel_046": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "bmccoy2",
                "title": "Squirrel Chatter 4 3 2016 Lincoln Nebraska .mp3",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/bmccoy2/sounds/342105/",
                "dur": 2.5,
                "lufs": -20.12,
                "truePeak": -3.2,
                "noise": -49.7,
                "snr": 29.82
          },
          "squirrel_047": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "philberts",
                "title": "Red_Squirrel_chatter.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/philberts/sounds/111393/",
                "dur": 2.5,
                "lufs": -18.07,
                "truePeak": -3.95,
                "noise": -32.76,
                "snr": 13.42
          },
          "squirrel_048": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Littlebrojay",
                "title": "squirrel chatter w city.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Littlebrojay/sounds/195440/",
                "dur": 2.5,
                "lufs": -18,
                "truePeak": -5.16,
                "noise": -45.21,
                "snr": 25.24
          },
          "squirrel_alt_alarm": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "genghisattenborough",
                "title": "Squirrel, Grey alarm calls",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/genghisattenborough/sounds/744596/",
                "dur": 12,
                "lufs": -18.85,
                "truePeak": -2.81,
                "noise": -48.42,
                "snr": 28.54
          },
          "squirrel_alt_squeal": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "TRP",
                "title": "Squirrel, cry call / squeal (Toronto backyard)",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/TRP/sounds/717582/",
                "dur": 12,
                "lufs": -18.16,
                "truePeak": -4.23,
                "noise": -74.29,
                "snr": 54.31
          },
          "squirrel_main": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "philberts",
                "title": "Red Squirrel chatter",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/philberts/sounds/111393/",
                "dur": 12,
                "lufs": -18.83,
                "truePeak": -1.37,
                "noise": -30.05,
                "snr": 11.08
          },
          "wolf_040": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "EminYILDIRIM",
                "title": "Wolf Crying Howl",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/EminYILDIRIM/sounds/541282/",
                "dur": 4.28,
                "lufs": -17.99,
                "truePeak": -8.36,
                "noise": -48.4,
                "snr": 30.21
          },
          "wren_114": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "Sacha.Julien",
                "title": "Wren song close",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Sacha.Julien/sounds/734533/",
                "dur": 3,
                "lufs": -18.32,
                "truePeak": -3.2,
                "noise": -43.37,
                "snr": 23.3
          },
          "wren_115": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "Coppersmith Barbet",
                "title": "WinterWren1.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/Coppersmith Barbet/sounds/33376/",
                "dur": 3,
                "lufs": -18.08,
                "truePeak": -7.75,
                "noise": -34.84,
                "snr": 16.52
          },
          "wren_116": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "wildear1",
                "title": "Winter Wren.mp3",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/wildear1/sounds/94845/",
                "dur": 3,
                "lufs": -18.06,
                "truePeak": -7.42,
                "noise": -32.05,
                "snr": 13.29
          },
          "wren_117": {
                "license": "CC0 1.0",
                "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
                "author": "hoshisato",
                "title": "The song of an Eurasian Wren",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/hoshisato/sounds/853671/",
                "dur": 3,
                "lufs": -18.06,
                "truePeak": -5.23,
                "noise": -34.33,
                "snr": 15.28
          },
          "wren_118": {
                "license": "CC BY 4.0",
                "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
                "author": "klankbeeld",
                "title": "winter wren wind leaves.wav",
                "source": "Freesound",
                "sourceUrl": "https://freesound.org/people/klankbeeld/sounds/265633/",
                "dur": 3,
                "lufs": -19.01,
                "truePeak": -3.2,
                "noise": -38.59,
                "snr": 21.45
          }
    },
  };
})(globalThis);
