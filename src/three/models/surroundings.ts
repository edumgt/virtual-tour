import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createHeroKoreanPine,
  createKoreanPineTrunkGeometry,
  createKoreanPineCrownGeometry,
} from './realisticTrees';

/**
 * Helper to build a naturally sculpted granite mountain crag (화강암 암봉)
 * with ridge displacement so Mt. Bugaksan never looks like bare smooth cones.
 */
function createGranitePeakGeometry(
  radius: number,
  height: number,
  seed: number
): THREE.BufferGeometry {
  const geo = new THREE.ConeGeometry(radius, height, 18, 8);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const hNorm = (vy + height * 0.5) / height;
    const ridge =
      Math.sin(vx * 0.12 + seed) * Math.cos(vz * 0.13 - seed * 0.7) * 5.2 * (1 - hNorm * 0.45) +
      Math.sin(vx * 0.25 + vz * 0.22 + seed * 1.9) * 2.1;
    const radialScale = 1 + ridge / Math.max(8, radius);
    pos.setXYZ(i, vx * radialScale, vy + (hNorm > 0.15 && hNorm < 0.9 ? ridge * 0.35 : 0), vz * radialScale);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates scenic palace surroundings:
 * 1. Mt. Bugaksan (북악산 / 백악산) dramatic granite peaks & pine ridges in the north backdrop
 * 2. Palace Perimeter Walls (궁궐 담장) & Corner Watchtower (동십자각)
 * 3. Traditional Korean Red Pines (적송)
 * 4. Sumunjang Royal Guards & Ceremonial Banners (수문장 및 의장기)
 */
export function buildSurroundings(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'palace_surroundings';

  // 1. Mt. Bugaksan (북악산 - 웅장한 화강암 암봉과 소나무 능선)
  // Positioned directly north behind Geunjeongjeon (Z = -180 to -240)
  const mountainGroup = new THREE.Group();
  mountainGroup.name = 'mt_bugaksan';

  const peakSpecs: { x: number; y: number; z: number; r: number; h: number; sx: number; sz: number; seed: number; rock: boolean }[] = [
    { x: 0, y: 34, z: -200, r: 58, h: 70, sx: 1.45, sz: 0.92, seed: 1.1, rock: true },
    { x: -16, y: 22, z: -182, r: 32, h: 46, sx: 1.1, sz: 1.0, seed: 2.3, rock: false },
    { x: 18, y: 24, z: -184, r: 34, h: 48, sx: 1.15, sz: 0.95, seed: 3.7, rock: false },
    { x: -68, y: 26, z: -185, r: 48, h: 54, sx: 1.32, sz: 1.1, seed: 4.5, rock: false },
    { x: 65, y: 27, z: -190, r: 50, h: 56, sx: 1.25, sz: 1.0, seed: 5.9, rock: true },
    { x: -150, y: 30, z: -140, r: 62, h: 62, sx: 1.15, sz: 1.05, seed: 7.2, rock: true },
  ];

  peakSpecs.forEach((p) => {
    const geo = createGranitePeakGeometry(p.r, p.h, p.seed);
    const mesh = new THREE.Mesh(geo, p.rock ? materials.coastalRock : materials.mountainStone);
    mesh.position.set(p.x, p.y - 1, p.z);
    mesh.scale.set(p.sx, 1.0, p.sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mountainGroup.add(mesh);
  });

  // Forested Korean Pine Trees covering the lower & mid slopes of Mt. Bugaksan
  const bugakTreeCoords: [number, number, number][] = [];
  for (let i = 0; i < 84; i++) {
    const t = (i / 84) * Math.PI * 2;
    const band = i % 3;
    const tx = -95 + ((i * 23) % 190);
    const tz = -152 - band * 13 + Math.sin(t * 2.1) * 5;
    // Approximate slope elevation along foothills
    const distFromCenter = Math.abs(tx) * 0.4;
    const ty = Math.max(1.5, 16 - band * 3.5 + (1 - Math.min(1, distFromCenter / 60)) * 9);
    bugakTreeCoords.push([tx, ty, tz]);
  }
  const slopeTrunkGeo = createKoreanPineTrunkGeometry();
  const slopeCrownGeo = createKoreanPineCrownGeometry();
  const slopeTrunks = new THREE.InstancedMesh(slopeTrunkGeo, materials.treeBark, bugakTreeCoords.length);
  const slopeCrowns = new THREE.InstancedMesh(slopeCrownGeo, materials.leafCanopy, bugakTreeCoords.length);
  const dummy = new THREE.Object3D();
  const slopeColor = new THREE.Color();
  const slopePalette = [0x244d2d, 0x2f5e36, 0x1e4327, 0x3b693c];

  bugakTreeCoords.forEach(([tx, ty, tz], idx) => {
    const s = 1.6 + (idx % 4) * 0.25;
    dummy.position.set(tx, ty, tz);
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, idx * 1.3, 0);
    dummy.updateMatrix();
    slopeTrunks.setMatrixAt(idx, dummy.matrix);
    slopeCrowns.setMatrixAt(idx, dummy.matrix);
    slopeColor.setHex(slopePalette[idx % slopePalette.length]);
    slopeCrowns.setColorAt(idx, slopeColor);
  });
  slopeTrunks.instanceMatrix.needsUpdate = true;
  slopeCrowns.instanceMatrix.needsUpdate = true;
  if (slopeCrowns.instanceColor) slopeCrowns.instanceColor.needsUpdate = true;
  slopeTrunks.computeBoundingSphere();
  slopeCrowns.computeBoundingSphere();
  mountainGroup.add(slopeTrunks, slopeCrowns);

  root.add(mountainGroup);

  // 2. Palace Outer Walls (궁궐 담장) with granite plinth base & tiled roof caps
  const wallsGroup = new THREE.Group();
  wallsGroup.name = 'palace_walls';

  // East Wall
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 160), materials.granite);
  eastWall.position.set(48, 2.1, -40);
  const eastWallPlinth = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 160.2), materials.granitePlinth);
  eastWallPlinth.position.set(48, 0.275, -40);
  const eastWallCap = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.45, 160.4), materials.giwaRoof);
  eastWallCap.position.set(48, 4.4, -40);
  wallsGroup.add(eastWall, eastWallPlinth, eastWallCap);

  // West Wall
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 160), materials.granite);
  westWall.position.set(-48, 2.1, -40);
  const westWallPlinth = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 160.2), materials.granitePlinth);
  westWallPlinth.position.set(-48, 0.275, -40);
  const westWallCap = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.45, 160.4), materials.giwaRoof);
  westWallCap.position.set(-48, 4.4, -40);
  wallsGroup.add(westWall, westWallPlinth, westWallCap);

  // North Back Wall
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(98, 4.2, 1.6), materials.granite);
  northWall.position.set(0, 2.1, -120);
  const northWallPlinth = new THREE.Mesh(new THREE.BoxGeometry(98.2, 0.55, 2.0), materials.granitePlinth);
  northWallPlinth.position.set(0, 0.275, -120);
  const northWallCap = new THREE.Mesh(new THREE.BoxGeometry(98.4, 0.45, 2.5), materials.giwaRoof);
  northWallCap.position.set(0, 4.4, -120);
  wallsGroup.add(northWall, northWallPlinth, northWallCap);

  // Watchtower: Dongsipjagak (동십자각 - Corner Watchtower)
  const watchtower = new THREE.Group();
  watchtower.name = 'dongsipjagak';
  watchtower.position.set(48, 0, 12);

  const wtBase = new THREE.Mesh(new THREE.BoxGeometry(8, 4.8, 8), materials.granite);
  wtBase.position.set(0, 2.4, 0);
  const wtPlinth = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 8.5), materials.granitePlinth);
  wtPlinth.position.set(0, 0.25, 0);
  const wtPavilion = new THREE.Mesh(new THREE.BoxGeometry(6, 2.6, 6), materials.dancheong);
  wtPavilion.position.set(0, 6.1, 0);
  const wtRoof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 2.4, 4), materials.giwaRoof);
  wtRoof.rotation.y = Math.PI * 0.25;
  wtRoof.position.set(0, 8.4, 0);
  watchtower.add(wtBase, wtPlinth, wtPavilion, wtRoof);
  wallsGroup.add(watchtower);

  root.add(wallsGroup);

  // 3. Korean Red Pine Trees (한국 전통 조경수 소나무 / 적송 - Realistic Composite Sinuous Pines)
  const treePositions = [
    [-22, 0, 8],
    [-28, 0, -15],
    [22, 0, 8],
    [28, 0, -15],
    [-42, 0, -45],
    [42, 0, -45],
    [-34, 0, -90],
    [34, 0, -90],
    [-18, 0, 52],
    [18, 0, 52],
  ];

  treePositions.forEach(([tx, ty, tz], idx) => {
    const scale = 0.92 + (idx % 4) * 0.1;
    const tree = createHeroKoreanPine(materials.treeBark, materials.pineNeedles, scale, idx);
    tree.position.set(tx, ty, tz);
    root.add(tree);
  });

  // 4. Sumunjang Royal Guards (수문장 교대의식 호위군)
  function createGuardFigure(colorHex: number): THREE.Group {
    const guard = new THREE.Group();
    const robeMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });

    // Lower robe
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 1.3, 8), robeMat);
    robe.position.set(0, 0.65, 0);

    // Torso & head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), materials.mountainStone);
    head.position.set(0, 1.5, 0);

    // Traditional Joseon Gat hat with wide brim (갓 / 주립)
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 12), hatMat);
    hatBrim.position.set(0, 1.62, 0);
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.28, 10), hatMat);
    hatTop.position.set(0, 1.76, 0);

    // Ceremonial Spear (월도 / 창)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), materials.royalWood);
    shaft.position.set(0.35, 1.3, 0.2);
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 4), materials.goldLeaf);
    spearTip.position.set(0.35, 2.7, 0.2);

    guard.add(robe, head, hatBrim, hatTop, shaft, spearTip);
    return guard;
  }

  // Guard positions in front of Gwanghwamun gate flanking the Woldae terrace ramp
  const guardCoords = [
    [-6.2, 0.8, 18, 0x1d3a78], // Blue robe (청호위)
    [6.2, 0.8, 18, 0x9b2424],  // Red robe (적호위)
    [-11.5, 0, 14, 0xd49b29], // Yellow robe (수문장)
    [11.5, 0, 14, 0x1c4a3b],  // Green robe
  ];

  guardCoords.forEach(([gx, gy, gz, color]) => {
    const guard = createGuardFigure(color);
    guard.position.set(gx, gy, gz);
    guard.castShadow = true;
    root.add(guard);
  });

  // Royal Joseon Banners (의장기 - 용기, 초요기, 순라기) placed proudly along terrace flanks
  const bannerMat = new THREE.MeshStandardMaterial({
    color: 0x9e2a2b,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  [-9.2, 9.2].forEach((bx) => {
    const dir = bx > 0 ? 1 : -1;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.4, 8), materials.goldLeaf);
    pole.position.set(bx, 3.2, 26);
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), materials.goldLeaf);
    spearTip.position.set(bx, 6.6, 26);
    const crossSpar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8, 6), materials.goldLeaf);
    crossSpar.rotation.z = Math.PI * 0.5;
    crossSpar.position.set(bx + dir * 0.85, 6.02, 26);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), bannerMat);
    flag.position.set(bx + dir * 0.85, 4.8, 26);
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.14, 0.05), materials.goldLeaf);
    goldTrim.position.set(bx + dir * 0.85, 3.6, 26);
    const centerEmblem = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.38, 16), materials.goldLeaf);
    centerEmblem.position.set(bx + dir * 0.85, 4.85, 26.02);
    root.add(pole, spearTip, crossSpar, flag, goldTrim, centerEmblem);
  });

  return root;
}
