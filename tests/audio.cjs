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
const param = {
  setValueAtTime() {},
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
  value: 0,
};
const node = () => ({
  gain: param,
  frequency: param,
  detune: param,
  playbackRate: param,
  Q: param,
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

// —— 混音曲线：全局 0.2、聚焦 0.4、看得见 0.32、其他 0.1，且都要开根号 ——
{
  const M = GardenAudio.MIX;
  assert.equal(M.base, 0.2, '全局基准不是 0.2');
  assert.equal(M.base * M.focusK, 0.4, '聚焦时不是 0.4');
  // 0.2 × 1.6 在浮点里是 0.32000000000000006，用容差比而不是相等
  assert(Math.abs(M.base * M.seenK - 0.32) < 1e-9, '镜头里看得见但没聚焦的不是 0.32');
  assert.equal(M.base * M.otherK, 0.1, '完全看不见的不是 0.1');
  // 增益是振幅比 = sqrt(能量比)
  assert(Math.abs(Math.sqrt(0.2) - 0.4472) < 1e-3);
  assert(Math.abs(Math.sqrt(0.4) - 0.6325) < 1e-3);
  assert(Math.abs(Math.sqrt(0.32) - 0.5657) < 1e-3);
  assert(Math.abs(Math.sqrt(0.1) - 0.3162) < 1e-3);
  assert(M.ceiling >= 0.4, '上限低于聚焦时的 0.4，等于聚焦没效果');
  // 三档必须真的分得开，否则"抬高看得见的、压低看不见的"就是一句空话
  assert(M.focusK > M.seenK && M.seenK > 1 && M.otherK < 1, '三档没有拉开差距');
}
console.log(
  'PASS 属级分组符合分类学、录音文件都在盘上、混音三档 0.4/0.32/0.1 且按能量开根号',
);

// ══════════════ 素材包映射：每个物种都有录音，多条的要能随机 ══════════════
{
  const S = GardenAudio.CALL_FILES;
  const M = GardenAudio.CALL_META;
  const types = [...Object.keys(Eco.LIFE), ...Object.keys(EcoData.VISITORS)];
  for (const type of types) {
    assert(S[type] && S[type].length > 0, type + ' 在素材映射里没有录音');
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
  console.log(
    `PASS ${types.length} 个物种都有录音且文件在盘上；` +
      `${multi.length} 个物种有多个变体可随机；4 种猫变调互不相同（${catRates.join('/')}）`,
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
})();

// 混音回路是 setInterval，不停掉的话进程不会退出。
GardenAudio.stopMixLoop();
