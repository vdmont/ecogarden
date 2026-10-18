const assert = require('node:assert/strict');
require('./load.cjs');
require('../src/ui/journey.js');
const E = Eco;
function setup(l) {
  const p = E.defaultProfile();
  p.current = p.unlocked = l;
  const s = (p.worlds[l] = E.makeWorld(l, undefined, 42));
  s.rng = 42;
  return [p, s];
}
for (const l of [4, 5]) {
  const [p, s] = setup(l),
    i = s.cells.findIndex((c) => c && c.ground === 'soil' && !c.plant);
  for (const [k, n] of Object.entries(E.TERRAIN_UNLOCK)) {
    s.score = n - 1;
    const before = JSON.stringify(s.cells);
    assert(!E.place(s, k, i, p).ok);
    assert.equal(JSON.stringify(s.cells), before);
    s.score = n;
    assert.equal(E.allow(s, k, i, p), '');
  }
}
console.log(
  'PASS terrain thresholds apply to chapters five and six without mutating locked worlds',
);
{
  const [p, s] = setup(0);
  assert.equal(GardenJourney.plan(s, p).tool, 'seed');
  s.metrics.sprouted = 12;
  assert.equal(GardenJourney.plan(s, p).tool, 'bug');
  s.metrics.bugMeals = 4;
  assert.equal(GardenJourney.plan(s, p), null);
  const [q, t] = setup(1);
  assert.equal(GardenJourney.plan(t, q).tool, 'bug');
  t.cells.find((c) => c?.plant === 'grass').animal = E.animal('bug');
  assert.equal(GardenJourney.plan(t, q).tool, 'bird');
  t.metrics.birdMeals = 3;
  assert.equal(GardenJourney.plan(t, q), null);
  p.tutorial = { intro0: true, sow: true, unexpected: true };
  const migrated = E.validateProfile(JSON.parse(JSON.stringify(p)));
  assert(migrated.tutorial.sow);
  assert(!migrated.tutorial.unexpected);
  assert.equal(GardenJourney.plan(s, migrated), null);
}
console.log('PASS early tutorial advances on actual objectives and completed steps survive saves');
assert(E.LIFE.sheep < 720 && E.LIFE.alpaca < 840 && E.LIFE.rabbit < 360);
console.log('PASS shorter animal lifetimes');
{
  const p = E.defaultProfile(),
    s = E.makeWorld(0);
  const step = GardenJourney.plan(s, p);
  GardenJourney.learned(p, step);
  assert(GardenJourney.plan(s, p));
  GardenJourney.learned(p, step);
  assert.equal(GardenJourney.plan(s, p), null);
  const late = E.makeWorld(5);
  assert.equal(GardenJourney.plan(late, E.defaultProfile()), null);
  p.worlds[0] = s;
  const q = E.validateProfile(JSON.parse(JSON.stringify(p)));
  assert.equal(q.tutorialCounts.seed, 2);
  assert.equal(GardenJourney.plan(s, q), null);
}
console.log('PASS repeated teaching capped at two, persisted, and final chapter has no tutorial');
