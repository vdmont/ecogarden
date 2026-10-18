(function () {
  'use strict';
  const $ = (id) => document.getElementById(id),
    E = Eco,
    KEY = 'emergent-garden-v06';
  let profile = E.defaultProfile(),
    storageError = '',
    fresh = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      profile = E.validateProfile(JSON.parse(raw));
      fresh = false;
    }
  } catch (e) {
    storageError = T.m275;
  }
  try {
    const prefs = localStorage.getItem('ecogarden-preferences');
    if (prefs)
      profile.settings = E.validateProfile({
        ...profile,
        settings: { ...profile.settings, ...JSON.parse(prefs) },
      }).settings;
  } catch {}
  let journey = null;
  let achievementTarget = null,
    residentCursor = {},
    selectedAnimal = null,
    world,
    view,
    tool = 'seed',
    speed = 1,
    resumeSpeed = 1,
    selected = -1,
    focused = false,
    lastEvent = '',
    known = new Set(Object.keys(profile.achievements)),
    toastTimer,
    achTimer,
    acc = 0,
    last = 0,
    lastUI = 0,
    lastSave = 0,
    audio;
  const names = {
    soil: T.m276,
    ash: T.m277,
    water: T.m278,
    spring: T.m279,
    rock: T.m047,
    mountain: T.m280,
    seed: T.m035,
    grass: T.m281,
    flower: T.m282,
    tree: T.m283,
    bush: T.m044,
    bug: T.m001,
    bird: T.m003,
    butterfly: T.m002,
    sheep: T.m004,
    alpaca: T.m005,
    rabbit: T.m006,
    deer: T.m059,
    fox: T.m008,
    ...E.ANIMAL_NAMES,
  };
  function text(id, value) {
    $(id).textContent = value;
  }
  function el(tag, cls, content) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (content !== undefined) n.textContent = content;
    return n;
  }
  function toast(message) {
    text('toast', message);
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4000);
  }
  function save(force = false) {
    try {
      localStorage.setItem('ecogarden-preferences', JSON.stringify(profile.settings));
    } catch {}
    profile.current = world.level;
    profile.worlds[world.level] = world;
    if (!force && profile.settings.autosave === false) {
      text('saveStatus', '自动存档已关闭');
      return false;
    }
    if (storageError && !force) {
      text('saveStatus', T.m284);
      return false;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
      storageError = '';
      text('saveStatus', T.m285);
      text('saveMessage', T.m286);
      return true;
    } catch (e) {
      storageError = T.m287;
      text('saveStatus', T.m284);
      text('saveMessage', storageError);
      return false;
    }
  }
  function sound(freq = 480) {
    if (!profile.settings.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      let o = audio.createOscillator(),
        g = audio.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, audio.currentTime);
      o.frequency.exponentialRampToValueAtTime(freq * 0.75, audio.currentTime + 0.13);
      g.gain.setValueAtTime(0.035, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + 0.2);
    } catch (e) {}
  }
  function setSpeed(n) {
    speed = n;
    acc = 0;
    $('pausedBadge').hidden = n !== 0;
    document.querySelectorAll('[data-speed]').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.speed) === n);
      b.setAttribute('aria-pressed', String(Number(b.dataset.speed) === n));
    });
  }
  function overview() {
    view.overview();
    focused = false;
    view.followAnimal = null;
    text('viewMode', T.m288);
    $('stage').classList.remove('closeup');
  }
  function focus(i) {
    journey?.observe();
    if (!world.cells[i]) return toast(T.m289);
    focused = true;
    selected = i;
    selectedAnimal = world.cells[i].animal || null;
    view.selected = i;
    view.focusCell(i);
    view.followAnimal = selectedAnimal;
    $('stage').classList.add('closeup');
    text(
      'viewMode',
      (selectedAnimal ? '跟随 · ' : T.m290) +
        (names[world.cells[i].animal?.type || world.cells[i].plant || world.cells[i].ground] ||
          T.m291),
    );
    inspect();
  }
  function loadLevel(n) {
    if (world) save();
    undoSnapshot = null;
    strokeSnapshot = null;
    profile.current = n;
    world = profile.worlds[n] || E.makeWorld(n);
    profile.worlds[n] = world;
    E.refreshTerrain(world);
    selected = -1;
    selectedAnimal = null;
    focused = false;
    lastEvent = '';
    tool = 'seed';
    view.setWorld(world);
    setSpeed(1);
    $('stage').classList.remove('closeup');
    view.followAnimal = null;
    text('viewMode', T.m288);
    text('levelTag', E.LEVELS[n].tag);
    text('levelName', E.LEVELS[n].name);
    text('levelTip', E.LEVELS[n].tip);
    renderTools();
    inspect();
    update();
    save();
  }
  function chooseTool(k) {
    tool = k;
    view.panMode = false;
    $('panToggle').setAttribute('aria-pressed', 'false');
    renderTools();
  }
  const icons = {
    rare: '🐈',
    legend: '🐉',
    animal: '🐾',
    inspect: '⌕',
    seed: '🌱',
    water: '💧',
    bug: '🐛',
    bird: '🐦',
    bush: '🫐',
    rock: '🪨',
    squirrel: '🐿️',
    sheep: '🐑',
    alpaca: '🦙',
    rabbit: '🐇',
    deer: '🦌',
    fox: '🦊',
    lake: '🏞️',
    mountain: '⛰️',
    forest: '🌳',
    erase: '⌫',
  };
  const hints = {
    rare: '第六关的特别邻居',
    legend: '貔貅与白泽；龙的出现概率为 1%',
    animal: T.m292,
    inspect: T.m293,
    seed: T.m294,
    water: T.m295,
    bug: T.m296,
    bird: T.m297,
    bush: T.m298,
    rock: T.m299,
    squirrel: '放到成熟浆果旁，观察采食',
    sheep: T.m301,
    alpaca: T.m302,
    rabbit: T.m303,
    deer: T.m334,
    fox: T.m304,
    lake: T.m305,
    mountain: T.m306,
    forest: T.m307,
    erase: T.m308,
  };
  function renderTools() {
    const bar = $('toolbar');
    bar.replaceChildren();
    for (const k of [
      ...E.LEVELS[world.level].tools.filter((k) => k !== 'inspect' && k !== 'erase'),
      'erase',
    ]) {
      const t = E.TOOL[k],
        b = el('button', 'tool' + (k === tool ? ' active' : ''));
      b.dataset.tool = k;
      b.setAttribute('aria-pressed', String(k === tool));
      b.title = hints[k];
      const threshold = E.TERRAIN_UNLOCK[k] || 0,
        locked = world.level >= 4 && world.score < threshold;
      b.disabled = locked;
      b.append(
        el('span', 'toolIcon', icons[k]),
        el('span', 'toolName', t.name),
        el(
          'span',
          'toolCost',
          k === 'erase'
            ? ''
            : locked
              ? '🔒 ' + threshold + ' 生态'
              : (world.level === 5 ? '0' : t.cost) + ' 能量',
        ),
      );
      b.onclick = () => chooseTool(k);
      bar.append(b);
    }
    const back = el('button', 'tool');
    back.id = 'undoBtn';
    back.disabled = !undoSnapshot;
    back.title = '撤回上一步（整次拖动），恢复操作前的花园';
    back.append(el('span', 'toolIcon', '↶'), el('span', 'toolName', '撤回'));
    back.onclick = undo;
    bar.append(back);
    text(
      'selectedTool',
      E.TOOL[tool].name + (world.level !== 5 && E.TOOL[tool].cost ? ' · ' + E.TOOL[tool].cost : ''),
    );
    text('toolHelp', hints[tool]);
  }
  let paintReason = '',
    strokeCount = 0,
    undoSnapshot = null,
    strokeSnapshot = null;
  function snapshot() {
    profile.worlds[world.level] = world;
    return JSON.stringify(profile);
  }
  function undo() {
    if (!undoSnapshot) return;
    const previous = JSON.parse(undoSnapshot);
    previous.settings = profile.settings;
    profile = previous;
    world = null;
    known = new Set(Object.keys(profile.achievements));
    undoSnapshot = null;
    strokeSnapshot = null;
    loadLevel(profile.current);
    toast('已回到上次操作前');
  }

  function pick(i, batch = false) {
    if (i < 0) {
      if (!batch) toast(T.m309);
      return;
    }
    selected = i;
    view.selected = i;
    if (tool !== 'inspect') {
      const before = batch ? strokeSnapshot || snapshot() : snapshot();
      const r = E.place(world, tool, i, profile, $('replaceToggle').checked);
      if (r.ok) {
        if (batch) strokeSnapshot ??= before;
        else undoSnapshot = before;
        journey?.placed(tool);
      }
      if (!r.ok) {
        if (!batch || r.reason !== paintReason) toast(r.reason);
        paintReason = r.reason;
      } else if (batch) {
        strokeCount++;
      } else {
        sound(tool === 'water' ? 650 : 450);
        view.draw(performance.now());
        save();
      }
    }
    selectedAnimal = world.cells[i]?.animal || null;
    if (tool === 'inspect' && selectedAnimal && !batch) focus(i);
    if (!batch) {
      paintReason = '';
      inspect();
      update();
    }
  }
  function strokeEnd() {
    if (strokeSnapshot) {
      undoSnapshot = strokeSnapshot;
      strokeSnapshot = null;
    }
    paintReason = '';
    if (strokeCount) toast(T.m310 + strokeCount + T.m311);
    strokeCount = 0;
    sound(450);
    view.draw(performance.now());
    update();
    save();
  }
  function inspect() {
    if (selectedAnimal) {
      const at = world.cells.findIndex((c) => c?.animal === selectedAnimal);
      if (at >= 0) {
        selected = at;
        view.selected = at;
        if (focused && view.followAnimal === selectedAnimal && view.focus !== null)
          view.targetLook.set(
            (at % world.w) - world.w / 2 + 0.5,
            E.surfaceHeight(world.cells[at]) + 0.3,
            Math.floor(at / world.w) - world.h / 2 + 0.5,
          );
      } else {
        selectedAnimal = null;
        view.followAnimal = null;
        focused = false;
        text('viewMode', '它已离开这里');
      }
    }
    const c = world?.cells[selected];
    $('petBtn').hidden = !c?.animal;
    $('focusBtn').hidden = !c;
    $('cellFacts').replaceChildren();
    if (!c) {
      text('cellTitle', T.m312);
      text('cellDesc', T.m313);
      return;
    }
    text('cellTitle', names[c.animal?.type || c.plant || c.ground]);
    let desc =
      c.plant === 'seed'
        ? c.moist >= 0.6
          ? T.m316
          : T.m317
        : c.plant === 'bush'
          ? c.age >= 150
            ? T.m318
            : c.age >= 80
              ? T.m319
              : T.m320
          : c.plant === 'tree'
            ? T.m321
            : c.plant === 'grass'
              ? T.m322
              : c.ground === 'rock'
                ? T.m323
                : ['water', 'spring'].includes(c.ground)
                  ? T.m324
                  : T.m325;
    if (c.animal) {
      const a = c.animal;
      desc = a.drunk
        ? T.m326
        : a.sleep
          ? T.m327
          : {
              bug: T.m328,
              bird: T.m329,
              butterfly: T.m330,
              sheep: T.m331,
              alpaca: T.m332,
              rabbit: T.m333,
              deer: T.m334,
              fox: T.m335,
              bee: T.m336,
              chicken: T.m337,
              frog: T.m338,
              hedgehog: T.m339,
              wolf: T.m340,
              squirrel: T.m341,
              boar: T.m342,
            }[a.type] ||
            (EcoData.VISITORS[a.type]?.[1] === 'bird'
              ? '会寻找幼虫，也喜欢成熟的浆果。'
              : EcoData.VISITORS[a.type]?.[1] === 'cat'
                ? '会寻找小虫和松鼠，也接受成熟浆果。'
                : EcoData.VISITORS[a.type]?.[1] === 'dog'
                  ? '会寻找兔子，也接受成熟浆果。'
                  : '喜欢草地与成熟浆果，摸摸它认识一下。');
      if (a.hunger > 120) desc = T.m343;
      const remain = Math.max(0, Math.ceil((E.LIFE[a.type] - a.age) / 2));
      const row = el('div', 'lifeRow'),
        bar = el('div', 'meter'),
        fill = el('i');
      fill.style.width = Math.max(0, 100 * (1 - Math.max(0, a.age) / E.LIFE[a.type])) + '%';
      bar.append(fill);
      row.append(
        el(
          'span',
          '',
          T.m344 + Math.floor(remain / 60) + ':' + String(remain % 60).padStart(2, '0'),
        ),
        bar,
      );
      $('cellFacts').append(row);
    }
    text('cellDesc', desc);
    if (!c.fire && c.fert >= 0.1)
      $('cellFacts').append(
        el(
          'div',
          'fertilityFact',
          (c.fert >= 0.4 ? '肥沃土壤 · ' : '土壤养分 · ') +
            '发芽概率 +' +
            Math.round(c.fert * 20) +
            '% · 开花概率 +' +
            Math.round(c.fert * 30) +
            '%',
        ),
      );
    if (!c.animal && c.plant)
      $('cellFacts').append(
        el('span', 'fact', c.moist >= 0.6 ? T.m345 : c.moist ? T.m346 : T.m347),
      );
  }
  function update() {
    if ($('undoBtn')) $('undoBtn').disabled = !undoSnapshot;
    text('energy', world.level === 5 ? '∞' : Math.floor(world.energy) + '/100');
    $('energyFill').style.width = (world.level === 5 ? 100 : world.energy) + '%';
    text('score', Math.floor(world.score).toLocaleString());
    for (const b of document.querySelectorAll('[data-tool]')) {
      const k = b.dataset.tool,
        n = E.TERRAIN_UNLOCK[k] || 0,
        locked = world.level >= 4 && world.score < n;
      b.disabled = locked;
      b.classList.toggle(
        'unaffordable',
        !locked && world.level !== 5 && world.energy < E.TOOL[k].cost,
      );
      b.querySelector('.toolCost').textContent =
        k === 'erase'
          ? ''
          : locked
            ? '🔒 ' + n + ' 生态'
            : (world.level === 5 ? 0 : E.TOOL[k].cost) + ' 能量';
    }
    text(
      'combo',
      world.combo > 1 ? `连锁 ${world.combo} · +${Math.round((world.combo - 1) * 15)}%` : '',
    );
    text(
      'timeLabel',
      `岛上时间 ${Math.floor(world.tick / 120)}:${String(Math.floor(world.tick / 2) % 60).padStart(2, '0')} · ${speed === 0 ? T.m348 : speed + '×'}`,
    );
    $('goals').replaceChildren();
    for (const [k, n, label] of E.LEVELS[world.level].goals) {
      let v = Math.min(world.metrics[k], n),
        row = el('div', 'goal' + (v >= n ? ' done' : ''));
      const h = el('div', 'goalHeader');
      h.append(el('span', '', (v >= n ? '✓ ' : '○ ') + label), el('b', '', `${v}/${n}`));
      const meter = el('div', 'meter'),
        fill = el('i');
      fill.style.width = (v / n) * 100 + '%';
      meter.append(fill);
      row.append(h, meter);
      $('goals').append(row);
    }
    if (world.level === 5) $('goals').append(el('div', 'goal done', T.m349));
    $('nextChapter').hidden = !world.complete;
    const event = world.events[0];
    $('eventCard').hidden = !event;
    if (event) {
      text('eventTitle', event.title);
      text(
        'eventText',
        {
          firstSprout: T.m350,
          firstFire: T.m351,
          regrowth: T.m352,
          tree: T.m353,
          butterfly: T.m354,
          ferment: T.m355,
          bugFood: T.m356,
          birdMeal: T.m357,
          drunk: T.m358,
          nap: T.m359,
          sober: T.m360,
          baby: T.m361,
          rabbitBirth: T.m362,
          foxMeal: T.m363,
          plantCycle: T.m364,
          alpaca: T.m365,
          complete: T.m366,
          modelDemo: T.m367,
        }[event.id] || (event.id.startsWith('lifeEnd') ? T.m368 : T.m369),
      );
      if (lastEvent !== event.id) {
        const had = !!lastEvent;
        lastEvent = event.id;
        if (had && profile.settings.autoFocus && event.id !== 'complete') focus(event.i);
      }
    }
    renderResidents();
    text(
      'achievementCount',
      Object.keys(profile.achievements).length + '/' + E.ACHIEVEMENTS.length,
    );
    let newIds = Object.keys(profile.achievements).filter((k) => !known.has(k));
    if (newIds.length) {
      known = new Set(Object.keys(profile.achievements));
      const primary = newIds.find((id) => locateAchievement(id)) || newIds[0];
      const a = E.ACHIEVEMENTS.find((a) => a[0] === primary);
      text(
        'achievementTitle',
        T.m370 + a[1] + (newIds.length > 1 ? T.m371 + newIds.length + T.m372 : ''),
      );
      achievementTarget = locateAchievement(primary);
      $('achievementFocus').hidden = !achievementTarget;
      $('achievementToast').classList.add('show');
      clearTimeout(achTimer);
      achTimer = setTimeout(() => $('achievementToast').classList.remove('show'), 10000);
      if (newIds.includes('drunk')) renderTools();
      save();
    }
    inspect();
  }
  function open(id) {
    if (id === 'residents') renderResidents(true);
    if (id === 'chapters') renderChapters();
    if (id === 'achievements') renderAchievements();
    if (id === 'logs') renderLogs();
    if (id === 'saves') text('saveMessage', storageError || T.m373);
    $(id).showModal();
    acc = 0;
  }
  function renderChapters() {
    $('chapterGrid').replaceChildren();
    E.LEVELS.forEach((c, i) => {
      let b = el(
        'button',
        'chapterCard' +
          (i === profile.current ? ' current' : '') +
          (i > profile.unlocked ? ' locked' : ''),
      );
      b.disabled = i > profile.unlocked;
      b.append(
        el('span', 'chapterNumber', String(i + 1).padStart(2, '0')),
        el('h3', '', c.name),
        el(
          'span',
          'chapterState',
          i > profile.unlocked
            ? T.m374
            : profile.completed.includes(i)
              ? T.m375
              : profile.worlds[i]
                ? T.m376
                : T.m377,
        ),
      );
      b.onclick = () => {
        $('chapters').close();
        loadLevel(i);
      };
      const wrap = el('div', 'chapterWrap');
      wrap.append(b);
      if (i <= profile.unlocked && profile.worlds[i]) {
        const replay = el('button', 'replay', GardenCopy.replay);
        replay.onclick = () =>
          confirmAction(GardenCopy.replayTitle, GardenCopy.replayBody, () => {
            profile.worlds[i] = E.makeWorld(i);
            world = null;
            $('chapters').close();
            loadLevel(i);
          });
        wrap.append(replay);
      }
      $('chapterGrid').append(wrap);
    });
  }
  function renderAchievements() {
    $('achievementGrid').replaceChildren();
    for (const [id, title, description] of E.ACHIEVEMENTS) {
      const done = !!profile.achievements[id];
      if (!done && !achievementVisible(id)) continue;
      const card = el('section', 'achievement' + (done ? ' unlocked' : ''));
      card.append(
        el('span', 'badge', done ? '✦' : '◇'),
        el('h3', '', !done && E.SECRET.has(id) ? GardenCopy.secrets[id][0] : title),
        el('p', '', !done && E.SECRET.has(id) ? GardenCopy.secrets[id][1] : description),
        el('small', '', done ? T.m381 : T.m382),
      );
      $('achievementGrid').append(card);
    }
  }
  function achievementVisible(id) {
    if (['rareGuest', 'legendGuest', 'dragonGuest'].includes(id)) return profile.unlocked >= 5;
    const seen = profile.seen || {};
    if (id.startsWith('pet') && E.PET_TITLES[id.slice(3)]) return !!seen[id.slice(3)];
    const need = {
      bug: 'bug',
      bird: 'bird',
      berries: 'squirrel',
      drunk: 'sheep',
      sober: 'sheep',
      petDrunk: 'sheep',
      alpaca: 'alpaca',
      alpacaSnack: 'alpaca',
      baby: 'sheep',
      fox: 'fox',
      rabbit: 'rabbit',
      pollinator: 'flower',
      allAnimals: 'sheep',
      balance: 'bird',
      manyBabies: 'sheep',
      foodWeb: 'bird',
      petAll: 'sheep',
      petFriends: 'sheep',
    };
    if (need[id]) return !!seen[need[id]];
    return id !== 'freedom' || profile.unlocked >= 4;
  }
  function locateAchievement(id) {
    const place = profile.achievementPlaces?.[id];
    if (place && place.level === world.level && world.cells[place.i]) {
      const a = world.cells[place.i].animal;
      return { i: place.i, animal: a?.type === place.type ? a : null };
    }
    const type = id.startsWith('pet')
      ? id.slice(3)
      : {
          drunk: 'sheep',
          sober: 'sheep',
          baby: 'sheep',
          alpaca: 'alpaca',
          alpacaSnack: 'alpaca',
          bird: 'bird',
          bug: 'bug',
          fox: 'fox',
          rabbit: 'rabbit',
        }[id];
    if (!type) return null;
    const i = world.cells.findIndex(
      (c) => c?.animal?.type === type && (id !== 'drunk' || c.animal.drunk),
    );
    if (i >= 0) return { i, animal: world.cells[i].animal };
    return null;
  }
  function renderResidents(force = false) {
    const rawCounts = E.census(world),
      counts = Object.fromEntries(
        Object.keys(E.LIFE)
          .filter((k) => rawCounts[k])
          .map((k) => [k, rawCounts[k]]),
      ),
      total = Object.values(counts).reduce((n, a) => n + a.length, 0);
    text('residentSummary', Object.keys(counts).length + T.m383 + total + T.m384);
    if (!force && !$('residents').open) return;
    const signature = JSON.stringify(Object.entries(counts).map(([k, v]) => [k, v.length]));
    if (!force && signature === $('residentList').dataset.signature) return;
    $('residentList').dataset.signature = signature;
    $('residentList').replaceChildren();
    for (const [type, list] of Object.entries(counts)) {
      const wrap = el('div', 'residentEntry'),
        row = el('button', 'residentRow');
      row.append(
        el('span', '', E.ANIMAL_NAMES[type]),
        el('b', '', list.length + T.m384),
        el('span', '', T.m385),
      );
      row.onclick = () => {
        const now = E.census(world)[type];
        if (!now?.length) {
          renderResidents(true);
          return;
        }
        const cursor = (residentCursor[type] || 0) % now.length;
        residentCursor[type] = cursor + 1;
        $('residents').close();
        focus(now[cursor]);
      };
      const release = el('button', 'releaseAnimal', '放生一只');
      release.onclick = () => {
        const now = E.census(world)[type];
        if (!now?.length) return renderResidents(true);
        undoSnapshot = snapshot();
        const at = now[(residentCursor[type] || 0) % now.length],
          leaving = world.cells[at].animal;
        world.cells[at].animal = null;
        if (selectedAnimal === leaving) {
          selectedAnimal = null;
          selected = -1;
          view.followAnimal = null;
          focused = false;
        }
        view.dirty = true;
        renderResidents(true);
        update();
        save();
        toast('已放生一只' + E.ANIMAL_NAMES[type] + '，可撤回');
      };
      wrap.append(row, release);
      $('residentList').append(wrap);
    }
    if (!total) $('residentList').append(el('p', '', GardenCopy.noResidents));
  }
  function renderLogs() {
    $('logList').replaceChildren();
    if (!world.events.length) $('logList').append(el('p', '', T.m386));
    for (const event of world.events) {
      let b = el('button', 'logItem');
      b.append(
        el('b', '', event.title),
        el('p', '', event.text),
        el(
          'small',
          '',
          `${Math.floor(event.tick / 120)}分${Math.floor(event.tick / 2) % 60}秒 · 近看发生地点`,
        ),
      );
      b.onclick = () => {
        $('logs').close();
        focus(event.i);
      };
      $('logList').append(b);
    }
  }
  function confirmAction(title, message, action) {
    text('confirmTitle', title);
    text('confirmText', message);
    $('confirmAccept').onclick = () => {
      $('confirmDialog').close();
      action();
    };
    $('confirmDialog').showModal();
  }
  try {
    view = new GardenView(
      $('garden'),
      pick,
      () => {
        const r = $('tiltRange');
        if (r) r.value = String(Math.round((view.pitch * 180) / Math.PI));
      },
      () => tool !== 'inspect',
      strokeEnd,
    );
    view.setQuality(profile.settings.quality);
  } catch (e) {
    text('cellTitle', T.m387);
    text('cellDesc', T.m388);
    text('toast', T.m389 + e.message);
    $('toast').classList.add('show');
    return;
  }
  $('residentsBtn').onclick = () => open('residents');
  $('achievementFocus').onclick = () => {
    if (!achievementTarget) return;
    let i = achievementTarget.i;
    if (achievementTarget.animal) {
      const at = world.cells.findIndex((c) => c?.animal === achievementTarget.animal);
      if (at >= 0) i = at;
      else toast(T.m390);
    }
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
    focus(i);
    $('achievementToast').classList.remove('show');
  };
  $('achievementDismiss').onclick = () => $('achievementToast').classList.remove('show');
  $('pausedBadge').onclick = () => setSpeed(1);
  $('panToggle').onclick = () => {
    view.panMode = !view.panMode;
    view.followAnimal = null;
    $('panToggle').setAttribute('aria-pressed', String(view.panMode));
  };
  $('photoBtn').onclick = () => {
    view.render(performance.now());
    view.canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a'),
        url = URL.createObjectURL(blob);
      link.href = url;
      link.download = T.m391;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  };
  $('chapterBtn').onclick = () => open('chapters');
  $('nextChapter').onclick = () => open('chapters');
  $('achieveBtn').onclick = () => open('achievements');
  $('saveBtn').onclick = () => open('saves');
  $('logBtn').onclick = () => open('logs');
  document
    .querySelectorAll('[data-close]')
    .forEach((b) => (b.onclick = () => $(b.dataset.close).close()));
  $('confirmCancel').onclick = () => $('confirmDialog').close();
  $('petBtn').onclick = () => {
    const r = E.pet(world, selected, profile);
    if (r.ok) {
      GardenAudio.pet(r.type, profile.settings);
      toast(r.type === 'alpaca' ? T.m392 : T.m393);
      update();
      save();
    } else toast(r.reason);
  };
  $('focusBtn').onclick = () => focus(selected);
  $('eventFocus').onclick = () => world.events[0] && focus(world.events[0].i);
  $('overview').onclick = overview;
  $('inspectClose').onclick = () => {
    selected = -1;
    selectedAnimal = null;
    view.selected = -1;
    inspect();
  };
  $('rotateLeft').onclick = () => (view.yaw -= 0.35);
  $('rotateRight').onclick = () => (view.yaw += 0.35);
  $('tiltRange').oninput = (e) => {
    const deg = Math.max(20, Math.min(72, Number(e.target.value) || 39));
    view.pitch = (deg * Math.PI) / 180;
    view.dirty = true;
  };
  $('tiltRange').value = String(Math.round((view.pitch * 180) / Math.PI));
  $('zoomIn').onclick = () => (view.targetZoom = Math.max(0.14, view.targetZoom * 0.8));
  $('zoomOut').onclick = () => (view.targetZoom = Math.min(1.8, view.targetZoom * 1.25));
  document.querySelectorAll('[data-speed]').forEach(
    (b) =>
      (b.onclick = () => {
        setSpeed(Number(b.dataset.speed));
        if (focused) text('viewMode', speed ? T.m394 : T.m395);
      }),
  );
  for (const [id, key] of [
    ['labelsToggle', 'labels'],
    ['followToggle', 'autoFocus'],
    ['soundToggle', 'sound'],
    ['labelsSetting', 'labels'],
    ['followSetting', 'autoFocus'],
  ]) {
    const input = $(id);
    if (!input) continue;
    input.checked = profile.settings[key];
    input.onchange = () => {
      profile.settings[key] = input.checked;
      syncSettings();
      save();
    };
  }
  function syncSettings() {
    GardenAudio.configure(profile.settings);
    view.setTimeOfDay(profile.settings.timeOfDay || 'dawn');
    if ($('timeSelect')) $('timeSelect').value = profile.settings.timeOfDay || 'dawn';
    view.showLabels = profile.settings.labels;
    view.dirty = true;
    for (const [id, key] of [
      ['labelsToggle', 'labels'],
      ['followToggle', 'autoFocus'],
      ['soundToggle', 'sound'],
      ['labelsSetting', 'labels'],
      ['followSetting', 'autoFocus'],
    ])
      if ($(id)) $(id).checked = profile.settings[key];
    $('quality').value = profile.settings.quality;
    view.setQuality(profile.settings.quality);
  }
  $('replaceSetting').onchange = () => {
    $('replaceToggle').checked = $('replaceSetting').checked;
  };
  $('replaceToggle').onchange = () => {
    $('replaceSetting').checked = $('replaceToggle').checked;
  };
  $('quality').onchange = () => {
    profile.settings.quality = $('quality').value;
    view.setQuality(profile.settings.quality);
    save();
  };
  $('manualSave').onclick = () => {
    if (storageError)
      confirmAction(T.m396, T.m397, () => {
        if (save(true)) toast(T.m398);
      });
    else if (save(true)) toast(T.m398);
  };
  $('resetLevel').onclick = () =>
    confirmAction(T.m406, T.m407, () => {
      const n = world.level;
      profile.worlds[n] = E.makeWorld(n);
      world = null;
      loadLevel(n);
      $('saves').close();
      toast(T.m408);
    });
  window.addEventListener('keydown', (e) => {
    if (
      !journey.active() ||
      document.querySelector('dialog[open]') ||
      /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)
    )
      return;
    const direction = {
      w: [0, 22],
      ArrowUp: [0, 22],
      s: [0, -22],
      ArrowDown: [0, -22],
      a: [22, 0],
      ArrowLeft: [22, 0],
      d: [-22, 0],
      ArrowRight: [-22, 0],
    }[e.key];
    if (direction) {
      e.preventDefault();
      view.followAnimal = null;
      view.pan(...direction);
    }
    if (e.code === 'Space') {
      e.preventDefault();
      setSpeed(speed ? 0 : 1);
    }
    if (e.key.toLowerCase() === 'q') view.yaw -= 0.2;
    if (e.key.toLowerCase() === 'e') view.yaw += 0.2;
  });
  document.addEventListener('visibilitychange', () => {
    acc = 0;
    last = performance.now();
    if (document.hidden) save();
  });
  window.addEventListener('pagehide', () => save());
  window.addEventListener('beforeunload', () => save());
  journey = GardenJourney.mount({
    world: () => world,
    profile: () => profile,
    view,
    choose: chooseTool,
    pick,
    focus,
    save,
  });
  mountPreferences();
  syncSettings();
  loadLevel(profile.current);
  if (storageError) toast(storageError);
  function mountPreferences() {
    const newSave = el('button', 'danger', '全新存档');
    newSave.id = 'newSave';
    $('saves').insertBefore(newSave, $('saves').querySelector('.saveActions'));
    newSave.onclick = () =>
      confirmAction(
        '开始全新的花园？',
        '当前进度、成就、关卡与新手教程都会从零开始。若想保留当前花园，请先保存到手动存档位；已有手动存档位不会删除。',
        () => {
          const settings = profile.settings;
          profile = E.defaultProfile();
          profile.settings = settings;
          world = null;
          known = new Set();
          residentCursor = {};
          achievementTarget = null;
          storageError = '';
          $('achievementToast').classList.remove('show');
          document.querySelectorAll('dialog[open]').forEach((d) => d.close());
          syncSettings();
          loadLevel(0);
          journey.reset();
          save(true);
          toast('新的花园，从第一滴水开始');
        },
      );
    const residents = $('residentsBtn');
    residents.firstChild.textContent = '动物名录 ';
    const residentCard = el('section', 'panel residentPanel');
    residentCard.append(residents);
    document.querySelector('.side.left').append(residentCard);
    $('exportSave').remove();
    const panel = document.createElement('dialog');
    panel.id = 'settingsPanel';
    panel.innerHTML =
      '<div class="dialogHead"><h2>设置</h2><button id="closeSettings">返回花园</button></div>';
    document.body.append(panel);
    for (const node of [...$('saves').querySelectorAll('.setting')]) panel.append(node);
    $('soundToggle').parentElement.querySelector('span').textContent = '动物叫声与音效';
    const music = document.createElement('label');
    music.className = 'setting';
    music.innerHTML = '<span>轻柔音乐</span><input type="checkbox" id="musicToggle">';
    panel.prepend(music);
    panel.prepend(panel.querySelector('.dialogHead'));
    // 光影时段：目前只有「清晨」是按效果调过的，其余三档在界面上先禁用
    const timeRow = document.createElement('label');
    timeRow.className = 'setting';
    timeRow.innerHTML =
      '<span>光影时段</span><select id="timeSelect">' +
      '<option value="dawn">清晨</option>' +
      '<option value="afternoon" disabled>午后（待定）</option>' +
      '<option value="dusk" disabled>黄昏（待定）</option>' +
      '<option value="night" disabled>夜晚（待定）</option>' +
      '</select>';
    panel.append(timeRow);
    const prefs = () => {
      $('timeSelect').value = profile.settings.timeOfDay || 'dawn';
      $('musicToggle').checked = profile.settings.music !== false;
      $('autosaveToggle').checked = profile.settings.autosave !== false;
    };
    $('musicToggle').onchange = () => {
      profile.settings.music = $('musicToggle').checked;
      GardenAudio.configure(profile.settings);
      save();
    };
    $('timeSelect').onchange = () => {
      profile.settings.timeOfDay = $('timeSelect').value;
      view.setTimeOfDay(profile.settings.timeOfDay);
      save(true);
    };
    const button = el('button', '', '设置');
    button.id = 'settingsBtn';
    $('gardenMenuPanel').querySelector('.menuGrid').append(button);
    button.onclick = () => {
      $('gardenMenuPanel').close();
      prefs();
      panel.showModal();
    };
    $('closeSettings').onclick = () => panel.close();
    const auto = el('label', 'setting');
    auto.innerHTML = '<span>自动存档 · 每 10 秒</span><input type="checkbox" id="autosaveToggle">';
    $('saves').insertBefore(auto, $('saves').querySelector('.saveActions'));
    $('autosaveToggle').onchange = () => {
      profile.settings.autosave = $('autosaveToggle').checked;
      save(true);
    };
    const grid = el('div', 'saveSlots');
    grid.id = 'saveSlots';
    $('saves').append(grid);
    function renderSlots() {
      prefs();
      grid.replaceChildren();
      for (let n = 1; n <= 6; n++) {
        let slot = null,
          error = '';
        try {
          slot = GardenSlots.read(localStorage, n);
        } catch {
          error = '此存档无法读取';
        }
        const row = el('section', 'saveSlot');
        row.append(
          el('b', '', '手动存档 ' + n),
          el(
            'span',
            '',
            error ||
              (slot
                ? '第 ' +
                  (slot.profile.current + 1) +
                  ' 关 · ' +
                  new Date(slot.savedAt).toLocaleString()
                : '空位'),
          ),
        );
        const store = el('button', '', '保存'),
          load = el('button', '', '读取');
        load.disabled = !slot;
        store.onclick = () => {
          const run = () => {
            try {
              profile.current = world.level;
              profile.worlds[world.level] = world;
              GardenSlots.write(localStorage, n, profile);
              renderSlots();
              toast('已保存到位置 ' + n);
            } catch {
              toast('浏览器存储空间不足或不可用，原存档未被覆盖。');
            }
          };
          if (slot || error) confirmAction('覆盖存档 ' + n + '？', '只替换这个手动存档位。', run);
          else run();
        };
        load.onclick = () =>
          confirmAction(
            '读取存档 ' + n + '？',
            '当前花园将替换为这个时间点。需要保留的话，请先存到另一个位置。',
            () => {
              try {
                const incoming = GardenSlots.read(localStorage, n).profile;
                incoming.settings = profile.settings;
                profile = incoming;
                storageError = '';
                world = null;
                known = new Set(Object.keys(profile.achievements));
                syncSettings();
                loadLevel(profile.current);
                $('saves').close();
                toast('已读取存档 ' + n);
              } catch {
                toast('读取失败，当前花园已保留。');
              }
            },
          );
        row.append(store, load);
        grid.append(row);
      }
    }
    $('saveBtn').addEventListener('click', renderSlots);
    $('manualSave').textContent = '更新自动存档';
    // 导入存档 JSON：读文件 → 走存档校验 → 确认后整份替换（换浏览器/设备、载入演示存档用）
    $('importSave').onchange = async (e) => {
      const f = e.target.files[0];
      e.target.value = '';
      if (!f) return;
      try {
        if (f.size > 8 * 1024 * 1024) throw Error(T.m401);
        const incoming = E.validateProfile(JSON.parse(await f.text()));
        confirmAction(T.m402, T.m403, () => {
          profile = incoming;
          storageError = '';
          world = null;
          known = new Set(Object.keys(profile.achievements));
          residentCursor = {};
          achievementTarget = null;
          syncSettings();
          loadLevel(profile.current);
          $('saves').close();
          toast(T.m404);
        });
      } catch (err) {
        toast(T.m405 + ((err && err.message) || err));
      }
    };
    $('importSaveBtn').onclick = () => $('importSave').click();
    $('enterGarden').addEventListener('click', () => GardenAudio.unlock(profile.settings));
    prefs();
  }
  function lockFooterHeight() {
    const f = document.querySelector('#game>footer'),
      g = document.getElementById('game');
    if (!f || !g || g.dataset.mode === 'observe') return;
    const h = Math.round(f.getBoundingClientRect().height);
    if (h > 40) document.documentElement.style.setProperty('--footerH', h + 'px');
  }
  lockFooterHeight();
  window.addEventListener('resize', () => setTimeout(lockFooterHeight, 300));
  const MICRO_MS = 50;
  let simAcc = 0;
  function frame(t) {
    const dt = last ? Math.min(t - last, 250) : 0;
    last = t;
    const paused = document.hidden || !journey.active() || !!strokeSnapshot;
    if (!paused) {
      acc += dt * speed;
      // 固定 50ms 微步：E.advance 只推进位置，E.step 仍是 500ms 一拍做决策与生态。
      // 不用「这一帧的 dt」推进，存档在任何帧率下才都能复现。
      while (acc >= MICRO_MS) {
        E.advance(world, MICRO_MS);
        acc -= MICRO_MS;
        simAcc += MICRO_MS;
        if (simAcc >= E.STEP_MS) {
          E.tick(world, profile); // 只做决策与生态，运动由上面的 advance 推进
          simAcc -= E.STEP_MS;
        }
      }
    } else {
      acc = 0;
      simAcc = 0;
    }
    if (!document.hidden) view.render(t);
    journey.update();
    if (t - lastUI > 400) {
      update();
      lastUI = t;
    }
    if (t - lastSave > 10000) {
      save();
      lastSave = t;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
