import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createKoreanRoof,
  createDapoFacadeRow,
  createColumnPlinth,
  createStoneBalustradeLine,
} from './architecturalCraft';

/**
 * Creates Gwanghwamun Gate (광화문), Woldae terrace (월대), and Haechi statues (해태상).
 * Upgraded with authentic multi-course Ashlar granite Yukchuk, open Hongyemun arches,
 * stepped Dapo bracket systems (공포), exposed rafters (서까래), stone drain gargoyles (석루조),
 * column base plinths (초석), and gracefully curved sweeping Korean roofs with Japsang sentinels.
 */
export function buildGwanghwamun(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'gwanghwamun_root';

  // 1. Woldae (월대 - Royal Stone Terrace extending South)
  const woldaeGroup = new THREE.Group();
  woldaeGroup.name = 'woldae';

  // Base terrace slab (Length 34m along Z, Width 14m along X, Height 0.8m)
  const woldaeBaseGeo = new THREE.BoxGeometry(14, 0.8, 32);
  const woldaeBase = new THREE.Mesh(woldaeBaseGeo, materials.granite);
  woldaeBase.position.set(0, 0.4, 20);
  woldaeBase.castShadow = true;
  woldaeBase.receiveShadow = true;
  woldaeGroup.add(woldaeBase);

  // Central Royal Road (어차길 / 어도 - slightly raised central paving for the King)
  const eodoGeo = new THREE.BoxGeometry(4.2, 0.1, 31.8);
  const eodoMat = materials.granite.clone();
  const eodoMesh = new THREE.Mesh(eodoGeo, eodoMat);
  eodoMesh.position.set(0, 0.85, 20);
  eodoMesh.receiveShadow = true;
  woldaeGroup.add(eodoMesh);

  // Woldae Balustrades (난간석 with carved lotus bud posts) along both flanks
  const leftBalustrade = createStoneBalustradeLine(31.6, materials, 3.2);
  leftBalustrade.position.set(-6.8, 0.8, 20);
  leftBalustrade.rotation.y = Math.PI * 0.5;

  const rightBalustrade = createStoneBalustradeLine(31.6, materials, 3.2);
  rightBalustrade.position.set(6.8, 0.8, 20);
  rightBalustrade.rotation.y = Math.PI * 0.5;

  woldaeGroup.add(leftBalustrade, rightBalustrade);

  // Woldae Southern Entry Staircase & Dragon Carved Ramp (남측 어도 계단)
  for (let step = 0; step < 5; step++) {
    const sGeo = new THREE.BoxGeometry(14.8, 0.2, 0.9);
    const sMesh = new THREE.Mesh(sGeo, materials.granite);
    sMesh.position.set(0, 0.1 + step * 0.16, 36.8 - step * 0.8);
    woldaeGroup.add(sMesh);
  }

  root.add(woldaeGroup);

  // 2. Haechi / Haetae Statues (해태상)
  function createHaechi(side: 'left' | 'right'): THREE.Group {
    const haechi = new THREE.Group();
    haechi.name = `haechi_${side}`;

    // Multi-tiered carved granite pedestal (대석) with lotus relief
    const baseStep1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 3.2), materials.granite);
    baseStep1.position.set(0, 0.2, 0);

    const baseStep2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 2.7), materials.granite);
    baseStep2.position.set(0, 0.65, 0);

    const baseTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 2.4), materials.granite);
    baseTop.position.set(0, 1.05, 0);

    haechi.add(baseStep1, baseStep2, baseTop);

    // Sculpted Haechi Body (Composite parts: Haunches, Torso, Neck, Regal Head, Curly Mane, Tail)
    const bodyMat = materials.granite;

    // Muscular haunches & body
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 1.4, 10), bodyMat);
    torso.rotation.x = Math.PI * 0.18;
    torso.position.set(0, 1.85, -0.15);

    // Chest & neck
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 10), bodyMat);
    chest.position.set(0, 2.3, 0.45);

    // Head with open snout, bell collar and curly mane
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 1.0), bodyMat);
    head.position.set(0, 2.8, 0.75);

    // Snout / muzzle
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.6, 8), bodyMat);
    snout.rotation.x = Math.PI * 0.45;
    snout.position.set(0, 2.65, 1.2);

    // Auspicious single horn (해태 뿔)
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), bodyMat);
    horn.rotation.x = -Math.PI * 0.25;
    horn.position.set(0, 3.25, 0.6);

    // Front paws
    const leftPaw = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.1, 8), bodyMat);
    leftPaw.position.set(-0.45, 1.65, 0.7);
    const rightPaw = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.1, 8), bodyMat);
    rightPaw.position.set(0.45, 1.65, 0.7);

    // Curly tail curved up over the back
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.14, 8, 16, Math.PI * 1.3), bodyMat);
    tail.rotation.y = Math.PI * 0.5;
    tail.position.set(0, 2.1, -0.85);

    // Royal bell ornament on neck
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), materials.goldLeaf);
    bell.position.set(0, 2.25, 0.95);

    haechi.add(torso, chest, head, snout, horn, leftPaw, rightPaw, tail, bell);
    haechi.castShadow = true;
    return haechi;
  }

  const haechiLeft = createHaechi('left');
  haechiLeft.position.set(-8.5, 0, 34);
  haechiLeft.rotation.y = Math.PI * 0.08;

  const haechiRight = createHaechi('right');
  haechiRight.position.set(8.5, 0, 34);
  haechiRight.rotation.y = -Math.PI * 0.08;

  root.add(haechiLeft, haechiRight);

  // 3. Fortress Stone Base (육축 - Yukchuk: 4 massive granite piers & spanning lintel)
  const yukchukGroup = new THREE.Group();
  yukchukGroup.name = 'yukchuk_stone_base';

  // 4 Granite Vertical Piers dividing the 3 arches
  const pier1 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 5.0, 12), materials.granite);
  pier1.position.set(-15.7, 2.5, 0);
  pier1.castShadow = true;
  pier1.receiveShadow = true;

  const pier2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.2, 12), materials.granite);
  pier2.position.set(-5.0, 2.6, 0);
  pier2.castShadow = true;
  pier2.receiveShadow = true;

  const pier3 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.2, 12), materials.granite);
  pier3.position.set(5.0, 2.6, 0);
  pier3.castShadow = true;
  pier3.receiveShadow = true;

  const pier4 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 5.0, 12), materials.granite);
  pier4.position.set(15.7, 2.5, 0);
  pier4.castShadow = true;
  pier4.receiveShadow = true;

  // Horizontal Stone Course Ledges (장대석 석축 몰딩선)
  for (let course = 1; course <= 4; course++) {
    const courseTrim = new THREE.Mesh(new THREE.BoxGeometry(40.2, 0.08, 12.2), materials.granite);
    courseTrim.position.set(0, course * 1.25, 0);
    yukchukGroup.add(courseTrim);
  }

  // Spanning Upper Granite Lintel Beam (상부 홍예 개석)
  const lintelBeam = new THREE.Mesh(new THREE.BoxGeometry(40, 2.2, 12), materials.granite);
  lintelBeam.position.set(0, 6.1, 0);
  lintelBeam.castShadow = true;
  lintelBeam.receiveShadow = true;

  yukchukGroup.add(pier1, pier2, pier3, pier4, lintelBeam);

  // 3 Hongyemun Arches (홍예문 - Rainbow Arched Gate Vaults)
  const arches = [
    { x: 0, r: 2.4, h: 5.2, w: 4.8 },
    { x: -9.5, r: 1.9, h: 4.6, w: 3.8 },
    { x: 9.5, r: 1.9, h: 4.6, w: 3.8 },
  ];

  arches.forEach((a) => {
    // Arch vault ceiling
    const archVault = new THREE.Mesh(
      new THREE.CylinderGeometry(a.r, a.r, 12.05, 24, 1, false, 0, Math.PI),
      materials.granite
    );
    archVault.rotation.z = Math.PI;
    archVault.rotation.y = Math.PI * 0.5;
    archVault.position.set(a.x, a.h - a.r + 0.1, 0);
    yukchukGroup.add(archVault);

    // Granite Keystone Arch Rim (홍예석 테두리)
    const rimFront = new THREE.Mesh(
      new THREE.TorusGeometry(a.r + 0.12, 0.22, 8, 24, Math.PI),
      materials.granite
    );
    rimFront.position.set(a.x, a.h - a.r + 0.1, 6.02);
    const rimBack = rimFront.clone();
    rimBack.position.z = -6.02;
    yukchukGroup.add(rimFront, rimBack);

    // Heavy iron-studded royal wooden gate doors (판문) recessed inside
    const door1 = new THREE.Mesh(new THREE.BoxGeometry(a.w * 0.46, a.h - 0.4, 0.2), materials.royalWood);
    door1.position.set(a.x - a.w * 0.23, (a.h - 0.4) / 2, 0.5);
    door1.rotation.y = 0.42; // Invitingly open
    const door2 = new THREE.Mesh(new THREE.BoxGeometry(a.w * 0.46, a.h - 0.4, 0.2), materials.royalWood);
    door2.position.set(a.x + a.w * 0.23, (a.h - 0.4) / 2, 0.5);
    door2.rotation.y = -0.42;
    yukchukGroup.add(door1, door2);
  });

  // Stone Water Gargoyle Drainage Spouts (석루조 - 4 stone dragon gargoyles)
  [-14, -6, 6, 14].forEach((gx) => {
    const spout = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.8), materials.granite);
    spout.position.set(gx, 7.15, 6.35);
    spout.rotation.x = 0.15;
    const spoutBack = spout.clone();
    spoutBack.position.z = -6.35;
    spoutBack.rotation.x = -0.15;
    yukchukGroup.add(spout, spoutBack);
  });

  // Crenellated Parapet with Giwa tile copings (여장 - Yeojang crenels and embrasures)
  const parapetFront = new THREE.Mesh(new THREE.BoxGeometry(40.4, 1.1, 0.6), materials.granite);
  parapetFront.position.set(0, 7.75, 6.1);
  const parapetCapFront = new THREE.Mesh(new THREE.BoxGeometry(40.6, 0.2, 0.8), materials.giwaRoof);
  parapetCapFront.position.set(0, 8.35, 6.1);

  const parapetBack = parapetFront.clone();
  parapetBack.position.z = -6.1;
  const parapetCapBack = parapetCapFront.clone();
  parapetCapBack.position.z = -6.1;

  yukchukGroup.add(parapetFront, parapetCapFront, parapetBack, parapetCapBack);
  root.add(yukchukGroup);

  // 4. Wooden Gate Pavilion (2-tier Munru - 문루)
  const munruGroup = new THREE.Group();
  munruGroup.name = 'munru_pavilion';
  munruGroup.position.set(0, 7.2, 0);

  // Tier 1 Base Platform
  const tier1Floor = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 9.6), materials.royalWood);
  tier1Floor.position.set(0, 0.25, 0);
  munruGroup.add(tier1Floor);

  // Tier 1 Columns with Granite Plinths (초석)
  const pillarGeo = new THREE.CylinderGeometry(0.32, 0.35, 3.4, 14);
  const xPillars = [-13, -8.8, -4.4, 4.4, 8.8, 13]; // Center bay open
  const zPillars = [-3.8, 3.8];

  xPillars.forEach((px) => {
    zPillars.forEach((pz) => {
      // Granite plinth stone (초석)
      const plinth = createColumnPlinth(0.36, materials);
      plinth.position.set(px, 0.45, pz);

      // Vermilion wooden pillar
      const pillar = new THREE.Mesh(pillarGeo, materials.pillarCrimson);
      pillar.position.set(px, 2.3, pz);
      pillar.castShadow = true;

      munruGroup.add(plinth, pillar);
    });
  });

  // Tier 1 Multi-Tier Dapo Bracket Row (공포/다포계 결구)
  const dapoTier1 = createDapoFacadeRow(32, 9.6, xPillars, materials);
  dapoTier1.position.set(0, 3.8, 0);
  munruGroup.add(dapoTier1);

  // Tier 1 Graceful Curved Roof (하층 우진각 처마)
  const roofTier1 = createKoreanRoof(35, 13, 2.4, materials, {
    isPaljak: false,
    ridgeLengthRatio: 0.65,
    eavesFlare: 0.38,
    showJapsang: false,
  });
  roofTier1.position.set(0, 4.2, 0);
  munruGroup.add(roofTier1);

  // Tier 2 Upper Pavilion (상층 누각)
  const tier2Base = new THREE.Mesh(new THREE.BoxGeometry(26, 0.45, 7.8), materials.royalWood);
  tier2Base.position.set(0, 5.8, 0);
  munruGroup.add(tier2Base);

  // Tier 2 Railing around perimeter balcony (계자난간)
  const balconyRailFront = new THREE.Mesh(new THREE.BoxGeometry(25.8, 0.75, 0.12), materials.royalWood);
  balconyRailFront.position.set(0, 6.4, 3.8);
  const balconyRailBack = balconyRailFront.clone();
  balconyRailBack.position.z = -3.8;
  munruGroup.add(balconyRailFront, balconyRailBack);

  // Tier 2 Lattice Windows / Hanji partitions
  const latticeFront = new THREE.Mesh(new THREE.BoxGeometry(22, 2.6, 0.2), materials.latticeWindow);
  latticeFront.position.set(0, 7.3, 2.8);
  const latticeBack = latticeFront.clone();
  latticeBack.position.z = -2.8;
  munruGroup.add(latticeFront, latticeBack);

  // Tier 2 Pillars with plinths
  const pillarTier2Geo = new THREE.CylinderGeometry(0.28, 0.3, 2.8, 12);
  const xPillarsT2 = [-11, -5.5, 5.5, 11];
  xPillarsT2.forEach((px) => {
    [-2.8, 2.8].forEach((pz) => {
      const plinth = createColumnPlinth(0.3, materials);
      plinth.position.set(px, 6.0, pz);

      const p = new THREE.Mesh(pillarTier2Geo, materials.pillarCrimson);
      p.position.set(px, 7.4, pz);
      p.castShadow = true;
      munruGroup.add(plinth, p);
    });
  });

  // Tier 2 Signboard ("光化門" - Historically verified black lacquer & gold plaque)
  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.5, 0.22), materials.gwanghwamunSign);
  signMesh.position.set(0, 7.9, 3.2);
  munruGroup.add(signMesh);

  // Tier 2 Dapo Bracket Row
  const dapoTier2 = createDapoFacadeRow(26, 7.8, xPillarsT2, materials);
  dapoTier2.position.set(0, 8.8, 0);
  munruGroup.add(dapoTier2);

  // Tier 2 Grand Curved Roof (상층 우진각 지붕 - curved concave slope, Yongmaru, Chwimi, and Japsang figures)
  const mainRoof = createKoreanRoof(30, 12, 3.6, materials, {
    isPaljak: false,
    ridgeLengthRatio: 0.62,
    eavesFlare: 0.48,
    showJapsang: true,
    japsangCount: 5,
  });
  mainRoof.position.set(0, 9.4, 0);
  munruGroup.add(mainRoof);

  // Night Lanterns under the eaves (청사초롱)
  [-7, -2.5, 2.5, 7].forEach((lx) => {
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 8), materials.lanternGlow);
    lantern.position.set(lx, 8.6, 3.4);
    munruGroup.add(lantern);
  });

  root.add(munruGroup);

  return root;
}
