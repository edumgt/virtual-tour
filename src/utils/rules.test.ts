import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLightingPreset,
  dampVector3,
  distance3D,
  clampCameraPosition,
  getZoneOverviewCamera,
  filterLandmarksByZone,
  calculateEavesHeight,
  calculateRafterCount,
} from './rules';

test('getLightingPreset returns valid day and night configurations', () => {
  const day = getLightingPreset('day');
  assert.equal(typeof day.sunIntensity, 'number');
  assert.ok(day.sunIntensity > 1.5);
  assert.equal(day.lanternIntensity, 0);

  const night = getLightingPreset('night');
  assert.ok(night.sunIntensity < 1.0);
  assert.ok(night.lanternIntensity > 1.0);
});

test('distance3D computes accurate Euclidean distances', () => {
  const dist = distance3D([0, 0, 0], [3, 4, 0]);
  assert.equal(dist, 5);

  const dist3D = distance3D([1, 2, 3], [1, 2, 3]);
  assert.equal(dist3D, 0);
});

test('dampVector3 moves smoothly toward target', () => {
  const start: [number, number, number] = [0, 0, 0];
  const target: [number, number, number] = [10, 20, 30];
  const stepped = dampVector3(start, target, 5, 0.1);

  assert.ok(stepped[0] > 0 && stepped[0] < 10);
  assert.ok(stepped[1] > 0 && stepped[1] < 20);
  assert.ok(stepped[2] > 0 && stepped[2] < 30);
});

test('clampCameraPosition constrains values within allowable bounds', () => {
  const clampedInside = clampCameraPosition([10, 15, 20]);
  assert.deepEqual(clampedInside, [10, 15, 20]);

  const clampedExtreme = clampCameraPosition([-500, 0.5, 999]);
  assert.equal(clampedExtreme[0], -165);
  assert.equal(clampedExtreme[1], 1.2);
  assert.equal(clampedExtreme[2], 240);

  const clampedTop = clampCameraPosition([0, 400, 0]);
  assert.equal(clampedTop[1], 230);
});

test('getZoneOverviewCamera returns distinct framing for gwanghwamun and jamsil', () => {
  const gwanghwamunCam = getZoneOverviewCamera('gwanghwamun');
  assert.equal(gwanghwamunCam.defaultLandmarkId, 'gwanghwamun');
  assert.ok(gwanghwamunCam.position[1] < 30);

  const jamsilCam = getZoneOverviewCamera('jamsil');
  assert.equal(jamsilCam.defaultLandmarkId, 'lotte_world_tower');
  assert.ok(jamsilCam.position[1] > 30);
});

test('filterLandmarksByZone filters landmarks strictly by active zone', () => {
  const sample = [
    { id: 'a', zone: 'gwanghwamun' as const },
    { id: 'b', zone: 'jamsil' as const },
    { id: 'c', zone: 'jamsil' as const },
  ];
  assert.equal(filterLandmarksByZone(sample, 'gwanghwamun').length, 1);
  assert.equal(filterLandmarksByZone(sample, 'jamsil').length, 2);
  assert.deepEqual(
    filterLandmarksByZone(sample, 'jamsil').map((x) => x.id),
    ['b', 'c']
  );
});

test('calculateEavesHeight computes authentic concave Korean slope with corner sweep', () => {
  // Center ridge point (u=0, v=0) should equal full height
  const ridgeY = calculateEavesHeight(0, 0, 0.4, 3.6, 0.6);
  assert.ok(Math.abs(ridgeY - 3.6) < 0.05);

  // Eaves corner (u=1, v=1) should have corner flair
  const cornerY = calculateEavesHeight(1, 1, 0.4, 3.6, 0.6);
  assert.ok(cornerY > 0);
  assert.ok(cornerY >= 0.4 * 1.6);
});

test('calculateRafterCount yields realistic counts for palace eaves', () => {
  const countMunru = calculateRafterCount(32, 0.65);
  assert.equal(countMunru, 49);

  const countSmall = calculateRafterCount(1, 0.65);
  assert.equal(countSmall, 2);
});
