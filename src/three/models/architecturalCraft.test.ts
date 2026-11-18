import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import type { PalaceMaterials } from '../materials';
import { createKoreanRoof } from './architecturalCraft';

test('Korean roof surface faces upward and slopes down at the hip ends', () => {
  const material = new THREE.MeshStandardMaterial();
  const materials = new Proxy({}, { get: () => material }) as PalaceMaterials;
  const roof = createKoreanRoof(20, 12, 4, materials, { showJapsang: false });
  const surface = roof.getObjectByName('roof_surface');
  assert.ok(surface instanceof THREE.Mesh);

  const positions = surface.geometry.getAttribute('position');
  const normals = surface.geometry.getAttribute('normal');
  const centerRow = 16 * 49;
  assert.equal(positions.getY(centerRow), 0);
  assert.equal(positions.getY(centerRow + 24), 4);
  assert.equal(positions.getY(centerRow + 48), 0);
  assert.ok(normals.getY(centerRow + 24) > 0);
});
