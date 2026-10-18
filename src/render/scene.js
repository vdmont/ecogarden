(function (root) {
  'use strict';
  // 各 InstancedMesh 的实例预算：put() 超出预算会直接抛「模型实例超过预算」。
  // 加密模型或扩大地形/森林的改版，请同时跑 tests/shape.cjs 里的最坏情形护栏。
  const BUDGET = {
    terrain: 60000,
    animals: 50000,
    rings: 1800,
    flames: 9000,
    fireCores: 4500,
    waterfalls: 10000,
  };
  // 时段光影预设：太阳方位/颜色、天空与地面反射光、曝光、投影范围、舞台背景。
  // 清晨＝低角度暖阳 + 偏冷的补光，影子拉长。
  const TIME_PRESETS = {
    dawn: {
      sunColor: 0xffd9a8,
      sunIntensity: 1.05,
      sunPos: [-30, 13, 22],
      skyColor: 0xffe9c6,
      groundColor: 0x6e6353,
      hemiIntensity: 0.58,
      exposure: 1.08,
      shadowSpan: 46,
      sky: 'radial-gradient(ellipse at 50% 20%, #fff7e9 0%, #f8e8d2 52%, #e6d2b6 100%)',
    },
    // ↓ 以下三档尚未按观感调整，界面上暂不开放
    afternoon: {
      sunColor: 0xfff4dc,
      sunIntensity: 1.15,
      sunPos: [-8, 34, 16],
      skyColor: 0xeaf6ff,
      groundColor: 0x6c6654,
      hemiIntensity: 0.8,
      exposure: 1.0,
      shadowSpan: 34,
      sky: 'radial-gradient(ellipse at 50% 26%, #f8fcff 0%, #eaf2ec 60%, #dae7d8 100%)',
    },
    dusk: {
      sunColor: 0xff9d6b,
      sunIntensity: 1.0,
      sunPos: [28, 9, 18],
      skyColor: 0xffc9a8,
      groundColor: 0x5b4a44,
      hemiIntensity: 0.5,
      exposure: 1.05,
      shadowSpan: 48,
      sky: 'radial-gradient(ellipse at 50% 22%, #ffe2c2 0%, #f3c3a8 50%, #c99a9c 100%)',
    },
    night: {
      sunColor: 0x9fb4d8,
      sunIntensity: 0.25,
      sunPos: [-22, 26, 20],
      skyColor: 0x3d4a66,
      groundColor: 0x2b2f38,
      hemiIntensity: 0.5,
      exposure: 0.95,
      shadowSpan: 34,
      sky: 'radial-gradient(ellipse at 50% 30%, #39465f 0%, #2a3448 60%, #1e2532 100%)',
    },
  };
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
      Object.assign(this.sun.shadow.camera, {
        left: -30,
        right: 30,
        top: 30,
        bottom: -30,
        near: 0.1,
        far: 100,
      });
      this.sun.shadow.bias = -0.0012;
      this.sun.shadow.normalBias = 0.025;
      this.scene.add(this.sun);
      this.camera = new THREE.OrthographicCamera(-12, 12, 12, -12, 1, 110);
      this.box = new THREE.BoxGeometry(1, 1, 1);
      this.dummy = new THREE.Object3D();
      this.color = new THREE.Color();
      this.mesh = this.makeMesh(
        this.box,
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        BUDGET.terrain,
      );
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
      this.setTimeOfDay('dawn');
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
      this.draw(0);
    }
    // 时段预设。目前只有「清晨」是按效果调过的；其余三档只是占位，
    // 等所有者确认清晨的观感后再逐档调（不要拿它们当成品）。
    setTimeOfDay(name) {
      const p = TIME_PRESETS[name] || TIME_PRESETS.dawn;
      this.timeOfDay = TIME_PRESETS[name] ? name : 'dawn';
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
        near: 0.1,
        far: 200,
      });
      this.sun.shadow.camera.updateProjectionMatrix();
      // 合并说明：新界面把 #stage 当相纸用（纸纹 + 留白 + 胶带），
      // 天空底色不能盖掉整张纸，只能铺在照片内容区（画布）里。
      if (this.canvas) this.canvas.style.background = p.sky;
      this.dirty = true;
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
      this.resize();
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
    rayCell(origin, dir) {
      const s = this.world;
      if (!s || !dir || !(dir.y < 0)) return -1;
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
      if (lo < 0) return -1;
      let hi = lo;
      lo = Math.max(0, lo - 0.2);
      for (let k = 0; k < 8; k++) {
        const mid = (lo + hi) / 2;
        if (hit(mid)) hi = mid;
        else lo = mid;
      }
      const i = cellAt(hi);
      return i >= 0 && s.cells[i] ? i : -1;
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
      this.rings.count = 0;
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
              k === slices - 1 && el > 5
                ? 0xe2e8df
                : [0x777f78, 0x858b7d, 0x969b8b][(k + (i % 2)) % 3],
            );
          }
        }
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
        if (c.ground === 'ash' && !c.plant && c.ash > 0 && i % 3 === 0)
          b(x, terr + 0.18, z, 0.25, 0.15, 0.16, 0x9a8e86);
      });
      if (this.showLabels) {
        for (const [i, txt, col, y] of labelList)
          if (['种', '虫', '鸟', '蝶'].includes(txt))
            this.put(
              this.rings,
              (i % s.w) - s.w / 2 + 0.5,
              Eco.surfaceHeight(s.cells[i]) + 0.16,
              Math.floor(i / s.w) - s.h / 2 + 0.5,
              1,
              1,
              1,
              col,
            );
      }
      this.labelData = labelList;
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor.needsUpdate = true;
      this.rings.instanceMatrix.needsUpdate = true;
      this.rings.instanceColor.needsUpdate = true;
      this.flames.instanceMatrix.needsUpdate = true;
      this.flames.instanceColor.needsUpdate = true;
      this.fireCores.instanceMatrix.needsUpdate = true;
      this.fireCores.instanceColor.needsUpdate = true;
      this.lastDraw = t;
      this.dirty = false;
      this.lastTick = s.tick;
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
    drawAnimals(t) {
      if (!this.world) return;
      const s = this.world,
        m = this.animals;
      m.count = 0;
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
        }
      });
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor.needsUpdate = true;
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
      this.drawAnimals(t);
      this.drawEffects(t);
      let i = this.hover >= 0 ? this.hover : this.selected;
      this.cursor.visible = i >= 0 && !!this.world.cells[i];
      if (this.cursor.visible)
        this.cursor.position.set(
          (i % this.world.w) - this.world.w / 2 + 0.5,
          0.19 + Eco.surfaceHeight(this.world.cells[i]),
          Math.floor(i / this.world.w) - this.world.h / 2 + 0.5,
        );
      this.updateLabels();
      this.renderer.render(this.scene, this.camera);
    }
  }
  GardenView.BUDGET = BUDGET;
  // 默认相机倾角（仰角）：与旧版固定构图一致（水平 45、高 36 → 约 38.66°）。
  GardenView.PITCH_DEFAULT = Math.atan2(36, 45);
  GardenView.PITCH_MIN = (20 * Math.PI) / 180;
  GardenView.PITCH_MAX = (72 * Math.PI) / 180;
  root.GardenView = GardenView;
})(globalThis);
