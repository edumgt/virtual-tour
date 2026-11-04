import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createKoreanRoof,
  createDapoFacadeRow,
  createColumnPlinth,
  createStoneBalustradeLine,
  createDumuCauldron,
  createRoyalCanopyAndThrone,
} from './architecturalCraft';

/**
 * Creates Geunjeongjeon (근정전 - Main Throne Hall, National Treasure No. 223),
 * Double-tiered Woldae, Phoenix Dapdo stone, Courtyard Bakseok flagstones,
 * Pumgyeseok rank stones, Royal Throne with Dadjip canopy, and Dumu cauldrons.
 * Advanced Joseon Palace Architecture detailing:
 * - Double-tier curved Paljak hip-and-gable roofs with exposed double rafters (겹처마: 도리서까래 + 부연)
 * - Corner Chunya hip beams with Tosu dragon caps (토수) & Hapgak gable walls (합각벽)
 * - 4 Bronze fire cauldrons (드무) & Royal bronze incense burner (정 - 鼎)
 * - Phoenix & dragon carved royal ramp stone (답도)
 * - 12 Zodiac and 4 Guardian Deities stone sculptures (십이지신상 & 사신 석상)
 * - Royal Throne room with Dadjip dragon canopy and Ilworobongdo screen
 */
export function buildGeunjeongjeon(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'geunjeongjeon_root';
  root.position.set(0, 0, -68);

  // 1. Jojeong Courtyard & Pumgyeseok (조정 품계석 & 박석 마당)
  const jojeongGroup = new THREE.Group();
  jojeongGroup.name = 'jojeong_courtyard';

  // Bakseok Courtyard Ground Plane (Width 52m, Depth 44m)
  const courtyardGeo = new THREE.BoxGeometry(52, 0.1, 44);
  const courtyard = new THREE.Mesh(courtyardGeo, materials.granite);
  courtyard.position.set(0, 0.05, 32);
  courtyard.receiveShadow = true;
  jojeongGroup.add(courtyard);

  // Central Elevated Royal Way (삼도 - 중앙 어도 및 좌우 시종길)
  const royalWayGeo = new THREE.BoxGeometry(3.8, 0.08, 43.8);
  const royalWay = new THREE.Mesh(royalWayGeo, materials.granite);
  royalWay.position.set(0, 0.12, 32);
  royalWay.receiveShadow = true;
  jojeongGroup.add(royalWay);

  // Pumgyeseok (품계석 - Rank Stones)
  // East side: Civil Officials (문관: 정1품 ~ 종9품)
  // West side: Military Officials (무관: 정1품 ~ 종9품)
  const rankStoneGeo = new THREE.BoxGeometry(0.55, 0.85, 0.28);
  for (let r = 1; r <= 9; r++) {
    const zPos = 16 + r * 3.4;

    // East (Civil)
    const stoneEast = new THREE.Mesh(rankStoneGeo, materials.granite);
    stoneEast.position.set(-4.8, 0.5, zPos);
    stoneEast.castShadow = true;

    // West (Military)
    const stoneWest = new THREE.Mesh(rankStoneGeo, materials.granite);
    stoneWest.position.set(4.8, 0.5, zPos);
    stoneWest.castShadow = true;

    // Plinth under rank stone
    const pBaseE = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.15, 0.48), materials.granite);
    pBaseE.position.set(-4.8, 0.12, zPos);
    const pBaseW = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.15, 0.48), materials.granite);
    pBaseW.position.set(4.8, 0.12, zPos);

    jojeongGroup.add(stoneEast, stoneWest, pBaseE, pBaseW);
  }

  // Ring stones (차일고리 - iron rings embedded in bakseok for royal court awnings)
  for (let r = 1; r <= 9; r += 2) {
    const ringEast = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 12), materials.granite);
    ringEast.rotation.x = Math.PI * 0.5;
    ringEast.position.set(-6.2, 0.12, 16 + r * 3.4);
    const ringWest = ringEast.clone();
    ringWest.position.x = 6.2;
    jojeongGroup.add(ringEast, ringWest);
  }

  root.add(jojeongGroup);

  // 2. Double-Tiered Woldae (2단 월대: 하월대 + 상월대)
  const woldaeGroup = new THREE.Group();
  woldaeGroup.name = 'geunjeongjeon_woldae';

  // Lower Woldae (하월대 - 44m x 36m, height 1.3m)
  const haWoldae = new THREE.Mesh(new THREE.BoxGeometry(44, 1.3, 36), materials.granite);
  haWoldae.position.set(0, 0.65, 0);
  haWoldae.castShadow = true;
  haWoldae.receiveShadow = true;
  woldaeGroup.add(haWoldae);

  // Lower Woldae Balustrades with lotus posts
  const balustradeLowerFront = createStoneBalustradeLine(43.6, materials, 3.4);
  balustradeLowerFront.position.set(0, 1.3, 17.8);
  const balustradeLowerBack = createStoneBalustradeLine(43.6, materials, 3.4);
  balustradeLowerBack.position.set(0, 1.3, -17.8);
  balustradeLowerBack.rotation.y = Math.PI;
  const balustradeLowerL = createStoneBalustradeLine(35.6, materials, 3.4);
  balustradeLowerL.position.set(-21.8, 1.3, 0);
  balustradeLowerL.rotation.y = Math.PI * 0.5;
  const balustradeLowerR = createStoneBalustradeLine(35.6, materials, 3.4);
  balustradeLowerR.position.set(21.8, 1.3, 0);
  balustradeLowerR.rotation.y = -Math.PI * 0.5;

  woldaeGroup.add(balustradeLowerFront, balustradeLowerBack, balustradeLowerL, balustradeLowerR);

  // Upper Woldae (상월대 - 38m x 30m, height 1.3m on top of lower)
  const sangWoldae = new THREE.Mesh(new THREE.BoxGeometry(38, 1.3, 30), materials.granite);
  sangWoldae.position.set(0, 1.95, 0);
  sangWoldae.castShadow = true;
  sangWoldae.receiveShadow = true;
  woldaeGroup.add(sangWoldae);

  // Upper Woldae Balustrades
  const balustradeUpperFront = createStoneBalustradeLine(37.6, materials, 3.4);
  balustradeUpperFront.position.set(0, 2.6, 14.8);
  const balustradeUpperBack = createStoneBalustradeLine(37.6, materials, 3.4);
  balustradeUpperBack.position.set(0, 2.6, -14.8);
  balustradeUpperBack.rotation.y = Math.PI;
  const balustradeUpperL = createStoneBalustradeLine(29.6, materials, 3.4);
  balustradeUpperL.position.set(-18.8, 2.6, 0);
  balustradeUpperL.rotation.y = Math.PI * 0.5;
  const balustradeUpperR = createStoneBalustradeLine(29.6, materials, 3.4);
  balustradeUpperR.position.set(18.8, 2.6, 0);
  balustradeUpperR.rotation.y = -Math.PI * 0.5;

  woldaeGroup.add(balustradeUpperFront, balustradeUpperBack, balustradeUpperL, balustradeUpperR);

  // 4 Bronze Fire Cauldrons (드무 - Dumu) at the 4 corners of Upper Woldae
  [
    { x: -16.5, z: 12.5 },
    { x: 16.5, z: 12.5 },
    { x: -16.5, z: -12.5 },
    { x: 16.5, z: -12.5 },
  ].forEach((dPos) => {
    const dumu = createDumuCauldron(materials);
    dumu.position.set(dPos.x, 2.6, dPos.z);
    woldaeGroup.add(dumu);
  });

  // Royal Bronze Incense Burner (정 - 鼎) in front of central stairs
  const censerGroup = new THREE.Group();
  const censerBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), materials.granite);
  censerBase.position.set(0, 0.2, 0);
  const censerBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 0.8, 12), materials.dumuBronze);
  censerBowl.position.set(0, 0.8, 0);
  const censerLid = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.5, 12), materials.dumuBronze);
  censerLid.position.set(0, 1.45, 0);
  censerGroup.add(censerBase, censerBowl, censerLid);
  censerGroup.position.set(0, 2.6, 12.8);
  woldaeGroup.add(censerGroup);

  // 12 Zodiac & Guardian Animal Sculptures (십이지신상 & 서수상) along stairs and corners
  const guardianPositions = [
    { x: -5.5, z: 18.2, name: 'haetae_left' },
    { x: 5.5, z: 18.2, name: 'haetae_right' },
    { x: -21.5, z: 17.5, name: 'zodiac_tiger' },
    { x: 21.5, z: 17.5, name: 'zodiac_dragon' },
    { x: -18.5, z: 14.5, name: 'zodiac_horse' },
    { x: 18.5, z: 14.5, name: 'zodiac_ram' },
  ];

  guardianPositions.forEach((gp) => {
    const gMesh = new THREE.Group();
    const gBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), materials.granite);
    gBase.position.set(0, 0.2, 0);
    const gBody = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.65, 8), materials.granite);
    gBody.position.set(0, 0.7, 0);
    const gHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), materials.granite);
    gHead.position.set(0, 1.1, 0.08);

    gMesh.add(gBase, gBody, gHead);
    gMesh.position.set(gp.x, 1.3, gp.z);
    woldaeGroup.add(gMesh);
  });

  // Central Grand Staircase with Phoenix Carved Dapdo Stone (답도 - Dapdo)
  const stairSteps = 8;
  for (let s = 0; s < stairSteps; s++) {
    const y = s * 0.32;
    const z = 18.2 + (stairSteps - s) * 0.55;

    // Left steps
    const stepL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 0.6), materials.granite);
    stepL.position.set(-3.2, y, z);

    // Right steps
    const stepR = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 0.6), materials.granite);
    stepR.position.set(3.2, y, z);

    woldaeGroup.add(stepL, stepR);
  }

  // Central Slanted Dapdo Stone with Phoenix & Cloud Carvings (답도)
  const dapdo = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 4.8), materials.granite);
  dapdo.position.set(0, 1.3, 20.2);
  dapdo.rotation.x = -Math.PI * 0.16;

  // Phoenix relief gold centerpiece
  const phoenixRelief = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 3.2), materials.goldLeaf);
  phoenixRelief.position.set(0, 0.2, 0);
  dapdo.add(phoenixRelief);

  woldaeGroup.add(dapdo);

  root.add(woldaeGroup);

  // 3. Geunjeongjeon Main Hall (근정전 본당 건물)
  const hallGroup = new THREE.Group();
  hallGroup.name = 'geunjeongjeon_hall';
  hallGroup.position.set(0, 2.6, 0);

  // Granite Column Plinths (초석) and Vermilion Royal Pillars (석간주 홍기둥)
  const pillarGeoT1 = new THREE.CylinderGeometry(0.38, 0.42, 4.8, 14);
  const xPillarsT1 = [-14, -9.5, -4.8, 0, 4.8, 9.5, 14];
  const zPillarsT1 = [-10, -5, 5, 10];

  xPillarsT1.forEach((px) => {
    zPillarsT1.forEach((pz) => {
      // Column Plinth Base
      const plinth = createColumnPlinth(0.44, materials);
      plinth.position.set(px, 0.1, pz);

      // Vermilion Pillar
      const pillar = new THREE.Mesh(pillarGeoT1, materials.pillarCrimson);
      pillar.position.set(px, 2.6, pz);
      pillar.castShadow = true;

      hallGroup.add(plinth, pillar);
    });
  });

  // Exterior Lattice Windows and Doors (격자 창호)
  const frontWallLattice = new THREE.Mesh(new THREE.BoxGeometry(27.8, 3.8, 0.2), materials.latticeWindow);
  frontWallLattice.position.set(0, 2.8, 9.8);
  const backWallLattice = frontWallLattice.clone();
  backWallLattice.position.z = -9.8;

  const leftWallLattice = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 19.6), materials.latticeWindow);
  leftWallLattice.position.set(-13.8, 2.8, 0);
  const rightWallLattice = leftWallLattice.clone();
  rightWallLattice.position.x = 13.8;

  hallGroup.add(frontWallLattice, backWallLattice, leftWallLattice, rightWallLattice);

  // Tier 1 Dapo Bracket Row (하층 공포대)
  const dapoTier1 = createDapoFacadeRow(30, 20.5, xPillarsT1, materials);
  dapoTier1.position.set(0, 5.0, 0);
  hallGroup.add(dapoTier1);

  // Tier 1 Roof with Double Rafters (하층 우진각 겹처마 지붕)
  const roofTier1 = createKoreanRoof(35, 25, 3.2, materials, {
    isPaljak: false,
    ridgeLengthRatio: 0.72,
    eavesFlare: 0.42,
    showJapsang: false,
  });
  roofTier1.position.set(0, 5.5, 0);
  hallGroup.add(roofTier1);

  // Tier 2 Upper Level (상층부)
  const tier2Base = new THREE.Mesh(new THREE.BoxGeometry(24, 0.5, 15), materials.royalWood);
  tier2Base.position.set(0, 7.8, 0);
  hallGroup.add(tier2Base);

  // Tier 2 Pillars with Plinths
  const pillarGeoT2 = new THREE.CylinderGeometry(0.32, 0.35, 3.6, 12);
  const xPillarsT2 = [-10, -5, 0, 5, 10];
  const zPillarsT2 = [-6.5, 6.5];

  xPillarsT2.forEach((px) => {
    zPillarsT2.forEach((pz) => {
      const plinth = createColumnPlinth(0.35, materials);
      plinth.position.set(px, 8.0, pz);

      const pillar = new THREE.Mesh(pillarGeoT2, materials.pillarCrimson);
      pillar.position.set(px, 9.8, pz);
      pillar.castShadow = true;

      hallGroup.add(plinth, pillar);
    });
  });

  // Tier 2 Upper Windows
  const t2FrontWin = new THREE.Mesh(new THREE.BoxGeometry(19.8, 2.8, 0.2), materials.latticeWindow);
  t2FrontWin.position.set(0, 9.6, 6.4);
  const t2BackWin = t2FrontWin.clone();
  t2BackWin.position.z = -6.4;
  hallGroup.add(t2FrontWin, t2BackWin);

  // Signboard ("勤政殿" - Geunjeongjeon royal plaque with cinnabar frame)
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.2, 0.18), materials.pillarCrimson);
  signFrame.position.set(0, 10.45, 6.62);

  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.8, 0.24), materials.geunjeongjeonSign);
  signMesh.position.set(0, 10.45, 6.7);
  hallGroup.add(signFrame, signMesh);

  // Tier 2 Dapo Bracket Row
  const dapoTier2 = createDapoFacadeRow(22, 14, xPillarsT2, materials);
  dapoTier2.position.set(0, 11.6, 0);
  hallGroup.add(dapoTier2);

  // Tier 2 Grand Curved Paljak Roof with Double Rafters & Hapgak Gable Walls (상층 팔작 겹처마 지붕)
  const mainRoof = createKoreanRoof(28, 18, 4.4, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.64,
    eavesFlare: 0.52,
    showJapsang: true,
    japsangCount: 7,
  });
  mainRoof.position.set(0, 12.2, 0);
  hallGroup.add(mainRoof);

  // 4. Interior Throne & Dadjip Canopy (보좌 & 닫집)
  const throneRoom = createRoyalCanopyAndThrone(materials);
  throneRoom.position.set(0, 0.2, -1.5);
  hallGroup.add(throneRoom);

  root.add(hallGroup);

  return root;
}
