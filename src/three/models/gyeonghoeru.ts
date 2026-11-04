import * as THREE from 'three';
import { PalaceMaterials } from '../materials';
import {
  createKoreanRoof,
  createDapoFacadeRow,
  createColumnPlinth,
  createStoneBalustradeLine,
  createGyejaBalustrade,
} from './architecturalCraft';

/**
 * Creates Gyeonghoeru Pavilion (경회루 - National Treasure No. 224),
 * The Lotus Pond (방지), 3 Stone Arched Bridges, 48 Stone Pillars
 * (outer 24 square = Earth, inner 24 round = Heaven), and floating lotus pads.
 * Advanced Joseon Palace Architecture detailing:
 * - Grand curved Paljak hip-and-gable roof with exposed double rafters (겹처마)
 * - Corner Chunya hip beams with Tosu dragon caps (토수) & Hapgak gable walls (합각벽)
 * - Authentic Gyeja curved balcony balustrade (계자난간) surrounding the open upper hall
 * - 48 Grand pillars: 24 square outer + 24 cylindrical inner columns
 * - Suspended royal lattice folding doors (분합문)
 * - 3 Stone bridges with carved mythical water beasts (서수상)
 */
export function buildGyeonghoeru(materials: PalaceMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'gyeonghoeru_root';
  root.position.set(-68, 0, -68);

  // 1. The Lotus Pond (방지 - Bangji: 54m x 46m)
  const pondGroup = new THREE.Group();
  pondGroup.name = 'lotus_pond';

  // Pond stone basin boundary walls (석축) with stone coping
  const wallMat = materials.granite;
  const pondWallFront = new THREE.Mesh(new THREE.BoxGeometry(54, 1.2, 1.2), wallMat);
  pondWallFront.position.set(0, 0.4, 23);
  const pondWallBack = pondWallFront.clone();
  pondWallBack.position.z = -23;
  const pondWallLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 46), wallMat);
  pondWallLeft.position.set(-27, 0.4, 0);
  const pondWallRight = pondWallLeft.clone();
  pondWallRight.position.x = 27;

  pondGroup.add(pondWallFront, pondWallBack, pondWallLeft, pondWallRight);

  // Water Surface Plane (수면)
  const waterGeo = new THREE.PlaneGeometry(53, 45);
  const water = new THREE.Mesh(waterGeo, materials.waterPond);
  water.rotation.x = -Math.PI * 0.5;
  water.position.set(0, 0.45, 0);
  water.receiveShadow = true;
  pondGroup.add(water);

  // Floating Water Lilies / Lotus Leaves (연잎)
  const lilyMat = new THREE.MeshStandardMaterial({
    color: 0x2b593f,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const lilyGeo = new THREE.CircleGeometry(0.7, 10);
  for (let i = 0; i < 28; i++) {
    const lily = new THREE.Mesh(lilyGeo, lilyMat);
    lily.rotation.x = -Math.PI * 0.5;
    const lx = (Math.random() - 0.5) * 44;
    const lz = (Math.random() - 0.5) * 36;
    if (Math.abs(lx) > 13 || Math.abs(lz) > 11) {
      lily.position.set(lx, 0.47, lz);
      pondGroup.add(lily);
    }
  }

  root.add(pondGroup);

  // 2. Central Island & 3 Stone Arched Bridges (석교)
  const islandGroup = new THREE.Group();
  islandGroup.name = 'pavilion_island';

  // Island Stone Base (24m x 18m, height 1.2m above water)
  const islandBase = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 18), materials.granite);
  islandBase.position.set(0, 0.6, 0);
  islandBase.castShadow = true;
  islandBase.receiveShadow = true;
  islandGroup.add(islandBase);

  // 3 Stone Bridges connecting island to the East courtyard bank (X = 12 to X = 27)
  const bridgeZPositions = [-5.5, 0, 5.5];
  bridgeZPositions.forEach((bz) => {
    const bridgeGroup = new THREE.Group();

    // Bridge Deck (Length 15m along X, Width 2.4m along Z)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 2.4), materials.granite);
    deck.position.set(19.5, 0.8, bz);
    bridgeGroup.add(deck);

    // Arch support beneath
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 16, 1, false, 0, Math.PI), materials.granite);
    arch.rotation.z = Math.PI * 0.5;
    arch.position.set(19.5, 0.3, bz);
    bridgeGroup.add(arch);

    // Stone balustrade with lotus posts along both sides of bridge
    const rail1 = createStoneBalustradeLine(14.8, materials, 2.8);
    rail1.position.set(19.5, 0.95, bz - 1.2);
    const rail2 = createStoneBalustradeLine(14.8, materials, 2.8);
    rail2.position.set(19.5, 0.95, bz + 1.2);
    bridgeGroup.add(rail1, rail2);

    // Mythical water beast statue (서수상) guarding bridge entrance
    const beast = new THREE.Group();
    const bBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), materials.granite);
    bBase.position.set(0, 0.15, 0);
    const bBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8), materials.granite);
    bBody.position.set(0, 0.5, 0);
    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), materials.granite);
    bHead.position.set(0, 0.8, 0.05);
    beast.add(bBase, bBody, bHead);
    beast.position.set(27.2, 0.95, bz);
    bridgeGroup.add(beast);

    islandGroup.add(bridgeGroup);
  });

  root.add(islandGroup);

  // 3. Gyeonghoeru Grand Pavilion Structure (경회루 누각)
  const pavilion = new THREE.Group();
  pavilion.name = 'gyeonghoeru_pavilion';
  pavilion.position.set(0, 1.2, 0); // Sits on top of island stone base

  // 48 Granite Pillars (기둥: 외곽 24개 방주 + 내부 24개 원주)
  // 7 columns along X (-9 to +9), 4 columns along Z (-6 to +6)
  const colX = [-9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.6];
  const colZ = [-6.3, -2.1, 2.1, 6.3];

  const squareColGeo = new THREE.BoxGeometry(0.72, 4.6, 0.72);
  const roundColGeo = new THREE.CylinderGeometry(0.38, 0.42, 4.6, 14);

  colX.forEach((x, ix) => {
    colZ.forEach((z, iz) => {
      const isPerimeter = ix === 0 || ix === colX.length - 1 || iz === 0 || iz === colZ.length - 1;

      // Base plinth stone (초석)
      const plinth = createColumnPlinth(0.42, materials);
      plinth.position.set(x, 0.05, z);
      pavilion.add(plinth);

      // Outer pillars = Square (방주 - Earth); Inner pillars = Round (원주 - Heaven)
      const pillar = new THREE.Mesh(isPerimeter ? squareColGeo : roundColGeo, materials.granite);
      pillar.position.set(x, 2.4, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      pavilion.add(pillar);
    });
  });

  // Second Floor Wooden Floor Deck (2층 우물마루)
  const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 15.6), materials.royalWood);
  upperFloor.position.set(0, 4.85, 0);
  pavilion.add(upperFloor);

  // Second Floor Perimeter Railing (계자난간 - Gyeja Nangan with curved balusters & Ajasa grilles)
  const railFront = createGyejaBalustrade(21.8, materials, 1.6);
  railFront.position.set(0, 5.1, 7.5);
  const railBack = createGyejaBalustrade(21.8, materials, 1.6);
  railBack.position.set(0, 5.1, -7.5);
  railBack.rotation.y = Math.PI;

  const railLeft = createGyejaBalustrade(15.2, materials, 1.6);
  railLeft.position.set(-10.7, 5.1, 0);
  railLeft.rotation.y = Math.PI * 0.5;
  const railRight = createGyejaBalustrade(15.2, materials, 1.6);
  railRight.position.set(10.7, 5.1, 0);
  railRight.rotation.y = -Math.PI * 0.5;

  pavilion.add(railFront, railBack, railLeft, railRight);

  // Second Floor Vermilion Wooden Pillars (2층 홍기둥)
  const upperColGeo = new THREE.CylinderGeometry(0.32, 0.35, 3.8, 12);
  colX.forEach((x) => {
    colZ.forEach((z) => {
      const plinth = createColumnPlinth(0.32, materials);
      plinth.position.set(x, 5.1, z);

      const pillar = new THREE.Mesh(upperColGeo, materials.pillarCrimson);
      pillar.position.set(x, 7.0, z);
      pillar.castShadow = true;
      pavilion.add(plinth, pillar);
    });
  });

  // Suspended Folding Lattice Doors (들문 / 분합문 - hung horizontally beneath upper lintels)
  const doorGeo = new THREE.BoxGeometry(2.8, 0.1, 1.4);
  colX.slice(1, -1).forEach((x) => {
    const doorFront = new THREE.Mesh(doorGeo, materials.latticeWindow);
    doorFront.position.set(x, 8.6, 6.3);
    doorFront.rotation.x = -0.15; // Tilted up under eaves
    const doorBack = doorFront.clone();
    doorBack.position.z = -6.3;
    doorBack.rotation.x = 0.15;
    pavilion.add(doorFront, doorBack);
  });

  // Calligraphic Signboard ("慶 會 樓" - Gyeonghoeru royal plaque with vermilion frame)
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.2, 0.18), materials.pillarCrimson);
  signFrame.position.set(0, 9.45, 7.52);

  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.8, 0.24), materials.gyeonghoeruSign);
  signMesh.position.set(0, 9.45, 7.6);
  pavilion.add(signFrame, signMesh);

  // Second Floor Dapo Bracket Row (공포대)
  const dapoRow = createDapoFacadeRow(22, 15.6, colX, materials);
  dapoRow.position.set(0, 8.8, 0);
  pavilion.add(dapoRow);

  // Grand Curved Paljak Roof with Double Rafters & Hapgak Gable Walls (팔작 겹처마 지붕)
  const mainRoof = createKoreanRoof(28, 19, 4.6, materials, {
    isPaljak: true,
    ridgeLengthRatio: 0.65,
    eavesFlare: 0.54,
    showJapsang: true,
    japsangCount: 7,
  });
  mainRoof.position.set(0, 9.4, 0);
  pavilion.add(mainRoof);

  root.add(pavilion);

  return root;
}
