(function () {
  const {
    VERSION,
    LIFE,
    LEVELS,
    ACHIEVEMENTS,
    METRICS,
    EXTRA_METRICS,
    TERRAIN,
    defaultProfile,
    makeWorld,
    animal,
    soil,
    updateMoisture,
  } = Eco;
  // 存档是「严格」校验的：字段白名单 + 数值范围，任何越界都抛错而不是静默清空。
  // 新增字段的固定流程（漏掉任一步都会让存档往返丢数据或让校验误拒）：
  //   1) 在 soil()/animal() 里给出默认值（src/sim/core.js）；
  //   2) 加进下面 cell / animal 的字段清单与 finite 范围；需要更高上限时改 EcoData.TERRAIN；
  //   3) 若新字段参与渲染或玩法，同步 tests/behavior.cjs 的「确定性续玩」用例与 README 的存档说明。
  function validateProfile(input) {
    if (!input || typeof input !== 'object' || input.version !== VERSION) throw Error(T.m260);
    if (
      !Number.isInteger(input.unlocked) ||
      input.unlocked < 0 ||
      input.unlocked > 5 ||
      !Number.isInteger(input.current) ||
      input.current < 0 ||
      input.current > input.unlocked
    )
      throw Error(T.m261);
    const finite = (x, a, b) => typeof x === 'number' && Number.isFinite(x) && x >= a && x <= b;
    if (
      !finite(input.totalScore, 0, 1e12) ||
      !input.worlds ||
      !input.achievements ||
      !Array.isArray(input.completed) ||
      input.completed.some((i) => !Number.isInteger(i) || i < 0 || i > 4)
    )
      throw Error(T.m262);
    const out = defaultProfile();
    for (const [key, value] of Object.entries(input.tutorialCounts || {}))
      if (
        /^(seed|bug|bird|bush|rock|squirrel|animal|lake|forest|mountain|recover|island)$/.test(
          key,
        ) &&
        Number.isInteger(value) &&
        value >= 0 &&
        value <= 2
      )
        out.tutorialCounts[key] = value;
    for (const [key, value] of Object.entries(input.tutorial || {}))
      if (
        /^(intro[0-5]|chapter[0-5]|dismiss[0-4]_(sow|feedBug|berries|berryGuests|food|birds|rocks|fire|recover|neighbors|terrain|island)|sow|feedBug|berries|berryGuests|birds|rocks|fire|neighbors)$/.test(
          key,
        ) &&
        value === true
      )
        out.tutorial[key] = true;
    for (const key of [
      ...Object.keys(LIFE),
      'seed',
      'grass',
      'flower',
      'tree',
      'bush',
      'water',
      'spring',
      'soil',
      'rock',
      'mountain',
      'ash',
    ])
      if (input.seen?.[key] === true) out.seen[key] = true;
    for (let l = 0; l < 6; l++) {
      const r = input.records?.[l];
      if (r && finite(r.bestScore, 0, 1e12) && finite(r.completions, 0, 1e9))
        out.records[l] = { bestScore: r.bestScore, completions: r.completions };
    }
    out.unlocked = input.unlocked;
    out.current = input.current;
    out.completed = [...new Set(input.completed)];
    out.totalScore = input.totalScore;
    for (const [id] of ACHIEVEMENTS)
      if (typeof input.achievements[id] === 'string' && input.achievements[id].length < 80)
        out.achievements[id] = input.achievements[id];
    out.achievementPlaces = {};
    for (const [id, value] of Object.entries(input.achievementPlaces || {})) {
      if (
        ACHIEVEMENTS.some((a) => a[0] === id) &&
        value &&
        Number.isInteger(value.level) &&
        LEVELS[value.level] &&
        Number.isInteger(value.i) &&
        value.i >= 0 &&
        value.i < LEVELS[value.level].w * LEVELS[value.level].h
      )
        out.achievementPlaces[id] = {
          level: value.level,
          i: value.i,
          type: Object.hasOwn(LIFE, value.type) ? value.type : null,
        };
    }
    for (const k of METRICS) if (finite(input.totals?.[k], 0, 1e9)) out.totals[k] = input.totals[k];
    if (input.settings) {
      for (const k of ['sound', 'music', 'autosave', 'labels', 'autoFocus'])
        if (typeof input.settings[k] === 'boolean') out.settings[k] = input.settings[k];
      // 音量滑杆。范围写死 0–1：写宽了旧存档/坏存档能让音量跑到 10，
      // 一开声音就炸。范围不对这里是直接丢掉用默认值，不让整份存档作废。
      for (const k of ['musicVolume', 'callVolume'])
        if (finite(input.settings[k], 0, 1)) out.settings[k] = input.settings[k];
      if (['auto', 'low', 'high'].includes(input.settings.quality))
        out.settings.quality = input.settings.quality;
      if (['dynamic', 'dawn', 'afternoon', 'dusk', 'night'].includes(input.settings.timeOfDay))
        out.settings.timeOfDay = input.settings.timeOfDay;
    }
    for (const [key, s] of Object.entries(input.worlds)) {
      const l = Number(key),
        cfg = LEVELS[l];
      if (
        !cfg ||
        String(l) !== key ||
        l > out.unlocked ||
        !s ||
        s.level !== l ||
        s.w !== cfg.w ||
        s.h !== cfg.h ||
        !Array.isArray(s.cells) ||
        s.cells.length !== cfg.w * cfg.h
      )
        throw Error(T.m263);
      // 老存档没有 shape/seed：按第 1 版轮廓（当年那个圆岛）校验，种子按 0 处理，所以老存档照样读得进来。
      const sh =
        Number.isInteger(s.shape) && s.shape >= 1 && s.shape <= Eco.SHAPE_CURRENT ? s.shape : 1;
      const sd = Number.isInteger(s.seed) && s.seed >= 0 && s.seed <= 4294967295 ? s.seed : 0;
      const copy = makeWorld(l, sh, sd);
      for (let i = 0; i < s.cells.length; i++) {
        const c = s.cells[i];
        if (!copy.cells[i]) {
          if (c !== null) throw Error(T.m264);
          continue;
        }
        if (
          !c ||
          !['soil', 'water', 'spring', 'rock', 'mountain', 'ash'].includes(c.ground) ||
          ![null, 'seed', 'grass', 'flower', 'tree', 'bush'].includes(c.plant)
        )
          throw Error(T.m265);
        // 必填数值字段白名单：新增必填格字段要加进这里，上限见 EcoData.TERRAIN。
        const d = soil();
        d.ground = c.ground;
        d.plant = c.plant;
        for (const k of ['age', 'waterAge', 'fire', 'ash', 'recovery', 'burns', 'fert', 'moist']) {
          if (!finite(c[k], 0, k === 'fert' ? 3 : k === 'moist' ? 1 : 1e8)) throw Error(T.m266);
          d[k] = c[k];
        }
        if (c.plantLife !== undefined && !finite(c.plantLife, 0, 1e8)) throw Error(T.m267);
        d.plantLife = c.plantLife ?? 0;
        for (const key of ['elevation', 'variant']) {
          if (
            c[key] !== undefined &&
            !finite(c[key], 0, key === 'variant' ? TERRAIN.MAX_VARIANT : TERRAIN.MAX_ELEVATION)
          )
            throw Error(T.m268);
          d[key] = c[key] ?? (key === 'variant' ? (Math.imul(i + 1, 2654435761) >>> 0) % 5 : 0);
        }
        if (c.flow !== undefined && !(Number.isInteger(c.flow) && c.flow >= 0 && c.flow <= 8))
          throw Error(T.m268);
        d.flow = c.flow ?? 0;
        // 必填 animal 字段白名单 + 可选字段（hunger/bred/petUntil/variant）：新增行为/动作字段务必加进这两处。
        if (c.animal) {
          const a = c.animal;
          if (!Object.hasOwn(LIFE, a.type)) throw Error(T.m269);
          const b = animal(a.type);
          for (const k of ['age', 'full', 'drunk', 'sleep', 'dir', 'moved']) {
            if (
              !finite(
                a[k],
                k === 'age' ? -100 : k === 'dir' ? -Math.PI : k === 'moved' ? -1 : 0,
                1e9,
              )
            )
              throw Error(T.m270);
            b[k] = a[k];
          }
          for (const k of ['hunger', 'bred', 'petUntil', 'variant']) {
            if (a[k] !== undefined && !finite(a[k], 0, 1e12)) throw Error(T.m271);
            b[k] = a[k] ?? 0;
          }
          if (a.drift !== undefined && !finite(a.drift, 0, 999)) throw Error(T.m271);
          if (a.driftDir !== undefined && !finite(a.driftDir, -1, 7)) throw Error(T.m271);
          if (a.habit !== undefined && (!Number.isInteger(a.habit) || !finite(a.habit, 0, 6)))
            throw Error(T.m271);
          b.habit = a.habit ?? 0;
          b.drift = a.drift ?? 0;
          b.driftDir = a.driftDir ?? -1;
          // 连续位置与行程（C1）：老存档没有这些字段，按「站在格心、不在走路」处理
          if (a.x !== undefined && a.x !== null && !finite(a.x, -1, 1e4)) throw Error(T.m271);
          if (a.z !== undefined && a.z !== null && !finite(a.z, -1, 1e4)) throw Error(T.m271);
          if (a.phase !== undefined && a.phase !== null && !finite(a.phase, 0, 1e9))
            throw Error(T.m271);
          if (a.tcell !== undefined && !Number.isInteger(a.tcell) && a.tcell !== -1)
            throw Error(T.m271);
          if (a.state !== undefined && !['idle', 'walk'].includes(a.state)) throw Error(T.m271);
          b.x = a.x ?? null;
          b.z = a.z ?? null;
          b.tx = finite(a.tx, 0, 1e4) ? a.tx : 0;
          b.tz = finite(a.tz, 0, 1e4) ? a.tz : 0;
          b.phase = a.phase ?? 0;
          b.tcell = Number.isInteger(a.tcell) ? a.tcell : -1;
          b.state = a.state === 'walk' ? 'walk' : 'idle';
          d.animal = b;
        }
        if (d.ground === 'ash') d.ground = 'soil';
        d.fire = 0;
        d.ash = 0;
        d.recovery = 0;
        d.burns = 0;
        copy.cells[i] = d;
      }
      for (const k of ['tick', 'energy', 'score', 'combo', 'comboLeft', 'rng']) {
        if (
          !finite(
            s[k],
            k === 'combo' ? 1 : 0,
            k === 'energy' ? 100 : k === 'combo' ? 8 : k === 'comboLeft' ? 48 : 1e12,
          )
        )
          throw Error(T.m272);
        copy[k] = s[k];
      }
      if (typeof s.complete !== 'boolean') throw Error(T.m273);
      copy.complete = s.complete;
      copy.shape = sh;
      copy.seed = sd;
      for (const k of METRICS) {
        if (EXTRA_METRICS.includes(k) && s.metrics?.[k] === undefined) continue;
        if (!finite(s.metrics?.[k], 0, 1e9)) throw Error(T.m274);
        copy.metrics[k] = s.metrics[k];
      }
      copy.lastCombo = typeof s.lastCombo === 'string' ? s.lastCombo.slice(0, 60) : '';
      copy.events = Array.isArray(s.events)
        ? s.events
            .slice(0, 40)
            .filter(
              (e) =>
                e &&
                typeof e.id === 'string' &&
                typeof e.title === 'string' &&
                typeof e.text === 'string' &&
                Number.isInteger(e.i) &&
                e.i >= 0 &&
                e.i < copy.cells.length &&
                finite(e.tick, 0, 1e12),
            )
            .map((e) => ({
              id: e.id.slice(0, 40),
              title: e.title.slice(0, 100),
              text: e.text.slice(0, 500),
              i: e.i,
              tick: e.tick,
            }))
        : [];
      copy.events = copy.events.filter(
        (e) =>
          !/(fire|burn|ash|regrowth)/i.test(e.id) && !/(野火|灰烬|燃烧|火后|点火)/.test(e.title),
      );
      copy.notified = Object.fromEntries(
        Object.keys(s.notified || {})
          .filter((k) => /^[a-zA-Z0-9]+$/.test(k))
          .slice(0, 80)
          .map((k) => [k, true]),
      );
      updateMoisture(copy);
      out.worlds[key] = copy;
      for (const c of copy.cells)
        if (c) {
          if (c.plant) out.seen[c.plant] = true;
          if (c.animal) out.seen[c.animal.type] = true;
          out.seen[c.ground] = true;
        }
    }
    if (input.campaign !== 2) {
      out.completed = out.completed.filter((l) => l !== 2);
      delete out.records[2];
      for (const k of Object.keys(out.tutorial))
        if (
          k === 'berries' ||
          k === 'berryGuests' ||
          k === 'intro2' ||
          k === 'chapter2' ||
          k.startsWith('dismiss2_')
        )
          delete out.tutorial[k];
      delete out.tutorialCounts.bush;
      delete out.tutorialCounts.squirrel;
      if (out.worlds[2]) {
        out.worlds[2].complete = false;
        out.worlds[2].metrics.bushPlaced = 0;
        out.worlds[2].metrics.berryMeals = 0;
      }
    }
    return out;
  }
  Eco.validateProfile = validateProfile;
})();
