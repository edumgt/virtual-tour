import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Perturbs vertices organically along normals/radial vector to remove geometric sphere/icosahedron regularity
 * and returns a clean non-indexed BufferGeometry ready for mergeGeometries.
 */
function buildOrganicFoliageLobe(
  radius: number,
  sx: number,
  sy: number,
  sz: number,
  tx: number,
  ty: number,
  tz: number,
  seed: number,
  roughnessAmp = 0.16
): THREE.BufferGeometry {
  const rawGeo = new THREE.IcosahedronGeometry(radius, 1);
  const geo = rawGeo.index ? rawGeo.toNonIndexed() : rawGeo;
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const n1 = Math.sin(vx * 3.1 + vy * 2.4 + seed) * Math.cos(vz * 2.9 - seed * 0.7);
    const n2 = Math.sin(vz * 5.2 + vx * 4.3 + seed * 1.9);
    const factor = 1 + n1 * roughnessAmp + n2 * (roughnessAmp * 0.45);
    pos.setXYZ(i, vx * factor * sx + tx, vy * factor * sy + ty, vz * factor * sz + tz);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Helper to build a tapered non-indexed limb cylinder connecting base (x0, y0, z0) to tip (x1, y1, z1)
 */
function buildLimbSegment(
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  rBot: number,
  rTop: number,
  radialSegs = 7
): THREE.BufferGeometry {
  const p0 = new THREE.Vector3(x0, y0, z0);
  const p1 = new THREE.Vector3(x1, y1, z1);
  const dir = new THREE.Vector3().subVectors(p1, p0);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);

  const rawGeo = new THREE.CylinderGeometry(rTop, rBot, len, radialSegs, 1);
  const geo = rawGeo.index ? rawGeo.toNonIndexed() : rawGeo;
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  const mat = new THREE.Matrix4().compose(mid, quat, new THREE.Vector3(1, 1, 1));
  geo.applyMatrix4(mat);
  return geo;
}

/**
 * Merges an array of non-indexed geometries safely (normalizing attributes).
 */
function safeMerge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  if (!merged) {
    return new THREE.BoxGeometry(1, 1, 1);
  }
  merged.computeBoundingSphere();
  return merged;
}

/**
 * Broadleaf Coastal/Parkland Tree Trunk with flared root buttress & 3 forked main branches
 */
export function createRealisticBroadleafTrunkGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [
    buildLimbSegment(0, 0, 0, 0.08, 1.55, 0.04, 0.38, 0.23, 8),
    buildLimbSegment(0.06, 1.35, 0.03, 0.65, 2.35, 0.35, 0.18, 0.09, 6),
    buildLimbSegment(0.05, 1.4, 0.02, -0.58, 2.45, 0.25, 0.17, 0.08, 6),
    buildLimbSegment(0.05, 1.42, 0.0, 0.08, 2.55, -0.55, 0.16, 0.08, 6),
  ];
  return safeMerge(parts);
}

/**
 * Broadleaf Organic Multi-Cloud Foliage Canopy (6 ruffled asymmetrical leaf clusters)
 */
export function createRealisticBroadleafCrownGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [
    buildOrganicFoliageLobe(1.35, 1.15, 0.92, 1.1, 0.0, 3.05, 0.0, 1.1, 0.17),
    buildOrganicFoliageLobe(1.08, 1.1, 0.85, 1.05, 0.85, 2.65, 0.42, 2.4, 0.18),
    buildOrganicFoliageLobe(1.05, 1.08, 0.88, 1.05, -0.82, 2.75, 0.32, 3.7, 0.18),
    buildOrganicFoliageLobe(1.0, 1.05, 0.85, 1.08, 0.12, 2.8, -0.78, 5.0, 0.18),
    buildOrganicFoliageLobe(0.95, 1.02, 0.82, 1.02, -0.25, 3.65, -0.1, 6.3, 0.16),
    buildOrganicFoliageLobe(0.86, 1.08, 0.78, 1.0, 0.45, 3.55, 0.25, 7.6, 0.16),
  ];
  return safeMerge(parts);
}

/**
 * Korean Red Pine & Coastal Pine Sinuous Trunk (구불구불한 소나무·해송 수피 줄기)
 */
export function createKoreanPineTrunkGeometry(): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.22, 1.1, 0.08),
    new THREE.Vector3(-0.14, 2.2, -0.06),
    new THREE.Vector3(0.16, 3.3, 0.1),
  ]);
  const rawTube = new THREE.TubeGeometry(curve, 10, 0.22, 7, false);
  const mainTube = rawTube.index ? rawTube.toNonIndexed() : rawTube;

  const parts: THREE.BufferGeometry[] = [
    mainTube,
    buildLimbSegment(0, 0, 0, 0.08, 0.65, 0.02, 0.34, 0.22, 7), // flared root collar
    buildLimbSegment(-0.08, 2.05, -0.04, -0.92, 2.65, 0.25, 0.13, 0.06, 6),
    buildLimbSegment(0.08, 2.55, 0.05, 0.88, 3.15, -0.22, 0.12, 0.06, 6),
  ];
  return safeMerge(parts);
}

/**
 * Korean Pine Layered Windswept Needle Canopy Pads (소나무 다층 우산형 솔잎 군락)
 */
export function createKoreanPineCrownGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [
    buildOrganicFoliageLobe(1.18, 1.35, 0.44, 1.25, -0.95, 2.75, 0.28, 1.4, 0.19),
    buildOrganicFoliageLobe(1.12, 1.32, 0.42, 1.22, 0.92, 3.25, -0.22, 2.9, 0.19),
    buildOrganicFoliageLobe(1.38, 1.38, 0.48, 1.32, 0.12, 3.72, 0.12, 4.3, 0.18),
    buildOrganicFoliageLobe(1.05, 1.28, 0.44, 1.2, -0.25, 4.18, -0.18, 5.8, 0.18),
    buildOrganicFoliageLobe(0.85, 1.2, 0.42, 1.15, 0.22, 4.55, 0.06, 7.1, 0.17),
  ];
  return safeMerge(parts);
}

/**
 * Gnarled Vase-Shaped Korean Cherry Blossom Trunk (왕벚나무 가지형 줄기)
 */
export function createCherryBlossomTrunkGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [
    buildLimbSegment(0, 0, 0, 0.05, 1.25, 0.0, 0.36, 0.22, 8),
    buildLimbSegment(0.04, 1.1, 0.0, 0.95, 2.25, 0.55, 0.16, 0.07, 6),
    buildLimbSegment(0.04, 1.12, 0.0, -0.92, 2.2, 0.48, 0.16, 0.07, 6),
    buildLimbSegment(0.04, 1.15, 0.0, 0.65, 2.35, -0.82, 0.15, 0.07, 6),
    buildLimbSegment(0.04, 1.14, 0.0, -0.68, 2.3, -0.78, 0.15, 0.07, 6),
  ];
  return safeMerge(parts);
}

/**
 * Wide Airy Spreading Cherry Blossom Canopy (만개한 벚꽃 구름)
 */
export function createCherryBlossomCrownGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [
    buildOrganicFoliageLobe(1.32, 1.35, 0.62, 1.25, 0.0, 2.95, 0.0, 2.1, 0.18),
    buildOrganicFoliageLobe(1.18, 1.25, 0.58, 1.15, 1.05, 2.45, 0.62, 3.4, 0.19),
    buildOrganicFoliageLobe(1.16, 1.25, 0.58, 1.15, -1.02, 2.42, 0.55, 4.7, 0.19),
    buildOrganicFoliageLobe(1.1, 1.22, 0.58, 1.18, 0.72, 2.55, -0.88, 6.0, 0.19),
    buildOrganicFoliageLobe(1.12, 1.22, 0.56, 1.15, -0.75, 2.52, -0.82, 7.3, 0.19),
  ];
  return safeMerge(parts);
}

/**
 * Creates a Hero Composite Korean Red Pine Tree (THREE.Group) for Gyeongbokgung courtyard grounds
 */
export function createHeroKoreanPine(
  barkMat: THREE.Material,
  needleMat: THREE.Material,
  scale = 1.0,
  seed = 0
): THREE.Group {
  const tree = new THREE.Group();
  const trunkGeo = createKoreanPineTrunkGeometry();
  const crownGeo = createKoreanPineCrownGeometry();

  const trunk = new THREE.Mesh(trunkGeo, barkMat);
  trunk.castShadow = true;
  trunk.receiveShadow = true;

  const crown = new THREE.Mesh(crownGeo, needleMat);
  crown.castShadow = true;
  crown.receiveShadow = true;

  tree.add(trunk, crown);
  tree.scale.setScalar(scale * 1.18);
  tree.rotation.y = seed * 2.1;
  return tree;
}

/**
 * Concrete 4-legged coastal breakwater Tetrapod armor block (물건항 방파제 테트라포드)
 */
export function createCoastalTetrapodGeometry(): THREE.BufferGeometry {
  const legs: [number, number, number][] = [
    [0, 1, 0],
    [0.94, -0.33, 0],
    [-0.47, -0.33, 0.81],
    [-0.47, -0.33, -0.81],
  ];
  const parts = legs.map(([lx, ly, lz]) =>
    buildLimbSegment(0, 0, 0, lx * 1.15, ly * 1.15, lz * 1.15, 0.44, 0.24, 6)
  );
  return safeMerge(parts);
}
