import test from 'node:test';
import assert from 'node:assert/strict';
import { getLightingPreset, dampVector3, distance3D, clampCameraPosition } from './rules';

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
  assert.equal(clampedExtreme[0], -120);
  assert.equal(clampedExtreme[1], 1.2);
  assert.equal(clampedExtreme[2], 160);
});
