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
  const MIX = {
    base: 0.2, // 全局视角：动物声能量 / BGM 能量
    focusK: 2.0, // 聚焦的那个物种 ×2 → 0.2 × 2 = 0.4
    // 镜头里**看得见但没聚焦**的那些：抬到 1.6 倍（0.2 × 1.6 = 0.32）。
    // 项目所有者要的是"一片生机"，不是"孤零零一只"，所以看得到的都该浮出来一点。
    seenK: 1.6,
    otherK: 0.5, // 完全看不到的 ×0.5 → 0.2 × 0.5 = 0.1
    zoomBoost: 1.5, // 拉到最近时整体再抬这么多倍（即最多 ×2.5）
    ceiling: 0.85, // 能量比上限，防止拉满后盖过背景音乐
    rampSec: 1.2, // 线性过渡时长
    agcMs: 250, // 能量修正回路步进
    agcMaxDb: 1.5, // 每步最多修正 1.5 dB
    minConcurrent: 3, // 环境声同时在响的只数下限
    maxConcurrent: 5, // 上限
    gapMs: [4000, 22000], // 两次发声之间的随机间隔
    // 镜头正在看的那只：间隔比别的短得多，所以它几乎一直在叫。
    focusGapMs: 2600,
    focusDb: -1, // 比背景声稍大一点，够突出又不吵
    // 「看得见」的判定半径（以正交相机画面半高 extent 为 1 倍）。
    // 1.15 是放宽了一点：相机有俯角，动物又有高度，站在画面边上的也该算看见。
    seenRadius: 1.15,
  };

  let ambientBus = null,
    ambAnalyser = null,
    bgmAnalyser = null,
    bgmGain = null;
  const genusBus = {}; // genus → GainNode
  const mixLog = []; // 最近几次 applyMix 的「想要多少 / 实际多少」，诊断用
  const LOG_MAX = 12;
  const buffers = {}; // path → AudioBuffer（加载后按 RMS 归一到 1.0）
  const loading = {}; // path → Promise，避免并发重复加载
  let mixRamp = null; // 当前这轮线性过渡的起点/终点
  let agcScale = 1; // 能量修正回路累计出来的整体缩放
  let mixCalls = 0; // applyMix 被调了几次（诊断用：反复调用会把线性过渡一次次重启）
  let observeCalls = 0; // observeView 被调了几次（应该等于渲染帧数）
  let view = null; // GardenView 实例（由包一层 render 拿到）
  let viewHooked = false;
  let focusType = ''; // 镜头正在看的那只（type key），没有就是空串
  let focusGenus = ''; // 它的属，只作为"这个物种没录音"时的退路
  let seenTypes = new Set(); // 镜头看得见的物种集合
  let zoomT = 0; // 0 = 最远，1 = 最近
  let ambTargetEnergy = MIX.base;
  let ambMeasured = 0;
  let bgmMeasured = 0;

  function ensureBuses() {
    if (!ctx || !master) return false;
    if (!ambientBus) {
      ambientBus = ctx.createGain();
      ambAnalyser = ctx.createAnalyser();
      ambAnalyser.fftSize = 1024;
      ambientBus.connect(ambAnalyser);
      // 这条固定连 master：ambientBus 是整层的出口，不能跟着 synthOut 走。
      ambAnalyser.connect(master);
    }
    return true;
  }

  function busFor(genus) {
    if (!ensureBuses()) return null;
    let g = genusBus[genus];
    if (!g) {
      g = ctx.createGain();
      g.connect(ambientBus);
      genusBus[genus] = g;
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
        normalizeBuffer(buf);
        buffers[path] = buf;
        return buf;
      } catch (e) {
        delete CALL_FILES[Object.keys(CALL_FILES).find((k) => CALL_FILES[k].includes(path)) || ''];
        return null;
      } finally {
        delete loading[path];
      }
    })();
    loading[path] = p;
    return p;
  }

  function normalizeBuffer(buf) {
    let sum = 0,
      n = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) sum += d[i] * d[i];
      n += d.length;
    }
    const rms = Math.sqrt(sum / Math.max(n, 1));
    if (!(rms > 1e-6)) return;
    const k = 1 / rms;
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] *= k;
    }
  }

  function pickFile(genus) {
    const list = CALL_FILES[genus];
    if (!list || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  // 放一段录音。走属总线，所以聚焦/远近的混音对它同样生效。
  //
  // ambPlaying 的增减**只在这里做**，调用方一律不许碰。踩过的坑：原来
  // playRecord 自己加一、scheduleAmbient 又加一，而结束时只减一次；pet() 那条路
  // 更是只加不减。计数器只涨不涨，涨过 maxConcurrent 之后调度被永久挡死——
  // 表现是开场几声鸟叫之后再也不响。真实浏览器里量到的 ambPlaying 恒为 9、
  // 30 秒 recordPlays 零增长，就是这个。
  // 计数时机取"源真的开始发声"，而不是"决定要发声"：加载失败的那次不该占位。
  function pickFile(type, wantLoop) {
    const list = CALL_FILES[type];
    if (!list || !list.length) return null;
    const meta = CALL_META[type];
    // wantLoop：这个物种有没有标了「适合连续播」的文件（蟋蟀、蜜蜂、狐狸那声带混响的）。
    // 有就从里面挑，没有就退回普通变体。
    const loops = (meta && meta.loops) || [];
    const pool = wantLoop && loops.length ? loops : list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // 放一段录音。走物种总线，所以聚焦/远近的混音对它同样生效。
  //
  // ambPlaying 的增减**只在这里做**，调用方一律不许碰。踩过的坑：原来
  // playRecord 自己加一、scheduleAmbient 又加一，而结束时只减一次；pet() 那条路
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

  const byType = {}; // type → 正在发声的条数（voices 上限就是拿它数的）

  let ambPlaying = 0;
  let recordPlays = 0;
  let ambTimer = 0;
  const ambCooldown = {}; // type → 下次可发声的时间戳

  // 场上真的有、而且有录音的物种。羊都迁走了就不该再咩咩叫。
  // 返回 type 而不是属：素材包给的是**每种动物**独立的录音与变调。
  function liveTypes() {
    const w = view?.world;
    if (!w || !w.cells) return Object.keys(CALL_FILES);
    const out = new Set();
    for (const c of w.cells) {
      const a = c && c.animal;
      if (!a || !a.type) continue;
      if (CALL_FILES[a.type]) out.add(a.type);
      else if (CALL_FILES[genusOf(a.type)]) out.add(genusOf(a.type));
    }
    return [...out];
  }

  // 镜头看得见的物种。这是"抬高看得见的、压低看不到的"那条需求的判据。
  //
  // 判据用**离镜头注视点的世界距离**而不是投影到屏幕坐标，因为正交相机的
  // 可视范围就是一个以注视点为中心、按 zoom 放大的矩形（见 scene.js 的
  // updateCamera：extent = max(...) * zoom）。照抄那个公式量出来的半径，
  // 和画面实际大小是一致的；再乘 1.15 把画面边上的也算进来。
  //
  // 动物位置优先从 view.motion 里读——那是渲染时真正在用的坐标，动物会走动；
  // 读不到（还没被画过）才退回按格子下标推算的位置。
  function visibleTypes() {
    const v = view;
    const w = v && v.world;
    if (!w || !w.cells) return new Set(liveTypes());
    const aspect = (v.width || 1) / (v.height || 1);
    const extent =
      Math.max((w.w * 0.65) / Math.max(0.65, aspect), w.h * 0.73, 8) * (v.zoom || v.targetZoom || 1);
    const radius = extent * MIX.seenRadius;
    const lx = (v.look && v.look.x) || 0;
    const lz = (v.look && v.look.z) || 0;
    const out = new Set();
    for (let i = 0; i < w.cells.length; i++) {
      const c = w.cells[i];
      const a = c && c.animal;
      if (!a || !a.type) continue;
      const st = v.motion && v.motion.get(a);
      const x = st ? st.x : i % w.w - w.w / 2 + 0.5;
      const z = st ? st.z : Math.floor(i / w.w) - w.h / 2 + 0.5;
      if ((x - lx) * (x - lx) + (z - lz) * (z - lz) > radius * radius) continue;
      if (CALL_FILES[a.type]) out.add(a.type);
      else if (CALL_FILES[genusOf(a.type)]) out.add(genusOf(a.type));
    }
    return out;
  }

  // 调度。项目所有者要的是「镜头移到哪，哪只动物就一直叫」：
  //   · 镜头正在看的那只（focusType）**优先**，冷却比别的短得多，所以它几乎一直在叫；
  //     镜头上秒看羊、下秒看松鼠，羊停了、松鼠接上。
  //   · 剩下的名额给"镜头看得见的其他动物"随机挑，维持 3–5 个声音在响，
  //     才有生机盎然的感觉；完全没有在看的就退回场上任意物种。
  // 同物种多条素材由 pickFile 随机挑，所以听不出在重复。
  function scheduleAmbient() {
    if (!ambientBus || !active || settings.sound === false) return;
    const now = performance.now();
    const want =
      MIX.minConcurrent + Math.floor(Math.random() * (MIX.maxConcurrent - MIX.minConcurrent + 1));
    if (ambPlaying >= want) return;

    const live = liveTypes();
    if (!live.length) return;
    const inView = visibleTypes();
    const onCooldown = (t, gap) => (ambCooldown[t] || 0) >= now + gap;
    const markCooldown = (t, gap) => {
      ambCooldown[t] = now + gap + Math.random() * MIX.gapMs[1] * 0.5;
    };
    const gapFor = (t) => (t === focusType ? MIX.focusGapMs : MIX.gapMs[0] + Math.random() * (MIX.gapMs[1] - MIX.gapMs[0]));

    // 1) 镜头正在看的那只：只要冷却到了就给它一个位置，不管 want 还剩多少。
    if (focusType && CALL_FILES[focusType] && !onCooldown(focusType, 0)) {
      markCooldown(focusType, MIX.focusGapMs);
      playRecord(focusType, MIX.focusDb);
      if (ambPlaying >= want) return;
    }

    // 2) 其余名额：先在"镜头看得见的"里挑，没有可见动物再从全场挑。
    const pickFrom = (list) => {
      const pool = list.filter((t) => CALL_FILES[t] && !onCooldown(t, 0));
      if (!pool.length) return null;
      const t = pool[Math.floor(Math.random() * pool.length)];
      markCooldown(t, gapFor(t));
      playRecord(t, -3); // ambPlaying 由 playRecord 自己管，这里不要再加减
      return t;
    };
    if (!pickFrom(inView)) pickFrom(live);
  }

  // 能量修正回路：把环境声的实际能量慢慢拉到目标（相对 BGM）。
  // 每步只允许修 ±1.5 dB，快了会泵动。
  function agcStep() {
    if (!ambAnalyser || !bgmAnalyser) return;
    ambMeasured = readRms(ambAnalyser);
    bgmMeasured = readRms(bgmAnalyser);
    if (!(bgmMeasured > 1e-5) || !(ambMeasured > 1e-6)) return;
    const want = ambTargetEnergy * bgmMeasured * bgmMeasured; // 目标能量（功率）
    const have = ambMeasured * ambMeasured;
    const errDb = 10 * Math.log10(want / have);
    if (!isFinite(errDb) || Math.abs(errDb) < 0.5) return;
    const step = Math.max(-MIX.agcMaxDb, Math.min(MIX.agcMaxDb, errDb));
    agcScale *= Math.pow(10, step / 20);
    agcScale = Math.max(0.02, Math.min(4, agcScale));
  }

  const rmsBuf = new Float32Array(1024);
  function readRms(analyser) {
    analyser.getFloatTimeDomainData(rmsBuf);
    let s = 0;
    for (let i = 0; i < rmsBuf.length; i++) s += rmsBuf[i] * rmsBuf[i];
    return Math.sqrt(s / rmsBuf.length);
  }

  // 把每个属的增益从当前值线性过渡到目标值。
  function applyMix(instant) {
    if (!ambientBus || !ctx) return;
    mixCalls++;
    // 缩放做整体远近：最远 ×1，最近 ×(1 + zoomBoost)
    const boost = 1 + MIX.zoomBoost * zoomT;
    // 能量比 → 振幅比要开根号
    const t = ctx.currentTime;
    const ramp = instant ? 0.001 : MIX.rampSec;
    const entry = {
      t: +t.toFixed(2),
      zoomT: +zoomT.toFixed(3),
      focus: focusType || '-',
      gen: {},
      tgt: {},
      was: {},
    };
    for (const g of Object.keys(genusBus)) {
      // 三档：镜头正在看的那只最高，镜头里看得见的次之，完全看不到的压低。
      // 项目所有者要的是"生机盎然"——看得到的一起响，看不到的退到后面去。
      const focused = !!focusType && (g === focusType || g === focusGenus);
      let k;
      if (!focusType) k = 1;
      else if (focused) k = MIX.focusK;
      else if (seenTypes.has(g)) k = MIX.seenK;
      else k = MIX.otherK;
      const energy = Math.min(MIX.ceiling, MIX.base * boost * k);
      const target = Math.sqrt(energy);
      const p = genusBus[g].gain;
      entry.gen[g] = 1;
      entry.tgt[g] = +target.toFixed(4);
      entry.was[g] = +p.value.toFixed(4);
      p.cancelScheduledValues(t);
      p.setValueAtTime(p.value, t);
      p.linearRampToValueAtTime(target, t + ramp);
    }
    mixLog.push(entry);
    if (mixLog.length > LOG_MAX) mixLog.shift();
    ambTargetEnergy = Math.min(MIX.ceiling, MIX.base * boost * (focusType ? MIX.otherK : 1));
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
    const seen = visibleTypes();
    const seenChanged = seen.size !== seenTypes.size || [...seen].some((x) => !seenTypes.has(x));
    if (t !== zoomT || ty !== focusType || seenChanged) {
      zoomT = t;
      focusType = ty;
      focusGenus = ty ? genusOf(ty) : '';
      seenTypes = seen;
      applyMix(false);
    }
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
        master.connect(ctx.destination);
      }
      ctx.resume();
    } catch {}
    try {
      ensureBuses();
      hookView();
      applyMix(true);
      startMixLoop();
    } catch {}
    try {
      playMusic();
    } catch {}
  }

  // 混音回路：能量修正（很慢）+ 环境声调度（更慢）。用 setInterval 而不是
  // 挂在渲染循环上，这样页面切到后台 rAF 被节流时声音也不会停。
  let mixTimer = 0;
  function startMixLoop() {
    if (mixTimer || !ctx) return;
    mixTimer = setInterval(() => {
      if (document.hidden || !active) return;
      try {
        agcStep();
        if (ambientBus) ambientBus.gain.value = agcScale;
        scheduleAmbient();
      } catch {}
    }, MIX.agcMs);
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

  // 等 rebase 完成、app.js 可以改之后，应该由 app.js 显式调这个函数，
  // 替掉现在「包一层 GardenView.prototype.render」的观察办法。
  function setMix(state) {
    if (!state) return;
    const tz = state.zoom || 1;
    const lo = Math.log(0.14),
      hi = Math.log(1.8);
    const t = Math.max(0, Math.min(1, (hi - Math.log(tz)) / (hi - lo)));
    const g = state.focus ? state.focus : '';
    if (t === zoomT && g === focusType) return;
    zoomT = t;
    focusType = g;
    focusGenus = g ? genusOf(g) : '';
    if (state.seen) seenTypes = new Set(state.seen);
    applyMix(false);
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
    // 视图实例。混音在正式流程里是**逐帧读它**驱动的（observeView），不是靠
    // setMix 推的——所以要验证真实行为就得改这里的 targetZoom / followAnimal。
    // 只给测试和调试用，正常游戏代码不碰。
    _view: () => view,
    // 属总线上那个 AudioParam 的活对象（不是快照）。诊断用：
    // 能拿它单独排一次过渡，就分得清「写法不对」和「这条图上的参数不跑」。
    _busParam: (genus) => (genusBus[genus] ? genusBus[genus].gain : null),
    // 调试用：读当前混音状态，验证线性过渡真的到位了
    _mix: () => ({
      zoomT,
      focusType,
      focusGenus,
      seen: [...seenTypes],
      // 每个物种现在有几个声音在响。voices 上限就是拿它数的。
      byType: { ...byType },
      agcScale,
      ambTargetEnergy,
      ambMeasured,
      bgmMeasured,
      ambPlaying,
      recordPlays,
      viewHooked: !!view,
      buffers: Object.keys(buffers).length,
      mixCalls,
      observeCalls,
      mixLog: mixLog.slice(),
      // 每个总线的实际增益。上面那些是"算出来的意图"，这里是"节点上的真值"——
      // 验证线性过渡有没有真的到位，只能看这个。
      genusGains: Object.fromEntries(
        Object.keys(genusBus).map((g) => [g, +genusBus[g].gain.value.toFixed(4)]),
      ),
      ctxState: ctx ? ctx.state : null,
      ctxTime: ctx ? +ctx.currentTime.toFixed(3) : null,
    }),
    // 场上真的有、且有录音的物种 / 镜头看得见的物种。调度和混音都靠这两个。
    _liveTypes: liveTypes,
    _visibleTypes: () => [...visibleTypes()],
  };
})(globalThis);
