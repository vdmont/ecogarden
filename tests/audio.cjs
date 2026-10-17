const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let notes = 0;

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
    return node();
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
require('./load.cjs');
require('../src/ui/audio.js');

// ══════════════ 背景音乐：三首真实录音，随机连播 ══════════════
const TRACKS = GardenAudio.MUSIC_TRACKS;
assert(TRACKS.length >= 2, '曲库少于两首，没法「随机循环」');
for (const t of TRACKS) {
  const p = path.resolve(__dirname, '../assets', t);
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
assert.equal(bg.volume, GardenAudio.MUSIC_VOLUME, '音乐音量不是设定值');

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
    `60 次换曲无重复、缺文件会跳过（共 ${TRACKS.reduce((s, t) => s + Math.round(fs.statSync(path.resolve(__dirname, '../assets', t)).size / 1024), 0)} KB）`,
);

// ══════════════ 动物叫声：仍然实时合成 ══════════════
GardenAudio.configure({ music: false, sound: true });
const before = notes;
GardenAudio.pet('ragdoll', { music: false, sound: false });
assert.equal(notes, before, '关掉音效后仍在发声');

for (const type of Object.keys(Eco.LIFE)) {
  const n = notes;
  GardenAudio.pet(type, { music: false, sound: true });
  assert(notes > n, type);
}
for (const type of Object.keys(EcoData.VISITORS)) {
  const n = notes;
  GardenAudio.pet(type, { music: false, sound: true });
  assert(notes > n, type);
}
console.log(
  `PASS 音效开关，以及全部 ${Object.keys(Eco.LIFE).length}+${Object.keys(EcoData.VISITORS).length} 种动物叫声都出声`,
);

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
  `PASS ${all.length} 种叫声均非空、频率与共振峰在合法范围；青蛙脉冲率 ${(1 / gap).toFixed(2)}/s；蝉与蜂以噪声为载波`,
);
