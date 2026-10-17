// 生态花园 · 音效。分两块：
//   ① 背景音乐：assets/bgm/ 下三首真实录音，随机连播（文件末尾已做淡出）。
//      早先这里是实时合成的 245 秒曲子（钢琴/小提琴/口琴 + 六段曲式），
//      听起来太"出戏"，已整体删除。
//   ② 动物叫声：仍然实时合成，走下面的源-滤波模型。
//
// ── 叫声的依据（不是拍脑袋编的）──
// 嗓音：源-滤波模型 —— 声门脉冲（谐波谱约 -12dB/oct）送入并联共振峰滤波器。
//      这是动物叫声与人类嗓音共用的物理机制，也是之前版本最大的错误所在：
//      用方波/锯齿滑音去"模拟"嗓音，只会得到电子蜂鸣器。
// 青蛙：招偶call 是脉冲串，实测脉率约 5.9 脉冲/秒（R. imitator）。
// 猫：家猫 meow 平均基频约 609Hz（非洲野猫祖先约 255Hz），音高轮廓是拱形的。
// 猫呼噜：20–150Hz 的有节奏振动，吸气和呼气都不间断。
// 蜜蜂：翅膀拍频在低百 Hz，给宽带噪声做调幅，这才是「嗡嗡」的物理来源。
(function (root) {
  'use strict';

  // ══════════════ 音频随机（仅用于噪声，刻意与生态模拟的 rand(s) 完全分开）══════════════
  let seed = 0x2f6e2b1;
  const rnd = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) / 4294967296) * 2 - 1;
  };

  // ═══════════════════ 动物叫声：声门源 + 并联共振峰（源-滤波模型）═══════════════════
  const calls = {};
  // 通用嗓音：谐波谱按 roll 次幂衰减，送入并联共振峰，全程带呼吸噪声。
  const V = (f0, to, d, v, F, breath = 0.2, roll = 1.2, vib = null) => ({
    events: [{ k: 'voice', t: 0, f: f0, to, d, v, F, breath, roll, vib }],
  });
  const pulse = (f0, to, d, v, F, rate, n, breath = 0.25) => ({
    events: Array.from({ length: n }, (_, j) => {
      const p = j / (n - 1 || 1);
      return {
        k: 'voice',
        t: j / rate,
        f: f0 + (to - f0) * p,
        d,
        v,
        F,
        breath,
        roll: 1.25,
        vib: null,
      };
    }),
  });

  // —— 猫：拱形音高（上去再下来）+ 鼻-开口共振 + 持续气声 ——
  const meow = (m) => ({
    events: [
      {
        k: 'voice',
        t: 0,
        f: 523 * m,
        to: 470 * m,
        d: 0.26,
        v: 0.09,
        F: [
          [700, 7, 1],
          [1500, 8, 0.4],
        ],
        breath: 0.34,
        roll: 1.1,
        vib: [22, 0.01],
      },
      {
        k: 'voice',
        t: 0.22,
        f: 742 * m,
        to: 470 * m,
        d: 0.42,
        v: 0.095,
        F: [
          [620, 7, 1],
          [1900, 9, 0.6],
          [3000, 10, 0.22],
        ],
        breath: 0.26,
        roll: 1.15,
        vib: [18, 0.013],
      },
    ],
  });
  calls.cat = (m) => meow(m);
  // 呼噜：20–150Hz 有节奏振动，吸呼都不停
  calls.purr = () => ({
    events: Array.from({ length: 11 }, (_, j) => ({
      k: 'voice',
      t: j * 0.098,
      f: 54 + Math.sin(j * 1.7) * 8,
      d: 0.1,
      v: 0.075 - Math.abs(j - 5) * 0.007,
      F: [
        [180, 4, 1],
        [420, 5, 0.5],
      ],
      breath: 0.12,
      roll: 2.2,
      vib: null,
    })),
  });

  // —— 犬科 ——
  calls.bark = (m) => ({
    events: [
      { k: 'noise', t: 0, d: 0.05, v: 0.075, lo: 400, hi: 2600, q: 0.7 },
      {
        k: 'voice',
        t: 0.005,
        f: 430 * m,
        to: 185,
        d: 0.2,
        v: 0.1,
        F: [
          [820, 6, 1],
          [1750, 7, 0.55],
          [2900, 8, 0.25],
        ],
        breath: 0.34,
        roll: 1.1,
        vib: [26, 0.02],
      },
    ],
  });
  calls.howl = (m) => ({
    events: [
      { k: 'noise', t: 0, d: 1.3, v: 0.018, lo: 350, hi: 1500, q: 0.9 },
      {
        k: 'voice',
        t: 0,
        f: 336 * m,
        to: 392 * m,
        d: 0.55,
        v: 0.062,
        F: [
          [620, 6, 1],
          [1180, 7, 0.6],
          [2400, 8, 0.25],
        ],
        breath: 0.2,
        roll: 1.25,
        vib: [5, 0.055],
      },
      {
        k: 'voice',
        t: 0.48,
        f: 392 * m,
        to: 350 * m,
        d: 0.92,
        v: 0.058,
        F: [
          [610, 6, 1],
          [1150, 7, 0.6],
          [2400, 8, 0.25],
        ],
        breath: 0.2,
        roll: 1.25,
        vib: [5, 0.05],
      },
    ],
  });
  const yip = (m) => ({
    events: Array.from({ length: 3 }, (_, j) => ({
      k: 'voice',
      t: j * 0.16,
      f: 880 * m,
      to: 1260 * m,
      d: 0.13,
      v: 0.07,
      F: [
        [1300, 6, 1],
        [2600, 7, 0.5],
      ],
      breath: 0.26,
      roll: 1.1,
      vib: [30, 0.04],
    })),
  });
  calls.yip = yip;
  calls.fox = () => yip(1.08);
  calls.capyClicks = () => ({
    events: Array.from({ length: 8 }, (_, j) => ({
      k: 'voice',
      t: j * 0.072,
      f: 298 + Math.sin(j * 2.3) * 52,
      d: 0.05,
      v: 0.055,
      F: [
        [420, 5, 1],
        [1150, 6, 0.45],
      ],
      breath: 0.3,
      roll: 1.4,
      vib: null,
    })),
  });

  // —— 鸟：FM 音节保留，但调制指数大幅压低（>6 就变金属声了），并加重气声 ——
  const warble = (f, d, v, n, spread) => ({
    events: Array.from({ length: n }, (_, j) => ({
      k: 'fm',
      t: j * (d / n),
      f: f * (1 + Math.sin(j * 2.3) * spread),
      d: (d / n) * 0.92,
      v,
      w: 'sine',
      r: 2.4,
      ix: 1.9,
      ix2: 0.5,
      br: { lo: f * 0.7, hi: f * 1.9, q: 2.2, b: spread > 0 ? 0.5 : 0.32 },
    })),
  });
  calls.birdWren = (d) => ({
    events: [
      ...warble(3400 * d, 0.34, 0.048, 6, 0.06).events,
      ...warble(2900 * d, 0.38, 0.042, 7, 0.08).events,
    ],
  });
  calls.birdLongtail = (d) => ({
    events: [
      ...warble(5600 * d, 0.12, 0.038, 3, 0.03).events,
      ...warble(5100 * d, 0.14, 0.036, 4, 0.04).events,
    ],
  });
  calls.birdRedstart = (d) => ({
    events: [
      ...warble(2450 * d, 0.15, 0.046, 3, 0.05).events,
      ...warble(2850 * d, 0.18, 0.042, 4, 0.06).events,
    ],
  });
  calls.birdGeneric = (d) => ({
    events: [
      ...warble(3300 * d, 0.14, 0.042, 3, 0.04).events,
      ...warble(2200 * d, 0.17, 0.04, 4, 0.05).events,
    ],
  });
  calls.flamingo = (d) => ({
    events: [
      { k: 'noise', t: 0, d: 0.17, v: 0.026, lo: 600, hi: 2000, q: 1.1 },
      {
        k: 'voice',
        t: 0.01,
        f: 420 * d,
        to: 352 * d,
        d: 0.17,
        v: 0.075,
        F: [
          [700, 7, 1],
          [1500, 8, 0.5],
        ],
        breath: 0.3,
        roll: 1.15,
        vib: [26, 0.03],
      },
      { k: 'noise', t: 0.24, d: 0.15, v: 0.024, lo: 600, hi: 2000, q: 1.1 },
      {
        k: 'voice',
        t: 0.25,
        f: 398 * d,
        to: 338 * d,
        d: 0.16,
        v: 0.07,
        F: [
          [700, 7, 1],
          [1500, 8, 0.5],
        ],
        breath: 0.3,
        roll: 1.15,
        vib: [26, 0.03],
      },
    ],
  });
  calls.nightHeron = (d) => ({
    events: [
      { k: 'noise', t: 0, d: 0.32, v: 0.045, lo: 400, hi: 1500, q: 0.5 },
      {
        k: 'voice',
        t: 0,
        f: 470 * d,
        to: 430 * d,
        d: 0.32,
        v: 0.048,
        F: [
          [900, 6, 1],
          [1900, 7, 0.4],
        ],
        breath: 0.55,
        roll: 1.0,
        vib: [14, 0.03],
      },
    ],
  });

  // —— 神话访客 ——
  calls.dragon = () => ({
    events: [
      { k: 'noise', t: 0, d: 1.2, v: 0.042, lo: 120, hi: 900, q: 0.5 },
      {
        k: 'voice',
        t: 0,
        f: 74,
        to: 66,
        d: 1.2,
        v: 0.105,
        F: [
          [260, 5, 1],
          [700, 6, 0.5],
        ],
        breath: 0.4,
        roll: 1.3,
        vib: [7, 0.05],
      },
    ],
  });
  calls.pixiu = () => ({
    events: [
      {
        k: 'fm',
        t: 0,
        f: 988,
        d: 0.85,
        v: 0.045,
        w: 'sine',
        r: 1.414,
        ix: 1.6,
        ix2: 0.4,
        br: { lo: 1600, hi: 5200, q: 1.6, b: 0.3 },
      },
      {
        k: 'fm',
        t: 0.02,
        f: 1480,
        d: 0.55,
        v: 0.02,
        w: 'sine',
        r: 2.76,
        ix: 1.2,
        ix2: 0.3,
        br: { lo: 2200, hi: 6000, q: 1.6, b: 0.25 },
      },
    ],
  });
  calls.baize = () => ({
    events: [
      { k: 'noise', t: 0, d: 0.45, v: 0.012, lo: 700, hi: 4000, q: 1 },
      {
        k: 'fm',
        t: 0,
        f: 523,
        d: 1.75,
        v: 0.04,
        w: 'sine',
        r: 2,
        ix: 1.3,
        ix2: 0.5,
        br: { lo: 900, hi: 3000, q: 1.8, b: 0.2 },
      },
    ],
  });

  // —— 常驻居民 ——
  // 蝉式虫鸣：真实蝉靠鼓膜的高频脉冲，本质是宽带噪声被 ~90Hz 调幅。
  // 之前用纯正弦做载波，听起来就是「电子哔」；改成噪声主导才像虫。
  calls.bug = () => ({
    events: [
      {
        k: 'am',
        t: 0,
        f: 0,
        d: 0.9,
        v: 0.02,
        w: 'noise',
        rate: 92,
        depth: 0.85,
        lo: 2200,
        hi: 7000,
      },
      { k: 'am', t: 0, f: 2400, d: 0.9, v: 0.006, w: 'sine', rate: 92, depth: 0.8 },
    ],
  });
  calls.butterfly = () => ({
    events: [
      { k: 'noise', t: 0, d: 0.55, v: 0.014, lo: 5200, hi: 11000, q: 0.9 },
      { k: 'noise', t: 0.16, d: 0.42, v: 0.01, lo: 6000, hi: 12000, q: 0.9 },
    ],
  });
  calls.sheep = () => ({
    events: [
      { k: 'noise', t: 0, d: 0.46, v: 0.014, lo: 800, hi: 2600, q: 0.8 },
      {
        k: 'voice',
        t: 0,
        f: 392,
        to: 352,
        d: 0.48,
        v: 0.075,
        F: [
          [690, 8, 1],
          [2150, 9, 0.7],
        ],
        breath: 0.26,
        roll: 1.1,
        vib: [24, 0.035],
      },
    ],
  });
  calls.alpaca = () => ({
    events: Array.from({ length: 4 }, (_, j) => ({
      k: 'voice',
      t: j * 0.2,
      f: 212 + Math.sin(j * 1.9) * 10,
      d: 0.22,
      v: 0.07,
      F: [
        [600, 7, 1],
        [1250, 8, 0.55],
      ],
      breath: 0.22,
      roll: 1.3,
      vib: [23, 0.03],
    })),
  });
  calls.rabbit = () => ({
    events: [
      { k: 'noise', t: 0, d: 0.032, v: 0.055, lo: 110, hi: 600, q: 0.6 },
      {
        k: 'voice',
        t: 0,
        f: 228,
        to: 118,
        d: 0.085,
        v: 0.085,
        F: [
          [300, 5, 1],
          [900, 6, 0.35],
        ],
        breath: 0.5,
        roll: 1.6,
        vib: null,
      },
      {
        k: 'voice',
        t: 0.012,
        f: 640,
        to: 470,
        d: 0.05,
        v: 0.014,
        F: [
          [1200, 6, 1],
          [2600, 7, 0.4],
        ],
        breath: 0.35,
        roll: 1.2,
        vib: null,
      },
    ],
  });
  calls.deer = () => ({
    events: [
      { k: 'noise', t: 0, d: 0.2, v: 0.05, lo: 400, hi: 2400, q: 0.6 },
      {
        k: 'voice',
        t: 0,
        f: 430,
        to: 248,
        d: 0.24,
        v: 0.055,
        F: [
          [900, 6, 1],
          [2100, 7, 0.4],
        ],
        breath: 0.5,
        roll: 1.0,
        vib: [20, 0.03],
      },
    ],
  });
  // 蜜蜂：翅膀拍频给宽带噪声做调幅。载波改成噪声为主 —— 锯齿波载波会听成「电子嗡嗡」。
  calls.bee = () => ({
    events: [
      {
        k: 'am',
        t: 0,
        f: 0,
        d: 0.5,
        v: 0.026,
        w: 'noise',
        rate: 225,
        depth: 0.85,
        lo: 120,
        hi: 1600,
      },
      {
        k: 'voice',
        t: 0,
        f: 232,
        d: 0.5,
        v: 0.014,
        F: [
          [700, 5, 1],
          [2200, 6, 0.4],
        ],
        breath: 0.4,
        roll: 1.6,
        vib: [225, 0.05],
      },
    ],
  });
  calls.chicken = () => ({
    events: [
      { k: 'noise', t: 0, d: 0.1, v: 0.012, lo: 900, hi: 3000, q: 0.9 },
      {
        k: 'voice',
        t: 0,
        f: 760,
        to: 420,
        d: 0.12,
        v: 0.07,
        F: [
          [760, 7, 1],
          [2000, 8, 0.6],
        ],
        breath: 0.3,
        roll: 1.15,
        vib: [34, 0.045],
      },
      {
        k: 'voice',
        t: 0.16,
        f: 700,
        to: 400,
        d: 0.12,
        v: 0.062,
        F: [
          [760, 7, 1],
          [2000, 8, 0.6],
        ],
        breath: 0.3,
        roll: 1.15,
        vib: [34, 0.045],
      },
      {
        k: 'voice',
        t: 0.31,
        f: 640,
        to: 380,
        d: 0.11,
        v: 0.055,
        F: [
          [760, 7, 1],
          [2000, 8, 0.6],
        ],
        breath: 0.3,
        roll: 1.15,
        vib: [34, 0.045],
      },
    ],
  });
  // 青蛙：实测脉率 5.9 脉冲/秒的脉冲串。调制指数压低，让能量留在载波上。
  calls.frog = () =>
    pulse(
      232,
      214,
      0.075,
      0.075,
      [
        [420, 6, 1],
        [1250, 7, 0.35],
      ],
      5.92,
      9,
      0.28,
    );
  calls.hedgehog = () => ({
    events: Array.from({ length: 5 }, (_, j) => ({
      k: 'noise',
      t: j * 0.115,
      d: 0.075,
      v: 0.075,
      lo: 1000,
      hi: 5000,
      q: 0.7,
    })),
  });
  calls.wolf = () => calls.howl(0.92);
  calls.squirrel = () => ({
    events: Array.from({ length: 7 }, (_, j) => ({
      k: 'voice',
      t: j * 0.058,
      f: 1480 - j * 80,
      d: 0.055,
      v: 0.05,
      F: [
        [2200, 6, 1],
        [4200, 7, 0.4],
      ],
      breath: 0.3,
      roll: 1.15,
      vib: [26, 0.03],
    })),
  });
  calls.boar = () => ({
    events: [
      { k: 'noise', t: 0, d: 0.22, v: 0.04, lo: 180, hi: 1600, q: 0.5 },
      {
        k: 'voice',
        t: 0,
        f: 168,
        to: 116,
        d: 0.28,
        v: 0.09,
        F: [
          [340, 5, 1],
          [900, 6, 0.4],
        ],
        breath: 0.42,
        roll: 1.35,
        vib: [12, 0.025],
      },
    ],
  });

  function callEvents(type) {
    const k = EcoData.VISITORS?.[type]?.[1];
    let b = null;
    if (k === 'cat') b = () => calls.cat(1);
    else if (k === 'dog') b = () => calls.bark(0.86 + ((type.length % 5) - 2) * 0.03);
    else if (k === 'capy') b = () => calls.capyClicks();
    else if (type === 'nightHeron') b = () => calls.nightHeron(1);
    else if (type === 'redstart') b = () => calls.birdRedstart(1);
    else if (type === 'longtail') b = () => calls.birdLongtail(1);
    else if (type === 'wren') b = () => calls.birdWren(1);
    else if (type === 'flamingo') b = () => calls.flamingo(1);
    else if (k === 'dragon') b = () => calls.dragon();
    else if (k === 'myth') b = () => (type === 'pixiu' ? calls.pixiu() : calls.baize());
    else if (type === 'bug') b = () => calls.bug();
    else if (type === 'butterfly') b = () => calls.butterfly();
    else if (type === 'bird') b = () => calls.birdGeneric(1);
    else if (type === 'alpaca') b = () => calls.alpaca();
    else if (type === 'sheep') b = () => calls.sheep();
    else if (type === 'rabbit') b = () => calls.rabbit();
    else if (type === 'deer') b = () => calls.deer();
    else if (type === 'fox') b = () => calls.fox();
    else if (type === 'bee') b = () => calls.bee();
    else if (type === 'chicken') b = () => calls.chicken();
    else if (type === 'frog') b = () => calls.frog();
    else if (type === 'hedgehog') b = () => calls.hedgehog();
    else if (type === 'wolf') b = () => calls.wolf();
    else if (type === 'squirrel') b = () => calls.squirrel();
    else if (type === 'boar') b = () => calls.boar();
    if (!b) return [];
    const shift =
      {
        abyssinian: 1.12,
        ragdoll: 0.93,
        tabby: 1.0,
        orangeCat: 1.06,
        borderCollie: 1.05,
        golden: 0.92,
        samoyed: 1.15,
      }[type] || 1;
    return b().events.map((e) => {
      const o = Object.assign({}, e);
      if (o.f) o.f *= shift;
      if (o.to) o.to *= shift;
      if (o.F) o.F = o.F.map(([f, q, g]) => [f * shift, q, g]);
      if (o.br) o.br = Object.assign({}, o.br, { lo: o.br.lo * shift, hi: o.br.hi * shift });
      if (o.lo && shift !== 1) {
        o.lo *= shift;
        o.hi *= shift;
      }
      return o;
    });
  }

  // ══════════════════════════════════ 发声层 ══════════════════════════════════
  let ctx,
    master,
    settings = {},
    active = false;
  // 包络：入参是 GainNode（不是它的 .gain）。所有调用点传的都是节点。
  function gnode(node, t, d, v, atk) {
    const g = node.gain;
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(v, t + atk);
    g.exponentialRampToValueAtTime(0.0001, t + d);
  }
  function bp(f, q) {
    const n = ctx.createBiquadFilter();
    n.type = 'bandpass';
    n.frequency.value = f;
    n.Q.value = q;
    return n;
  }
  function lp(f) {
    const n = ctx.createBiquadFilter();
    n.type = 'lowpass';
    n.frequency.value = f;
    return n;
  }
  // 自定义波表：把一整串谐波压成一个振荡器。
  // 这是性能关键 —— 钢琴若按分音逐个起振荡器，单音就要 20 个节点，
  // 整首几百个音会把排程和离线渲染都拖垮。改成波表 + 一个随时间关闭的低通来
  // 表达「高次分音先死」，既省节点，物理上也更贴近弦的阻尼。
  const waveCache = new Map();
  function waveFor(roll, odd) {
    const key = roll + '|' + (odd ? 1 : 0);
    if (waveCache.has(key)) return waveCache.get(key);
    const N = 14,
      re = new Float32Array(N),
      im = new Float32Array(N);
    for (let n = 1; n < N; n++) {
      if (odd && n % 2 === 0) continue;
      im[n] = 1 / Math.pow(n, roll);
    }
    const w = ctx.createPeriodicWave(re, im);
    waveCache.set(key, w);
    return w;
  }

  // 带通噪声：气流、摩擦、沙沙
  function noise(t, d, v, lo, hi, q) {
    const n = Math.max(64, Math.ceil(ctx.sampleRate * d) + 64);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate),
      ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = rnd();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = bp(Math.sqrt(lo * hi), q || 1),
      g = ctx.createGain();
    gnode(g, t, d, v, 0.008);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + d + 0.02);
    src.onended = () => {
      src.disconnect();
      f.disconnect();
      g.disconnect();
    };
  }
  // FM 音节（仅用于鸟歌与神话音）。br 会叠一层带通噪声当气声。
  function fm(f, t, d, v, w, r, ix, ix2, br) {
    const c = ctx.createOscillator(),
      m = ctx.createOscillator(),
      mg = ctx.createGain(),
      g = ctx.createGain();
    c.type = w;
    c.frequency.setValueAtTime(f, t);
    m.type = 'sine';
    m.frequency.setValueAtTime(Math.max(20, f * r), t);
    mg.gain.setValueAtTime(f * ix, t);
    mg.gain.exponentialRampToValueAtTime(Math.max(1, f * (ix2 ?? ix * 0.4)), t + d);
    m.connect(mg);
    mg.connect(c.frequency);
    gnode(g, t, d, v, 0.012);
    c.connect(g);
    g.connect(master);
    const parts = [c, g, m, mg];
    if (br) {
      const n = Math.max(64, Math.ceil(ctx.sampleRate * d) + 64);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate),
        ch = buf.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = rnd();
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = bp(Math.sqrt(br.lo * br.hi), br.q || 2),
        bg = ctx.createGain();
      gnode(bg, t, d, v * (br.b || 0.3), 0.01);
      src.connect(f);
      f.connect(bg);
      bg.connect(master);
      src.start(t);
      src.stop(t + d + 0.02);
      src.onended = () => {
        src.disconnect();
        f.disconnect();
        bg.disconnect();
      };
      parts.push(src, f, bg);
    }
    c.start(t);
    m.start(t);
    c.stop(t + d + 0.02);
    m.stop(t + d + 0.02);
    c.onended = () => {
      for (const p of parts)
        try {
          p.disconnect();
        } catch {}
    };
  }
  // 调幅：翅膀拍频推动载波音量
  function am(f, t, d, v, w, rate, depth, lo, hi) {
    const src = w === 'noise' ? ctx.createBufferSource() : ctx.createOscillator();
    if (w === 'noise') {
      const n = Math.max(64, Math.ceil(ctx.sampleRate * d) + 64);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate),
        ch = buf.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = rnd();
      src.buffer = buf;
    } else {
      src.type = w || 'sawtooth';
      src.frequency.setValueAtTime(f, t);
    }
    const l = ctx.createOscillator(),
      lg = ctx.createGain(),
      g = ctx.createGain();
    l.type = 'sine';
    l.frequency.setValueAtTime(rate, t);
    lg.gain.setValueAtTime(v * depth, t);
    l.connect(lg);
    lg.connect(g.gain);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(g);
    let tail = g;
    if (w === 'noise') {
      const f = bp(Math.sqrt(lo * hi), 1.1);
      g.connect(f);
      tail = f;
    }
    tail.connect(master);
    src.start(t);
    l.start(t);
    src.stop(t + d + 0.02);
    l.stop(t + d + 0.02);
    src.onended = () => {
      src.disconnect();
      l.disconnect();
      lg.disconnect();
      g.disconnect();
      tail.disconnect();
    };
  }

  // ── 嗓音：谐波源 + 并联共振峰 + 呼吸噪声（动物与哺乳动物的共用机制）──
  function voiceF(f, t, d, v, F, br, roll, vib, to = f) {
    const parts = [];
    // 声门源：谐波按 roll 次幂衰减（roll≈1.2 接近真实声门脉冲的 -12dB/oct）
    const src = ctx.createOscillator();
    src.setPeriodicWave(waveFor(roll || 1.2, false));
    src.frequency.setValueAtTime(f, t);
    if (Math.abs(to - f) > 1) src.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + d);
    // 并联共振峰：真正决定「像不像嗓子」的就是这一步
    for (const [fq, q, gv] of F) {
      const fl = bp(fq, q),
        fg = ctx.createGain();
      fg.gain.value = gv;
      src.connect(fl);
      fl.connect(fg);
      fg.connect(master);
      parts.push(fl, fg);
    }
    // 颤音：嚎叫与拉弦的标志
    if (vib) {
      const l = ctx.createOscillator(),
        lg = ctx.createGain();
      l.type = 'sine';
      l.frequency.setValueAtTime(vib[0], t);
      lg.gain.setValueAtTime(f * vib[1], t);
      l.connect(lg);
      lg.connect(src.detune);
      parts.push(l, lg);
      l.start(t);
      l.stop(t + d + 0.03);
    }
    // 呼吸噪声：全程都有，不只是在起音 —— 这是「像活物」的关键
    if (br) {
      const n = Math.max(64, Math.ceil(ctx.sampleRate * d) + 64);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate),
        ch = buf.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = rnd();
      const s = ctx.createBufferSource();
      s.buffer = buf;
      const fl = bp(Math.max(500, f * 2.2), 1.6),
        bg = ctx.createGain();
      gnode(bg, t, d, v * br, 0.02);
      s.connect(fl);
      fl.connect(bg);
      bg.connect(master);
      s.start(t);
      s.stop(t + d + 0.03);
      parts.push(s, fl, bg);
    }
    // 总体包络（声门脉冲串的开合）
    const env = ctx.createGain();
    gnode(env, t, d, v, 0.014);
    src.connect(env);
    env.connect(master);
    parts.push(env, src);
    src.start(t);
    src.stop(t + d + 0.03);
    src.onended = () => {
      for (const p of parts)
        try {
          p.disconnect();
        } catch {}
    };
  }

  function play(ev, t) {
    const T = t + (ev.t || 0);
    if (ev.k === 'voice') voiceF(ev.f, T, ev.d, ev.v, ev.F, ev.breath, ev.roll, ev.vib);
    else if (ev.k === 'fm') fm(ev.f, T, ev.d, ev.v, ev.w || 'sine', ev.r, ev.ix, ev.ix2, ev.br);
    else if (ev.k === 'am') am(ev.f, T, ev.d, ev.v, ev.w, ev.rate, ev.depth, ev.lo, ev.hi);
    else if (ev.k === 'noise') noise(T, ev.d, ev.v, ev.lo, ev.hi, ev.q);
  }

  // —— 离线渲染：走的是上面完全相同的 play()，只是换成 OfflineAudioContext。
  // 存在的意义是「我听到的必须就是游戏里放的那个声音」，不接受任何复刻近似。
  // 背景音乐是录好的文件（assets/bgm/），不再实时合成，所以这里只渲染叫声。
  async function renderOffline(kind, opt) {
    const o = Object.assign({ slot: 1.4 }, opt || {});
    const saved = { ctx, master };
    try {
      const all = [...new Set([...Object.keys(EcoData.LIFE), ...Object.keys(EcoData.VISITORS)])];
      const total = all.length * o.slot + 1;
      const oc = new OfflineAudioContext(2, Math.ceil(total * 44100), 44100);
      ctx = oc;
      master = oc.createGain();
      master.gain.value = 0.8;
      master.connect(oc.destination);
      // 简易混响：让声音「在空间里」而不是在耳朵里，是「像真的」一大半
      const irLen = Math.floor(oc.sampleRate * 0.75),
        ir = oc.createBuffer(2, irLen, oc.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < irLen; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.8);
      }
      const cv = oc.createConvolver();
      cv.buffer = ir;
      const send = oc.createGain();
      send.gain.value = 0.12;
      const wet = oc.createGain();
      wet.gain.value = 0.9;
      master.connect(send);
      send.connect(cv);
      cv.connect(wet);
      wet.connect(oc.destination);

      all.forEach((type, idx) => {
        for (const ev of callEvents(type)) play(ev, idx * o.slot + (ev.t || 0));
      });
      return await oc.startRendering();
    } finally {
      ctx = saved.ctx;
      master = saved.master;
    }
  }

  // ══════════════════════ 背景音乐：真实录音随机连播 ══════════════════════
  // 曲子是真的音频文件（assets/bgm/），不再实时合成 —— 合成出来的东西太"出戏"。
  // 每首末尾都做了 4 秒淡出，所以放完直接换下一首不会突兀；
  // 换曲时避开刚放完的那首，免得连着两首一样。
  // 路径写成 assets/bgm/… 是为了让开发模式与离线版用同一处曲库定义：
  // 开发时页面在仓库根，所以这个相对路径直接可用；构建时 scripts/build.cjs
  // 会把同样这几个文件转成 data URI 替换掉，离线版因此只有一个 html。
  const MUSIC_TRACKS = [
    'assets/bgm/track-1.mp3',
    'assets/bgm/track-2.mp3',
    'assets/bgm/track-3.mp3',
  ];
  const MUSIC_VOLUME = 0.45;
  let bgm = null,
    bgmLast = -1,
    bgmMisses = 0,
    bgmGen = 0;

  // 音乐该放着的三个条件：已经解锁、没关静音、页面在前台
  function musicWanted() {
    return active && settings.music !== false && !document.hidden;
  }

  function playMusic() {
    if (!musicWanted() || bgmMisses >= MUSIC_TRACKS.length) return;
    if (!bgm) {
      bgm = new Audio();
      bgm.preload = 'auto';
      bgm.volume = MUSIC_VOLUME;
    }
    // 换曲会让上一首的回调作废：用代号区分「这条回调属于哪一次起播」，
    // 否则一次 src 变更触发的 error 会把还没试过的曲子误判成取不到。
    const gen = ++bgmGen;
    bgm.onended = () => {
      if (gen === bgmGen) playMusic();
    };
    bgm.onerror = () => {
      if (gen !== bgmGen) return;
      bgmMisses++;
      playMusic(); // 这首取不到就换下一首；全都不行就靠 bgmMisses 收手
    };

    let i = Math.floor(Math.random() * MUSIC_TRACKS.length);
    if (MUSIC_TRACKS.length > 1)
      while (i === bgmLast) i = Math.floor(Math.random() * MUSIC_TRACKS.length);
    bgmLast = i;
    bgm.src = MUSIC_TRACKS[i];
    const p = bgm.play();
    // 浏览器的自动播放策略：没有用户手势时这里会 reject，静默即可，
    // 下一次 unlock（用户又点了一下界面）会重新尝试。
    if (p && p.catch) p.catch(() => {});
  }

  function syncMusic() {
    if (!bgm) return;
    if (musicWanted()) playMusic();
    else bgm.pause();
  }

  function unlock(s) {
    settings = s || settings;
    active = true;
    try {
      ctx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (!master) {
        master = ctx.createGain();
        master.gain.value = 0.8;
        master.connect(ctx.destination);
      }
      ctx.resume();
    } catch {}
    try {
      playMusic();
    } catch {}
  }

  function configure(s) {
    settings = s;
    if (ctx) {
      if (document.hidden) ctx.suspend();
      else if (active) ctx.resume();
    }
    try {
      syncMusic();
    } catch {}
  }

  function pet(type, s) {
    unlock(s);
    if (!ctx || s.sound === false) return;
    const t = ctx.currentTime + 0.02;
    for (const ev of callEvents(type)) play(ev, t);
  }

  document.addEventListener('visibilitychange', () => configure(settings));
  root.GardenAudio = {
    unlock,
    configure,
    pet,
    callEvents,
    renderOffline,
    MUSIC_TRACKS,
    MUSIC_VOLUME,
  };
})(globalThis);
