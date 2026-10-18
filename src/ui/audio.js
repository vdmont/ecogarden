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
    limiter,
    settings = {},
    active = false;
  // 合成声的输出节点。默认等于 master，但环境声混音会把某些属的合成叫
  // 改道到该属的总线上（见 pet()），所以这里做成可切换的一层。
  let synthOut = null;
  const sink = () => synthOut || master;
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
    g.connect(sink());
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
    g.connect(sink());
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
      bg.connect(sink());
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
    tail.connect(sink());
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
      fg.connect(sink());
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
      bg.connect(sink());
      s.start(t);
      s.stop(t + d + 0.03);
      parts.push(s, fl, bg);
    }
    // 总体包络（声门脉冲串的开合）
    const env = ctx.createGain();
    gnode(env, t, d, v, 0.014);
    src.connect(env);
    env.connect(sink());
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
    const saved = { ctx, master, synthOut };
    try {
      const all = [...new Set([...Object.keys(EcoData.LIFE), ...Object.keys(EcoData.VISITORS)])];
      const total = all.length * o.slot + 1;
      const oc = new OfflineAudioContext(2, Math.ceil(total * 44100), 44100);
      ctx = oc;
      master = oc.createGain();
      master.gain.value = 0.8;
      master.connect(oc.destination);
      // 离线渲染必须走 master：这里渲染的是"干声 + 混响"，
      // 若沿用实时的 synthOut（某个属的总线）就会把混响绕开。
      synthOut = null;
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
      synthOut = saved.synthOut;
    }
  }

  // ══════════════════════ 属级分组：哪几个物种共用一段声音 ══════════════════════
  // 粒度是**分类学上的属**，不是随手合并的大类（项目所有者明确要求的）：
  //   狼 *Canis lupus* 与家犬 *Canis lupus familiaris* 同属 Canis → 共用；
  //   狐狸 *Vulpes*、刺猬 *Erinaceus*、松鼠 *Sciurus* 属各不相同 → 必须分开。
  // 没有真实录音的属继续用实时合成（AGENTS.md 第 9 节：缺素材不硬凑）。
  const GENUS = {
    bird: 'bird',
    nightHeron: 'nightHeron',
    redstart: 'redstart',
    longtail: 'longtail',
    wren: 'wren',
    flamingo: 'flamingo',
    sheep: 'sheep',
    chicken: 'chicken',
    rabbit: 'rabbit',
    deer: 'deer',
    fox: 'fox',
    wolf: 'canis', // 与家犬同属 Canis
    boar: 'boar',
    squirrel: 'squirrel',
    capybara: 'capybara',
    hedgehog: 'hedgehog',
    frog: 'frog',
    bee: 'bee',
    // 常驻 15 种
    alpaca: 'alpaca', // 无真实录音，保留合成（*Vicugna* 与羊 *Ovis* 不同属，不共用）
    bug: 'bug',
    butterfly: 'butterfly',
    // 访客按 VISITORS[type][1] 的 kind 分派
    kindCat: 'cat', // 4 种猫，同属 *Felis*
    kindDog: 'canis', // 3 种家犬
    kindCapy: 'capybara',
    kindDragon: 'dragon',
    kindMyth: 'pixiu', // pixiu / baize 同类
  };

  // 真实录音的文件在 assets/calls/，物种 → 文件的映射由 assets/calls/SFXMAP.mjs
  // 提供（那个文件由 scripts/gen-sfxmap.cjs 从 music/ 里的素材包生成，勿手改）。
  //
  // 总线按**物种**分，不再按属分：素材包里 4 种猫、3 种狗各自有独立录音和变调，
  // 合成一属就没法用上各自的 rate 了。genusOf() 仍然保留，作为"这个物种没有录音"
  // 时的退路（神话生物之外的漏网之鱼），以及给测试用。
  const ECO = root.EcoCalls || { species: {}, licenses: {}, masterGain: 1 };
  const CALL_FILES = {};
  const CALL_META = {};
  for (const [type, s] of Object.entries(ECO.species)) {
    CALL_FILES[type] = s.files.slice();
    CALL_META[type] = s;
  }
  // 这个物种走真实录音吗？（没有就退回实时合成）
  function hasCall(type) {
    return !!CALL_FILES[type] || !!CALL_FILES[genusOf(type)];
  }

  // species key（访客是 visitor key，常驻是物种 key）→ 属
  function genusOf(type) {
    const k = EcoData.VISITORS?.[type]?.[1];
    if (k === 'cat') return GENUS.kindCat;
    if (k === 'dog') return GENUS.kindDog;
    if (k === 'capy') return GENUS.kindCapy;
    if (k === 'dragon') return GENUS.kindDragon;
    if (k === 'myth') return type === 'pixiu' ? 'pixiu' : GENUS.kindMyth;
    return GENUS[type] || type;
  }

  // ══════════════════════ 环境声混音：按远近与聚焦动态调整 ══════════════════════
  // 需求（项目所有者）：全局看时动物声压到只有 BGM 的 0.2 能量；拉近某只动物时，
  // 它的属线性升到 0.4、其他属同时线性压到 0.1。相机缩放做整体远近，
  // 聚焦做个体加权。
  //
  // 三个必须说清的实现选择：
  //  1. 0.2 / 0.4 / 0.1 是**能量（功率）比**，不是振幅比，所以落到增益上要开根号：
  //     0.2 → 0.447、0.4 → 0.632、0.1 → 0.316。差 7 dB，听感差别很明显。
  //  2. 能量比是相对 BGM 的，所以两边都要测：bgmAnalyser 与 ambAnalyser 各挂一个
  //     AnalyserNode 取滑动平均 RMS，再用一个**很慢且每步钳位**的修正回路把环境声
  //     拉到目标能量。太快会听到音量呼吸（泵动），所以宁可慢。
  //  3. 不改 scene.js / app.js（朋友正在 rebase 那两个文件），而是在这里包一层
  //     GardenView.prototype.render 拿到视图实例，逐帧读 zoom 与 followAnimal。
  //     等 rebase 完成后，应该改成 app.js 显式调 GardenAudio.setMix()。
  // ══════════════════════════════════════════════════════════════
  // 空间化动物声层
  //
  // 项目所有者 2026-10-18 定的验收标准（要点）：
  //   · 全局视角：耳朵里最明显的是 BGM，动物声只是很小的环境声
  //   · 逐渐放大：视口内的动物声**随缩放平滑升高**，不能突然出现
  //   · 锁定一只：它在动物层里最大，但**切换必须平滑**，不能"啪"一下炸出来
  //   · 视口里有什么就放什么：鸟和狗同屏就该同时听到两种；移出视口淡出到 0
  //   · 离视口中心越近越大、越靠边缘越小（连续权重，不是"看得见/看不见"两级）
  //   · 每个物种从**自己的音频池随机取片段**，一段接一段，**交叉淡化**，80 条都参与
  //   · 增益每帧 lerp 到目标值，时间常数 0.3–0.8 秒；镜头瞬移也不能从 0 跳到最大
  //   · 按**平均能量（RMS）**归一化到 0.2–0.4，不只看峰值
  //
  // 三条实现上的选择，说清楚为什么：
  //
  // 1. **归一化到固定 RMS，而不是"对着 BGM 量能量再修正"。**
  //    原来有个 AGC 回路：挂两个 AnalyserNode 量动物声与 BGM 的能量，再慢慢修正。
  //    问题是它在无头浏览器里量不准（音频线程成块渲染，而且完全静音的分支根本不
  //    推进参数，上一轮实测就是把陈旧值当成了真值），而且它和"每帧平滑"天然打架
  //    ——一个每 250ms 步进 1.5 dB，一个要求 0.3–0.8 秒内到位。
  //    改成：解码后把每条片段**一次性**归一化到 RMS 0.3，之后增益完全由空间模型决定，
  //    不再有任何反馈回路。AnalyserNode 留着，但只用来**测量和验收**，不参与控制。
  //
  // 2. **每帧在 JS 侧做 lerp 再写 gain.value**，而不是往音频线程排 ramp。
  //    因为验收要看"当前增益真的走到哪了"。排进音频线程的 ramp 读不回来，
  //    出问题时分不清是算法错了还是根本没排上。
  //
  // 3. **同物种多只用饱和相加（1-Π(1-w)），不是直接相加。**
  //    三只羊挤在画面中央，直接相加就是 3 倍能量，锁一只猫的时候背景会突然变响。
  //    饱和相加的效果是"一只 = 一只，两只还是一只那么多但更满"，不会有突变。
  const MIX = {
    // 每条片段归一化到的 RMS。要求落在 0.2–0.4，取中间值 0.3。
    clipRms: 0.3,
    clipRmsMin: 0.2,
    clipRmsMax: 0.4,
    // 归一化之后还要限一下峰值：有些片段动态极大（峰均是均值的 20 倍以上），
    // 按 RMS 拉到 0.3 之后峰值会超过 1.0，那就会削波。超过就整体压下来，
    // 并记进 clipStats，诊断里能看见是哪些。
    clipPeak: 0.89,
    // 压缩门槛 = 当前平均能量 × 这个倍数。取 2.2 而不是 1.0：门槛放低压得更狠、
    // 数字更容易凑齐，但听起来"被压过"。实测两者归一化结果几乎一样
    // （峰值最高 0.861 vs 0.863），所以取更温和的这个。
    compThrMul: 2.2,

    // 空间权重 → 增益
    zoomMin: 0.06, // 缩到最远时动物层还剩这么多（不能真到 0，要留一点"生机"）
    zoomMax: 0.85, // 锁到最近且那只就在画面中心时的上限（防盖过 BGM）
    lockBoost: 1.45, // 锁定的那只比同样距离的"只是看见"的动物再大 1.45 倍
    // 每帧 lerp 的时间常数（秒）。取 0.45：够快（验收要求约 0.5 秒内到位），
    // 又不会在镜头轻微晃动时跟着抖。
    smoothTau: 0.45,
    // 视口判定半径（以正交相机画面半高 extent 为 1 倍）。1.15 把画面边上的也算进来
    // ——相机有俯角、动物有高度，卡太死会让站在边上的羊突然静音。
    seenRadius: 1.15,

    // 同时在响的物种数上限。31 种全放就是菜市场，不是花园。
    maxVoices: 5,
    // 权重低于这个就不放（视口边缘之外自然落到 0）。
    voiceFloor: 0.06,

    // 片段之间的交叉淡化时长。太短会"啪"，太长会两声叠在一起。
    xfadeSec: 0.14,
    // 片段至少要有这么长才值得排进链里（否则交叉淡化会盖过整段）。
    minClipSec: 0.25,

    // BGM 让位：全局 1.0，锁到最近时压到 bgmDuckMin。要让位但不能被压没。
    bgmDuckMin: 0.72,

    tickMs: 33, // 空间增益的刷新间隔（约 30 帧/秒）
  };

  let ambientBus = null,
    ambAnalyser = null,
    bgmAnalyser = null,
    bgmGain = null;
  const speciesBus = {}; // type → GainNode（每个物种一条总线）
  const busGainState = {}; // type → {cur, target}：验收要看"当前增益真的走到哪了"
  const mixLog = []; // 最近几次空间计算的快照，诊断用
  const LOG_MAX = 12;
  const buffers = {}; // path → AudioBuffer（解码后已按 RMS 归一化到 0.3）
  const loading = {}; // path → Promise，避免并发重复加载
  const clipStats = {}; // path → {rmsBefore, rmsAfter, peak, limited}
  const failedClips = {}; // path → 错误信息（取不到的片段；不牵连整个物种）
  const voices = {}; // type → 正在连续播的那条（片段链）
  let agcScale = 1; // 只为兼容旧诊断输出，已不参与控制
  let mixCalls = 0;
  let observeCalls = 0; // observeView 被调了几次（应该等于渲染帧数）
  let view = null; // GardenView 实例（由包一层 render 拿到）
  let viewHooked = false;
  let focusType = ''; // 镜头正在看的那只（type key），没有就是空串
  let focusGenus = ''; // 它的属，只作为"这个物种没录音"时的退路
  let zoomT = 0; // 0 = 最远，1 = 最近
  let lastTickAt = 0;
  let ambMeasured = 0; // 只用于测量与验收，不参与控制
  let bgmMeasured = 0;
  let lastSpatial = { weights: {}, locked: '', audible: [] };

  function ensureBuses() {
    if (!ctx || !master) return false;
    if (!ambientBus) {
      ambientBus = ctx.createGain();
      ambAnalyser = ctx.createAnalyser();
      ambAnalyser.fftSize = 1024;
      ambientBus.connect(ambAnalyser);
      // 这条固定连 master：ambientBus 是整层的出口，不能跟着 synthOut 走。
      ambAnalyser.connect(master);
      // 动物声的总音量就挂在这条总线上，新建时先按设置摆好，
      // 否则解锁后的第一帧是"默认满音量"再被拉回去，听着像突然一响。
      applySoundLevel(true);
    }
    return true;
  }

  const unit01 = (x, dft) => {
    const n = typeof x === 'number' && Number.isFinite(x) ? x : dft;
    return Math.max(0, Math.min(1, n));
  };

  // 动物声这一层的总音量。复选框和滑杆都走这里。
  //
  // ⚠ 以前这里是坏的：configure() 只处理音乐，**环境声混音回路压根没看
  //   settings.sound**。表现就是设置里的「动物叫声与音效」点着没反应，
  //   勾不勾小动物都在叫——只有"手动摸"那条路（pet 里判 s.sound）是对的。
  //   挂 ambientBus 是因为环境声、手动摸的录音、没有录音时的实时合成叫，
  //   三条路全都汇到这条总线，在这里拧一个旋钮就三边一起管住了。
  function applySoundLevel(immediate) {
    if (!ambientBus || !ctx) return;
    const on = settings.sound !== false;
    const vol = on ? unit01(settings.callVolume, 1) : 0;
    const g = ambientBus.gain;
    if (immediate) {
      g.cancelScheduledValues(0);
      g.value = vol;
      return;
    }
    // 平滑过去：直接改 .value 会"啪"一下断掉
    const now = ctx.currentTime;
    try {
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(vol, now + (vol === 0 ? 0.2 : 0.1));
    } catch {
      g.value = vol;
    }
  }

  function busFor(type) {
    if (!ensureBuses()) return null;
    let g = speciesBus[type];
    if (!g) {
      g = ctx.createGain();
      // 新建的总线增益默认是 1.0，但空间模型认为"还没被看见"的目标是 0。
      // 这里显式置 0 并同步到 busGainState——否则第一帧 lerp 是从 1.0 往下走，
      // 听起来就是"本来很响突然被关小"。
      g.gain.value = 0;
      g.connect(ambientBus);
      speciesBus[type] = g;
      busGainState[type] = { cur: 0, target: 0 };
    }
    return g;
  }

  // 加载并解码录音。解码后在**内存里**按 RMS 归一到 1.0——这样属总线的增益
  // 直接就是输出能量，不用再为每条素材的不同响度单独打补丁（文件本身已归一过）。
  function loadBuffer(path) {
    if (buffers[path]) return Promise.resolve(buffers[path]);
    if (loading[path]) return loading[path];
    const p = (async () => {
      try {
        const r = await fetch(path);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const raw = await r.arrayBuffer();
        const buf = await ctx.decodeAudioData(raw);
        normalizeBuffer(buf, path);
        buffers[path] = buf;
        return buf;
      } catch (e) {
        // ⚠ 这里原来写的是 `delete CALL_FILES[用到的物种]`，也就是
        //   **任何一条片段加载失败，就把整个物种从表里永久删掉**。
        //   后果是：一次网络抖动、一次 ctx 还没建好的早调用，那只动物就永远不出声，
        //   而且错误被吞掉、控制台什么都没有——排查时完全看不出发生过什么。
        //   （暴露它的经过：给验收加了 _preloadAll()，在 unlock 之前调用，
        //   ctx 为 null → 80 条全"失败" → CALL_FILES 被清空 → 全场静音。）
        // 正确做法：只记下**这一条**取不到，把它从该物种的候选里排除，
        // 别的片段照常播；物种本身不动。
        failedClips[path] = String((e && e.message) || e);
        return null;
      } finally {
        delete loading[path];
      }
    })();
    loading[path] = p;
    return p;
  }

  // 按**平均能量（RMS）**归一化，不是按峰值。
  //
  // 为什么不能只看峰值：峰值只管最响的那一下。一条极短、高动态的猫叫
  // 峰值可以顶到 0，而一条又长又平的蟋蟀
  // 峰值不低但平均能量很小。按峰值对齐，这两条放在一起的听感差一大截。
  //
  // ⚠ 这里有个绕不过去的物理约束，必须说清楚：**光靠调增益，RMS 0.3 和峰值
  // 0.89 在数学上不可能同时满足。** 素材包里很多片段的峰均比高达 25 dB
  // （峰是均值的 18 倍）；按 RMS 拉到 0.3，峰值就是 5.4，削掉到 0.89 的话
  // RMS 会被压到 0.05 左右。第一版就是纯增益缩放 + 峰值硬限，实测 80 条**全部**
  // 被限幅、RMS 只剩 0.04–0.26 —— 等于没有归一化。
  //
  // 正确做法是**先把峰均比压到达标，再一次性归一化**，最后硬限幅兜底。
  //
  // ⚠ 为什么必须"先压后归一"、不能反过来：能量不在峰值上。
  //   一段叫声的响度几乎全在中间那一段，峰值只是最响的那一下。
  //   所以"压一下峰值再按平均能量放大"是个正反馈——压掉的峰值少，
  //   放大又把峰值顶回去，越迭代越糟。
  //   实测（.dsh-reports\research\probe-norm.mjs，80 条真实解码音频）：
  //     · 纯增益不管峰值      → 80/80 落在 0.2–0.4，但峰值最高到 6.6
  //     · 压→归一化循环（旧） → 只有 21/80，平均能量中位只剩 0.074（发散）
  //     · 先压到峰均比达标再归一 → 80/80 落在 0.2–0.4，峰值最高 0.863
  //
  // 门槛取"当前平均能量的 2.2 倍"而不是固定电平，是为了跟素材的电平无关：
  // 安静的和响的用同一套压缩量。门槛以下一个样本都不动，
  // 所以不会把底噪放大。
  function normalizeBuffer(buf, path) {
    const stat = measureBuf(buf);
    const rec = {
      rmsBefore: +stat.rms.toFixed(5),
      peakBefore: +stat.peak.toFixed(4),
      crestBefore: +(stat.peak / Math.max(1e-9, stat.rms)).toFixed(2),
      limited: false,
      silent: false,
    };
    if (!(stat.rms > 1e-6)) {
      clipStats[path] = rec;
      return;
    }
    // RMS 0.3 + 峰值 0.89 意味着峰均比最多只能到 2.97。留 3% 余量给浮点误差。
    const wantCrest = (MIX.clipPeak / MIX.clipRms) * 0.97;
    let m = stat;
    let passes = 0;
    for (; passes < 7 && m.peak / m.rms > wantCrest; passes++) {
      const ratio = [2, 3, 4, 6][Math.min(passes, 3)];
      const thr = m.rms * MIX.compThrMul;
      for (let c = 0; c < buf.numberOfChannels; c++) applyChan(buf, c, (d) => softCompress(d, thr, ratio));
      m = measureBuf(buf);
    }
    rec.passes = passes;
    rec.limited = passes > 0;
    // 压到达标之后**只做一次**归一化。
    if (m.rms > 1e-6) {
      const scale = MIX.clipRms / m.rms;
      for (let c = 0; c < buf.numberOfChannels; c++) applyChan(buf, c, (d) => scaleChan(d, scale));
    }
    // 兜底：无论上面走到哪一步，峰值都不得超过 clipPeak
    const fin = measureBuf(buf);
    if (fin.peak > MIX.clipPeak) {
      const k = MIX.clipPeak / fin.peak;
      for (let c = 0; c < buf.numberOfChannels; c++) applyChan(buf, c, (d) => scaleChan(d, k));
      rec.limited = true;
    }
    const after = measureBuf(buf);
    rec.rmsAfter = +after.rms.toFixed(4);
    rec.peakAfter = +after.peak.toFixed(4);
    rec.gain = +(MIX.clipRms / Math.max(1e-9, m.rms)).toFixed(2);
    clipStats[path] = rec;
  }

  function applyChan(buf, c, fn) {
    const d = buf.getChannelData(c);
    fn(d);
  }
  function scaleChan(d, k) {
    for (let i = 0; i < d.length; i++) d[i] *= k;
  }
  // 软拐点压缩：阈值以下原样，超过的部分按 1/ratio 压。
  // 不用硬限幅是因为硬限幅会在波形上切出平台，听着像被削过。
  function softCompress(d, thr, ratio) {
    for (let i = 0; i < d.length; i++) {
      const a = d[i] < 0 ? -d[i] : d[i];
      if (a <= thr) continue;
      const y = thr + (a - thr) / ratio;
      d[i] = d[i] < 0 ? -y : y;
    }
  }
  function measureBuf(buf) {
    let sum = 0,
      n = 0,
      peak = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) {
        const v = d[i];
        sum += v * v;
        const a = v < 0 ? -v : v;
        if (a > peak) peak = a;
      }
      n += d.length;
    }
    return { rms: Math.sqrt(sum / Math.max(n, 1)), peak };
  }

  // 归一化之后这条片段的平均能量落在哪儿。要求 0.2–0.4。
  // 这是验收用的判据，所以它是"真的算一遍"，不是查一个写死的数。
  function clipEnergyReport() {
    const rows = [];
    for (const [p, s] of Object.entries(clipStats)) {
      if (s.silent) continue;
      rows.push({ path: p, rms: s.rmsAfter, peak: s.peakAfter, limited: s.limited });
    }
    const inRange = rows.filter((r) => r.rms >= MIX.clipRmsMin && r.rms <= MIX.clipRmsMax).length;
    return {
      total: rows.length,
      inRange,
      limited: rows.filter((r) => r.limited).length,
      overPeak: rows.filter((r) => r.peak > 1).length,
      rmsMin: rows.length ? Math.min(...rows.map((r) => r.rms)) : 0,
      rmsMax: rows.length ? Math.max(...rows.map((r) => r.rms)) : 0,
      rows,
    };
  }

  function pickFile(genus) {
    const list = CALL_FILES[genus];
    if (!list || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  // 放一段录音。走属总线，所以聚焦/远近的混音对它同样生效。
  //
  // ambPlaying 的增减**只在这里做**，调用方一律不许碰。踩过的坑：原来
  // playRecord 自己加一、调度器又加一，而结束时只减一次；pet() 那条路
  // 更是只加不减。计数器只涨不涨，涨过 maxConcurrent 之后调度被永久挡死——
  // 表现是开场几声鸟叫之后再也不响。真实浏览器里量到的 ambPlaying 恒为 9、
  // 30 秒 recordPlays 零增长，就是这个。
  // 计数时机取"源真的开始发声"，而不是"决定要发声"：加载失败的那次不该占位。
  function pickFile(type, wantLoop) {
    const all = CALL_FILES[type];
    if (!all || !all.length) return null;
    let list = all.filter((p) => !failedClips[p]);
    if (!list.length) list = all;
    const meta = CALL_META[type];
    // wantLoop：这个物种有没有标了「适合连续播」的文件（蟋蟀、蜜蜂、狐狸那声带混响的）。
    // 有就从里面挑，没有就退回普通变体。
    const loops = ((meta && meta.loops) || []).filter((p) => list.includes(p));
    const pool = wantLoop && loops.length ? loops : list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // 放一段录音。走物种总线，所以聚焦/远近的混音对它同样生效。
  //
  // ambPlaying 的增减**只在这里做**，调用方一律不许碰。踩过的坑：原来
  // playRecord 自己加一、调度器又加一，而结束时只减一次；pet() 那条路
  // 更是只加不减。计数器只涨不跌，涨过 maxConcurrent 之后调度被永久挡死——
  // 表现是开场几声鸟叫之后再也不响。真实浏览器里量到的 ambPlaying 恒为 9、
  // 30 秒 recordPlays 零增长，就是这个。
  // 计数时机取"源真的开始发声"，而不是"决定要发声"：加载失败的那次不该占位。
  // force=true 是"玩家主动摸"用的。并发上限（voices）只该管**环境声**：
  // 环境声是程序自己排的，堆到三只同类以上会糊成一片；而玩家摸一下必须出声，
  // 摸第三只同类就哑掉是明显的故障感。
  function playRecord(type, extraDb, force) {
    const bus = busFor(type);
    if (!bus) return null;
    const meta = CALL_META[type] || {};
    // 同物种在响的只数上限。素材包统一给 2：一只在叫时远处再来一只同类，
    // 叠到三只以上就成"一片糊"了。
    if (!force && playingFor(type) >= (meta.voices || 2)) return null;
    const path = pickFile(type, false);
    if (!path) return null;
    recordPlays++;
    return loadBuffer(path).then((buf) => {
      if (!buf) return null;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      // 变调：素材包给的大小差异（猫狗体型、貔貅白泽）为主，再叠一点随机，
      // 免得同一条素材反复听出来。±3% 是听不出明显失真的范围。
      const base = meta.rate || 1;
      src.playbackRate.value = base * (0.985 + Math.random() * 0.03);
      const g = ctx.createGain();
      g.gain.value = (meta.gain === undefined ? 1 : meta.gain) * Math.pow(10, (extraDb || 0) / 20);
      src.connect(g);
      g.connect(bus);
      ambPlaying++;
      byType[type] = (byType[type] || 0) + 1;
      src.onended = () => {
        ambPlaying--;
        byType[type] = Math.max(0, (byType[type] || 1) - 1);
        try {
          src.disconnect();
          g.disconnect();
        } catch {}
      };
      src.start();
      return src;
    });
  }

  // 某个物种现在有几个声音在响
  function playingFor(type) {
    return byType[type] || 0;
  }

  const byType = {}; // type → 正在发声的条数（playRecord 那条路用它数 voices）

  let ambPlaying = 0;
  let recordPlays = 0;

  // ══════════════ 空间权重 ══════════════
  //
  // 需求原文：「离视口中心越近的动物，叫声越大；越靠边缘越小，窗口外淡出到 0。」
  // 所以这里是**连续**权重，不是我上一版的"看得见 / 看不见"两级。
  //
  // 半径照抄 scene.js 的正交相机可视范围公式（extent = max(...) * zoom），
  // 再乘 seenRadius 把画面边上的也算进来。动物坐标优先取 view.motion——
  // 那是渲染时真正在用的坐标，动物会走动；读不到才按格子下标推算。
  function spatialWeights() {
    const v = view;
    const w = v && v.world;
    const out = {};
    if (!w || !w.cells) return out;
    const aspect = (v.width || 1) / (v.height || 1);
    const extent =
      Math.max((w.w * 0.65) / Math.max(0.65, aspect), w.h * 0.73, 8) * (v.zoom || v.targetZoom || 1);
    const radius = extent * MIX.seenRadius;
    const lx = (v.look && v.look.x) || 0;
    const lz = (v.look && v.look.z) || 0;
    for (let i = 0; i < w.cells.length; i++) {
      const c = w.cells[i];
      const a = c && c.animal;
      if (!a || !a.type) continue;
      const key = CALL_FILES[a.type] ? a.type : genusOf(a.type);
      if (!CALL_FILES[key]) continue;
      const st = v.motion && v.motion.get(a);
      const x = st ? st.x : i % w.w - w.w / 2 + 0.5;
      const z = st ? st.z : Math.floor(i / w.w) - w.h / 2 + 0.5;
      const d = Math.hypot(x - lx, z - lz) / radius; // 0 = 正中心，1 = 画面边缘
      if (d >= 1) continue; // 窗口外：不进权重表，也就不会被排进播放
      let wi = 1 - d; // 连续：中心 1 → 边缘 0
      if (key === focusType) {
        // 锁定的那只权重最高。镜头正对着它时它可能不在几何中心附近，
        // 所以给它一个下限，免得"锁定了却在画面边上、声音很小"。
        wi = Math.max(wi, 0.85);
        wi = Math.min(1, wi * MIX.lockBoost);
      }
      // 同物种多只用饱和相加 1-Π(1-w)，不是直接相加：
      // 三只羊挤在中央，直接相加就是 3 倍能量，锁一只猫时背景会突然变响。
      out[key] = 1 - (1 - (out[key] || 0)) * (1 - wi);
    }
    return out;
  }

  // ══════════════ 片段链 ══════════════
  //
  // 需求原文：「每个动物叫声不要只循环一条，要从该动物对应的音频池中随机选片段，
  // 一段播完再随机播下一段；片段切换要交叉淡化，避免爆音和重复感。80 条音频
  // 要真正参与随机池管理。」
  //
  // 一条 voice 的结构：当前片段 cur（src+gain）+ 预排的下一段 next。
  // 下一段在当前段结束前 xfadeSec 开始淡入，同时把当前段淡出并 stop——
  // 中间那一小段两者都在，就是交叉淡化。淡化不足会"啪"，过长会两声叠在一起。
  function makeVoice(type, bus) {
    return { type, bus, cur: null, next: null, last: '', clips: 0 };
  }

  // 抽一条不等于上一条的片段。池子只有 1 条时只能重复，那是素材的缺口。
  // 取不到的片段（failedClips）不参与抽取——但只排除它自己，不牵连整个物种。
  function pickNextPath(type, last) {
    const all = CALL_FILES[type];
    if (!all || !all.length) return null;
    let list = all.filter((p) => !failedClips[p]);
    // 全都取不到就退回原始列表，宁可再失败一次也不要彻底哑掉
    if (!list.length) list = all;
    if (list.length === 1) return list[0];
    let p = list[Math.floor(Math.random() * list.length)];
    for (let guard = 0; p === last && guard < 8; guard++)
      p = list[Math.floor(Math.random() * list.length)];
    return p;
  }

  function startVoice(type, bus) {
    const v = makeVoice(type, bus);
    voices[type] = v;
    pumpVoice(v, ctx.currentTime, true);
    return v;
  }

  function stopVoice(type, fadeSec) {
    const v = voices[type];
    if (!v) return;
    delete voices[type];
    const now = ctx.currentTime;
    for (const slot of [v.cur, v.next]) {
      if (!slot) continue;
      const g = slot.g;
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + (fadeSec === undefined ? 0.35 : fadeSec));
        slot.src.stop(now + (fadeSec === undefined ? 0.35 : fadeSec) + 0.02);
        slot.src.onended = () => {
          ambPlaying--;
          try {
            slot.src.disconnect();
            g.disconnect();
          } catch {}
        };
      } catch {}
    }
    v.cur = null;
    v.next = null;
  }

  // 把链往前推一格：没有当前段就起一条；当前段快结束就排下一条。
  function pumpVoice(v, now, first) {
    if (!ctx) return;
    if (!v.cur) {
      scheduleClip(v, now + 0.03, first);
      return;
    }
    if (v.next) return;
    const end = v.cur.started + v.cur.dur;
    if (now >= end - MIX.xfadeSec) scheduleClip(v, Math.max(now + 0.02, end - MIX.xfadeSec), false);
  }

  function scheduleClip(v, at, isFirst) {
    const path = pickNextPath(v.type, v.last);
    if (!path) return;
    v.last = path;
    loadBuffer(path).then((buf) => {
      // 加载是异步的。这期间物种可能已经退出视口（voice 被删了），
      // 或者已经排过下一段了——两种情况都直接放弃，别叠进来。
      if (!buf || voices[v.type] !== v) return;
      if (!isFirst && v.next) return;
      if (!(buf.duration >= MIX.minClipSec)) return;
      const meta = CALL_META[v.type] || {};
      const src = ctx.createBufferSource();
      src.buffer = buf;
      // 变调：素材包给的大小差异为主，再叠 ±1.5% 的随机，免得同一条反复听出来
      src.playbackRate.value = (meta.rate || 1) * (0.985 + Math.random() * 0.03);
      const g = ctx.createGain();
      src.connect(g);
      g.connect(v.bus);
      const start = Math.max(at, ctx.currentTime + 0.01);
      const xf = Math.min(MIX.xfadeSec, buf.duration / 3);
      ambPlaying++;
      v.clips++;
      if (isFirst || !v.cur) {
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(1, start + xf);
        src.start(start);
        v.cur = { src, g, started: start, dur: buf.duration / src.playbackRate.value };
      } else {
        const old = v.cur;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(1, start + xf);
        // 旧的那段在同样这段时间里淡出——中间重叠的就是交叉淡化
        try {
          old.g.gain.cancelScheduledValues(start);
          old.g.gain.setValueAtTime(old.g.gain.value, start);
          old.g.gain.linearRampToValueAtTime(0, start + xf);
          old.src.stop(start + xf + 0.02);
          old.src.onended = () => {
            ambPlaying--;
            try {
              old.src.disconnect();
              old.g.disconnect();
            } catch {}
          };
        } catch {}
        src.start(start);
        v.cur = { src, g, started: start, dur: buf.duration / src.playbackRate.value };
        v.next = null;
        // 到了 start+xf 就把 v.next 用掉，让下一轮可以继续排
        setTimeout(
          () => {
            if (voices[v.type] === v) v.next = null;
          },
          Math.max(0, start + xf - ctx.currentTime) * 1000 + 20,
        );
      }
      if (src.onended === null) {
        src.onended = () => {
          ambPlaying--;
          try {
            src.disconnect();
            g.disconnect();
          } catch {}
        };
      }
    });
  }

  // 只测量，不控制。
  //
  // 这里原来是一个 AGC 反馈回路：量动物声与 BGM 的能量，然后每 250ms 修正 1.5 dB。
  // 两个问题，都不是调参能解决的：
  //   · 它和无头浏览器的测量方式冲突——音频线程成块渲染，完全静音的分支根本不
  //     推进参数，上一轮实测就是把陈旧值当成真值，整组结论作废重测才拿到真数。
  //   · 它和"0.3–0.8 秒内平滑到位"天然打架：一个每 250ms 步进 1.5 dB。
  // 现在增益完全由空间模型算出来，这两件事都不存在了，所以回路删掉。
  // AnalyserNode 留着，给验收用（能量到底落在 0.2–0.4 区间没有）。
  function measureLevels() {
    if (!ambAnalyser || !bgmAnalyser) return;
    ambMeasured = readRms(ambAnalyser);
    bgmMeasured = readRms(bgmAnalyser);
  }

  const rmsBuf = new Float32Array(1024);
  function readRms(analyser) {
    analyser.getFloatTimeDomainData(rmsBuf);
    let s = 0;
    for (let i = 0; i < rmsBuf.length; i++) s += rmsBuf[i] * rmsBuf[i];
    return Math.sqrt(s / rmsBuf.length);
  }

  // ══════════════ 每帧：算目标增益 → 平滑插值 → 写总线 ══════════════
  //
  // 需求原文：「响度必须渐变：每帧根据"缩放级别 + 距视口中心距离 + 是否锁定"计算
  // 目标增益，再用平滑插值过渡，例如 currentGain = lerp(currentGain, targetGain,
  // smoothFactor)，时间常数约 0.3–0.8 秒。即使镜头瞬移到鸟身上，也要在短时间内
  // 平滑升高，不能瞬间从 0 跳到最大。」
  //
  // 目标增益怎么算（三项相乘）：
  //   zoomLerp   缩放从最远到最近，动物层整体从 zoomMin 抬到 zoomMax
  //   w          该物种的空间权重（0…1，离中心越近越大；锁定的那只最高）
  //   duck       被锁定物种的额外抬升
  // 三者相乘再钳位，所以离画面边缘越远的动物目标越接近 0，窗口外就是 0。
  //
  // 平滑用指数趋近，等价于对时间常数 τ 的一阶低通：
  //   cur += (target - cur) * (1 - exp(-dt / τ))
  // 每帧用**实际经过的时间**算系数，不是写死一个 magic number——
  // 掉帧或标签页节流时 dt 变大，插值跟着变大，声音不会因为卡顿而变慢。
  function lerpTo(cur, target, dt, tau) {
    if (!(dt > 0)) return cur;
    const k = 1 - Math.exp(-dt / tau);
    const v = cur + (target - cur) * k;
    return Math.abs(v - target) < 1e-5 ? target : v; // 收尾：别在目标附近抖
  }

  function targetGainFor(type, weight) {
    const zoomLerp = MIX.zoomMin + (MIX.zoomMax - MIX.zoomMin) * zoomT;
    const locked = type === focusType;
    let g = zoomLerp * Math.max(0, Math.min(1, weight));
    if (locked) g *= MIX.lockBoost;
    return Math.max(0, Math.min(MIX.zoomMax * MIX.lockBoost, g));
  }

  function updateSpatial(now) {
    if (!ambientBus || !ctx) return;
    mixCalls++;
    const dt = lastTickAt ? Math.max(0, Math.min(0.5, (now - lastTickAt) / 1000)) : 1 / 30;
    lastTickAt = now;

    const weights = spatialWeights();
    // 挑要开声/关声的物种：权重够高的，最多 maxVoices 个，按权重从大到小。
    const ranked = Object.keys(weights)
      .filter((t) => weights[t] >= MIX.voiceFloor)
      .sort((a, b) => (a === focusType ? 1e9 : weights[a]) - (b === focusType ? 1e9 : weights[b]));
    const want = new Set(ranked.slice(0, MIX.maxVoices));

    for (const t of Object.keys(speciesBus)) {
      if (want.has(t)) continue;
      // 掉出视口：先淡出再拆。淡出期间总线增益还在往下走，声音是平滑消失的。
      const st = busGainState[t];
      if (st.cur > 0.002) {
        st.target = 0;
        st.cur = lerpTo(st.cur, 0, dt, MIX.smoothTau);
        speciesBus[t].gain.value = st.cur;
      } else if (voices[t]) {
        st.cur = 0;
        speciesBus[t].gain.value = 0;
        stopVoice(t, 0.25);
      }
    }
    for (const t of want) {
      const bus = busFor(t);
      if (!bus) continue;
      const st = busGainState[t] || (busGainState[t] = { cur: 0, target: 0 });
      st.target = targetGainFor(t, weights[t]);
      st.cur = lerpTo(st.cur, st.target, dt, MIX.smoothTau);
      bus.gain.value = st.cur;
      // 增益起来一点之后才开声：否则会出现"刚开始播就只有一个响的瞬间"
      if (!voices[t] && st.cur > 0.01) startVoice(t, bus);
      const v = voices[t];
      if (v) pumpVoice(v, ctx.currentTime, false);
    }

    // BGM 让位：放大/锁定时压一点，但压不到 0。
    // musicVolume 是设置里的「音乐音量」滑杆（0–1，默认 1）。
    if (bgmGain) {
      const duck = 1 - (1 - MIX.bgmDuckMin) * zoomT;
      // musicVolume 是设置里的「音乐音量」滑杆（0–1，默认 1）。
      const want = MUSIC_VOLUME * unit01(settings.musicVolume, 1) * duck;
      bgmGain.gain.value = lerpTo(bgmGain.gain.value, want, dt, MIX.smoothTau);
    }

    lastSpatial = { weights, locked: focusType, audible: [...want] };
    const entry = {
      t: +(ctx.currentTime).toFixed(2),
      zoomT: +zoomT.toFixed(3),
      focus: focusType || '-',
      audible: [...want].join(',') || '-',
      gains: Object.fromEntries(
        Object.keys(speciesBus).map((k) => [
          k,
          +((busGainState[k] ? busGainState[k].cur : 0) || 0).toFixed(4),
        ]),
      ),
      targets: Object.fromEntries(
        Object.keys(speciesBus).map((k) => [
          k,
          +((busGainState[k] ? busGainState[k].target : 0) || 0).toFixed(4),
        ]),
      ),
      clips: Object.fromEntries(Object.entries(voices).map(([k, v]) => [k, v.clips])),
    };
    mixLog.push(entry);
    if (mixLog.length > LOG_MAX) mixLog.shift();
  }

  // 逐帧读视图状态。只在这里读，不改 scene.js / app.js。
  function observeView(v) {
    view = v;
    observeCalls++;
    const tz = v.targetZoom || 1;
    // zoom 0.14（最近）… 1.8（最远），用对数映射才有均匀的手感
    const lo = Math.log(0.14),
      hi = Math.log(1.8);
    const t = Math.max(0, Math.min(1, (hi - Math.log(tz)) / (hi - lo)));
    // 聚焦对象 → 它的物种。followAnimal 是动物对象（也可能直接是 key）。
    // 主键用 type 而不是属：素材包里 4 种猫各有自己的录音与变调，合到一属
    // 就没法做到"镜头看阿比西尼亚猫时只响它那两条"。
    const fa = v.followAnimal;
    const ty = fa ? fa.type || fa : '';
    zoomT = t;
    focusType = ty;
    focusGenus = ty ? genusOf(ty) : '';
  }

  function hookView() {
    if (viewHooked || !root.GardenView || !root.GardenView.prototype) return;
    const proto = root.GardenView.prototype;
    const orig = proto.render;
    if (typeof orig !== 'function') return;
    proto.render = function (...a) {
      try {
        observeView(this);
      } catch {}
      return orig.apply(this, a);
    };
    viewHooked = true;
  }

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
  // 基础音量。项目所有者 2026-10-19 要求从 0.45 抬到 0.9（两倍），因为
  // 「BGM 还是太小」。设置里的「音乐音量」滑杆是在这个基础上再乘 0–1，
  // 所以滑杆不动、只抬底子，默认 100% 的听感就整体翻倍。
  //
  // 抬完不会爆：主输出那层有 0.8 的 master，再后面还有一道限幅器
  // （阈值 −3 dB、20:1）。实测音乐文件峰值见 .dsh-reports 的探针输出。
  const MUSIC_VOLUME = 0.9;
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
      // 音量改由 WebAudio 里的 bgmGain 控制（要挂 AnalyserNode 测它的能量），
      // 所以元素本身的音量必须保持 1，否则会被乘两次。
      bgm.volume = 1;
      try {
        const src = ctx.createMediaElementSource(bgm);
        bgmGain = ctx.createGain();
        bgmGain.gain.value = MUSIC_VOLUME;
        bgmAnalyser = ctx.createAnalyser();
        bgmAnalyser.fftSize = 1024;
        src.connect(bgmGain);
        bgmGain.connect(bgmAnalyser);
        bgmAnalyser.connect(master || ctx.destination);
      } catch {
        // createMediaElementSource 每个元素只能调用一次；失败就退回元素自身音量
        bgm.volume = MUSIC_VOLUME;
        bgmAnalyser = null;
      }
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
        // 主输出限幅器，兜住「总输出不爆音」这条验收。
        // 单条片段归一化之后峰值已经 ≤0.89，但最多 5 个物种可以同时响、
        // 锁定的那个还能再乘 1.45，理论上仍可能叠过 1.0 削波。
        // 平时它完全不动（阈值 -3 dB 之上才介入），只在极端叠加时压一下。
        limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -3;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.25;
        master.connect(limiter);
        limiter.connect(ctx.destination);
      }
      ctx.resume();
    } catch {}
    try {
      ensureBuses();
      hookView();
      lastTickAt = 0; // 让第一帧的 dt 用默认值，不把「从解锁到现在」算成一个大 dt
      updateSpatial(performance.now());
      startMixLoop();
    } catch {}
    try {
      playMusic();
    } catch {}
  }

  // 空间混音回路。挂在 setInterval 上而不是渲染循环里：页面切到后台时
  // rAF 会被节流到一秒一帧甚至停掉，声音的平滑推进不能跟着停。
  // 33ms 约等于 30 帧/秒，配合 0.45 秒的时间常数，插值是连续的。
  let mixTimer = 0;
  function startMixLoop() {
    if (mixTimer || !ctx) return;
    mixTimer = setInterval(() => {
      if (document.hidden || !active) return;
      try {
        updateSpatial(performance.now());
        if ((mixCalls & 15) === 0) measureLevels(); // 测量是给验收看的，不用那么勤
      } catch {}
    }, MIX.tickMs);
  }

  // 停掉混音回路。正常游戏里不主动调用（页面卸载时浏览器会回收），
  // 但测试进程需要它才能退出——setInterval 会一直吊着。
  function stopMixLoop() {
    if (!mixTimer) return;
    clearInterval(mixTimer);
    mixTimer = 0;
  }

  function configure(s) {
    settings = s;
    if (ctx) {
      if (document.hidden) ctx.suspend();
      else if (active) ctx.resume();
    }
    try {
      applySoundLevel();
    } catch {}
    try {
      syncMusic();
    } catch {}
  }

  function pet(type, s) {
    unlock(s);
    if (!ctx || s.sound === false) return;
    // 有真实录音的走文件，没有的走实时合成；两者都从总线出去，
    // 所以聚焦/远近的混音对它们一视同仁。
    // 手动摸摸是明确的交互，给 +5 dB 让它从环境声里浮出来。
    const key = CALL_FILES[type] ? type : genusOf(type);
    if (CALL_FILES[key]) {
      // force=true：并发上限只管环境声，玩家主动摸一律出声。
      playRecord(key, 5, true);
      return;
    }
    const bus = busFor(key);
    if (!bus) {
      const t = ctx.currentTime + 0.02;
      for (const ev of callEvents(type)) play(ev, t);
      return;
    }
    synthOut = bus;
    try {
      const t = ctx.currentTime + 0.02;
      for (const ev of callEvents(type)) play(ev, t);
    } finally {
      synthOut = null;
    }
  }

  // 手动推一次镜头状态。正常游戏里**不用**——混音是逐帧读视图自己算的
  // （observeView + updateSpatial）。留这个函数是为了测试能单独驱动，
  // 但要清楚：拿它测出来的结果不代表正式流程，正式流程要看 observeCalls。
  function setMix(state) {
    if (!state) return;
    const tz = state.zoom || 1;
    const lo = Math.log(0.14),
      hi = Math.log(1.8);
    zoomT = Math.max(0, Math.min(1, (hi - Math.log(tz)) / (hi - lo)));
    focusType = state.focus || '';
    focusGenus = focusType ? genusOf(focusType) : '';
    updateSpatial(performance.now());
  }

  document.addEventListener('visibilitychange', () => configure(settings));
  root.GardenAudio = {
    unlock,
    configure,
    pet,
    setMix,
    stopMixLoop,
    callEvents,
    renderOffline,
    GENUS,
    CALL_FILES,
    CALL_META,
    ECO,
    MIX,
    genusOf,
    hasCall,
    MUSIC_TRACKS,
    MUSIC_VOLUME,
    // 音乐接进 WebAudio 之后，音量由节点控制而不是元素属性（否则会被乘两次）。
    // 这里统一报出"实际生效的音量"，测试和调试都看这一个数。
    musicLevel: () => (bgmGain ? bgmGain.gain.value : bgm ? bgm.volume : null),
    // 背景音乐是否接进了音频图（接了才能被测量）
    musicMetered: () => !!bgmAnalyser,
    // 视图实例。混音在正式流程里是**逐帧读它**驱动的（observeView），
    // 要验证真实行为就得改这里的 targetZoom / followAnimal。只给测试和调试用。
    _view: () => view,
    // 总线上那个 AudioParam 的活对象（不是快照）。诊断用。
    _busParam: (type) => (speciesBus[type] ? speciesBus[type].gain : null),
    // 动物声那一层的总音量（复选框 + 「动物音量」滑杆拧的就是它）。
    // 取不到是正常的：还没解锁、没进岛的时候没有这条总线。
    _ambientGain: () => (ambientBus ? ambientBus.gain : null),
    // BGM 那一层的总音量（音乐滑杆 × 让位系数）。
    _bgmGain: () => (bgmGain ? bgmGain.gain : null),
    // 空间模型算出来的权重（离视口中心越近越大）。验收"越近越大"看这个。
    _weights: () => ({ ...spatialWeights() }),
    // 归一化之后的能量报告：每条片段的平均能量有没有落在 0.2–0.4。
    _clipEnergy: clipEnergyReport,
    // 取归一化**之后**那条波形（游戏真正在放的那份），用来试听和量频谱。
    // 只给测试/诊断用，游戏本身不读它。
    _clipBuffer: (path) => {
      const b = buffers[path];
      if (!b) return null;
      const ch = [];
      for (let c = 0; c < b.numberOfChannels; c++) ch.push(Array.from(b.getChannelData(c)));
      return { ch, rate: b.sampleRate, len: b.length, stats: clipStats[path] || null };
    },
    // 取不到的片段（不会牵连整个物种，只是不参与抽取）
    _failedClips: () => ({ ...failedClips }),
    // 把全部片段都加载一遍（解码 + 归一化），然后给出能量报告。
    //
    // 为什么需要这个：归一化是在**内存里**做的，磁盘上的文件还是原始电平。
    // 所以"直接 fetch 文件量 RMS"量到的是素材包原样，永远不是 0.2–0.4——
    // 上一版探针就栽在这儿，把正确的结果报成了 0/80 不合格。
    _preloadAll: async () => {
      const paths = [...new Set(Object.values(CALL_FILES).flat())];
      await Promise.all(paths.map((p) => loadBuffer(p).catch(() => null)));
      return clipEnergyReport();
    },
    // 只加载指定的几条（试听/对比用）。给的是文件名片段，会匹配 CALL_FILES 里
    // 所有含它的路径。全量 80 条解码一遍要几十秒，只听 3 条就别付那个代价。
    _loadClips: async (names) => {
      const all = [...new Set(Object.values(CALL_FILES).flat())];
      const paths = all.filter((p) => names.some((n) => p.includes(n)));
      await Promise.all(paths.map((p) => loadBuffer(p).catch(() => null)));
      return paths;
    },
    // 调试用：读当前混音状态
    _mix: () => ({
      zoomT,
      focusType,
      focusGenus,
      weights: lastSpatial.weights,
      audible: lastSpatial.audible,
      // 每个物种：当前增益（节点上的真值）与目标增益。
      // 「平滑渐变」就是看 cur 一格一格走向 target，而不是一步跳过去。
      gains: Object.fromEntries(
        Object.keys(speciesBus).map((k) => [k, +speciesBus[k].gain.value.toFixed(4)]),
      ),
      targets: Object.fromEntries(
        Object.keys(speciesBus).map((k) => [
          k,
          +((busGainState[k] ? busGainState[k].target : 0) || 0).toFixed(4),
        ]),
      ),
      // 每个物种的片段链播了多少段。验收"80 条都参与随机池"看这个有没有长。
      clips: Object.fromEntries(Object.entries(voices).map(([k, v]) => [k, v.clips])),
      ambPlaying,
      recordPlays,
      viewHooked: !!view,
      buffers: Object.keys(buffers).length,
      mixCalls,
      observeCalls,
      mixLog: mixLog.slice(),
      ambMeasured,
      bgmMeasured,
      ctxState: ctx ? ctx.state : null,
      ctxTime: ctx ? +ctx.currentTime.toFixed(3) : null,
    }),
    // 现在还在播片段链的物种。
    _voices: () => Object.keys(voices),
  };
})(globalThis);
