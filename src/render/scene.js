(function (root) {
  'use strict';
  // 各 InstancedMesh 的实例预算：put() 超出预算会直接抛「模型实例超过预算」。
  // 加密模型或扩大地形/森林的改版，请同时跑 tests/shape.cjs 里的最坏情形护栏。
  const BUDGET = {
    terrain: 60000,
    animals: 50000,
    rings: 1800,
    // 每层（半透明那层 / 不透明那层各自）的上限。实测 CLOUD_GRID=10 时一层用掉 712 ~ 1037 块，
    // 留到 1400 是给关卡更大、陆地更多的情况兜底；两层的 makeMesh 都各自吃满这个数。
    clouds: 1400,
    // 接地阴影贴片：一只动物一片，最多同屏动物数那么多（实测 20 只）留 4 倍余量
    contacts: 800,
    flames: 9000,
    fireCores: 4500,
    waterfalls: 10000,
  };
  // 阴影参数按阴影图分辨率分档。
  // 实测结论（.dsh-reports/shadow-ab.cjs：一只羊 + 全平地面，把地面痱子按连通块剔掉再量）：
  //  · bias 从 -0.0012 一路调到 0，影子的"远边"一动不动（黄昏恒为 2.733 格、清晨恒为 1.800 格）。
  //    也就是说交接文档里写的"清晨黄昏影子会与物体分离"，在这套参数下**量不出来**，
  //    更像是早先某个版本的毛病。别再拿它当调 bias 的理由。
  //  · 真正会变的是地面痱子（shadow acne）：分辨率越高越轻，而且对 bias 越不敏感。
  //    2048 下痱子稳在 4.2%，-0.0002 到 -0.0012 全是一样；1024 下必须给到 -0.002 才压得住。
  // 所以按分辨率配 bias，而不是全局一个值。
  const SHADOW_TUNING = {
    1024: { bias: -0.002, normalBias: 0.025 },
    2048: { bias: -0.0004, normalBias: 0.025 },
  };
  // ── 云的形状 ──────────────────────────────────────────────────
  // 用值噪声 fBm 切出云团，方法来自 Perlin 1985《An Image Synthesizer》与 2002 年的
  // 改进（插值曲线换成五次式，首末两阶导数都为 0，看不出格子边界），
  // 多层按"频率 ×2、振幅 ×0.5"叠加就是分形布朗运动，《The Book of Shaders》第 13 章。
  // 关键的一步是再乘一个"离中心越远越低"的权重：只切噪声会得到铺满整个格子的雾，
  // 乘上衰减才聚成一坨，轮廓自然蓬松不规则——而不是几个方块排成一行。
  function fade5(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  // 三段平滑过渡：ed 落在 [e0,e1] 之间才变化，两端都是平的。允许 e0 > e1（也就是"反向"的过渡）。
  function smoothstep(e0, e1, x) {
    if (e0 === e1) return x < e0 ? 0 : 1;
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }
  // 格点伪随机值：纯整数哈希，不依赖 Math.random，也绝不碰模拟那条 rand(s) 随机流
  // （碰了会把后面所有生态事件整体平移，存档对不上）。
  function lattice(ix, iy, iz, seed) {
    let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(iz, 1442695041);
    h = (h + Math.imul(seed, 1274126177)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function valueNoise3(x, y, z, seed) {
    const ix = Math.floor(x),
      iy = Math.floor(y),
      iz = Math.floor(z);
    const fx = fade5(x - ix),
      fy = fade5(y - iy),
      fz = fade5(z - iz);
    const mix = (a, b, t) => a + (b - a) * t;
    const z0 = mix(
      mix(lattice(ix, iy, iz, seed), lattice(ix + 1, iy, iz, seed), fx),
      mix(lattice(ix, iy + 1, iz, seed), lattice(ix + 1, iy + 1, iz, seed), fx),
      fy,
    );
    const z1 = mix(
      mix(lattice(ix, iy, iz + 1, seed), lattice(ix + 1, iy, iz + 1, seed), fx),
      mix(lattice(ix, iy + 1, iz + 1, seed), lattice(ix + 1, iy + 1, iz + 1, seed), fx),
      fy,
    );
    return mix(z0, z1, fz);
  }
  function fbm3(x, y, z, seed, octaves) {
    let sum = 0,
      amp = 1,
      norm = 0,
      freq = 1;
    for (let o = 0; o < octaves; o++) {
      sum += amp * valueNoise3(x * freq, y * freq, z * freq, seed + o);
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  }
  // 一朵云：几个"鼓包"取并集，每个鼓包的半径再被噪声调一下。
  // 这么做是因为现实里的积云本来就不是球——底部被凝结高度压得平，顶部一坨坨鼓成花椰菜，
  // 边缘还被风撕成丝。之前用"椭球按噪声切"切出来的东西，边缘还是一圈规整的椭球轮廓，
  // 一眼就看出是程序摆的（实验台 .dsh-reports/cloud-lab2.cjs 里那一档就是对照组）。
  // 鼓包圆心全部压在底部附近、并把 y<BASE 的格子直接丢掉 → 平底自然就有了，不用额外算。
  // 整体仍然限制在单位球内，buildClouds 才敢拿 π·a·c 当俯视面积。
  function cloudBillows(seed, count) {
    const out = [];
    for (let k = 0; k < count; k++)
      out.push({
        x: (lattice(k, 0, 0, seed) * 2 - 1) * 0.66,
        y: -0.42 + lattice(0, k, 1, seed) * 0.72,
        z: (lattice(1, 0, k, seed) * 2 - 1) * 0.66,
        r: 0.4 + lattice(k, k, k, seed) * 0.3,
      });
    return out;
  }
  // 返回归一化到 [-1,1] 的球内坐标。y 方向在函数里就乘了 1.25（压扁鼓包），
  // 之后 buildClouds 再按 a>b>c 拉一遍，两层扁度叠在一起才是"宽而扁"的云。
  function makeCloudShape(seed, n) {
    const blocks = [];
    const half = (n - 1) / 2,
      bs = cloudBillows(seed, CLOUD_BILLOWS);
    for (let iy = 0; iy < n; iy++)
      for (let iz = 0; iz < n; iz++)
        for (let ix = 0; ix < n; ix++) {
          const nx = (ix - half) / half,
            ny = (iy - half) / half,
            nz = (iz - half) / half;
          if (nx * nx + ny * ny + nz * nz >= 1 || ny < -0.92) continue;
          const f = fbm3(ix * 0.62 + seed * 3.1, iy * 0.62 + seed * 2.2, iz * 0.62 + seed * 1.7, seed * 29 + 3, 4);
          let hit = false;
          for (const b of bs) {
            const dx = nx - b.x,
              dy = (ny - b.y) * 1.25,
              dz = nz - b.z;
            // 半径随噪声起伏 → 轮廓参差，不是几个光溜溜的球拼起来
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) / b.r <= 0.72 + 0.42 * f) {
              hit = true;
              break;
            }
          }
          if (hit) blocks.push([nx, ny, nz]);
        }
    return blocks;
  }
  // 云的参数。ASPECT 是 x 比 z 宽多少（a/c），FLAT 是 y 压得比 z 扁多少（b/c）。
  // 上层半透明、下层不透明，两层用同一套比例，只是上层小一截。
  // FLAT 从最早的 0.44 提到 0.62：0.44 在游戏里读成一排扁架子，不像"一坨"。
  // b 不参与俯视面积（面积 = π·a·c），所以改它不影响"下方占岛的 1/4、上方占下方 1/4"。
  // GRID 是切形用的格点数，8 是实验台上最小的一档还像云（6 太粗，散成几块浮渣）。
  // GRID 是切形用的格点数。8 时一朵只有 55~90 块、块边长 3.1，在 44 格宽的岛上
  // 一块就有几十像素，怎么切都读成"码起来的方块"；10 是块边长降到 2.4 的档，
  // 块数约 1749（两层各自不到预算 1400），drawClouds 实测仍在 0.5 毫秒以内。
  const CLOUD_UP = 6,
    CLOUD_LOW = 5,
    CLOUD_ASPECT = 1.4,
    CLOUD_FLAT = 0.62,
    CLOUD_GRID = 10,
    CLOUD_BILLOWS = 7,
    CLOUD_OVERLAP = 1.18;
  // 接地阴影贴片的旋钮。三个值都是对着真机截图调的，不是拍脑袋。
  // FOOT_Y 是"脚正常踩在地上"时 part() 传进来的 y（方块中心高度）。
  // 实测 31 种：走兽 0.025~0.195、访客猫狗 0.170、飞鸟 0.395~0.540、
  // 蜜蜂蝴蝶 0.64~0.68、龙 0.400。以 0.1 为基准，比它高的算"腾空"，影子按指数淡下去。
  // SPREAD 让贴片比脚的包围盒宽 1.5 倍——不宽出来就整个躲在肚子底下看不见（实测过）。
  // SKEW 是朝背光方向的偏移量（按贴片宽度的比例）。
  // DARK 是中心浓度：刻意比阴影贴图淡，因为两者叠加，太浓会像地砖脏了一块。
  const CONTACT_FOOT_Y = 0.1,
    CONTACT_SPREAD = 1.5,
    CONTACT_SKEW = 0.22,
    CONTACT_DARK = 0.5;
  // 昼夜四个关键帧（phase 0=清晨、0.25=正午、0.5=黄昏、0.75=夜晚）。
  // 动态模式会在它们之间平滑插值；也可以定格到某一档。
  const DAY_KEYS = [
    {
      at: 0,
      sunColor: 0xffd9a8,
      sunIntensity: 1.05,
      sunPos: [-30, 13, 22],
      skyColor: 0xffe9c6,
      groundColor: 0x6e6353,
      hemiIntensity: 0.58,
      exposure: 1.08,
      shadowSpan: 40,
      skyTop: 0xfff7e9,
      skyBottom: 0xe6d2b6,
    },
    {
      at: 0.25,
      sunColor: 0xfff6e0,
      sunIntensity: 1.18,
      sunPos: [-6, 36, 14],
      skyColor: 0xf2fbff,
      groundColor: 0x77806a,
      hemiIntensity: 0.82,
      exposure: 1.02,
      shadowSpan: 30,
      skyTop: 0xfbfdff,
      skyBottom: 0xdbe7d6,
    },
    {
      at: 0.5,
      sunColor: 0xff9d6b,
      sunIntensity: 1.0,
      sunPos: [30, 10, 16],
      skyColor: 0xffc9a8,
      groundColor: 0x5b4a44,
      hemiIntensity: 0.5,
      exposure: 1.05,
      shadowSpan: 44,
      skyTop: 0xffe2c2,
      skyBottom: 0xc99a9c,
    },
    {
      at: 0.75,
      sunColor: 0x8fa8d8,
      sunIntensity: 0.34,
      sunPos: [-14, 30, 20],
      skyColor: 0x40506e,
      groundColor: 0x232833,
      hemiIntensity: 0.42,
      exposure: 0.95,
      shadowSpan: 34,
      skyTop: 0x3b4863,
      skyBottom: 0x1c2331,
    },
  ];
  // 定格用的四档（名称 → 关键帧下标）
  const TIME_PRESETS = { dawn: 0, afternoon: 1, dusk: 2, night: 3 };

  function lerpNum(a, b, t) {
    return a + (b - a) * t;
  }
  function lerpHex(a, b, t) {
    const ch = (hex, sh) => (hex >> sh) & 255;
    const r = Math.round(lerpNum(ch(a, 16), ch(b, 16), t));
    const g = Math.round(lerpNum(ch(a, 8), ch(b, 8), t));
    const bl = Math.round(lerpNum(ch(a, 0), ch(b, 0), t));
    return (r << 16) | (g << 8) | bl;
  }
  // 按相位（0~1）解析出这一刻的光影参数
  function resolvePhase(phase) {
    const p = ((phase % 1) + 1) % 1;
    let i = DAY_KEYS.length - 1;
    for (let k = 0; k < DAY_KEYS.length; k++) if (p >= DAY_KEYS[k].at) i = k;
    const a = DAY_KEYS[i],
      b = DAY_KEYS[(i + 1) % DAY_KEYS.length];
    const span = (b.at - a.at + 1) % 1 || 1;
    const t = Math.min(1, Math.max(0, ((p - a.at + 1) % 1) / span));
    return {
      sunColor: lerpHex(a.sunColor, b.sunColor, t),
      sunIntensity: lerpNum(a.sunIntensity, b.sunIntensity, t),
      sunPos: [
        lerpNum(a.sunPos[0], b.sunPos[0], t),
        lerpNum(a.sunPos[1], b.sunPos[1], t),
        lerpNum(a.sunPos[2], b.sunPos[2], t),
      ],
      skyColor: lerpHex(a.skyColor, b.skyColor, t),
      groundColor: lerpHex(a.groundColor, b.groundColor, t),
      hemiIntensity: lerpNum(a.hemiIntensity, b.hemiIntensity, t),
      exposure: lerpNum(a.exposure, b.exposure, t),
      shadowSpan: lerpNum(a.shadowSpan, b.shadowSpan, t),
      sky:
        'radial-gradient(ellipse at 50% 22%, #' +
        lerpHex(a.skyTop, b.skyTop, t).toString(16).padStart(6, '0') +
        ' 0%, #' +
        lerpHex(a.skyBottom, b.skyBottom, t).toString(16).padStart(6, '0') +
        ' 100%)',
    };
  }
  // 把一个十六进制颜色按系数调暗（用于贴图里的环境光遮蔽）
  function shadeHex(hex, k) {
    const r = Math.max(0, Math.min(255, Math.round(((hex >> 16) & 255) * k)));
    const g = Math.max(0, Math.min(255, Math.round(((hex >> 8) & 255) * k)));
    const b = Math.max(0, Math.min(255, Math.round((hex & 255) * k)));
    return (r << 16) | (g << 8) | b;
  }

  class GardenView {
    constructor(canvas, onPick, onDrag, isPainting, onStrokeEnd) {
      this.canvas = canvas;
      this.onPick = onPick;
      this.onDrag = onDrag;
      this.isPainting = isPainting;
      this.onStrokeEnd = onStrokeEnd;
      this.world = null;
      this.focus = null;
      this.panMode = false;
      this.dirty = true;
      this.lastTick = -1;
      this.yaw = 0.72;
      this.pitch = GardenView.PITCH_DEFAULT;
      this.zoom = 1;
      this.targetZoom = 1;
      this.look = new THREE.Vector3();
      this.targetLook = new THREE.Vector3();
      this.lastDraw = 0;
      this.selected = -1;
      this.lastClick = null;
      this.onDoublePick = null;
      this.showLabels = true;
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        preserveDrawingBuffer: true,
      });
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.scene = new THREE.Scene();
      this.hemi = new THREE.HemisphereLight(0xe9fff4, 0x6c6654, 0.9);
      this.scene.add(this.hemi);
      this.sun = new THREE.DirectionalLight(0xffefce, 0.9);
      this.sun.position.set(-12, 30, 18);
      this.sun.castShadow = true;
      this.sun.shadow.mapSize.set(1024, 1024);
      // 近远面只要罩住整个岛就够：岛最大 44×30，角上离岛心约 26.6 格、峰顶再高约 9 格，
      // 所以最远的投影物离岛心约 28 格；太阳本身离岛心 35~40 格。取 2 / 80 两侧都留足了余量。
      // 原来写的是 0.1 / 200 —— 白白多出 2.5 倍深度范围。bias 是按深度比例生效的，
      // 范围一大，同样的 bias 折算成"沿光线的世界偏移"也跟着变大（0.0012 × 199.9 = 0.24 格，
      // 收紧后 0.002 × 78 = 0.156 格）。收紧后地面痱子持平、影子长度不变（实测），净赚的是精度。
      Object.assign(this.sun.shadow.camera, {
        left: -30,
        right: 30,
        top: 30,
        bottom: -30,
        near: 2,
        far: 80,
      });
      this.sun.shadow.bias = SHADOW_TUNING[1024].bias;
      this.sun.shadow.normalBias = SHADOW_TUNING[1024].normalBias;
      this.scene.add(this.sun);
      this.camera = new THREE.OrthographicCamera(-12, 12, 12, -12, 1, 110);
      this.box = new THREE.BoxGeometry(1, 1, 1);
      this.dummy = new THREE.Object3D();
      this.color = new THREE.Color();
      // 地形用独立几何：多带一个"这根方块会不会被风吹"的每实例权重（植物=1，地面=0）
      this.terrainGeo = new THREE.BoxGeometry(1, 1, 1);
      this.swayAttr = new THREE.InstancedBufferAttribute(new Float32Array(BUDGET.terrain), 1);
      this.swayAttr.setUsage(THREE.DynamicDrawUsage);
      this.terrainGeo.setAttribute('aSway', this.swayAttr);
      this.mesh = this.makeMesh(
        this.terrainGeo,
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        BUDGET.terrain,
      );
      // 顶点风动：只在植物上生效（aSway=1），底边锚定、越靠上摆得越多
      this.mesh.material.onBeforeCompile = (shader) => {
        shader.uniforms.uWindTime = { value: 0 };
        this.windShader = shader;
        shader.vertexShader =
          'attribute float aSway;\nuniform float uWindTime;\n' +
          shader.vertexShader.replace(
            '#include <begin_vertex>',
            [
              '#include <begin_vertex>',
              'float windH = clamp(position.y + 0.5, 0.0, 1.0);',
              'float windPh = uWindTime * 1.7 + instanceMatrix[3][0] * 0.55 + instanceMatrix[3][2] * 0.75;',
              'transformed.x += sin(windPh) * 0.085 * aSway * windH;',
              'transformed.z += cos(windPh * 0.83) * 0.055 * aSway * windH;',
            ].join('\n'),
          );
      };
      this.scene.add(this.mesh);
      this.animals = this.makeMesh(
        this.box,
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        BUDGET.animals,
      );
      this.scene.add(this.animals);
      this.motion = new WeakMap();
      this.lastAnimalFrame = 0;
      this.ringsG = new THREE.RingGeometry(0.29, 0.34, 24);
      this.ringsG.rotateX(-Math.PI / 2);
      this.rings = this.makeMesh(
        this.ringsG,
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
        BUDGET.rings,
      );
      this.scene.add(this.rings);
      // 云分两套：岛面上方的一层半透明（看得见后面的天空，压得住但不抢戏）；
      // 岛面下方 y<0 的一层不透明，给这座悬空岛一个"底下也有云"的厚度感。
      // 半透明那套必须 depthWrite:false，否则它会挡住自己后面的方块，整片云糊成一坨。
      // 两套各自一份几何：每实例的"挡视线程度"存在几何的 aFade 上，
      // 而几何上的 InstancedBufferAttribute 是所有用它的网格共享的，
      // 共用一份的话下层会把上层的淡入淡出值覆盖掉。
      const cloudGeo = () => {
        const g = new THREE.BoxGeometry(1, 1, 1);
        const fade = new THREE.InstancedBufferAttribute(new Float32Array(BUDGET.clouds), 1);
        fade.setUsage(THREE.DynamicDrawUsage);
        g.setAttribute('aFade', fade);
        return g;
      };
      // 云越靠近"相机与岛之间"就越透明。这个值要按实例逐个给，而 material.opacity 是整块共享的，
      // 所以只能塞进几何属性、在片元着色器里乘上去——和地形用 aSway 吹风是同一套路子。
      const cloudFadeShader = (mat) => {
        mat.onBeforeCompile = (shader) => {
          shader.vertexShader =
            'attribute float aFade;\nvarying float vFade;\n' +
            shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvFade = aFade;');
          // 老版 three.js 的收尾是 encodings_fragment，新版改名 opaque_fragment，两个都试一遍
          const anchor = shader.fragmentShader.includes('#include <opaque_fragment>')
            ? '#include <opaque_fragment>'
            : '#include <encodings_fragment>';
          shader.fragmentShader =
            'varying float vFade;\n' +
            shader.fragmentShader.replace(anchor, 'gl_FragColor.a *= vFade;\n' + anchor);
        };
        return mat;
      };
      this.cloud = this.makeMesh(
        cloudGeo(),
        cloudFadeShader(
          new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.62,
            depthWrite: false,
          }),
        ),
        BUDGET.clouds,
      );
      this.cloud.castShadow = false;
      this.cloud.receiveShadow = false;
      this.scene.add(this.cloud);
      // 下面那层平时是不透明的，但也得能淡出，所以照样走 transparent；
      // depthWrite 保持 true，淡入淡出之外的绝大多数帧看起来仍是不透明的实心云。
      this.cloudLow = this.makeMesh(
        cloudGeo(),
        cloudFadeShader(new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true })),
        BUDGET.clouds,
      );
      this.cloudLow.castShadow = false;
      this.cloudLow.receiveShadow = false;
      this.scene.add(this.cloudLow);
      this.flames = this.makeMesh(
        new THREE.ConeGeometry(1, 1, 5),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.66,
          depthWrite: false,
        }),
        BUDGET.flames,
      );
      this.flames.castShadow = false;
      this.scene.add(this.flames);
      this.fireCores = this.makeMesh(
        this.flames.geometry,
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        BUDGET.fireCores,
      );
      this.fireCores.castShadow = false;
      this.scene.add(this.fireCores);
      this.waterfalls = this.makeMesh(
        this.box,
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        BUDGET.waterfalls,
      );
      this.waterfalls.castShadow = false;
      this.scene.add(this.waterfalls);
      // 接地阴影贴片（contact shadow，也叫 blob shadow）：脚底下那一小片软影子。
      //
      // 为什么要它：阴影贴图(shadow map)画的是"太阳直射被挡住的影子"，太阳斜的时候
      // 会跟物体脱开（就是 peter-panning，之前量过 bias 从 -0.0012 调到 0 都纹丝不动）。
      // 接地阴影补的是另一件事——**接触点附近的环境光被物体自己挡住**（ambient occlusion），
      // 影子贴图原理上画不出来，因为那不依赖太阳方向。两者叠加，物体才像"踩在地上"。
      //
      // 踩过的坑：曾经把动物脚下**那一整格地砖**乘 0.78 压暗，被否决了。
      // 一只羊的脚只占一格的一小块，整格染色读作"地砖换色"而不是"有影子"。
      // 所以这里是一片独立贴片，尺寸由模型自己脚的包围盒算出来，绝不超过一格。
      this.contacts = this.makeMesh(
        (() => {
          const g = new THREE.PlaneGeometry(1, 1);
          g.rotateX(-Math.PI / 2);                     // 躺平在 xz 平面上
          const a = new THREE.InstancedBufferAttribute(new Float32Array(BUDGET.contacts), 1);
          a.setUsage(THREE.DynamicDrawUsage);
          g.setAttribute('aDark', a);                  // 每片各自的浓度（腾空时变淡）
          return g;
        })(),
        // 用 ShaderMaterial 而不是贴图：径向渐隐直接在片元里算，不需要美术资源，
        // npm run build 内联离线版时也就没有多出来的东西要打包。
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
          vertexShader: [
            'attribute float aDark;',
            'varying vec2 vUv;',
            'varying float vDark;',
            'void main() {',
            '  vUv = uv; vDark = aDark;',
            '  #ifdef USE_INSTANCING',
            '    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);',
            '  #else',
            '    vec4 mv = modelViewMatrix * vec4(position, 1.0);',
            '  #endif',
            '  gl_Position = projectionMatrix * mv;',
            '}',
          ].join('\n'),
          fragmentShader: [
            'varying vec2 vUv;',
            'varying float vDark;',
            'void main() {',
            // d: 0 = 贴片正中心，1 = 边缘。smoothstep 让边界化开，而不是一刀切出硬边。
            '  float d = length(vUv - 0.5) * 2.0;',
            '  float a = smoothstep(1.0, 0.15, d);',
            '  a = pow(a, 1.5) * vDark;',
            // 直接输出半透明黑：叠在地面上就是"这里被压暗"，不必读回地面颜色。
            '  gl_FragColor = vec4(0.10, 0.09, 0.08, a);',
            '}',
          ].join('\n'),
        }),
        BUDGET.contacts,
      );
      this.contacts.castShadow = false;
      this.contacts.receiveShadow = false;
      this.contacts.renderOrder = 2;                   // 压在地面之后画
      this.scene.add(this.contacts);
      this.cursor = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.04, 1),
        new THREE.MeshBasicMaterial({ color: 0xffe4a2, transparent: true, opacity: 0.55 }),
      );
      this.cursor.visible = false;
      this.scene.add(this.cursor);
      this.ray = new THREE.Raycaster();
      this.labels = [];
      this.labelRoot = document.getElementById('worldLabels');
      this.pointers = new Map();
      this.bind();
      this.dayPhase = 0.02; // 从清晨稍后一点开始
      this.dayLengthMs = 240000; // 一昼夜 4 分钟
      this.dayCycle = true;
      this.lastDayT = 0;
      this.lastDayApply = -1e9;
      this.setTimeOfDay('dynamic');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      // 页面布局会变（切到观察模式时页脚被隐藏、打开对话框、手机转屏），必须跟着重新测量画布，
      // 否则渲染尺寸和显示尺寸对不上，画面会被拉伸——看起来就像"视角/倾角变了"。
      if (typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(this.canvas.parentElement || this.canvas);
      }
    }
    makeMesh(g, m, n) {
      let mesh = new THREE.InstancedMesh(g, m, n);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      mesh.count = 0;
      return mesh;
    }
    // 只有地形网格有这个属性；其它网格静默跳过
    writeSway(mesh, n, value) {
      if (mesh !== this.mesh) return;
      const attr = mesh.geometry.attributes.aSway;
      if (attr) attr.array[n] = value;
    }
    // 云的两层网格各有一份 aFade（见构造函数里为什么要各自一份几何）
    writeFade(mesh, n, value) {
      const attr = mesh.geometry.attributes.aFade;
      if (attr) attr.array[n] = value;
    }
    // rz = 绕动物前后轴的左右歪（tilt）；rx = 绕动物左右轴的前后摆（pitch，腿就是靠它绕胯转的）。
    // 欧拉顺序用 YXZ（先绕自身转再转向）而不是默认的 XYZ：默认顺序里 rx 会在 yaw 之后生效，
    // 那就变成绕世界坐标轴转了，动物一转身腿就摆错方向。
    // rz/rx 都默认为 0 时，YXZ 的矩阵是 Ry·Rz，和原来的 XYZ(=Rx·Ry·Rz) 完全一样，
    // 所以现有调用点一个都不用改。
    put(mesh, x, y, z, w, h, d, color, ry = 0, rz = 0, rx = 0) {
      let n = mesh.count++;
      if (n >= mesh.instanceMatrix.count) throw Error('模型实例超过预算');
      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(rx, ry, rz, 'YXZ');
      this.dummy.scale.set(w, h, d);
      this.dummy.updateMatrix();
      mesh.setMatrixAt(n, this.dummy.matrix);
      this.color.setHex(color).convertSRGBToLinear();
      mesh.setColorAt(n, this.color);
      this.writeSway(mesh, n, this.swayFlag ? 1 : 0);
    }
    boxAt(x, y, z, w, h, d, color, ry = 0, rz = 0) {
      this.put(this.mesh, x, y, z, w, h, d, color, ry, rz);
    }
    // 岛缘岩裙的方块清单（抽出来是为了让测试能拿到和游戏完全一致的几何）
    cliffBoxes(s) {
      const out = [];
      s.cells.forEach((c, i) => {
        if (!c) return;
        const gx = i % s.w,
          gz = Math.floor(i / s.w),
          x = gx - s.w / 2 + 0.5,
          z = gz - s.h / 2 + 0.5,
          r = Math.min(1, Eco.islandRadius(gx, gz, s.w, s.h)),
          d = 1.1 + 3 * (1 - r) + 0.28 * Math.sin(x * 0.9 + z * 0.7);
        out.push([x, -0.3625, z, 1, 0.625, 1, 0x8d7659]);
        out.push([
          x,
          -0.675 - d / 2,
          z,
          1,
          d,
          1,
          [0x7e8173, 0x8e8c78, 0x99927a][Math.abs(Math.floor(x / 4 + z / 3)) % 3],
        ]);
      });
      return out;
    }
    setWorld(s) {
      this.world = s;
      this.dirty = true;
      this.lastTick = -1;
      this.motion = new WeakMap();
      this.focus = null;
      this.selected = -1;
      this.hover = -1;
      this.zoom = this.targetZoom = 1;
      this.look.set(0, 0, 0);
      this.targetLook.set(0, 0, 0);
      if (this.cliff) {
        this.scene.remove(this.cliff);
        this.cliff.material.dispose();
        this.cliff.dispose?.();
      }
      this.cliff = this.makeMesh(
        this.box,
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        s.cells.length * 2,
      );
      for (const box of this.cliffBoxes(s)) this.put(this.cliff, ...box);
      this.cliff.instanceMatrix.needsUpdate = true;
      this.cliff.instanceColor.needsUpdate = true;
      this.scene.add(this.cliff);
      this.resize();
      this.clouds = this.buildClouds(s);
      this.draw(0);
    }
    // 光影应用：太阳/半球光/曝光/阴影范围/画布天空底色
    applyLighting(p) {
      this.sun.color.setHex(p.sunColor);
      this.sun.intensity = p.sunIntensity;
      this.sun.position.set(p.sunPos[0], p.sunPos[1], p.sunPos[2]);
      this.hemi.color.setHex(p.skyColor);
      this.hemi.groundColor.setHex(p.groundColor);
      this.hemi.intensity = p.hemiIntensity;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = p.exposure;
      Object.assign(this.sun.shadow.camera, {
        left: -p.shadowSpan,
        right: p.shadowSpan,
        top: p.shadowSpan,
        bottom: -p.shadowSpan,
        // 近远面跟构造器保持一致：只罩住岛 + 太阳就够，别把深度范围摊大，
        // 否则 bias 折算到地面上的偏移会被放大（原来这里写的是 0.1 / 200）。
        near: 2,
        far: 80,
      });
      this.sun.shadow.camera.updateProjectionMatrix();
      if (this.canvas) this.canvas.style.background = p.sky;
      this.dirty = true;
    }
    // 时段：'dynamic' 走 4 分钟一轮的昼夜循环；其余名字定格到那一档
    setTimeOfDay(name) {
      if (name === 'dynamic') {
        this.timeOfDay = 'dynamic';
        this.dayCycle = true;
        this.applyLighting(resolvePhase(this.dayPhase || 0));
        return;
      }
      if (!(name in TIME_PRESETS)) name = 'dawn';
      this.timeOfDay = name;
      this.dayCycle = false;
      this.applyLighting(resolvePhase(DAY_KEYS[TIME_PRESETS[name]].at));
    }
    resize() {
      let w = Math.max(1, this.canvas.clientWidth),
        h = Math.max(1, this.canvas.clientHeight);
      this.renderer.setPixelRatio(
        Math.min(devicePixelRatio || 1, this.quality === 'high' ? 2 : 1.5),
      );
      this.renderer.setSize(w, h, false);
      this.width = w;
      this.height = h;
      this.updateCamera(1);
    }
    setQuality(q) {
      this.quality = q;
      this.renderer.shadowMap.enabled = q !== 'low';
      // 只有"清晰"档付得起更细的阴影图；换分辨率要连 bias 一起换到匹配痱子的档位
      if (q !== 'low') this.setShadowMapSize(q === 'high' ? 2048 : 1024);
      this.resize();
    }
    // 换阴影图分辨率：three.js 不会自己重建已经建好的阴影贴图，
    // 必须把旧的 dispose 掉、置空，下一帧才会按新尺寸重新渲染一张。
    setShadowMapSize(px) {
      const sh = this.sun.shadow;
      if (sh.mapSize.x === px) return;
      sh.mapSize.set(px, px);
      if (sh.map) {
        sh.map.dispose();
        sh.map = null;
      }
      const tune = SHADOW_TUNING[px] || SHADOW_TUNING[1024];
      sh.bias = tune.bias;
      sh.normalBias = tune.normalBias;
    }
    updateCamera(k) {
      if (!this.world) return;
      this.zoom += (this.targetZoom - this.zoom) * k;
      this.look.lerp(this.targetLook, k);
      let a = this.width / this.height,
        extent =
          Math.max((this.world.w * 0.65) / Math.max(0.65, a), this.world.h * 0.82, 8) * this.zoom;
      // 相机绕岛心转圈：水平距离与高度都由倾角（仰角）决定，默认 38.7° 与之前的构图完全一致。
      // 倾角越大越俯视，越小越接近平视；半径不变，所以画面大小不受影响。
      const R = 57.6,
        cp = Math.cos(this.pitch),
        sp = Math.sin(this.pitch);
      this.camera.left = -extent * a;
      this.camera.right = extent * a;
      this.camera.top = extent;
      this.camera.bottom = -extent;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(
        this.look.x + Math.sin(this.yaw) * R * cp,
        this.look.y + R * sp,
        this.look.z + Math.cos(this.yaw) * R * cp,
      );
      this.camera.lookAt(this.look);
      this.camera.updateMatrixWorld();
    }
    screenCell(i) {
      if (!this.world?.cells[i]) return null;
      const r = this.canvas.getBoundingClientRect(),
        v = new THREE.Vector3(
          (i % this.world.w) - this.world.w / 2 + 0.5,
          Eco.surfaceHeight(this.world.cells[i]) + 0.2,
          Math.floor(i / this.world.w) - this.world.h / 2 + 0.5,
        ).project(this.camera);
      return { x: r.left + ((v.x + 1) * r.width) / 2, y: r.top + ((1 - v.y) * r.height) / 2 };
    }
    focusCell(i) {
      if (!this.world?.cells[i]) return;
      this.focus = i;
      this.targetLook.set(
        (i % this.world.w) - this.world.w / 2 + 0.5,
        Eco.surfaceHeight(this.world.cells[i]) + 0.3,
        Math.floor(i / this.world.w) - this.world.h / 2 + 0.5,
      );
      this.targetZoom = Math.max(0.14, Math.min(0.28, 5 / this.world.w));
    }
    pan(dx, dy) {
      if (!this.world) return;
      const factor = (this.camera.top - this.camera.bottom) / Math.max(1, this.height);
      this.targetLook.x += (-dx * Math.cos(this.yaw) - dy * Math.sin(this.yaw)) * factor;
      this.targetLook.z += (dx * Math.sin(this.yaw) - dy * Math.cos(this.yaw)) * factor;
      this.targetLook.x = Math.max(
        -this.world.w / 2,
        Math.min(this.world.w / 2, this.targetLook.x),
      );
      this.targetLook.z = Math.max(
        -this.world.h / 2,
        Math.min(this.world.h / 2, this.targetLook.z),
      );
      this.focus = null;
    }
    overview() {
      this.focus = null;
      this.targetLook.set(0, 0, 0);
      this.targetZoom = 1;
    }
    // 相纸是斜的，画布跟着歪。屏幕坐标要先逆着这层旋转回到画布本地坐标系，
    // 否则鼠标越靠边，落点偏得越多（0.6° 在 800px 宽上约 4px，正好错开一格）。
    screenToCanvas(cx, cy) {
      const el = this.canvas,
        w = Math.max(1, el.clientWidth),
        h = Math.max(1, el.clientHeight),
        stage = el.closest('#stage');
      const tf = stage ? getComputedStyle(stage).transform : '';
      if (!stage || !tf || tf === 'none') {
        const r = el.getBoundingClientRect();
        return [cx - r.left, cy - r.top, w, h];
      }
      const m = new DOMMatrix(tf),
        sr = stage.getBoundingClientRect(),
        cs = getComputedStyle(stage),
        padX = parseFloat(cs.paddingLeft) || 0,
        padY = parseFloat(cs.paddingTop) || 0;
      const dx = cx - (sr.left + sr.width / 2),
        dy = cy - (sr.top + sr.height / 2);
      return [
        dx * m.a + dy * m.b + stage.clientWidth / 2 - padX,
        -dx * m.b + dy * m.a + stage.clientHeight / 2 - padY,
        w,
        h,
      ];
    }
    pick(cx, cy) {
      if (!this.world) return -1;
      const [lx, ly, w, h] = this.screenToCanvas(cx, cy),
        v = new THREE.Vector2((lx / w) * 2 - 1, -(ly / h) * 2 + 1);
      this.ray.setFromCamera(v, this.camera);
      return this.rayCell(this.ray.ray.origin, this.ray.ray.direction);
    }
    // 高度感知拾取：沿射线粗步长前进找到第一个命中采样点，再二分细化到该格地表的精确交点。
    // 于是更高的山峰会遮挡其身后的格子。旧实现直接与 y=0 平面求交：相机俯角约 38.7°，
    // 6 格高的峰会让点选位置向后偏约 7.5 格（想在山顶点东西却点到山背后）。
    // 纯几何、不依赖 THREE，因此可在 Node 里用 Object.create(GardenView.prototype) 直接测试。
    // 除了格子下标，同时返回命中距离 t——判断"云有没有挡在岛前面"要用它。
    rayGroundHit(origin, dir) {
      const none = { cell: -1, t: -1 };
      const s = this.world;
      if (!s || !dir || !(dir.y < 0)) return none;
      const cellAt = (t) => {
        const x = Math.floor(origin.x + dir.x * t + s.w / 2),
          y = Math.floor(origin.z + dir.z * t + s.h / 2);
        return x < 0 || y < 0 || x >= s.w || y >= s.h ? -1 : y * s.w + x;
      };
      const hit = (t) => {
        const i = cellAt(t);
        return i >= 0 && !!s.cells[i] && origin.y + dir.y * t <= Eco.surfaceHeight(s.cells[i]);
      };
      const maxT = (0 - origin.y) / dir.y + 1;
      let lo = -1;
      for (let t = 0; t <= maxT; t += 0.2)
        if (hit(t)) {
          lo = t;
          break;
        }
      if (lo < 0) return none;
      let hi = lo;
      lo = Math.max(0, lo - 0.2);
      for (let k = 0; k < 8; k++) {
        const mid = (lo + hi) / 2;
        if (hit(mid)) hi = mid;
        else lo = mid;
      }
      const i = cellAt(hi);
      return i >= 0 && s.cells[i] ? { cell: i, t: hi } : none;
    }
    rayCell(origin, dir) {
      return this.rayGroundHit(origin, dir).cell;
    }
    bind() {
      let dragging = false,
        start = null,
        pinch = 0,
        angle = 0,
        mode = 'rotate',
        painted = false,
        visited = new Set();
      const c = this.canvas;
      const paintLine = (from, to) => {
        let distance = Math.hypot(to[0] - from[0], to[1] - from[1]),
          steps = Math.max(1, Math.ceil(distance / 5));
        for (let k = 0; k <= steps; k++) {
          let i = this.pick(
            from[0] + ((to[0] - from[0]) * k) / steps,
            from[1] + ((to[1] - from[1]) * k) / steps,
          );
          if (i >= 0 && !visited.has(i)) {
            visited.add(i);
            this.onPick(i, true);
            painted = true;
          }
        }
      };
      c.addEventListener('pointerdown', (e) => {
        c.setPointerCapture?.(e.pointerId);
        this.pointers.set(e.pointerId, [e.clientX, e.clientY]);
        if (this.pointers.size === 1) {
          start = [e.clientX, e.clientY];
          dragging = false;
          painted = false;
          visited.clear();
          mode =
            e.button === 1 || e.shiftKey || this.panMode
              ? 'pan'
              : e.button !== 0 || !this.isPainting?.() || this.pick(e.clientX, e.clientY) < 0
                ? 'rotate'
                : 'paint';
        } else {
          dragging = true;
          mode = 'pinch';
          let a = [...this.pointers.values()];
          pinch = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]);
          angle = Math.atan2(a[1][1] - a[0][1], a[1][0] - a[0][0]);
        }
      });
      c.addEventListener('pointermove', (e) => {
        let p = this.pointers.get(e.pointerId);
        if (p) {
          const oldPoints = [...this.pointers.values()],
            oldCenter =
              oldPoints.length > 1
                ? [(oldPoints[0][0] + oldPoints[1][0]) / 2, (oldPoints[0][1] + oldPoints[1][1]) / 2]
                : null;
          let q = [e.clientX, e.clientY],
            dx = q[0] - p[0];
          this.pointers.set(e.pointerId, q);
          if (this.pointers.size === 1 && mode !== 'pinch') {
            let begun = !dragging && start && Math.hypot(q[0] - start[0], q[1] - start[1]) > 9;
            if (begun) {
              dragging = true;
              this.lastClick = null;
            }
            if (dragging) {
              if (mode === 'paint') paintLine(begun ? start : p, q);
              else if (mode === 'pan') this.pan(dx, q[1] - p[1]);
              else {
                this.yaw -= dx * 0.008;
                this.pitch = Math.min(
                  GardenView.PITCH_MAX,
                  Math.max(GardenView.PITCH_MIN, this.pitch + (q[1] - p[1]) * 0.004),
                );
                this.onDrag?.();
              }
            }
          } else if (this.pointers.size > 1) {
            let a = [...this.pointers.values()],
              d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]),
              next = Math.atan2(a[1][1] - a[0][1], a[1][0] - a[0][0]);
            if (oldCenter)
              this.pan(
                (a[0][0] + a[1][0]) / 2 - oldCenter[0],
                (a[0][1] + a[1][1]) / 2 - oldCenter[1],
              );
            if (pinch > 0 && d > 0)
              this.targetZoom = Math.max(0.14, Math.min(1.8, (this.targetZoom * pinch) / d));
            let delta = next - angle;
            if (delta > Math.PI) delta -= 2 * Math.PI;
            if (delta < -Math.PI) delta += 2 * Math.PI;
            this.yaw -= delta;
            pinch = d;
            angle = next;
          }
        }
        this.hover = this.pick(e.clientX, e.clientY);
      });
      c.addEventListener('pointerup', (e) => {
        let single = this.pointers.size === 1;
        this.pointers.delete(e.pointerId);
        const now = performance.now(),
          hit = this.pick(e.clientX, e.clientY),
          dbl =
            single &&
            !dragging &&
            !!this.lastClick &&
            now - this.lastClick.t < 340 &&
            Math.hypot(e.clientX - this.lastClick.x, e.clientY - this.lastClick.y) < 16;
        if (single && !dragging && start && e.button === 0 && mode !== 'pan') {
          const used = dbl && this.onDoublePick ? this.onDoublePick(hit) !== false : false;
          if (!used) this.onPick(hit);
        }
        this.lastClick = dbl ? null : { t: now, x: e.clientX, y: e.clientY };
        if (this.pointers.size === 0) {
          if (painted) this.onStrokeEnd?.();
          start = null;
          dragging = false;
          pinch = 0;
          visited.clear();
        }
      });
      c.addEventListener('pointercancel', (e) => {
        this.pointers.delete(e.pointerId);
        if (painted) this.onStrokeEnd?.();
        painted = false;
        dragging = true;
        start = null;
      });
      c.addEventListener('lostpointercapture', () => {
        if (painted && this.pointers.size === 0) {
          painted = false;
        }
      });
      c.addEventListener(
        'wheel',
        (e) => {
          e.preventDefault();
          this.targetZoom = Math.max(
            0.14,
            Math.min(1.8, this.targetZoom * (e.deltaY > 0 ? 1.1 : 0.9)),
          );
        },
        { passive: false },
      );
      c.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    draw(t) {
      if (!this.world) return;
      let s = this.world,
        m = this.mesh;
      m.count = 0;
      let labelList = [];
      const b = (...args) => this.boxAt(...args);
      s.cells.forEach((c, i) => {
        if (!c) return;
        let x = (i % s.w) - s.w / 2 + 0.5,
          z = Math.floor(i / s.w) - s.h / 2 + 0.5,
          phase = 0,
          variant = c.variant || 0,
          wet = c.moist >= 0.6;
        const waterCell = ['water', 'spring'].includes(c.ground),
          terr = c.elevation || 0,
          bare = c.ground === 'mountain';
        // 体素环境光遮蔽：四周比它高的格子越多、越高，这一格越暗（凹处/墙根变暗）
        const voxelAO = this.voxelAO(s, i, terr);
        if (!bare && terr > 0.12)
          b(x, (terr - 0.1) / 2, z, 1, terr, 1, shadeHex(0x8d7659, voxelAO * 0.95));
        let ground = c.ground === 'ash' ? 0x7f756a : c.moist >= 0.6 ? 0x9c9a6b : 0xb7a57c;
        if (c.ground === 'soil' && c.fert >= 0.4) ground = c.moist >= 0.6 ? 0x858558 : 0x9b8965;
        if (!bare) b(x, terr, z, 1, 0.1, 1, shadeHex(ground, voxelAO));
        if (['water', 'spring'].includes(c.ground)) {
          b(x, terr + 0.11, z, 1, 0.12, 1, c.ground === 'spring' ? 0x53a9b5 : 0x71b3c2);
          if (i % 3 === 0) b(x - 0.1, terr + 0.18, z, 0.5, 0.025, 0.07, 0xc2e4df);
        }
        if (c.ground === 'rock') {
          b(x, terr + 0.26, z, 0.76, 0.52, 0.7, shadeHex(0x8c9490, voxelAO));
          b(x - 0.12, terr + 0.57, z + 0.03, 0.48, 0.16, 0.5, 0xb3b6a6);
        }
        if (bare) {
          const el = c.elevation || 1.8,
            slices = Math.max(3, Math.min(10, Math.round(el / 1.05))),
            base = -0.05,
            total = el - base;
          for (let k = 0; k < slices; k++) {
            const y = base + ((k + 0.5) * total) / slices,
              shrink = (k / slices) * 0.46;
            let left = shrink / 2,
              right = shrink / 2,
              front = shrink / 2,
              back = shrink / 2;
            const linked = (j) =>
              s.cells[j]?.ground === 'mountain' && (s.cells[j].elevation || 0) >= y;
            if (i % s.w > 0 && linked(i - 1)) left = 0;
            if (i % s.w < s.w - 1 && linked(i + 1)) right = 0;
            if (linked(i - s.w)) front = 0;
            if (linked(i + s.w)) back = 0;
            b(
              x + (left - right) / 2,
              y,
              z + (front - back) / 2,
              1 - left - right,
              total / slices,
              1 - front - back,
                shadeHex(
                  k === slices - 1 && el > 5
                    ? 0xe2e8df
                    : [0x777f78, 0x858b7d, 0x969b8b][(k + (i % 2)) % 3],
                  // 山体也要吃环境光遮蔽：越靠下越暗，夹在两峰之间的岩面压暗
                  voxelAO * (0.80 + 0.20 * (k / slices)),
                ),
            );
          }
        }
        this.swayFlag = 1;
        GardenModels.plants({
          b: (...a) => this.boxAt(a[0], a[1] + terr, a[2], ...a.slice(3)),
          c,
          i,
          x,
          z,
          variant,
          wet,
          labelList,
        });
        this.swayFlag = 0;
        if (c.ground === 'ash' && !c.plant && c.ash > 0 && i % 3 === 0)
          b(x, terr + 0.18, z, 0.25, 0.15, 0.16, 0x9a8e86);
      });
      // 圆环本身不在这里画：draw() 只在"地形变了"时才跑，画在这里就永远动不了。
      // 只把清单留下来，交给每帧都跑的 drawMarkers()。
      this.labelData = labelList;
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor.needsUpdate = true;
      this.flames.instanceMatrix.needsUpdate = true;
      this.flames.instanceColor.needsUpdate = true;
      this.fireCores.instanceMatrix.needsUpdate = true;
      this.fireCores.instanceColor.needsUpdate = true;
      if (this.swayAttr) this.swayAttr.needsUpdate = true;
      this.lastDraw = t;
      this.dirty = false;
      this.lastTick = s.tick;
    }
    // 地上那些小圆环标记：慢速轻轻浮起来再落回去，像在呼吸。
    // 幅度很小（抬 0.075 格、涨 12%），一个来回约 3.6 秒，并按格子错开相位，
    // 否则满地圆环会整齐划一地上下，像节拍器。用余弦形而不是硬摆，起落是平滑的。
    // 低画质（"轻量"档）下保持静止：那档本来就该省开销，也免得动态看着变形。
    drawMarkers(t) {
      const m = this.rings,
        list = this.labelData;
      if (!m || !list) return;
      m.count = 0;
      if (!this.showLabels) return;
      const s = this.world,
        still = this.quality === 'low';
      for (const [i, txt, col] of list) {
        if (!['种', '虫', '鸟', '蝶'].includes(txt)) continue;
        let lift = 0,
          k = 1;
        if (!still) {
          const ph = (t * 0.00028 + (i % 7) * 0.9) % 1,
            ease = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2);
          lift = ease * 0.075;
          k = 1 + ease * 0.12;
        }
        this.put(
          m,
          (i % s.w) - s.w / 2 + 0.5,
          Eco.surfaceHeight(s.cells[i]) + 0.16 + lift,
          Math.floor(i / s.w) - s.h / 2 + 0.5,
          // 圆环躺在 XZ 平面上，所以只放大 x/z；两轴同值就是等比，不会拉变形
          k,
          1,
          k,
          col,
        );
      }
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor.needsUpdate = true;
    }
    // 体素环境光遮蔽：看 8 个邻格比本格高多少，折算成一个 0.72~1 的亮度系数
    voxelAO(s, i, terr) {
      const x = i % s.w,
        z = Math.floor(i / s.w);
      let occ = 0;
      for (const [dx, dz, w] of [
        [1, 0, 1],
        [-1, 0, 1],
        [0, 1, 1],
        [0, -1, 1],
        [1, 1, 0.55],
        [1, -1, 0.55],
        [-1, 1, 0.55],
        [-1, -1, 0.55],
      ]) {
        const xx = x + dx,
          zz = z + dz;
        if (xx < 0 || zz < 0 || xx >= s.w || zz >= s.h) continue;
        const n = s.cells[zz * s.w + xx];
        if (!n) continue;
        const nh = n.ground === 'mountain' ? n.elevation || 1.8 : n.elevation || 0;
        const rise = nh - terr;
        if (rise > 0.05) occ += Math.min(1, rise / 1.5) * w;
      }
      return 1 - 0.28 * Math.min(1, occ / 2.2);
    }
    // 脚底高度：周围四格双线性插值，走坡/上台阶时是斜坡而不是瞬间抬升
    groundAt(s, ax, az) {
      const x0 = Math.max(0, Math.min(s.w - 2, Math.floor(ax - 0.5)));
      const z0 = Math.max(0, Math.min(s.h - 2, Math.floor(az - 0.5)));
      const fx = Math.max(0, Math.min(1, ax - 0.5 - x0));
      const fz = Math.max(0, Math.min(1, az - 0.5 - z0));
      const h = (x, z) => {
        const c = s.cells[z * s.w + x];
        return c ? Eco.surfaceHeight(c) : 0;
      };
      return (
        (h(x0, z0) * (1 - fx) + h(x0 + 1, z0) * fx) * (1 - fz) +
        (h(x0, z0 + 1) * (1 - fx) + h(x0 + 1, z0 + 1) * fx) * fz
      );
    }
    // 贴片要落的地板高度：中心加四个偏移点取**最高**的那格台面。
    // 取最高而不是取中心，是因为贴片有一点面积，跨到相邻更高的格子时，
    // 按中心高度放就会被那一格埋掉；取最高则保证整片都浮在地面之上。
    groundMax(s, px, pz, ox, oz) {
      let h = -1e9;
      for (const [dx, dz] of [
        [0, 0],
        [-ox, 0],
        [ox, 0],
        [0, -oz],
        [0, oz],
      ]) {
        const gx = Math.floor(px + dx + s.w / 2),
          gz = Math.floor(pz + dz + s.h / 2);
        if (gx < 0 || gz < 0 || gx >= s.w || gz >= s.h) continue;
        const c = s.cells[gz * s.w + gx];
        if (c) h = Math.max(h, Eco.surfaceHeight(c));
      }
      return h > -1e8 ? h : 0;
    }
    drawAnimals(t) {
      if (!this.world) return;
      const s = this.world,
        m = this.animals;
      m.count = 0;
      const mc = this.contacts;
      if (mc) mc.count = 0;
      const darkAttr = mc ? mc.geometry.attributes.aDark : null;
      // 接地阴影贴片。尺寸、位置都由模型自己脚的包围盒算出来，这里不按物种硬编码体型。
      // 上限 0.85 是硬性的：项目所有者明确否掉过"把脚踩的那一整格地砖压暗"，
      // 影子必须永远是脚下的一小块，不允许长成一整格。
      const shadow = (x, y, z, w, d, dark) => {
        if (!mc) return;
        w = Math.min(0.8, w);
        d = Math.min(0.8, d);
        if (w <= 0.04 || d <= 0.04) return;
        this.put(mc, x, y, z, w, 1, d, 0x1a1712);
        if (darkAttr) darkAttr.array[mc.count - 1] = dark;
      };
      const b = (...args) => this.put(m, ...args),
        labelList = [],
        dt = Math.min(60, Math.max(0, t - this.lastAnimalFrame)),
        blend = 1 - Math.exp(-dt / 170);
      this.lastAnimalFrame = t;
      s.cells.forEach((c, i) => {
        if (!c?.animal) return;
        // 模拟给的是格内连续坐标（格心在整数 + 0.5），这里只换成以岛心为原点
        const ax = c.animal.x ?? (i % s.w) + 0.5,
          az = c.animal.z ?? Math.floor(i / s.w) + 0.5;
        let x = ax - s.w / 2,
          z = az - s.h / 2,
          phase = Math.sin(t * 0.005 + (c.animal.variant || 0) * 1.3);
        if (c.animal) {
          let a = c.animal,
            state = this.motion.get(a);
          if (!state) {
            state = {
              x,
              z,
              y: Eco.surfaceHeight(c),
              yaw: a.dir || 0,
              pet: 0,
              heart: 0,
              phase: (a.variant || 0) * 1.3,
            };
            this.motion.set(a, state);
          }
          // 位置本身已经连续：正常只用 35ms 跟随（几乎不滞后，脚不会滑）；
          // 被水冲走/刚生成这种 1 格以上的跳变才用 130ms 慢平滑
          const jump = Math.hypot(x - state.x, z - state.z);
          const follow = 1 - Math.exp(-dt / (jump > 2.5 ? 130 : 35));
          state.y += (this.groundAt(s, ax, az) - state.y) * (1 - Math.exp(-dt / 90));
          state.phase += dt * 0.004;
          state.x += (x - state.x) * follow;
          state.z += (z - state.z) * follow;
          let turn = (a.dir || 0) - state.yaw;
          turn = Math.atan2(Math.sin(turn), Math.cos(turn));
          state.yaw += turn * blend;
          x = state.x;
          z = state.z;
          if (a.petUntil > s.tick && (a.petUntil || 0) > state.pet) {
            state.pet = a.petUntil;
            state.heart = t + 2200;
          }
          // 脚底接触阴影：越贴地越黑，腾空（被冲走/睡着压扁）时不画
          let bob = state.y + (a.sleep || a.type === 'bug' ? 0 : Math.sin(state.phase) * 0.014),
            yaw = state.yaw;
          let footY = Infinity,
            fx0 = Infinity,
            fx1 = -Infinity,
            fz0 = Infinity,
            fz1 = -Infinity;
          if (state.heart > t) {
            let rise = 1 - (state.heart - t) / 2200,
              hy = 2 + rise * 0.5,
              col = 0xe698a4;
            for (const [dx, dy] of [
              [-0.1, 0.09],
              [0.1, 0.09],
              [0, -0.03],
            ])
              b(x + dx, hy + dy, z, 0.18, 0.18, 0.12, col);
          }
          const part = (dx, y, dz, w, h, d, col, tilt = 0, pitch = 0) => {
            let xx = dx * Math.cos(yaw) + dz * Math.sin(yaw),
              zz = -dx * Math.sin(yaw) + dz * Math.cos(yaw);
            // 顺带记一下"贴着地的那一层"占了多大范围——这就是影子的尺寸。
            // 只有几个比较，不改模型文件，也不用在 scene.js 里给每个物种写一张体型表。
            if (y < footY - 1e-6) {
              footY = y;
              fx0 = fx1 = xx;
              fz0 = fz1 = zz;
            } else if (y <= footY + 0.16) {
              if (xx < fx0) fx0 = xx;
              if (xx > fx1) fx1 = xx;
              if (zz < fz0) fz0 = zz;
              if (zz > fz1) fz1 = zz;
            }
            b(
              x + xx,
              y + bob,
              z + zz,
              w,
              h,
              d,
              shadeHex(
                GardenPalette.animalColor(col, a.type, a.variant || 0),
                0.8 + 0.2 * Math.min(1, Math.max(0, y / 0.55)),
              ),
              yaw,
              tilt,
              pitch,
            );
          };
          GardenModels.animals({ a, part, phase, t, i, labelList });
          // 接地阴影：一片，落在脚的包围盒上。
          // 太阳在 (-12, 30, 18)，所以影子往 (+12, -18) 偏一点点，偏的量跟着影子大小走。
          // 腾空越高影子越淡越小（被水冲走、飞起来）：这是"接地"二字的含义——
          // 离地了就不该还有一圈实影子。
          if (footY !== Infinity) {
            const lift = Math.max(0, footY - CONTACT_FOOT_Y),
              k = Math.exp(-lift / 0.4);
            // 贴片要比脚的包围盒大出一圈。相机俯角约 38°，正好等于身高的量，
            // 所以只有比身体更宽的那一圈能露出来——贴着脚的尺寸画，等于全躲在肚子底下。
            const w = fx1 - fx0 + 0.2,
              dd = fz1 - fz0 + 0.2;
            const cx = x + (fx0 + fx1) / 2,
              cz = z + (fz0 + fz1) / 2;
            shadow(
              // 太阳在 (-12, 30, 18)，影子朝 (+12, -18) 偏。偏得比原来多，
              // 让它从身体下沿探出来，而不是整个缩在脚底。
              cx + w * CONTACT_SKEW,
              // 踩在脚下那一格的**真实台面**上，不是 state.y。
              // state.y 是双线性插值出来的平滑高度，在坡上会比旁边高的那格低一截，
              // 贴片按它放就会被地形埋掉——实测 10 片里有 2 片整个看不见。
              this.groundMax(s, cx, cz, w * 0.35, dd * 0.35) + 0.03,
              cz - dd * CONTACT_SKEW * 1.5,
              w * CONTACT_SPREAD * (1 + lift * 0.25),
              dd * CONTACT_SPREAD * (1 + lift * 0.25),
              CONTACT_DARK * k,
            );
          }
        }
      });
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor.needsUpdate = true;
      if (mc) {
        mc.instanceMatrix.needsUpdate = true;
        mc.instanceColor.needsUpdate = true;
        if (darkAttr) darkAttr.needsUpdate = true;
      }
    }
    // 云的形状与散布只算一次，之后每帧只做平移。
    // 尺寸从"岛的面积"反解，而不是拍脑袋给边长：岛的 1/4 留给下方那层的大云，
    // 上方那层再取它的 1/4。x 均匀铺满整个岛的宽度，风沿着 x 推，越界绕回来。
    buildClouds(s) {
      let land = 0;
      for (const c of s.cells) if (c) land++;
      // 风沿着 x 推，所以 x 铺满整个岛的宽度再各自漂移、越界绕回来；
      // z 不动，只把各团错开铺在岛的 z 跨度上，免得全挤在一条线上。
      const spanX = Math.max(s.w * 1.5, 60),
        spanZ = Math.max(s.h * 1.2, 34);
      // 由俯视面积 π·a·c 反解半轴：先定 a/c 与 b/c 的比例，再解出 c。
      const axes = (area) => {
        const cz = Math.sqrt(area / Math.PI / CLOUD_ASPECT);
        return { a: CLOUD_ASPECT * cz, c: cz, b: cz * CLOUD_FLAT };
      };
      const lowAx = axes(land / 4),
        upAx = axes(land / 16);
      const step = 2 / (CLOUD_GRID - 1);
      const fill = (arr, ax, seed0, yOf, tintOf) => {
        for (let k = 0; k < arr.length; k++) {
          const c = (arr[k] = arr[k] || {});
          c.a = ax.a;
          c.b = ax.b;
          c.c = ax.c;
          // 相邻方块故意做得比间距略大，让它们互相嵌进去一点。
          // 严丝合缝的话外面全是平的面和接缝，看着就是"码起来的积木"；
          // 嵌一点之后只有最外圈露出来，整团就糊成一块面，参差也更自然。
          c.sx = ax.a * step * CLOUD_OVERLAP;
          c.sy = ax.b * step * CLOUD_OVERLAP;
          c.sz = ax.c * step * CLOUD_OVERLAP;
          // x 均匀铺满岛的宽度：每团之间错开，避免全挤在一头；x 也是风来的方向
          c.x0 = -spanX / 2 + ((k + 0.5) / arr.length) * spanX;
          c.z = -spanZ / 2 + ((k * 7.3 + 5) % spanZ);
          c.y = yOf(k);
          c.v = 0.5 + (k % 4) * 0.15;
          c.tint = tintOf(k);
          c.seed = seed0 + k;
        }
      };
      const up = new Array(CLOUD_UP),
        low = new Array(CLOUD_LOW);
      fill(
        up,
        upAx,
        1,
        (k) => 3.8 + (k % 3) * 2.6,
        (k) => (k % 3 === 0 ? 0xf6f1e4 : k % 3 === 1 ? 0xfdfbf5 : 0xeef2ea),
      );
      // 下方那层一律沉到岛的底面以下：岛的底在 y=0，云的半高是 b（现在 4.86），
      // 中心必须低于 -b，否则云顶会顶进岛的侧壁、在岛边沿上糊出一块白。
      fill(low, lowAx, 101, (k) => -lowAx.b - 1.2 - (k % 3) * 1.6 - (k % 2) * 1.1, () => 0xe7e9e2);
      for (const c of up) c.blocks = makeCloudShape(c.seed, CLOUD_GRID);
      for (const c of low) c.blocks = makeCloudShape(c.seed, CLOUD_GRID);
      const footprint = (arr) => arr.reduce((a, c) => a + Math.PI * c.a * c.c, 0) / Math.max(1, arr.length);
      return { up, low, spanX, spanZ, land, areaRatio: footprint(up) / Math.max(1e-6, footprint(low)) };
    }
    // 上方那层云的高度基准 + 岛的平面包围盒：全岛当前最高的地表。
    // 玩家可以堆山，所以这两个值不能只在建世界时算一次——按 tick 变化重算，一拍一次就够，
    // 不必每帧扫全岛。低于它的云会被山穿过去，那就不叫"在岛的上方"了。
    cloudFloor() {
      const s = this.world;
      if (!s) return 0;
      if (this.cloudFloorTick !== s.tick) {
        let top = 0,
          minX = 1e9,
          maxX = -1e9,
          minZ = 1e9,
          maxZ = -1e9;
        for (let i = 0; i < s.cells.length; i++) {
          const c = s.cells[i];
          if (!c) continue;
          const x = (i % s.w) - s.w / 2 + 0.5,
            z = Math.floor(i / s.w) - s.h / 2 + 0.5;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
          top = Math.max(top, Eco.surfaceHeight(c));
        }
        this.cloudFloorY = top;
        this.cloudBox = { minX, maxX, minZ, maxZ, top };
        this.cloudFloorTick = s.tick;
      }
      return this.cloudFloorY;
    }
    // 一朵云该保留多少可见度：返回 1（完全看得见）到 0（完全透明）。
    // 做法就是"镜头里的锥角"：把云心和岛心都投到相机的成像平面上，看两件事——
    //   rad   云心横向偏出岛轮廓多远（1 = 正好压在岛轮廓边上，越小越正中）
    //   depth 云比岛心近多少（> 0 才谈得上挡视线）
    // 两个条件同时成立才算挡路，于是横向飘开、或退到岛后面的云都照样看得见。
    // 全程连续、没有"是/否"的跳变——云是慢慢飘进来的，也就该慢慢淡出去，
    // 而不是"啪"一下消失。阈值是量出来的：正挡在相机与岛之间的标尺云 rad=0.12，
    // 岛外远处的标尺云 rad=3.3，中间这一段就是渐变的行程。
    cloudBlockFade(x, y, z, a) {
      const box = this.cloudBox;
      if (!box) return 1;
      const cam = this.camera;
      cam.updateMatrixWorld();
      // three.js 的矩阵是列主序：0..3 是相机右、4..7 是相机上、8..11 是本地 +Z（视线是它的反向）
      const e = cam.matrixWorld.elements;
      const rx = e[0],
        ry = e[1],
        rz = e[2],
        ux = e[4],
        uy = e[5],
        uz = e[6],
        fx = -e[8],
        fy = -e[9],
        fz = -e[10];
      const c0x = (box.minX + box.maxX) / 2,
        c0y = box.top,
        c0z = (box.minZ + box.maxZ) / 2;
      const dx = x - c0x,
        dy = y - c0y,
        dz = z - c0z;
      // 岛在镜头里占多大：把包围盒 8 个角投到相机的右/上两条轴上，取最远的一个
      let ru = 0,
        rv = 0;
      for (let i = 0; i < 8; i++) {
        const px = (i & 1 ? box.maxX : box.minX) - c0x,
          py = (i & 2 ? box.top : 0) - c0y,
          pz = (i & 4 ? box.maxZ : box.minZ) - c0z;
        const a1 = Math.abs(px * rx + py * ry + pz * rz);
        if (a1 > ru) ru = a1;
        const a2 = Math.abs(px * ux + py * uy + pz * uz);
        if (a2 > rv) rv = a2;
      }
      if (ru < 1e-3 || rv < 1e-3) return 1;
      const depth = -(dx * fx + dy * fy + dz * fz);
      if (depth <= 0) return 1;
      const rad = Math.hypot((dx * rx + dy * ry + dz * rz) / ru, (dx * ux + dy * uy + dz * uz) / rv);
      // 云的横向跨度换算到"岛轮廓"的单位：云心完全飘出轮廓才谈得上不挡路
      const span = (a / ru + a / rv) / 2;
      const lateral = smoothstep(1 + span, Math.max(0, 1 - span), rad);
      const near = smoothstep(0, a, depth);
      return 1 - lateral * near;
    }
    // 云：上半透明那层铺在岛面上方，下半不透明那层沉在 y<0。
    // 风沿着 x 推，所以只有 x 在动；z 保持铺在岛的 z 跨度上不动。
    drawClouds(t) {
      const m = this.cloud,
        mLow = this.cloudLow;
      if (!m || !mLow) return;
      m.count = 0;
      mLow.count = 0;
      const groups = this.clouds;
      if (!groups) return;
      const drift = t * 0.00035;
      const floor = this.cloudFloor();
      const place = (mesh, list, isUp) => {
        for (const c of list) {
          let cx = ((c.x0 + drift * c.v) % groups.spanX + groups.spanX) % groups.spanX;
          cx -= groups.spanX / 2;
          const cy = isUp ? floor + c.y : c.y;
          // 淡到 0 的整朵跳过，不再往实例缓冲里写——既是省事，也免得白白占预算
          const fade = this.cloudBlockFade(cx, cy, c.z, c.a);
          if (fade <= 0.004) continue;
          for (const [ox, oy, oz] of c.blocks) {
            this.put(mesh, cx + ox * c.a, cy + oy * c.b, c.z + oz * c.c, c.sx, c.sy, c.sz, c.tint);
            this.writeFade(mesh, mesh.count - 1, fade);
          }
        }
      };
      place(m, groups.up, true);
      place(mLow, groups.low, false);
      for (const mesh of [m, mLow]) {
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        const fa = mesh.geometry.attributes.aFade;
        if (fa) fa.needsUpdate = true;
      }
    }
    drawEffects(t) {
      const s = this.world;
      if (!s) return;
      this.flames.count = 0;
      this.fireCores.count = 0;
      this.waterfalls.count = 0;
      const b = (...args) => this.put(this.waterfalls, ...args);
      s.cells.forEach((c, i) => {
        if (!c) return;
        const x = (i % s.w) - s.w / 2 + 0.5,
          z = Math.floor(i / s.w) - s.h / 2 + 0.5;
        if (['water', 'spring'].includes(c.ground)) {
          const myY = Eco.surfaceHeight(c);
          if (c.flow) {
            const fd = Eco.FLOW_DIR[c.flow - 1],
              ph = (t * 0.0006 + i * 0.13) % 1;
            for (let k = 0; k < 3; k++) {
              const f = (ph + k / 3) % 1;
              b(
                x + fd[0] * f,
                myY + 0.2,
                z + fd[1] * f,
                fd[0] ? 0.06 : 0.18,
                0.02,
                fd[1] ? 0.06 : 0.18,
                0xe2f6f8,
              );
            }
          }
          for (const [dx, dz] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ]) {
            const xx = (i % s.w) + dx,
              zz = Math.floor(i / s.w) + dz,
              inside = xx >= 0 && zz >= 0 && xx < s.w && zz < s.h,
              nb = inside ? s.cells[zz * s.w + xx] : null;
            if (nb && Eco.surfaceHeight(nb) > myY - 0.45) continue;
            const depth = nb ? Math.max(0.7, myY - Eco.surfaceHeight(nb) + 0.5) : 2.6;
            b(
              x + dx * 0.51,
              myY - depth / 2,
              z + dz * 0.51,
              dx ? 0.14 : 1.01,
              depth,
              dz ? 0.14 : 1.01,
              0x70bac9,
            );
            for (let k = 0; k < 4; k++) {
              const fall = (t * 0.00035 + k / 4 + i * 0.11) % 1;
              b(
                x + dx * 0.59 + (dz ? (k - 1.5) * 0.14 : 0),
                myY - fall * depth,
                z + dz * 0.59 + (dx ? (k - 1.5) * 0.14 : 0),
                dx ? 0.035 : 0.08,
                0.23,
                dz ? 0.035 : 0.08,
                0xc9edf0,
              );
            }
            for (let k = 0; k < 3; k++) {
              const drop = (t * 0.00025 + k * 0.33) % 1;
              b(
                x + dx * (0.53 + drop * 0.12),
                myY - depth - drop * 0.6,
                z + dz * (0.53 + drop * 0.12),
                0.07 * (1 - drop) + 0.015,
                0.14,
                0.07 * (1 - drop) + 0.015,
                0xc7e4e5,
              );
            }
          }
        }
      });
      for (const m of [this.waterfalls, this.flames, this.fireCores]) {
        m.instanceMatrix.needsUpdate = true;
        m.instanceColor.needsUpdate = true;
      }
    }
    updateLabels() {
      for (const label of this.labels) label.hidden = true;
    }
    render(t) {
      if (this.dayCycle) {
        const dt = this.lastDayT ? Math.min(t - this.lastDayT, 250) : 0;
        this.lastDayT = t;
        this.dayPhase = (this.dayPhase + dt / this.dayLengthMs) % 1;
        // 每 160ms 重算一次光影（每帧重设 CSS 背景会白白重排）
        if (t - this.lastDayApply > 160) {
          this.lastDayApply = t;
          this.applyLighting(resolvePhase(this.dayPhase));
        }
      }
      if (!this.world) return;
      // 每帧顺手核对一次画布尺寸：布局变化（切模式、开关对话框、转屏）后如果显示尺寸和绘制尺寸不一致，
      // 画面会被拉伸——看起来就像"视角变了"。这里不依赖 ResizeObserver，自己发现就重新测量。
      if (!this.lastSizeCheck || t - this.lastSizeCheck > 250 || this.lastSizeCheck > t) {
        this.lastSizeCheck = t;
        if (
          Math.abs(this.canvas.clientWidth - this.width) > 0.5 ||
          Math.abs(this.canvas.clientHeight - this.height) > 0.5
        )
          this.resize();
      }
      if (this.followAnimal && this.focus !== null) {
        const state = this.motion.get(this.followAnimal);
        if (state) this.targetLook.set(state.x, state.y + 0.3, state.z);
      }
      this.updateCamera(0.1);
      if (this.dirty || this.lastTick !== this.world.tick) this.draw(t);
      if (this.windShader) this.windShader.uniforms.uWindTime.value = t * 0.001;
      this.drawClouds(t);
      this.drawAnimals(t);
      this.drawEffects(t);
      this.drawMarkers(t);
      let i = this.hover >= 0 ? this.hover : this.selected;
      this.cursor.visible = i >= 0 && !!this.world.cells[i];
      if (this.cursor.visible)
        this.cursor.position.set(
          (i % this.world.w) - this.world.w / 2 + 0.5,
          0.19 + Eco.surfaceHeight(this.world.cells[i]),
          Math.floor(i / this.world.w) - this.world.h / 2 + 0.5,
        );
      // 悬停/选中方块也轻轻呼吸一下，三轴同值所以不会拉变形；低画质下保持静止
      if (this.cursor.visible) {
        const breathe =
          this.quality === 'low' ? 1 : 1 + (0.5 - 0.5 * Math.cos(t * 0.0004)) * 0.07;
        this.cursor.scale.set(breathe, 1, breathe);
      }
      this.updateLabels();
      this.renderer.render(this.scene, this.camera);
    }
  }
  GardenView.BUDGET = BUDGET;
  // 供测试直接调：云的形状是纯函数，不用开浏览器就能验
  GardenView.cloudShape = makeCloudShape;
  // 默认相机倾角（仰角）：与旧版固定构图一致（水平 45、高 36 → 约 38.66°）。
  GardenView.PITCH_DEFAULT = Math.atan2(36, 45);
  GardenView.PITCH_MIN = (20 * Math.PI) / 180;
  GardenView.PITCH_MAX = (72 * Math.PI) / 180;
  root.GardenView = GardenView;
})(globalThis);
