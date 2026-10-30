import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createKoreanRoof,
  createDapoFacadeRow,
  createColumnPlinth,
  createStoneBalustradeLine,
} from './architecturalCraft';

/**
 * Creates Geunjeongjeon (근정전 - Main Throne Hall, National Treasure No. 223),
 * Double-tiered Woldae, Phoenix Dapdo stone, Courtyard Bakseok flagstones,
 * Pumgyeseok rank stones, Royal Throne (어좌), and Ilworobongdo screen.
 * Upgraded with curved Paljak hip-and-gable roofs, multi-tier Dapo brackets,
 * column plinths, stone balustrades with lotus finials, and coffered ceilings.
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

  // Ring stones (차일고리 - iron rings embedded in bakseok for awnings)
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
  woldaeGroup.add(balustradeLowerFront);

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
  woldaeGroup.add(balustradeUpperFront, balustradeUpperBack);

  // Southern Royal Staircases & Phoenix Dapdo (답도 - 봉황 조각 판석)
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(8, 0.26, 0.8), materials.granite);
    s.position.set(0, 0.13 + i * 0.26, 19.5 - i * 0.7);
    woldaeGroup.add(s);
  }

  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.26, 0.7), materials.granite);
    s.position.set(0, 1.43 + i * 0.26, 16.2 - i * 0.6);
    woldaeGroup.add(s);
  }

  // Carved Dapdo Phoenix relief stone (답도 판석)
  const dapdoStone = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 3.4), materials.granite);
  dapdoStone.position.set(0, 2.15, 14.8);
  dapdoStone.rotation.x = Math.PI * 0.15;
  woldaeGroup.add(dapdoStone);

  // Auspicious Four Guardian Spirits (사신수: 청룡, 백호, 주작, 현무) finials
  const beastGeo = new THREE.BoxGeometry(0.55, 0.7, 0.65);
  const guardianCorners = [
    [-18.5, 3.1, 14.5], // South-West (White Tiger / 백호)
    [18.5, 3.1, 14.5],  // South-East (Blue Dragon / 청룡)
    [-18.5, 3.1, -14.5],// North-West (Black Tortoise / 현무)
    [18.5, 3.1, -14.5], // North-East (Vermilion Bird / 주작)
  ];
  guardianCorners.forEach(([x, y, z]) => {
    const guardian = new THREE.Mesh(beastGeo, materials.granite);
    guardian.position.set(x, y, z);
    guardian.castShadow = true;
    woldaeGroup.add(guardian);
  });

  root.add(woldaeGroup);

  // 3. The Throne Hall Pavilion (근정전 전각 본채)
  const hallGroup = new THREE.Group();
  hallGroup.name = 'geunjeongjeon_hall';
  hallGroup.position.set(0, 2.6, 0);

  // Wooden Base Platform
  const hallFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 22), materials.royalWood);
  hallFloor.position.set(0, 0.2, 0);
  hallGroup.add(hallFloor);

  // Main Vermilion Pillars with Plinths (외진주, 내진주)
  const pillarGeo = new THREE.CylinderGeometry(0.42, 0.45, 6.2, 14);
  const xColumns = [-13, -8.6, -3.8, 3.8, 8.6, 13];
  const zColumns = [-9, -4.5, 4.5, 9];

  xColumns.forEach((cx) => {
    zColumns.forEach((cz) => {
      // Granite plinth stone (초석)
      const plinth = createColumnPlinth(0.45, materials);
      plinth.position.set(cx, 0.35, cz);

      // Vermilion pillar
      const col = new THREE.Mesh(pillarGeo, materials.pillarCrimson);
      col.position.set(cx, 3.5, cz);
      col.castShadow = true;
      hallGroup.add(plinth, col);
    });
  });

  // Front Open Lattice Doors (창호 분합문 - flanking bays, center bay open to throne)
  [-2, -1, 1, 2].forEach((b) => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.8, 0.18), materials.latticeWindow);
    door.position.set(b * 4.4, 2.8, 9.1);
    hallGroup.add(door);
  });

  // Tier 1 Dapo Bracket Cluster Row (하층 다포계 공포 - 3-tier stepped cantilevers)
  const dapoTier1 = createDapoFacadeRow(30, 22, xColumns, materials);
  dapoTier1.position.set(0, 6.6, 0);
  hallGroup.add(dapoTier1);

  // Tier 1 Sloped Curved Giwa Eaves (하층 팔작지붕 처마)
  const eaves1 = createKoreanRoof(34, 26, 2.8, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.72,
    eavesFlare: 0.42,
    showJapsang: false,
  });
  eaves1.position.set(0, 7.2, 0);
  hallGroup.add(eaves1);

  // Tier 2 Upper Level (상층 누각부)
  const upperBody = new THREE.Mesh(new THREE.BoxGeometry(24, 3.2, 16), materials.royalWood);
  upperBody.position.set(0, 9.8, 0);
  hallGroup.add(upperBody);

  // Tier 2 Lattice clerestory windows
  const upperWindowFront = new THREE.Mesh(new THREE.BoxGeometry(20, 2.0, 0.15), materials.latticeWindow);
  upperWindowFront.position.set(0, 9.8, 8.1);
  const upperWindowBack = upperWindowFront.clone();
  upperWindowBack.position.z = -8.1;
  hallGroup.add(upperWindowFront, upperWindowBack);

  // Signboard: "勤政殿" (Gold letters on black lacquer)
  const sign = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.6, 0.22), materials.geunjeongjeonSign);
  sign.position.set(0, 10.8, 8.4);
  hallGroup.add(sign);

  // Tier 2 Dapo Bracket Row
  const xColumnsT2 = [-9.5, -4.5, 4.5, 9.5];
  const dapoTier2 = createDapoFacadeRow(24, 16, xColumnsT2, materials);
  dapoTier2.position.set(0, 11.5, 0);
  hallGroup.add(dapoTier2);

  // Tier 2 Grand Paljak Hip-and-Gable Roof (상층 웅장한 팔작지붕)
  const mainRoof = createKoreanRoof(29, 21, 4.8, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.62,
    eavesFlare: 0.52,
    showJapsang: true,
    japsangCount: 7,
  });
  mainRoof.position.set(0, 12.2, 0);
  hallGroup.add(mainRoof);

  // 4. Interior Throne (어좌 - Royal Throne) & Ilworobongdo Screen
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'eojwa_throne_interior';
  interiorGroup.position.set(0, 0.4, -2.5);

  // Elevated Throne Platform (당가 - Dang-ga / Bojwa)
  const bojwaBase = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.85, 4.0), materials.royalWood);
  bojwaBase.position.set(0, 0.42, 0);
  interiorGroup.add(bojwaBase);

  // Royal Throne Chair (어좌 - Carved red and gold dragon throne)
  const chairBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.4), materials.royalWood);
  chairBase.position.set(0, 1.15, 0);
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.25), materials.royalWood);
  chairBack.position.set(0, 1.85, -0.6);
  const goldCrownFinial = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 6), materials.goldLeaf);
  goldCrownFinial.position.set(0, 2.7, -0.6);
  interiorGroup.add(chairBase, chairBack, goldCrownFinial);

  // Ilworobongdo Screen (일월오봉도 - Sun, Moon, and Five Peaks screen)
  const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(6.6, 3.5, 0.12), materials.ilworobongdo);
  screenMesh.position.set(0, 2.6, -1.8);
  screenMesh.castShadow = true;
  interiorGroup.add(screenMesh);

  // Golden Canopy Dragon ceiling pendant (황룡 보개천장)
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.35, 3.8), materials.goldLeaf);
  canopy.position.set(0, 5.6, 0);
  interiorGroup.add(canopy);

  hallGroup.add(interiorGroup);
  root.add(hallGroup);

  return root;
}
