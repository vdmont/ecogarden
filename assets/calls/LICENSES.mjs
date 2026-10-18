// 许可台账：每一条用到的外部音频素材，都必须在这里登记来源与许可。
//
// 这个文件是给人和给机器看的双重账本：
//   - 人要能一眼看出「这条声音哪来的、能不能商用、要不要署名」
//   - 机器要能对着 assets/calls/ 目录查「有没有漏登记的、有没有登记了但文件不存在的」
//
// ⚠ 本文件由 .dsh-reports/research/make-licenses.cjs 生成，不要手改。
//   要改先改生成器：许可信息是拿原始文件的 SHA1 去 Commons 反查回来的，
//   手工抄一遍就等于把「查证过的东西」变成「谁抄的谁负责」。
//
// 字段说明：
//   file         相对 assets/ 的路径，就是音频文件本身
//   genus        game's 里的属 key（一个属可以没有声音，用 KEEP_SYNTHETIC 标出来）
//   license      Commons 上的标准许可名，必须是允许再分发 + 允许商用的
//   licenseUrl   许可全文地址
//   sourceUrl    素材页面地址（不是文件直链，是人和版权方能看懂的页面）
//   commonsTitle Commons 上的原始文件名
//   author       作者 / 版权方
//   modified     我们对它做了什么（剪过、压过、降噪过……改了就是演绎，
//                所以带 modified 的素材一律不能是 ND 许可）
//   fetchedAt    取得日期（取自原始文件的修改时间）
//   sha1         原始文件的 SHA1。反查 Commons 就是靠它，
//                任何人拿这个哈希都能复核「我们登记的这条就是这条」
//
// 许可门槛（AGENTS.md 第 9 节）：只收 CC0 / CC-BY / CC-BY-SA / Public Domain。
// 排除 CC-BY-NC（不许商用）、CC-BY-ND（不许改，而剪/压缩就是改）。
// 本批 27 条的许可分布：{"CC BY-SA 4.0":11,"CC BY-SA 3.0":7,"CC0":4,"Public domain":4,"CC BY 3.0":1}

const ASSET_LICENSES = [
  {
    file: 'calls/bird-0.mp3',
    genus: 'bird',
    label: '通用飞鸟（画眉 Erithacus rubecula）',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Erithacus_rubecula_-_European_Robin_XC503644.mp3',
    commonsTitle: 'File:Erithacus rubecula - European Robin XC503644.mp3',
    author: 'Jochem verweij',
    modified:
      '取 6.5–8.2s；掐掉首尾静音（成片 1.70s）；高通 120 Hz；归一化（净 +27.5 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '8586dc040fe5ea8c6cfcf1bd39b8b0ca6c8f1341',
  },
  {
    file: 'calls/nightHeron-0.mp3',
    genus: 'nightHeron',
    label: '夜鹭 Nycticorax nycticorax',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nycticorax_nycticorax_-_Black-crowned_Night_Heron_XC543137.mp3',
    commonsTitle: 'File:Nycticorax nycticorax - Black-crowned Night Heron XC543137.mp3',
    author: 'Luis Alvarez Menendez',
    modified:
      '取 2.7–4.2s；掐掉首尾静音（成片 1.50s）；高通 200 Hz；轻降噪 强度 0.35；归一化（净 +31.3 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '33978ca9e5e05b9e5967a667f35526be1db5f70b',
  },
  {
    file: 'calls/redstart-0.mp3',
    genus: 'redstart',
    label: '红尾水鸲 Phoenicurus phoenicurus',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Common_Redstart_(Phoenicurus_phoenicurus)_(W1CDR0001505_BD3).ogg',
    commonsTitle: 'File:Common Redstart (Phoenicurus phoenicurus) (W1CDR0001505 BD3).ogg',
    author: '英国国家图书馆（British Library）提供；野外录音：Aubrey John Williams',
    modified:
      '取 9.2–13.0s；掐掉首尾静音（成片 3.80s）；高通 120 Hz；归一化（净 +2.2 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '4dc7114eaa5adddbc0259fd2abdd2ce860776862',
  },
  {
    file: 'calls/longtail-0.mp3',
    genus: 'longtail',
    label: '北长尾山雀 Aegithalos caudatus',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Aegithalos_caudatus_-_Long-tailed_Tit_-_XC114614.ogg',
    commonsTitle: 'File:Aegithalos caudatus - Long-tailed Tit - XC114614.ogg',
    author: 'Jonathon Jongsma',
    modified:
      '取 2.8–5.0s；掐掉首尾静音（成片 2.20s）；高通 200 Hz；轻降噪 强度 0.35；归一化（净 +5.3 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: 'ed289877253ca09f849f59de5323b8b4a20a4d50',
  },
  {
    file: 'calls/longtail-1.mp3',
    genus: 'longtail',
    label: '北长尾山雀 Aegithalos caudatus',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Aegithalos_caudatus_-_Long-tailed_Tit_XC424195.mp3',
    commonsTitle: 'File:Aegithalos caudatus - Long-tailed Tit XC424195.mp3',
    author: 'Borja',
    modified:
      '取 72.5–76.5s；掐掉首尾静音（成片 4.00s）；高通 700 Hz；轻降噪 强度 0.4；归一化（净 +15.0 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '9d4a2ea679edbc88f5f9c493662d6ecc1f3ff52b',
  },
  {
    file: 'calls/wren-0.mp3',
    genus: 'wren',
    label: '冬鹪鹩 Troglodytes troglodytes',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Troglodytes_troglodytes_-_Eurasian_Wren_XC125791.ogg',
    commonsTitle: 'File:Troglodytes troglodytes - Eurasian Wren XC125791.ogg',
    author: 'Dan Stowell',
    modified:
      '取 2.5–4.2s；掐掉首尾静音（成片 1.70s）；高通 400 Hz；归一化（净 +8.5 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '7a5c39d963143ed989a8fdcf791b25f8d9ff02ad',
  },
  {
    file: 'calls/canis-0.mp3',
    genus: 'canis',
    label: '犬科 Canis（灰狼 + 3 种家犬共用）',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Barking_of_a_dog.ogg',
    commonsTitle: 'File:Barking of a dog.ogg',
    author: 'Amada44',
    modified:
      '取 0.2–2.3s；掐掉首尾静音（成片 2.10s）；高通 100 Hz；归一化（净 -3.0 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '2dc95fc596ea2601b685a9dc569b2e82859cc6cc',
  },
  {
    file: 'calls/fox-0.mp3',
    genus: 'fox',
    label: '狐狸 Vulpes vulpes',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vulpes_vulpes,_at_Henclov%C3%A1,_Slovakia_XC108315.mp3',
    commonsTitle: 'File:Vulpes vulpes, at Henclová, Slovakia XC108315.mp3',
    author: 'Alexander Kurthy',
    modified:
      '取 2.0–3.4s；掐掉首尾静音（成片 1.40s）；高通 120 Hz；归一化（净 +15.1 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '5f43d99d80c9dc8706d9b5f0d3b7fb5f3f149a04',
  },
  {
    file: 'calls/cat-0.mp3',
    genus: 'cat',
    label: '猫 Felis catus（4 种猫共用）',
    license: 'CC0',
    licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Maullido_de_gata_hembra.ogg',
    commonsTitle: 'File:Maullido de gata hembra.ogg',
    author: 'George Miquilena',
    modified:
      '取 0.0–1.2s；掐掉首尾静音（成片 1.19s）；高通 80 Hz；增益 -4 dB；归一化（净 -2.8 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '0464967b04aa5581816da0b0b19b2fea3b565050',
  },
  {
    file: 'calls/cat-1.mp3',
    genus: 'cat',
    label: '猫 Felis catus（4 种猫共用）',
    license: 'Public domain',
    licenseUrl: '',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Meow_of_a_pleading_cat.oga',
    commonsTitle: 'File:Meow of a pleading cat.oga',
    author: 'Heismark',
    modified:
      '取 3.4–5.0s；掐掉首尾静音（成片 1.40s）；高通 80 Hz；归一化（净 -2.4 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '337a0fc263567775dcf5e9d65a0e80f9e115712b',
  },
  {
    file: 'calls/cat-2.mp3',
    genus: 'cat',
    label: '猫 Felis catus（4 种猫共用）',
    license: 'CC0',
    licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Meow_of_a_Siamese_cat_-_freemaster2.wav',
    commonsTitle: 'File:Meow of a Siamese cat - freemaster2.wav',
    author: 'freemaster2',
    modified:
      '取 0.0–1.1s；掐掉首尾静音（成片 1.10s）；高通 80 Hz；增益 -8 dB；归一化（净 +1.9 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '2bd855be3604b65aea38a313ef7baaf9f85e5827',
  },
  {
    file: 'calls/cat-3.mp3',
    genus: 'cat',
    label: '猫 Felis catus（4 种猫共用）',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Audio_file_of_cat_meowing.ogg',
    commonsTitle: 'File:Audio file of cat meowing.ogg',
    author: 'Yair Haklai',
    modified:
      '取 25.1–28.6s；掐掉首尾静音（成片 3.50s）；高通 90 Hz；归一化（净 +14.8 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '19499ec3b95084b119668c3d6b8f4dd64f3871e4',
  },
  {
    file: 'calls/cat-4.mp3',
    genus: 'cat',
    label: '猫 Felis catus（4 种猫共用）',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Felis_silvestris_catus_meows.ogg',
    commonsTitle: 'File:Felis silvestris catus meows.ogg',
    author: 'Tobias Puderer',
    modified:
      '取 3.7–5.4s；掐掉首尾静音（成片 1.70s）；高通 80 Hz；归一化（净 +3.6 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '9ecb3bdf58373ad6459c71a1d54741e7b8f71ae5',
  },
  {
    file: 'calls/chicken-0.mp3',
    genus: 'chicken',
    label: '鸡 Gallus（公鸡 + 母鸡）',
    license: 'Public domain',
    licenseUrl: '',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Medium_rooster_crowing.ogg',
    commonsTitle: 'File:Medium rooster crowing.ogg',
    author: 'alys',
    modified:
      '取 0.8–5.5s；掐掉首尾静音（成片 4.70s）；高通 80 Hz；增益 -5 dB；归一化（净 -4.9 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '31a18ee41bf2898d310f12004199423d94b9c610',
  },
  {
    file: 'calls/chicken-1.mp3',
    genus: 'chicken',
    label: '鸡 Gallus（公鸡 + 母鸡）',
    license: 'Public domain',
    licenseUrl: '',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hen_announcing_shes_lain_an_egg.ogg',
    commonsTitle: 'File:Hen announcing shes lain an egg.ogg',
    author: 'alys',
    modified:
      '取 3.5–5.5s；掐掉首尾静音（成片 2.00s）；高通 100 Hz；增益 -5 dB；归一化（净 -3.2 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '9a5e2673beaffe6b1de8a0ad494eb04399deef34',
  },
  {
    file: 'calls/sheep-0.mp3',
    genus: 'sheep',
    label: '羊 Ovis',
    license: 'CC0',
    licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sheep_bleat.ogg',
    commonsTitle: 'File:Sheep bleat.ogg',
    author: 'Eviatar Bach',
    modified:
      '取 0.0–0.5s；掐掉首尾静音（成片 0.50s）；高通 70 Hz；归一化（净 +18.5 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '5432bbb6d9ca4a11cd72f3648686e444cdf13340',
  },
  {
    file: 'calls/sheep-1.mp3',
    genus: 'sheep',
    label: '羊 Ovis',
    license: 'Public domain',
    licenseUrl: '',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sheep_bleating.ogg',
    commonsTitle: 'File:Sheep bleating.ogg',
    author: 'earthcalling',
    modified:
      '取 2.5–4.5s；掐掉首尾静音（成片 2.00s）；高通 70 Hz；归一化（净 +15.0 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: 'b9f1e382cd830df067eb3bc4e83186b468dd581e',
  },
  {
    file: 'calls/sheep-2.mp3',
    genus: 'sheep',
    label: '羊 Ovis',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lamb_bleating_and_its_mother%27s_response.flac',
    commonsTitle: 'File:Lamb bleating and its mother\'s response.flac',
    author: 'Yosef Ben Melamed',
    modified:
      '取 2.2–4.4s；掐掉首尾静音（成片 2.20s）；高通 70 Hz；归一化（净 +21.0 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: 'ce7983ba7a11de0780428fef44f04de2247c2705',
  },
  {
    file: 'calls/deer-0.mp3',
    genus: 'deer',
    label: '鹿 Cervus elaphus',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Red_Deer_(Cervus_elaphus)_(W1CDR0001424_BD3).ogg',
    commonsTitle: 'File:Red Deer (Cervus elaphus) (W1CDR0001424 BD3).ogg',
    author: '英国国家图书馆（British Library）提供；原始录音者未在素材页标注',
    modified:
      '取 33.5–37.5s；掐掉首尾静音（成片 4.00s）；高通 80 Hz；增益 -18 dB；归一化（净 +18.5 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: 'b97dc45a02d54a4cc714c0a110f3bc67c6dda546',
  },
  {
    file: 'calls/squirrel-0.mp3',
    genus: 'squirrel',
    label: '松鼠 Sciurus',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Squirrel_calls.wav',
    commonsTitle: 'File:Squirrel calls.wav',
    author: 'Arunasank',
    modified:
      '取 3.5–5.5s；掐掉首尾静音（成片 2.00s）；高通 200 Hz；归一化（净 +27.7 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '83d893d54606ba5bc26d7203ad00ed06901c0f90',
  },
  {
    file: 'calls/squirrel-1.mp3',
    genus: 'squirrel',
    label: '松鼠 Sciurus',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Grey_Squirrel_(Sciurus_carolinensis)_(W1CDR0001470_BD12).ogg',
    commonsTitle: 'File:Grey Squirrel (Sciurus carolinensis) (W1CDR0001470 BD12).ogg',
    author: '英国国家图书馆（British Library）提供；原始录音者未在素材页标注',
    modified:
      '取 6.2–8.1s；掐掉首尾静音（成片 1.90s）；高通 90 Hz；归一化（净 +4.0 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: 'a8fa5e9627dd63a87ae0ee036b23a5270ad4b1fc',
  },
  {
    file: 'calls/squirrel-2.mp3',
    genus: 'squirrel',
    label: '松鼠 Sciurus',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Indian_Palm_Squirrel_-_chip_chip_chip_sound.ogg',
    commonsTitle: 'File:Indian Palm Squirrel - chip chip chip sound.ogg',
    author: 'Manojk',
    modified:
      '取 26.0–28.5s；掐掉首尾静音（成片 2.50s）；高通 300 Hz；归一化（净 +0.2 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '2d38ba9760f08fea252e5e640a6781efa3cdd7c8',
  },
  {
    file: 'calls/hedgehog-0.mp3',
    genus: 'hedgehog',
    label: '刺猬 Erinaceus（占位音）',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Troglodytes_troglodytes_-_Eurasian_Wren_XC125791.ogg',
    commonsTitle: 'File:Troglodytes troglodytes - Eurasian Wren XC125791.ogg',
    author: 'Dan Stowell',
    modified:
      '取 2.5–4.2s；掐掉首尾静音（成片 1.70s）；高通 200 Hz；低通 3500 Hz；升调 ×0.70；归一化（净 +15.3 dB）；首尾淡入淡出；48 kbps 单声道 MP3；⚠ 借用 wren 的原声',
    fetchedAt: '2026-10-18',
    sha1: '7a5c39d963143ed989a8fdcf791b25f8d9ff02ad',
  },
  {
    file: 'calls/rabbit-0.mp3',
    genus: 'rabbit',
    label: '兔 Oryctolagus',
    license: 'CC0',
    licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rabbit_oinks_and_squeaks.wav',
    commonsTitle: 'File:Rabbit oinks and squeaks.wav',
    author: 'kessir',
    modified:
      '取 8.8–13.2s；掐掉首尾静音（成片 4.40s）；高通 80 Hz；增益 -5 dB；归一化（净 +10.0 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: '8892155415b3adca6cea0ba68fedd94091517f64',
  },
  {
    file: 'calls/frog-0.mp3',
    genus: 'frog',
    label: '蛙 Rana',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rana_temporaria_120329-015849.ogg',
    commonsTitle: 'File:Rana temporaria 120329-015849.ogg',
    author: 'Gilles San Martin',
    modified:
      '取 1.0–2.0s；掐掉首尾静音（成片 1.00s）；高通 80 Hz；归一化（净 +3.4 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: 'b81b8e81cc0a71b172446003f96674bf5f15b677',
  },
  {
    file: 'calls/bee-0.mp3',
    genus: 'bee',
    label: '蜜蜂 Apis mellifera',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:BioAcoustica_413-2_Apis_mellifera_524_.flac',
    commonsTitle: 'File:BioAcoustica 413-2 Apis mellifera 524 .flac',
    author: 'BioAcoustica 生态声学数据库（记录页 bio.acousti.ca/node/9372）',
    modified:
      '取 1.0–9.0s；掐掉首尾静音（成片 8.00s）；高通 70 Hz；增益 -4 dB；归一化（净 +15.1 dB）；首尾淡入淡出；48 kbps 单声道 MP3',
    fetchedAt: '2026-10-18',
    sha1: 'd59eb788a1d5e25e1aaa060424391e4c6b069cb7',
  },
  {
    file: 'calls/flamingo-0.mp3',
    genus: 'flamingo',
    label: '火烈鸟 Phoenicopterus roseus（占位音）',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Erithacus_rubecula_-_European_Robin_XC503644.mp3',
    commonsTitle: 'File:Erithacus rubecula - European Robin XC503644.mp3',
    author: 'Jochem verweij',
    modified:
      '取 6.5–8.2s；掐掉首尾静音（成片 1.70s）；高通 60 Hz；低通 1800 Hz；降调 ×1.35；增益 -3 dB；归一化（净 +30.8 dB）；首尾淡入淡出；48 kbps 单声道 MP3；⚠ 借用 bird 的原声',
    fetchedAt: '2026-10-18',
    sha1: '8586dc040fe5ea8c6cfcf1bd39b8b0ca6c8f1341',
  },
];

// 神话生物：现实中不存在，没有真实录音，继续用实时合成。
export const MYTHICAL = ["dragon","pixiu","baize"];

// 有真实录音但找不到可用素材、继续用实时合成的属。
// 依据 AGENTS.md 第 9 节：缺素材不硬凑，宁可留着合成的。
export const KEEP_SYNTHETIC = {
  boar: "Commons 上唯一一条 Sus scrofa 是 Lingua Libre 的念词录音",
  alpaca: "只有一条 29 MB 克丘亚语「牧羊人吹口哨赶羊驼」，内容不可控且体积离谱",
  capybara: "全部是各语言念 capybara 这个词的读音录音",
  bug: "幼虫本身不发声，没有可用的野外录音",
  butterfly: "蝴蝶没有鸣叫器官",
};

export default ASSET_LICENSES;
