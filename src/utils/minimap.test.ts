import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ZONE_MAP_CONFIGS,
  projectWorldToMap,
  mapNormToWorldXZ,
  computeCameraYawDeg,
  panCameraToWorldXZ,
} from './minimap';
import { SceneZone } from '../types';

const ALL_ZONES: SceneZone[] = [
  'gwanghwamun',
  'jamsil',
  'namsan_han',
  'namhae_german',
  'jeonju_hanok',
];

test('ZONE_MAP_CONFIGS provides bounds and schematic shapes for all 5 zones', () => {
  for (const zone of ALL_ZONES) {
    const cfg = ZONE_MAP_CONFIGS[zone];
    assert.ok(cfg, `Missing config for ${zone}`);
    assert.ok(cfg.bounds.maxX > cfg.bounds.minX);
    assert.ok(cfg.bounds.maxZ > cfg.bounds.minZ);
    assert.ok(cfg.shapes.length >= 5);
  }
});

test('projectWorldToMap maps center of bounds to center of SVG canvas and clamps outliers', () => {
  const cfg = ZONE_MAP_CONFIGS.gwanghwamun;
  const midX = (cfg.bounds.minX + cfg.bounds.maxX) * 0.5;
  const midZ = (cfg.bounds.minZ + cfg.bounds.maxZ) * 0.5;

  const center = projectWorldToMap(midX, midZ, 'gwanghwamun');
  assert.equal(center.isOutOfBounds, false);
  assert.ok(Math.abs(center.xPercent - 50) < 0.01);
  assert.ok(Math.abs(center.yPercent - 50) < 0.01);

  const outlier = projectWorldToMap(9999, -9999, 'gwanghwamun');
  assert.equal(outlier.isOutOfBounds, true);
  assert.ok(outlier.xPercent <= 97 && outlier.xPercent >= 3);
  assert.ok(outlier.yPercent <= 97 && outlier.yPercent >= 3);
});

test('mapNormToWorldXZ cleanly inverts normalized coordinates into world X/Z', () => {
  for (const zone of ALL_ZONES) {
    const [wx, wz] = mapNormToWorldXZ(0.5, 0.5, zone);
    const projected = projectWorldToMap(wx, wz, zone);
    assert.ok(Math.abs(projected.xPercent - 50) < 0.01);
    assert.ok(Math.abs(projected.yPercent - 50) < 0.01);
  }
});

test('computeCameraYawDeg aligns cardinal directions (N=0, E=90, S=180, W=270)', () => {
  assert.equal(Math.round(computeCameraYawDeg([0, 10, 48], [0, 5, 0])), 0);
  assert.equal(Math.round(computeCameraYawDeg([0, 10, 0], [40, 5, 0])), 90);
  assert.equal(Math.round(computeCameraYawDeg([0, 10, 0], [0, 5, 40])), 180);
  assert.equal(Math.round(computeCameraYawDeg([40, 10, 0], [0, 5, 0])), 270);
});

test('panCameraToWorldXZ keeps viewing target centered and clamps extreme offsets', () => {
  const result = panCameraToWorldXZ([-40, 180, 200], [0, 5, 0], 52, -36);
  assert.deepEqual(result.target, [52, 5, -36]);
  assert.ok(result.position[1] <= 55 && result.position[1] >= 12);
  const horizOffset = Math.hypot(result.position[0] - 52, result.position[2] - -36);
  assert.ok(horizOffset <= 65);
});
