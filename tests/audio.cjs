const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let notes = 0;
const mediaSources = [];
const fetched = [];
// 录音用的缓冲区源。放完要手动敲 onended，才能测「在响的只数会不会归零」。
const bufferSources = [];

// Web Audio 桩：发声层用到振荡器（含 detune / setPeriodicWave）、增益、滤波器、
// 噪声缓冲、缓冲区源、以及卷积混响，全部要能造出来。
//
// ⚠ 每个节点的参数对象必须是**各自独立**的。原来全部分到同一个 `param` 上，
//   读任何节点的 .gain.value 读到的都是"最后一次被谁写过"——
//   拿它断言音量会得到一个看起来对、其实毫无意义的数字。
//
//   而且排程的方法要真的改 value：真实浏览器里 ramp 是渐变过去的，
//   桩里没法模拟时间，就让它落到终点值——这样"目标音量有没有被拧过去"
//   仍然验得到，而"过渡平滑不平滑"按文件开头的说明一律留给浏览器实测。
const mkParam = (v = 0) => ({
  value: v,
  setValueAtTime(x) {
    this.value = x;
  },
  linearRampToValueAtTime(x) {
    this.value = x;
  },
  exponentialRampToValueAtTime(x) {
    this.value = x;
  },
  cancelScheduledValues() {},
});
const node = () => ({
  gain: mkParam(),
  frequency: mkParam(),
  detune: mkParam(),
  playbackRate: mkParam(),
  Q: mkParam(),
  type: '',
  buffer: null,
  connect() {
    return this;
  },
  disconnect() {},
  start() {
    notes++;
  },
  stop() {},
  setPeriodicWave() {},
  frequency0: 0,
});
class AudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
    this.sampleRate = 44100;
  }
  createGain() {
    return node();
  }
  createOscillator() {
    return node();
  }
  createBiquadFilter() {
    return node();
  }
  createConvolver() {
    return node();
  }
  // 环境声混音会挂 AnalyserNode 测 BGM 与动物声的能量，必须能造出来。
  createAnalyser() {
    return {
      fftSize: 0,
      getFloatTimeDomainData(a) {
        a.fill(0);
      },
      connect(d) {
        return d;
      },
      disconnect() {},
    };
  }
  // 背景音乐接进 WebAudio 才能被测量；接了之后元素音量必须保持 1。
  createMediaElementSource(el) {
    mediaSources.push(el);
    return node();
  }
  decodeAudioData() {
    return Promise.resolve({
      numberOfChannels: 1,
      duration: 1,
      getChannelData: () => new Float32Array(8),
    });
  }
  createPeriodicWave() {
    return {};
  }
  createBuffer(ch, len) {
    return {
      getChannelData() {
        return new Float32Array(len);
      },
    };
  }
  createBufferSource() {
    const s = node();
    // 录音放完要有人通知，否则测不了「在响的只数会不会归零」。
    // 真浏览器里是 AudioBufferSourceNode.onended；桩里手动触发。
    bufferSources.push(s);
    return s;
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  suspend() {
    this.state = 'suspended';
  }
}

// HTMLAudioElement 桩：背景音乐走的是真实录音，不再实时合成，所以这里要能造播放器。
const players = [];
class FakeAudio {
  constructor() {
    this.paused = true;
    this.plays = 0;
    this.pauses = 0;
    this.volume = 1;
    this.src = '';
    this.preload = '';
    players.push(this);
  }
  play() {
    this.paused = false;
    this.plays++;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    this.pauses++;
  }
}

global.window = { AudioContext };
global.Audio = FakeAudio;
global.document = { hidden: false, addEventListener() {} };
// 真实录音是 fetch 进来的音频文件，这里记下请求过的路径。
global.fetch = function (u) {
  fetched.push(u);
  return Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
};
require('./load.cjs');
require('../src/ui/audio.js');

// ══════════════ 背景音乐：三首真实录音，随机连播 ══════════════
const TRACKS = GardenAudio.MUSIC_TRACKS;
assert(TRACKS.length >= 2, '曲库少于两首，没法「随机循环」');
const assetOf = (t) => path.resolve(__dirname, '..', t);
for (const t of TRACKS) {
  const p = assetOf(t);
  assert(fs.existsSync(p), '曲库里的文件不存在: ' + t);
  assert(
    fs.statSync(p).size > 200 * 1024,
    t + ' 只有 ' + Math.round(fs.statSync(p).size / 1024) + ' KB，像是空的',
  );
}

GardenAudio.unlock({ music: true, sound: true });
assert.equal(players.length, 1, '解锁后没有创建音乐播放器');
const bg = players[0];
assert(TRACKS.includes(bg.src), '放的不是曲库里的曲子: ' + bg.src);
assert.equal(bg.paused, false, '解锁后音乐没有开始播放');
assert.equal(bg.volume, 1, '接进音频图之后元素音量必须保持 1，否则会被乘两次');
assert.equal(GardenAudio.musicLevel(), GardenAudio.MUSIC_VOLUME, '实际生效的音乐音量不是设定值');
assert.equal(GardenAudio.musicMetered(), true, '背景音乐没接进音频图，就没法测它的能量');

// —— 静音开关必须真的把音乐停下来 ——
GardenAudio.configure({ music: false, sound: true });
assert.equal(bg.paused, true, '关掉音乐后仍在播放');
GardenAudio.configure({ music: true, sound: true });
assert.equal(bg.paused, false, '重新打开音乐后没有恢复播放');

// —— 一首放完要随机换一首，且不能连着放同一首 ——
const seq = [bg.src];
for (let i = 0; i < 60; i++) {
  bg.onended();
  seq.push(bg.src);
}
for (let i = 1; i < seq.length; i++) assert(seq[i] !== seq[i - 1], '连着放了两首一样的: ' + seq[i]);
assert(new Set(seq).size === TRACKS.length, '60 次随机里只用到 ' + new Set(seq).size + ' 首');
assert.equal(players.length, 1, '每换一首就新建一个播放器，会互相盖住');

// —— 取不到的曲子要跳过：整个曲库试完就收手，不能无限重试 ——
const playsBefore = bg.plays;
for (let i = 0; i < TRACKS.length + 3; i++) bg.onerror();
// 最后一次 error 会先把「已失败次数」顶到曲库大小再返回，所以是 N-1 次重试：
// 首发出错 → 再试 N-1 次 → 整个曲库试完，停手。
assert.equal(
  bg.plays - playsBefore,
  TRACKS.length - 1,
  '曲子取不到时的重试次数对不上（应为曲库大小减一）',
);
assert.equal(players.length, 1, '取不到曲子时新建了播放器');
console.log(
  `PASS 背景音乐：${TRACKS.length} 首真实录音随机连播、静音开关有效、` +
    `60 次换曲无重复、缺文件会跳过（共 ${TRACKS.reduce((s, t) => s + Math.round(fs.statSync(assetOf(t)).size / 1024), 0)} KB）`,
);

// ══════════════ 叫声：按物种分组 + 录音/合成两条路 ══════════════
// 有真实录音的物种走文件（不发合成音），没有的走实时合成。两条都要能出声。
GardenAudio.configure({ music: false, sound: true });
const before = notes;
GardenAudio.pet('ragdoll', { music: false, sound: false });
assert.equal(notes, before, '关掉音效后仍在发声');

const species = [...Object.keys(Eco.LIFE), ...Object.keys(EcoData.VISITORS)];
const withRecording = new Set();
const withoutRecording = new Set();
for (const type of species) {
  const g = GardenAudio.genusOf(type);
  assert(g, type + ' 没有分到属');
  const n = notes;
  GardenAudio.pet(type, { music: false, sound: true });
  // 录音表是**按物种**建的（素材包给每种动物独立录音与变调），不是按属。
  // 所以这里问的是这个物种有没有录音，而不是它那个属有没有。
  if (GardenAudio.hasCall(type)) {
    // 录音是异步加载的（先 fetch 再 decode），所以这里看"有没有发起一次录音播放"，
    // 而不是等它真的响——那是浏览器里的事。
    const rp = GardenAudio._mix().recordPlays;
    GardenAudio.pet(type, { music: false, sound: true });
    assert(
      GardenAudio._mix().recordPlays > rp || notes > n,
      type + ' 有录音，却什么都没响',
    );
    withRecording.add(type);
  } else {
    assert(notes > n, type + ' 没有录音也没发出合成音');
    withoutRecording.add(type);
  }
}
console.log(
  `PASS 音效开关；${withRecording.size} 个物种用真实录音，` +
    `${withoutRecording.size} 个物种走实时合成（${[...withoutRecording].join(' ') || '无'}）`,
);

// —— 属级分组必须符合分类学，不能为了省事乱合并 ——
// 狼与家犬同属 Canis，共用一段是合理的；
// 狐狸 *Vulpes*、刺猬 *Erinaceus*、松鼠 *Sciurus* 属各不相同，绝不能混为一类。
assert.equal(GardenAudio.genusOf('wolf'), 'canis', '狼的属不对');
for (const k of Object.keys(EcoData.VISITORS)) {
  if (EcoData.VISITORS[k][1] === 'dog')
    assert.equal(GardenAudio.genusOf(k), 'canis', '家犬应当与狼同属 Canis：' + k);
}
assert.equal(GardenAudio.genusOf('fox'), 'fox');
assert.equal(GardenAudio.genusOf('hedgehog'), 'hedgehog');
assert.equal(GardenAudio.genusOf('squirrel'), 'squirrel');
assert.notEqual(GardenAudio.genusOf('fox'), GardenAudio.genusOf('wolf'), '狐狸和狼被混成一类了');
assert.notEqual(
  GardenAudio.genusOf('hedgehog'),
  GardenAudio.genusOf('squirrel'),
  '刺猬和松鼠被混成一类了',
);
// 羊 *Ovis* 与羊驼 *Vicugna* 不是同属；羊驼没有录音，必须留合成而不是蹭羊的
assert.notEqual(GardenAudio.genusOf('alpaca'), GardenAudio.genusOf('sheep'), '羊驼不该和羊共用');

// —— 每个录音文件都必须在盘上存在，且不是空的 ——
for (const [g, list] of Object.entries(GardenAudio.CALL_FILES)) {
  assert(list.length > 0, g + ' 的录音列表是空的');
  for (const f of list) {
    const p = assetOf(f);
    assert(fs.existsSync(p), '录音文件不存在: ' + f);
    assert(
      fs.statSync(p).size > 512,
      f + ' 只有 ' + Math.round(fs.statSync(p).size / 1024) + ' KB',
    );
  }
}

// ══════════════ 空间混音模型：验收要求里能在 Node 里验的那些 ══════════════
//
// 这里只验**公式与常量**。真实的平滑曲线、片段链、能量实测必须在浏览器里验
// （.dsh-reports/research/probe-calls.mjs）：Web Audio 的时间在 Node 桩里是
// frozen 的，量出来的过渡全是假的——上一轮就因为这个把陈旧值当成真值。
{
  const M = GardenAudio.MIX;

  // 验收 8：归一化目标必须落在 0.2–0.4
  assert(
    M.clipRms >= M.clipRmsMin && M.clipRms <= M.clipRmsMax,
    '归一化目标 ' + M.clipRms + ' 不在要求的 ' + M.clipRmsMin + '–' + M.clipRmsMax + ' 区间',
  );
  // 峰值上限必须小于 1，否则归一化之后仍可能削波
  assert(M.clipPeak < 1, '峰值上限 ' + M.clipPeak + ' ≥ 1，归一化后仍会削波');

  // 验收 7：平滑时间常数必须在要求的 0.3–0.8 秒之间
  assert(
    M.smoothTau >= 0.3 && M.smoothTau <= 0.8,
    '平滑时间常数 ' + M.smoothTau + ' 不在要求的 0.3–0.8 秒',
  );

  // 验收 1：全局视角动物声只是很小的环境声 —— zoomMin 要远小于 zoomMax
  assert(M.zoomMin > 0 && M.zoomMin < M.zoomMax * 0.3, '全局视角的动物声不够小');
  // 验收 3：锁定要有额外抬升，不然"锁定谁"在混音上毫无区别
  assert(M.lockBoost > 1.2, '锁定的那只没有被额外抬高');
  // 验收 9：BGM 让位但不能压没
  assert(M.bgmDuckMin > 0.5 && M.bgmDuckMin <= 1, 'BGM 让位太多或完全没让位');
  // 验收 6：交叉淡化要够短（否则叠音）又不能是 0（会"啪"）
  assert(M.xfadeSec > 0.02 && M.xfadeSec < 0.5, '交叉淡化时长离谱：' + M.xfadeSec);
  // 验收 4：同屏多源要能叠，但 31 种全放就是菜市场
  assert(M.maxVoices >= 2, '同屏多种同时发声做不到');
  assert(M.maxVoices <= 8, '同时在响的物种太多，会变成一片糊');
  assert(M.voiceFloor > 0 && M.voiceFloor < 0.2, '视口边缘之外的淡出阈值不对：' + M.voiceFloor);
}
console.log(
  'PASS 空间混音常量符合验收要求：归一化 ' +
    GardenAudio.MIX.clipRms +
    '（要求 ' +
    GardenAudio.MIX.clipRmsMin +
    '–' +
    GardenAudio.MIX.clipRmsMax +
    '）、时间常数 ' +
    GardenAudio.MIX.smoothTau +
    's（要求 0.3–0.8）、全局 ' +
    GardenAudio.MIX.zoomMin +
    ' → 最近 ' +
    GardenAudio.MIX.zoomMax +
    '、锁定 ×' +
    GardenAudio.MIX.lockBoost +
    '、最多 ' +
    GardenAudio.MIX.maxVoices +
    ' 个声源、淡化 ' +
    GardenAudio.MIX.xfadeSec +
    's',
);

// ══════════════ 设置里的开关与滑杆：真的拧得动吗 ══════════════
//
// 这一段是被项目所有者发现的 bug 逼出来的：设置里的「动物叫声与音效」
// 点着没反应，勾不勾小动物都在叫。根因是 configure() 只处理音乐，
// 环境声那一层压根没看 settings.sound。
//
// 这里断言的是**真实的总线增益**，所以测试桩里每个节点的 gain 必须是
// 独立对象——共用一个的话读到的永远是"最后一个写过它的人"。
{
  const amb = GardenAudio._ambientGain();
  assert(amb, '没有拿到动物声总线的增益参数');
  const base = { music: true, sound: true, musicVolume: 1, callVolume: 1 };
  GardenAudio.configure(base);
  assert(Math.abs(amb.value - 1) < 1e-6, '默认音量应该是 1，实际 ' + amb.value);

  // 取消勾选 → 整层静音
  GardenAudio.configure({ ...base, sound: false });
  assert(amb.value === 0, '取消「动物叫声与音效」之后动物声没有归零，实际 ' + amb.value);

  // 勾回来 → 恢复满音量
  GardenAudio.configure(base);
  assert(Math.abs(amb.value - 1) < 1e-6, '勾回来之后没有恢复满音量，实际 ' + amb.value);

  // 老存档里没有这个字段 → 回到默认满音量，而不是 0（哑掉）
  GardenAudio.configure({ music: true });
  assert(Math.abs(amb.value - 1) < 1e-6, '缺 sound 字段的老设置没有回到默认音量，实际 ' + amb.value);

  // BGM 那一层不在这儿断言：它的目标值是在 updateSpatial 里按"让位系数 ×
  // 音乐音量"算的，而那个函数靠真实经过的时间往前推。Node 桩里时间是假的，
  // 断言会得到一个看起来合理的假数字。音乐滑杆在浏览器探针里量
  // （probe-settings.mjs）。

  // 勾回来但滑杆拉到 30% → 只剩三成
  GardenAudio.configure({ ...base, callVolume: 0.3 });
  assert(Math.abs(amb.value - 0.3) < 1e-6, '动物音量滑杆没生效，实际 ' + amb.value);

  // 越界必须被夹住：坏存档里的 99 不能让一开声音就炸
  GardenAudio.configure({ ...base, callVolume: 99 });
  assert(amb.value === 1, '超出范围的音量没有被夹到 1，实际 ' + amb.value);
  GardenAudio.configure({ ...base, callVolume: -3 });
  assert(amb.value === 0, '负音量没有被夹到 0，实际 ' + amb.value);

  // 静音优先于滑杆：滑杆拉满但开关关着，还是必须没声
  GardenAudio.configure({ ...base, callVolume: 1, sound: false });
  assert(amb.value === 0, '开关关着的时候滑杆不该把声音放出来');

  GardenAudio.configure(base);
}
// ══════════════ 听感微调旋钮（TUNE.musicDb / TUNE.callsDb）══════════════
//
// 文件顶部那两行是给项目所有者手动调的。他会直接编辑这两个数字，
// 所以这里要保证「写错也不会把音轨调成哑的」：写错类型、写成字符串、
// 写到离谱大，都必须夹回安全范围，而不是产生 NaN 把整条音轨弄没。
{
  const t = GardenAudio._tune();
  assert(t, '没有暴露 TUNE 微调旋钮的读数');
  for (const k of ['musicDb', 'callsDb']) {
    assert(
      typeof t[k] === 'number' && Number.isFinite(t[k]),
      k + ' 不是有限数字（改了之后必须仍是数字）：' + JSON.stringify(t[k]),
    );
    assert(t[k] >= -24 && t[k] <= 12, k + ' 超出安全范围（−24…12 dB）：' + t[k]);
    // 换算必须与 dbToGain 的公式一致，别让注释里的倍数和实际对不上
    const expect = Math.pow(10, t[k] / 20);
    const key = k === 'musicDb' ? 'musicTrim' : 'callsTrim';
    assert(Math.abs(t[key] - expect) < 1e-4, k + ' 换算对不上：' + t[key] + ' vs ' + expect);
  }
  // 当前是 0 dB 时，两边都不该有额外增减——否则「改之前」和「改之后」没法比
  console.log(
    'PASS 听感微调旋钮：音乐 ' + t.musicDb + ' dB（×' + t.musicTrim + '）、动物 ' +
      t.callsDb + ' dB（×' + t.callsTrim + '）',
  );
}
console.log('PASS 音量滑杆：静音生效、比例生效、越界被夹住、开关优先于滑杆、老存档回默认');

// ══════════════ 素材包映射：有录音的逐条核对，没有的必须在例外名单里 ══════════════
//
// 2026-10-19 起，库里 10 条 CC BY-NC 素材被全部删掉（项目所有者决定）：
// NC 是单向门——将来收费时再删，不能消除已经发生的违约，所以提前删干净。
// 同日小鹿的 deer_029 也因为「素材本身不行」被点名删掉。
// 萨摩耶的空洞（原来只有 NC 的 dog_073 一条）后来用 CC0 的狗叫补上了；
// 小鹿这批素材里没有，仍然是空的。
// 例外名单是**双向**的：名单里的物种一旦补上素材，测试会反过来报
// 「已经有录音了，把这条从名单里删掉」，不会悄悄放过。
const NO_RECORDING = new Set(['deer']);
{
  const S = GardenAudio.CALL_FILES;
  const M = GardenAudio.CALL_META;
  const types = [...Object.keys(Eco.LIFE), ...Object.keys(EcoData.VISITORS)];
  for (const type of types) {
    if (!S[type] || !S[type].length) {
      assert(NO_RECORDING.has(type), type + ' 在素材映射里没有录音');
      continue; // 没有录音就没有播放参数，下面几条无从谈起
    }
    assert(M[type], type + ' 缺播放参数');
    assert(M[type].rate > 0.5 && M[type].rate < 2, type + ' 的变调倍率离谱：' + M[type].rate);
    assert(M[type].voices >= 1, type + ' 的同物种并发上限是 0，等于永远不叫');
    for (const f of S[type]) {
      assert(assetOf(f) && fs.existsSync(assetOf(f)), type + ' 的录音不在盘上：' + f);
      assert(f.startsWith('assets/calls/'), '路径必须以 assets/calls/ 开头，构建靠它内联：' + f);
    }
    // loops 里点名的必须确实在 files 里，否则循环播那条永远取不到
    for (const l of M[type].loops || [])
      assert(S[type].includes(l), type + ' 的循环文件 ' + l + ' 不在它的 files 里');
  }
  // 4 种猫共用猫录音但各自分到不同的条目，且变调互不相同——
  // 否则"镜头看阿比西尼亚猫"和"看橘猫"听起来会一模一样。
  const cats = ['abyssinian', 'ragdoll', 'tabby', 'orangeCat'];
  const catRates = cats.map((c) => M[c].rate);
  assert.equal(new Set(catRates).size, cats.length, '4 种猫的变调倍率有重复：' + catRates.join('/'));
  // 多条的物种必须能随机取到不同文件：抽 400 次，应当覆盖该物种的全部变体。
  // 判据用"覆盖率 = 全部"而不是"至少 2 个"——后者会让"有 4 条却永远只抽到
  // 2 条"的物种照样通过，是那种安静地少报、不会报错的检查。
  const multi = Object.keys(S).filter((t) => S[t].length > 1);
  assert(multi.length >= 20, '多条变体的物种太少，随机机制没东西可随机');
  for (const t of ['fox', 'sheep', 'frog', 'wren']) {
    const list = S[t];
    const seenFiles = new Set();
    for (let i = 0; i < 400; i++) seenFiles.add(list[Math.floor(Math.random() * list.length)]);
    assert(
      seenFiles.size === list.length,
      t + ' 的随机挑选 400 次只取到 ' + seenFiles.size + '/' + list.length + ' 个变体',
    );
  }
  // 名单要双向自证：补上素材的物种不能继续留在例外名单里，
  // 否则名单会越积越长、最后什么异常都盖得住。
  for (const t of NO_RECORDING)
    assert(!S[t] || !S[t].length, t + ' 现在已经有录音了，把它从 NO_RECORDING 名单里删掉');
  const withRec = types.length - NO_RECORDING.size;
  const multi2 = multi.length;
  console.log(
    'PASS ' +
      withRec +
      ' 个物种有录音且文件都在盘上（' +
      NO_RECORDING.size +
      ' 个例外：' +
      [...NO_RECORDING].join('、') +
      '，走实时合成叫）；' +
      multi2 +
      ' 个物种有多个变体可随机；4 种猫变调互不相同（' +
      catRates.join('/') +
      '）',
  );
}

// —— 每种叫声都要有内容，且参数合法 ——
const all = [...Object.keys(Eco.LIFE), ...Object.keys(EcoData.VISITORS)];
for (const type of all) {
  const evs = GardenAudio.callEvents(type);
  assert(evs.length > 0, type + ' 没有任何叫声事件');
  for (const e of evs) {
    assert(e.k && typeof e.d === 'number' && e.d > 0, type + ' 有坏事件');
    // f===0 是「以噪声为载波」的约定（am 事件），不是频率越界
    if (e.f != null && e.f !== 0) assert(e.f > 20 && e.f < 20000, type + ' 频率越界: ' + e.f);
    if (e.lo) assert(e.lo > 0 && e.hi >= e.lo, type + ' 噪声频带非法');
    if (e.F) for (const [f] of e.F) assert(f > 50 && f < 12000, type + ' 共振峰越界: ' + f);
  }
}
// 青蛙必须是脉冲串，脉率接近实测的 5.9/s
const frog = GardenAudio.callEvents('frog');
assert(frog.length >= 6, '青蛙不是脉冲串');
const gap = frog[1].t - frog[0].t;
assert(Math.abs(1 / gap - 5.9) < 1.2, '青蛙脉冲率偏离实测 5.9/s：' + (1 / gap).toFixed(2));
// 蝉/蜂必须以噪声为载波，否则会听成「电子哔」
for (const t of ['bug', 'bee']) {
  const evs = GardenAudio.callEvents(t);
  const noiseCarrier = evs.filter(
    (e) =>
      e.k === 'am' &&
      e.w === 'noise' &&
      e.v >= evs.filter((x) => x.k === 'am').reduce((m, x) => Math.max(m, x.v), 0) * 0.5,
  );
  assert(noiseCarrier.length > 0, t + ' 不是以噪声为主的调幅，听起来会是电子音');
}
console.log(
  `PASS 合成叫声（现在的兜底路径）${all.length} 种事件参数合法；` +
    `青蛙脉冲率 ${(1 / gap).toFixed(2)}/s（实测 5.9）；蝉与蜂以噪声为载波`,
);

// —— 「在响的只数」必须能归零，不能只涨不涨 ——
// 踩过的坑：原来 playRecord 自己加一、scheduleAmbient 又加一，而结束时只减一次；
// pet() 那条路只加不减。计数器涨过上限之后，环境声调度被永久挡死——
// 表现是开场几声之后再也不响。真实浏览器里量到 ambPlaying 恒为 9、30 秒零发声。
(async () => {
  // 先停掉混音回路：它每 250ms 调度一次环境声，会往同一个计数器里塞数。
  GardenAudio.stopMixLoop();
  // 再把前面那些测试留下的异步加载结算干净：pet() 里的 loadBuffer 是异步的，
  // 它在 .then 里才给 ambPlaying 加一。不等它结算就取基线，量到的差值里
  // 混着上一批的账（第一版就因此把 5 读成了 75）。
  for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
  await new Promise((r) => setTimeout(r, 20));
  const before = GardenAudio._mix().ambPlaying;
  const mark = bufferSources.length; // 只认自己起的源，别把前面测试留下的算进来
  const n = 5;
  // 用真的物种 key。'cat' 现在只是分类学上的属名，游戏里传进来的是
  // abyssinian / ragdoll / tabby / orangeCat 其中之一——拿属名去摸，
  // 走不到录音那条路（以前能走通只是因为老表正好按属建）。
  const PET_TYPE = 'tabby';
  for (let i = 0; i < n; i++) GardenAudio.pet(PET_TYPE, { sound: true, music: true });
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setImmediate(r));
  const playing = GardenAudio._mix().ambPlaying;
  assert.equal(
    playing - before,
    n,
    `摸了 ${n} 次${PET_TYPE}，应该有 ${n} 段录音在响，实际只数 ${playing - before}`,
  );
  // 自己起的那些放完之后，只数必须回到出发时的数
  const live = bufferSources.slice(mark);
  assert.equal(live.length, n, '缓冲区源没有真的起播: ' + live.length);
  for (const s of live) if (typeof s.onended === 'function') s.onended();
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(
    GardenAudio._mix().ambPlaying,
    before,
    '录音都放完了，在响的只数却没归零：' +
      GardenAudio._mix().ambPlaying +
      '（基线 ' +
      before +
      '）',
  );
  // 只数不可能多于真正起播的源数（多出来的就是重复计数，正是原来那个 bug）
  assert(
    playing - before <= n,
    '在响的只数多算了：摸了 ' + n + ' 次，却数成 ' + (playing - before),
  );
  // 「同时不超过 5 只」这条约束是靠环境声调度实现的，它要场上真有动物
  // （_liveTypes 读视图里的 world），桩里没有视图，所以这条留给真实浏览器验。
  console.log(
    `PASS 在响的只数会归零（摸 ${n} 次${PET_TYPE} → ${playing - before} 段 → 放完回到基线 ${before}）`,
  );

  // 停掉混音回路。**必须放在这里**，不能只靠模块末尾那一句：
  // 模块末尾那句是同步执行的，而本块里的 pet() 会调 unlock() → startMixLoop()
  // 把定时器重新起起来，之后没人再停——进程就永远不退出，测试表现为"卡住"。
  GardenAudio.stopMixLoop();
})();

// 混音回路是 setInterval，不停掉的话进程不会退出。
GardenAudio.stopMixLoop();
